//! Tests for reducer calling functionality
//!
//! REQUIREMENTS:
//! 1. Browser environment (headless Firefox/Chrome)
//! 2. Test bridge initialized via init_test_bridge()
//! 3. For integration tests: SpacetimeDB server running with test-module

use wasm_bindgen_test::*;
use bevy_spacetimedb_wasm::*;
use serde::Serialize;

wasm_bindgen_test_configure!(run_in_browser);

// ============================================================================
// Test Reducers
// ============================================================================

/// Simple reducer with no arguments
pub struct NoArgsReducer;

impl Reducer for NoArgsReducer {
    const NAME: &'static str = "no_args_reducer";
    type Args = ();
}

/// Reducer with single argument
pub struct SingleArgReducer;

impl Reducer for SingleArgReducer {
    const NAME: &'static str = "single_arg_reducer";
    type Args = u32;
}

/// Reducer with multiple arguments
pub struct MultiArgReducer;

impl Reducer for MultiArgReducer {
    const NAME: &'static str = "multi_arg_reducer";
    type Args = (String, u32, f32);
}

/// Reducer with complex struct argument
#[derive(Serialize)]
pub struct ComplexArg {
    pub name: String,
    pub values: Vec<u32>,
}

pub struct ComplexArgReducer;

impl Reducer for ComplexArgReducer {
    const NAME: &'static str = "complex_arg_reducer";
    type Args = ComplexArg;
}

// ============================================================================
// Unit Tests - Reducer Trait
// ============================================================================

#[wasm_bindgen_test]
fn test_reducer_trait_name() {
    // Verify reducer names are correct
    assert_eq!(NoArgsReducer::NAME, "no_args_reducer");
    assert_eq!(SingleArgReducer::NAME, "single_arg_reducer");
    assert_eq!(MultiArgReducer::NAME, "multi_arg_reducer");
}

#[wasm_bindgen_test]
fn test_reducer_args_serialization() {
    // Test that reducer args can be serialized

    // No args
    let no_args = ();
    let serialized = serde_wasm_bindgen::to_value(&no_args);
    assert!(serialized.is_ok(), "No args should serialize");

    // Single arg
    let single_arg = 42u32;
    let serialized = serde_wasm_bindgen::to_value(&single_arg);
    assert!(serialized.is_ok(), "Single arg should serialize");

    // Multiple args (tuple)
    let multi_args = ("test".to_string(), 42u32, 3.14f32);
    let serialized = serde_wasm_bindgen::to_value(&multi_args);
    assert!(serialized.is_ok(), "Multiple args should serialize");

    // Complex struct
    let complex_arg = ComplexArg {
        name: "test".to_string(),
        values: vec![1, 2, 3],
    };
    let serialized = serde_wasm_bindgen::to_value(&complex_arg);
    assert!(serialized.is_ok(), "Complex arg should serialize");
}

// ============================================================================
// Integration Tests - Reducer Calling
// ============================================================================

#[wasm_bindgen_test]
fn test_reducer_caller_creation() {
    init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    let connection = StdbConnection::new(bridge, conn_id);

    // Should be able to create ReducerCaller
    let caller = connection.reducers();

    // ReducerCaller should have the correct connection ID
    assert_eq!(caller.connection_id, conn_id);

    web_sys::console::log_1(&"✓ ReducerCaller created successfully".into());
}

#[wasm_bindgen_test]
async fn test_reducer_call_no_args() {
    init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    // Connect to server (this might fail if server not running - that's OK for this test)
    let connect_result = wasm_bindgen_futures::JsFuture::from(bridge.connect(conn_id)).await;

    if connect_result.is_err() {
        web_sys::console::log_1(&"⚠️ Server not running - skipping reducer call test".into());
        return;
    }

    let connection = StdbConnection::new(bridge, conn_id);

    // Call reducer with no args
    let result = connection.reducers().call::<NoArgsReducer>(());

    // Should not fail to serialize (even if reducer doesn't exist on server)
    assert!(result.is_ok(), "No-args reducer should serialize successfully");

    web_sys::console::log_1(&"✓ No-args reducer called successfully".into());
}

