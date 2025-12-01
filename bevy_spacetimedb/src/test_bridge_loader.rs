/**
 * Production Bridge Loader for Tests
 *
 * Loads the bundled REAL SpacetimeDB bridge (which includes the actual SDK)
 * into the test environment using wasm-bindgen's inline_js feature.
 *
 * The bundle is created at build time by:
 * 1. npm run build-bridge creates tests/spacetimedb-bridge.bundle.js
 * 2. build.rs embeds it into the Rust binary at compile time
 * 3. This module loads it into the browser's global scope
 *
 * This approach works around wasm-pack's limitation of not supporting custom HTML files.
 *
 * NO MOCKING - Tests run against the REAL SpacetimeDB SDK and server.
 */

use wasm_bindgen::prelude::*;
use crate::log_utils::log_info;

// Include the bundled bridge JavaScript created at build time
const BRIDGE_BUNDLE: &str = include_str!(concat!(env!("OUT_DIR"), "/bridge_bundle.js"));

#[wasm_bindgen(inline_js = "
export function loadBundledBridge(bundleCode) {
    // Execute the bundle in the global scope
    // The bundle is an IIFE that sets up window.__SPACETIMEDB_BRIDGE__
    try {
        (0, eval)(bundleCode);
        console.log('✓ Production bridge bundle loaded (REAL SDK)');
    } catch (e) {
        console.error('❌ Failed to load bridge bundle:', e);
        throw e;
    }
}
")]
extern "C" {
    fn loadBundledBridge(bundle_code: &str);
}

/// Initialize the test bridge by loading the bundled production bridge + SDK
///
/// Call this at the start of each test:
///
/// ```rust
/// use bevy_spacetimedb_wasm::init_test_bridge;
///
/// #[wasm_bindgen_test]
/// fn my_test() {
///     init_test_bridge();
///     // ... test code that connects to REAL SpacetimeDB ...
/// }
/// ```
#[cfg(target_arch = "wasm32")]
pub fn init_test_bridge() {
    loadBundledBridge(BRIDGE_BUNDLE);
    log_info("✓ Test bridge initialized (REAL SpacetimeDB SDK - not a mock!)");
}

#[cfg(not(target_arch = "wasm32"))]
pub fn init_test_bridge() {
    // No-op on non-WASM platforms
}
