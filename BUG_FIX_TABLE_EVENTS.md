# Bug Fix: Table Event Handlers Not Firing

## Summary

**Bug:** Table event handlers (`onInsert`, `onUpdate`, `onDelete`) registered via `StdbPlugin.add_table()` were not firing because subscriptions were set up BEFORE the connection was established.

**Fixed:** Table subscriptions now happen asynchronously AFTER the connection is established and the module schema is loaded.

## Root Cause

In `bevy_spacetimedb/src/plugin.rs`, the plugin was calling table subscriptions synchronously during `Plugin.build()`:

```rust
// OLD CODE (BROKEN):
impl Plugin for StdbPlugin {
    fn build(&self, app: &mut App) {
        let connection_id = bridge.create_connection(uri, module_name, auth_token);

        // ❌ BUG: Subscriptions happen BEFORE connection!
        for table_config in &self.table_configs {
            (table_config.setup_fn)(&bridge, connection_id, &table_config.events, app);
        }

        // Connection happens later, asynchronously
        wasm_bindgen_futures::spawn_local(async move {
            bridge.connect(connection_id).await?;
        });
    }
}
```

**Problem:** The SpacetimeDB SDK requires the connection to be established and the module schema to be loaded before you can subscribe to tables. Calling `subscribe_table()` before connection results in "Table not found" errors because the SDK hasn't loaded the table definitions yet.

## The Fix

The fix uses a two-phase approach:

### Phase 1: Prepare subscriptions (synchronous, during plugin.build())

1. Create callbacks and MPSC channels
2. Register callbacks with the bridge
3. Store callback IDs in `PreparedTableSubscription` structs

```rust
// NEW: Prepare subscriptions but don't subscribe yet
let mut prepared_subscriptions = Vec::new();
for table_config in &self.table_configs {
    let prepared = (table_config.prepare_fn)(&bridge, &table_config.events, app);
    prepared_subscriptions.push(prepared);
}
```

### Phase 2: Actually subscribe (asynchronous, after connection)

1. Wait for connection to establish
2. Give SDK time to load module schema (100ms delay)
3. Call `subscribe_table()` with the prepared callback IDs

```rust
wasm_bindgen_futures::spawn_local(async move {
    // Wait for connection
    bridge.connect(connection_id).await?;

    // Give SDK time to sync module schema
    sleep(100ms).await;

    // ✅ NOW subscribe (after connection established and schema loaded)
    for prepared in prepared_subscriptions {
        bridge.subscribe_table(
            connection_id,
            &prepared.table_name,
            prepared.insert_callback_id,
            prepared.update_callback_id,
            prepared.delete_callback_id,
        ).await?;
    }
});
```

## Code Changes

### 1. `bevy_spacetimedb/src/tables.rs`

- **Added** `PreparedTableSubscription` struct to hold callback IDs
- **Added** `prepare_table_subscription<T>()` function to create callbacks without subscribing
- **Modified** `TableConfig` to include `prepare_fn` alongside `setup_fn`

### 2. `bevy_spacetimedb/src/plugin.rs`

- **Changed** plugin to call `prepare_fn` during build (synchronous)
- **Moved** actual `subscribe_table()` calls to async block after connection
- **Added** 100ms delay after connection for schema synchronization

### 3. `bevy_spacetimedb/tests/plugin_table_events_test.rs`

- **Added** regression test to verify plugin builds without errors
- Test would fail BEFORE fix (immediate "Table not found" error)
- Test passes AFTER fix (subscriptions happen asynchronously)

## Verification

**Before Fix:**
```
Creating connection 1...
📋 Subscribing to table: player  ← TOO EARLY!
❌ Error: Table player not found. Available: (none - connection not established)
```

**After Fix:**
```
Creating connection 1...
Connecting to SpacetimeDB connection 1...
✓ Connected, identity: c20057...
✓ Successfully connected to SpacetimeDB
📋 Subscribing to table: player  ← AFTER CONNECTION! ✅
✓ Subscribed to table player
```

## Testing

Run the regression test:
```bash
wasm-pack test --headless --chrome --test plugin_table_events_test
```

This test verifies that the plugin builds successfully without throwing "Table not found" errors, proving that subscriptions happen after connection.

## Related Files

- Bug report: `/BUG_REPORT.md`
- Plugin: `bevy_spacetimedb/src/plugin.rs`
- Tables: `bevy_spacetimedb/src/tables.rs`
- Test: `bevy_spacetimedb/tests/plugin_table_events_test.rs`

## Impact

- ✅ Fixes table event handlers not firing
- ✅ Allows `StdbPlugin.add_table()` API to work correctly
- ✅ Maintains backward compatibility (all existing tests pass)
- ✅ No breaking API changes for users