#[wasm_bindgen_test]
async fn test_reducer_call_with_args() {
    init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    let connect_result = wasm_bindgen_futures::JsFuture::from(bridge.connect(conn_id)).await;

    if connect_result.is_err() {
        web_sys::console::log_1(&"⚠️ Server not running - skipping reducer call test".into());
        return;
    }

    let connection = StdbConnection::new(bridge, conn_id);

    // Call reducer with single arg
    let result = connection.reducers().call::<SingleArgReducer>(42);
    assert!(result.is_ok(), "Single-arg reducer should serialize successfully");

    // Call reducer with multiple args
    let result = connection.reducers().call::<MultiArgReducer>(
        ("test".to_string(), 42, 3.14)
    );
    assert!(result.is_ok(), "Multi-arg reducer should serialize successfully");

    // Call reducer with complex arg
    let complex_arg = ComplexArg {
        name: "test".to_string(),
        values: vec![1, 2, 3],
    };
    let result = connection.reducers().call::<ComplexArgReducer>(complex_arg);
    assert!(result.is_ok(), "Complex-arg reducer should serialize successfully");

    web_sys::console::log_1(&"✓ Reducers with args called successfully".into());
}

// ============================================================================
// Macro Tests - define_reducer!
// ============================================================================

#[wasm_bindgen_test]
fn test_define_reducer_macro_no_args() {
    // Test the define_reducer! macro
    define_reducer!(TestNoArgs());

    assert_eq!(TestNoArgs::NAME, "TestNoArgs");

    // Should be able to use it
    let _args: <TestNoArgs as Reducer>::Args = ();
}

#[wasm_bindgen_test]
fn test_define_reducer_macro_with_args() {
    define_reducer!(TestWithArgs(name: String, count: u32));

    assert_eq!(TestWithArgs::NAME, "TestWithArgs");

    // Should be able to construct args as tuple
    let _args: <TestWithArgs as Reducer>::Args = ("test".to_string(), 42);
}

// ============================================================================
// Real Reducer Tests (require test-module published)
// ============================================================================

#[wasm_bindgen_test]
async fn test_real_reducer_create_player() {
    init_test_bridge();

    web_sys::console::log_1(&"========================================".into());
    web_sys::console::log_1(&"TEST: Real Reducer - create_player".into());
    web_sys::console::log_1(&"========================================".into());

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "http://localhost:3000",
        "test-module",
        None,
    );

    let connect_result = wasm_bindgen_futures::JsFuture::from(bridge.connect(conn_id)).await;

    if connect_result.is_err() {
        web_sys::console::log_1(&"⚠️ SpacetimeDB server not running - test skipped".into());
        web_sys::console::log_1(&"   Start server with: spacetime start".into());
        web_sys::console::log_1(&"========================================".into());
        return;
    }

    web_sys::console::log_1(&"✓ Connected to server".into());

    // Define the create_player reducer from test-module
    define_reducer!(CreatePlayer(id: u32, name: String));

    let connection = StdbConnection::new(bridge, conn_id);

    // Call the create_player reducer
    let result = connection.reducers().call::<CreatePlayer>((999, "TestPlayer".to_string()));

    assert!(result.is_ok(), "create_player reducer should be callable");

    web_sys::console::log_1(&"✓ create_player reducer called successfully".into());

    // Wait a bit for the reducer to process
    wasm_bindgen_futures::JsFuture::from(js_sys::Promise::new(&mut |resolve, _| {
        web_sys::window()
            .unwrap()
            .set_timeout_with_callback_and_timeout_and_arguments_0(&resolve, 100)
            .unwrap();
    }))
    .await
    .unwrap();

    web_sys::console::log_1(&"========================================".into());
}
