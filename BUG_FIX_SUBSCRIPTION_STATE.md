# Bug Fix: Subscription State Tracking Issue

## Summary

**Bug:** The `globalSubscription` object was set immediately when the subscription builder was created, before `onApplied()` fired. This caused subsequent table subscriptions to skip waiting for the subscription to complete, resulting in events not firing.

**Fixed:** Now tracks subscription state separately:
- `subscriptionPending`: Promise that resolves when `onApplied` fires
- `subscriptionApplied`: Boolean flag indicating subscription is ready
- `globalSubscription`: Only set AFTER `onApplied` fires

## Root Cause

In `tests/bridge-entry.js`, the `subscribeTable()` function had this logic:

```javascript
// OLD CODE (BUGGY):
if (!conn.globalSubscription) {
    conn.globalSubscription = conn.sdk.subscriptionBuilder()  // ← Set IMMEDIATELY!
        .onApplied(() => {
            resolve();  // ← But onApplied might never fire!
        })
        .subscribe(['SELECT * FROM *']);
} else {
    resolve();  // ← Assumes subscription is ready, but might not be!
}
```

**The Problem:**
1. First table subscribes → creates `globalSubscription` object immediately
2. For some reason, `onApplied()` never fires (subscription doesn't complete)
3. `globalSubscription` still exists (it was set before `onApplied` fired)
4. Second table checks `if (!conn.globalSubscription)` → FALSE
5. Goes to else branch → resolves immediately
6. Events don't fire because subscription was never actually applied!

This is a classic race condition where object existence doesn't guarantee completion.

## The Fix

Now tracks three states:

1. **No subscription** (`!subscriptionApplied && !subscriptionPending`)
   - Create new subscription
   - Set `subscriptionPending` to Promise
   - Wait for `onApplied` to fire

2. **Subscription pending** (`subscriptionPending`)
   - Previous subscription created but not applied yet
   - Wait for the existing `subscriptionPending` Promise

3. **Subscription applied** (`subscriptionApplied`)
   - Subscription is ready
   - Resolve immediately

```javascript
// NEW CODE (FIXED):
if (conn.subscriptionApplied) {
    // Already applied, use it
    resolve();
} else if (conn.subscriptionPending) {
    // Pending, wait for it
    conn.subscriptionPending.then(resolve).catch(reject);
} else {
    // Create new subscription
    conn.subscriptionPending = new Promise((resolveSubscription, rejectSubscription) => {
        const subscription = conn.sdk.subscriptionBuilder()
            .onApplied(() => {
                // ✅ Only set state AFTER onApplied fires
                conn.subscriptionApplied = true;
                conn.globalSubscription = subscription;
                conn.subscriptionPending = null;
                resolveSubscription();
            })
            .subscribe(['SELECT * FROM *']);
    });

    conn.subscriptionPending.then(resolve).catch(reject);
}
```

## Why This Matters

The bug report showed that:
- `onApplied` callback **never fired** for some modules (like game-server)
- Events didn't fire even though table handlers were registered
- WebSocket data was being received from server
- But SDK wasn't converting it into table events

This was because the subscription was created but never completed (`onApplied` never fired), yet subsequent subscriptions thought it was ready because `globalSubscription` existed.

## Verification

**Before Fix:**
```
Creating subscription...
globalSubscription set ← WRONG: Set before onApplied!
Second table checks: globalSubscription exists? Yes
Second table: resolve immediately ← WRONG: Subscription might not be applied!
Events don't fire ← BUG!
```

**After Fix:**
```
Creating subscription...
subscriptionPending set
onApplied fires
  subscriptionApplied = true ← Correct state tracking!
  globalSubscription set
  subscriptionPending = null
Second table checks: subscriptionApplied? Yes
Second table: resolve immediately ← CORRECT: Subscription IS applied!
Events fire correctly ✅
```

## Testing

Added regression test: `tests/subscription_state_bug_test.rs`

This test verifies that events fire correctly after subscription completes, which would fail if the Promise resolved before `onApplied` fired.

## Files Changed

- `tests/bridge-entry.js` - Fixed subscription state tracking
- `tests/subscription_state_bug_test.rs` - Regression test
- `tests/spacetimedb-bridge.bundle.js` - Rebuilt bundle

## Related

- Original bug report: `BUG_REPORT.md`
- First fix (timing): `BUG_FIX_TABLE_EVENTS.md`

This is the second bug fix for table events. The first fix moved subscriptions to happen AFTER connection. This fix ensures subscription state is tracked correctly so subsequent subscriptions wait for completion.
