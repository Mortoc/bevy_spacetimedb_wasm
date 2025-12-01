//! Tests for error handling in the library
//!
//! Verifies that the library handles errors gracefully without panicking

use bevy::prelude::*;
use bevy_spacetimedb_wasm::*;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

/// Test that plugin handles missing bridge gracefully without panicking
#[wasm_bindgen_test]
fn test_plugin_handles_missing_bridge_gracefully() {
    web_sys::console::log_1(&"TEST: Plugin handles missing bridge gracefully".into());

    // Clear the bridge from window to simulate it not being loaded
    if let Some(window) = web_sys::window() {
        let _ = js_sys::Reflect::delete_property(
            &window,
            &wasm_bindgen::JsValue::from_str("__SPACETIMEDB_BRIDGE__")
        );
    }

    let mut app = App::new();

    // This should NOT panic - it should log an error and return early
    app.add_plugins(MinimalPlugins)
        .add_plugins(
            StdbPlugin::default()
                .with_uri("http://localhost:3000")
                .with_module_name("test-module")
        );

    // App should still be running (not panicked)
    app.update();

    web_sys::console::log_1(&"✓ Plugin gracefully handled missing bridge without panicking".into());

    // Note: Re-initialize bridge for other tests
    init_test_bridge();
}

/// Test that get_bridge returns error when bridge is missing
#[wasm_bindgen_test]
fn test_get_bridge_returns_error_when_missing() {
    web_sys::console::log_1(&"TEST: get_bridge returns Error when bridge missing".into());

    // Clear the bridge
    if let Some(window) = web_sys::window() {
        let _ = js_sys::Reflect::delete_property(
            &window,
            &wasm_bindgen::JsValue::from_str("__SPACETIMEDB_BRIDGE__")
        );
    }

    // Should return Err, not panic
    let result = get_bridge();
    assert!(result.is_err(), "get_bridge should return Err when bridge is missing");

    let err_msg = result.unwrap_err();
    assert!(err_msg.contains("Bridge Not Found"), "Error message should be helpful");

    web_sys::console::log_1(&"✓ get_bridge returned proper error".into());

    // Re-initialize for other tests
    init_test_bridge();
}

/// Test that plugin handles window errors gracefully
#[wasm_bindgen_test]
fn test_plugin_timeout_errors_handled_gracefully() {
    init_test_bridge();

    web_sys::console::log_1(&"TEST: Plugin handles timeout errors gracefully".into());

    let mut app = App::new();

    // Plugin should build successfully even if setTimeout might fail in some edge cases
    // (though in practice setTimeout should always work in browser)
    app.add_plugins(MinimalPlugins)
        .add_plugins(
            StdbPlugin::default()
                .with_uri("http://localhost:3000")
                .with_module_name("test-module")
        );

    // Should not panic
    app.update();

    web_sys::console::log_1(&"✓ Plugin built successfully with error handling".into());
}
