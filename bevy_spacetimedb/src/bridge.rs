//! Bridge to the SpacetimeDB TypeScript SDK via wasm-bindgen
//!
//! This module provides Rust bindings to the JavaScript bridge layer that wraps
//! the SpacetimeDB TypeScript SDK. The bridge must be initialized in JavaScript
//! before the WASM module is loaded.

use wasm_bindgen::prelude::*;

/// External bindings to the JavaScript SpacetimeDB bridge
///
/// These functions are implemented in `js/spacetimedb-bridge.js`
#[wasm_bindgen]
extern "C" {
    /// The SpacetimeDB bridge singleton
    #[wasm_bindgen(js_name = SpacetimeDBBridge)]
    #[derive(Clone)]
    pub type SpacetimeDBBridge;

    /// Create a new connection to SpacetimeDB
    #[wasm_bindgen(method, js_name = createConnection)]
    pub fn create_connection(
        this: &SpacetimeDBBridge,
        uri: &str,
        module_name: &str,
        auth_token: Option<String>,
    ) -> u32;

    /// Connect to the SpacetimeDB server
    #[wasm_bindgen(method)]
    pub fn connect(this: &SpacetimeDBBridge, connection_id: u32) -> js_sys::Promise;

    /// Disconnect from the SpacetimeDB server
    #[wasm_bindgen(method)]
    pub fn disconnect(this: &SpacetimeDBBridge, connection_id: u32) -> js_sys::Promise;

    /// Register a callback for connection events
    #[wasm_bindgen(method, js_name = onConnect)]
    pub fn on_connect(this: &SpacetimeDBBridge, connection_id: u32, callback_id: u32);

    /// Register a callback for disconnection events
    #[wasm_bindgen(method, js_name = onDisconnect)]
    pub fn on_disconnect(this: &SpacetimeDBBridge, connection_id: u32, callback_id: u32);

    /// Register a callback for connection error events
    #[wasm_bindgen(method, js_name = onConnectionError)]
    pub fn on_connection_error(this: &SpacetimeDBBridge, connection_id: u32, callback_id: u32);

    /// Call a reducer on the SpacetimeDB server
    #[wasm_bindgen(method, js_name = callReducer)]
    pub fn call_reducer(
        this: &SpacetimeDBBridge,
        connection_id: u32,
        reducer_name: &str,
        args: JsValue,
    ) -> js_sys::Promise;

    /// Subscribe to a SQL query
    #[wasm_bindgen(method)]
    pub fn subscribe(
        this: &SpacetimeDBBridge,
        connection_id: u32,
        query: &str,
    ) -> js_sys::Promise;

    /// Subscribe to table events
    /// Returns a Promise that resolves when the subscription is applied and event handlers are registered
    #[wasm_bindgen(method, js_name = subscribeTable)]
    pub fn subscribe_table(
        this: &SpacetimeDBBridge,
        connection_id: u32,
        table_name: &str,
        on_insert_id: Option<u32>,
        on_update_id: Option<u32>,
        on_delete_id: Option<u32>,
    ) -> js_sys::Promise;

    /// Register a JavaScript callback
    #[wasm_bindgen(method, js_name = registerCallback)]
    pub fn register_callback(this: &SpacetimeDBBridge, callback: &js_sys::Function) -> u32;

    /// Unregister a callback
    #[wasm_bindgen(method, js_name = unregisterCallback)]
    pub fn unregister_callback(this: &SpacetimeDBBridge, callback_id: u32);

    /// Get the identity for a connection
    /// Returns hex-encoded identity (64 hex chars) or null if not connected
    #[wasm_bindgen(method, js_name = getIdentity)]
    pub fn get_identity(this: &SpacetimeDBBridge, connection_id: u32) -> Option<String>;

    /// Get the authentication token for a connection
    /// Returns token string or null if not available
    #[wasm_bindgen(method, js_name = getToken)]
    pub fn get_token(this: &SpacetimeDBBridge, connection_id: u32) -> Option<String>;

    /// Get connection state
    /// Returns 'disconnected', 'connecting', or 'connected'
    #[wasm_bindgen(method, js_name = getConnectionState)]
    pub fn get_connection_state(this: &SpacetimeDBBridge, connection_id: u32) -> String;
}

/// Get the global SpacetimeDB bridge instance from the browser window
///
/// # Panics
///
/// Panics with a helpful error message if the bridge is not initialized.
/// The bridge must be initialized in JavaScript before loading the WASM module.
///
/// For production use:
/// ```html
/// <script type="module">
///   import { SpacetimeDBBridge } from './js/spacetimedb-bridge.js';
///   window.__SPACETIMEDB_BRIDGE__ = new SpacetimeDBBridge();
///
///   // Then load your WASM module
///   import init from './pkg/my_game.js';
///   await init();
/// </script>
/// ```
///
/// For tests: Call `test_bridge_init::init_test_bridge()` before running tests.
pub fn get_bridge() -> SpacetimeDBBridge {
    // Get browser window (required - we only support browser environments)
    let window = web_sys::window().expect("Failed to get window - browser environment required");

    if let Ok(bridge) = js_sys::Reflect::get(&window, &JsValue::from_str("__SPACETIMEDB_BRIDGE__")) {
        if !bridge.is_undefined() && !bridge.is_null() {
            return bridge.unchecked_into();
        }
    }

    panic!(
        "\n\n\
        ╔══════════════════════════════════════════════════════════════════════════════╗\n\
        ║ SpacetimeDB Bridge Not Found!                                               ║\n\
        ╠══════════════════════════════════════════════════════════════════════════════╣\n\
        ║                                                                              ║\n\
        ║ The bevy_spacetimedb_wasm plugin requires the SpacetimeDB bridge to be      ║\n\
        ║ loaded and initialized BEFORE the WASM module loads.                        ║\n\
        ║                                                                              ║\n\
        ║ For production use, add this to your HTML file:                             ║\n\
        ║                                                                              ║\n\
        ║   <script type=\"module\">                                                    ║\n\
        ║     import {{ SpacetimeDBBridge }} from './js/spacetimedb-bridge.js';        ║\n\
        ║     window.__SPACETIMEDB_BRIDGE__ = new SpacetimeDBBridge();                ║\n\
        ║                                                                              ║\n\
        ║     // THEN load your WASM module                                           ║\n\
        ║     import init from './pkg/my_game.js';                                    ║\n\
        ║     await init();                                                           ║\n\
        ║   </script>                                                                 ║\n\
        ║                                                                              ║\n\
        ║ For tests: Call test_bridge_init::init_test_bridge() at the start of your  ║\n\
        ║ test to initialize the bridge automatically.                                ║\n\
        ║                                                                              ║\n\
        ║ The bridge file should be at: bevy_spacetimedb/js/spacetimedb-bridge.js    ║\n\
        ║                                                                              ║\n\
        ╚══════════════════════════════════════════════════════════════════════════════╝\n\n"
    )
}

