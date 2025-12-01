//! Integration tests for bevy_spacetimedb_wasm
//!
//! REQUIREMENTS:
//! 1. SpacetimeDB server MUST be running on localhost:3000
//! 2. Browser environment (headless Firefox/Chrome)
//!
//! Setup:
//!   spacetime start  # Start SpacetimeDB server
//!
//! Run with:
//!   wasm-pack test --headless --firefox -- --test integration_test
//!
//! These are REAL integration tests - they connect to an actual SpacetimeDB server.
//! Tests will FAIL if the server is not running.

use wasm_bindgen_test::*;
use bevy_spacetimedb_wasm::*;
use bevy::prelude::*;
use wasm_bindgen_futures::JsFuture;

wasm_bindgen_test_configure!(run_in_browser);

// ============================================================================
// Test Data Structures
// ============================================================================

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Component)]
pub struct TestPlayer {
    pub id: u32,
    pub name: String,
}

impl TableRow for TestPlayer {
    const TABLE_NAME: &'static str = "test_player";
}

// ============================================================================
// Integration Tests - ALL tests require SpacetimeDB server on localhost:3000
// ============================================================================

#[wasm_bindgen_test]
async fn test_real_connection() {
    use bevy_spacetimedb_wasm::init_test_bridge;
    init_test_bridge();

    web_sys::console::log_1(&"========================================".into());
    web_sys::console::log_1(&"INTEGRATION TEST: Real Server Connection".into());
    web_sys::console::log_1(&"========================================".into());
        let bridge = get_bridge();

        let connection_id = bridge.create_connection(
            "http://localhost:3000",
            "test-module",  // The actual module name published to SpacetimeDB
            None
        );

        // Connect - this WILL fail if server is not running
        JsFuture::from(bridge.connect(connection_id))
            .await
            .expect("❌ FAILED: SpacetimeDB server not running on localhost:3000! Start with: spacetime start");

        web_sys::console::log_1(&"✓ Connected to real SpacetimeDB server".into());

        // Disconnect
        JsFuture::from(bridge.disconnect(connection_id))
            .await
            .expect("Failed to disconnect from SpacetimeDB");

        web_sys::console::log_1(&"✓ Disconnected successfully".into());
        web_sys::console::log_1(&"========================================".into());
}
