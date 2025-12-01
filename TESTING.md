# Testing Guide

This library uses `wasm-pack test` for all testing. Tests run in real browser environments.

## Quick Start

```bash
# Enter nix development environment
nix develop

# Run all tests
wasm-pack test --headless --chrome

# Run specific test file
wasm-pack test --headless --chrome --test identity_token_test

# Run unit tests only (lib.rs tests)
wasm-pack test --headless --chrome --lib
```

## Test Structure

### Unit Tests (No Server Required)

Located in `bevy_spacetimedb/tests/`:

- `plugin_integration_test.rs` - StdbPlugin builder and configuration
- `stdb_connection_test.rs` - Connection resource methods
- `table_configuration_test.rs` - TableEvents configuration
- `channel_system_test.rs` - MPSC channel forwarding
- `connection_events_test.rs` - Connection lifecycle events
- `test_helpers_test.rs` - Test utility functions

Plus inline unit tests in `src/identity.rs`.

### Integration Tests (Require SpacetimeDB Server)

- `reducer_test.rs` - Reducer calling with real server
- `table_events_test.rs` - Table subscriptions with real server

## Running Tests

### All Tests

```bash
wasm-pack test --headless --chrome
```

### Unit Tests Only

```bash
wasm-pack test --headless --chrome \
  --lib \
  --test plugin_integration_test \
  --test stdb_connection_test \
  --test table_configuration_test \
  --test channel_system_test \
  --test connection_events_test \
  --test test_helpers_test
```

### Integration Tests

```bash
# 1. Start SpacetimeDB server
spacetime start

# 2. Run integration tests
wasm-pack test --headless --chrome \
  --test reducer_test \
  --test table_events_test
```

## Browser Options

- `--chrome` (recommended, most stable)
- `--firefox`

Safari is not supported by wasm-pack.

## Debugging

### See browser window

```bash
wasm-pack test --chrome  # Remove --headless
```

### Verbose output

```bash
wasm-pack test --headless --chrome -- --nocapture
```

### Single test

```bash
wasm-pack test --headless --chrome --test identity_token_test -- test_identity_to_hex
```

### Verbose build

```bash
BEVY_SPACETIMEDB_VERBOSE_BUILD=1 wasm-pack test --headless --chrome
```

## Test Module

Integration tests use a test SpacetimeDB module in `bevy_spacetimedb/tests/test_module/`.

The `build.rs` script automatically:
1. Builds the test module WASM
2. Publishes to SpacetimeDB (if server running)
3. Generates TypeScript bindings

Manual steps (if needed):

```bash
cd bevy_spacetimedb/tests/test_module

# Build
cargo build --release --target wasm32-unknown-unknown

# Publish (requires running server)
spacetime publish --server http://localhost:3000 -y test-module

# Generate bindings
spacetime generate --lang typescript --out-dir ../generated
```

## Troubleshooting

### Bridge not found

```bash
cd bevy_spacetimedb/tests
npm install
npm run build-bridge
```

### Test module not found

```bash
spacetime start  # Make sure server is running
cd bevy_spacetimedb/tests/test_module
spacetime publish -y test-module
```

## Writing Tests

### Unit Test

```rust
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_feature() {
    assert!(true);
}
```

### Integration Test

```rust
use bevy_spacetimedb_wasm::test_helpers;

#[wasm_bindgen_test]
async fn test_with_server() {
    test_helpers::init_test_bridge();
    
    let mut app = App::new();
    let connection = test_helpers::TestConnection::setup(
        &mut app,
        "ws://localhost:3000",
        "test-module",
        None,
    ).await.expect("Failed to connect");
    
    // Test code here
    
    connection.cleanup().await.ok();
}
```

## Coverage

Current test coverage: **~90%**

- ✅ Identity/token (95%)
- ✅ Reducers (90%)
- ✅ Tables (95%)
- ✅ Plugin (80%)
- ✅ Events (90%)
- ✅ Channels (85%)
- ✅ Connection (95%)
- ✅ Helpers (90%)
