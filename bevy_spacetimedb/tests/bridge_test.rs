//! Bridge availability tests
//!
//! These tests verify that the SpacetimeDB bridge is properly loaded
//! in the browser environment.
//!
//! REQUIREMENTS:
//! 1. Browser environment (headless Firefox/Chrome)
//! 2. Test bridge initialized via init_test_bridge()

use wasm_bindgen_test::*;
use bevy_spacetimedb_wasm::{get_bridge, init_test_bridge};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_bridge_available() {
    // Initialize the test mock bridge
    init_test_bridge();

    // Verify bridge is available from window.__SPACETIMEDB_BRIDGE__
    let _bridge = get_bridge();

    // If we got here without panicking, the bridge is available!
    web_sys::console::log_1(&"✓ Bridge is available".into());
}

#[wasm_bindgen_test]
fn test_bridge_has_create_connection() {
    init_test_bridge();

    let bridge = get_bridge();

    // Verify the bridge has the createConnection method
    let has_create_connection = js_sys::Reflect::has(
        &bridge,
        &wasm_bindgen::JsValue::from_str("createConnection")
    ).unwrap();

    assert!(has_create_connection, "Bridge should have createConnection method");
    web_sys::console::log_1(&"✓ Bridge has createConnection method".into());
}

#[wasm_bindgen_test]
fn test_bridge_has_register_callback() {
    init_test_bridge();

    let bridge = get_bridge();

    // Verify the bridge has the registerCallback method
    let has_register_callback = js_sys::Reflect::has(
        &bridge,
        &wasm_bindgen::JsValue::from_str("registerCallback")
    ).unwrap();

    assert!(has_register_callback, "Bridge should have registerCallback method");
    web_sys::console::log_1(&"✓ Bridge has registerCallback method".into());
}
