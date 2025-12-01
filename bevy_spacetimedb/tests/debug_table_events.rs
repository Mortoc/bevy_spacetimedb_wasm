//! Simple debug test to see what's happening with table events

use wasm_bindgen_test::*;
use bevy_spacetimedb_wasm::init_test_bridge;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
async fn test_bridge_and_connection() {
    web_sys::console::log_1(&"Starting bridge test...".into());

    // Initialize the test bridge
    init_test_bridge();
    web_sys::console::log_1(&"Bridge initialized".into());

    // Try to get the bridge
    let bridge = bevy_spacetimedb_wasm::get_bridge();
    web_sys::console::log_1(&"Bridge retrieved successfully".into());

    // Create a connection
    let connection_id = bridge.create_connection(
        "http://localhost:3000",
        "test-module",
        None
    );
    web_sys::console::log_1(&format!("Created connection: {}", connection_id).into());

    // Try to connect (using mock WebSocket)
    match wasm_bindgen_futures::JsFuture::from(bridge.connect(connection_id)).await {
        Ok(_) => {
            web_sys::console::log_1(&"✓ Connected successfully!".into());
        }
        Err(e) => {
            web_sys::console::error_1(&format!("❌ Connection failed: {:?}", e).into());
        }
    }
}