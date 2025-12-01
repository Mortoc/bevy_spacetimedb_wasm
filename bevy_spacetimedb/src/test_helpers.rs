//! Test helpers for bevy_spacetimedb_wasm
//!
//! This module provides utilities to simplify testing with SpacetimeDB.

use bevy::prelude::*;
use wasm_bindgen_futures::JsFuture;
use serde::de::DeserializeOwned;

/// Initialize the test bridge
///
/// This ensures the global bridge is initialized for testing.
/// Should be called at the start of each test.
pub fn init_test_bridge() {
    // The bridge is initialized lazily when get_bridge() is called
    // This function is just for explicitness in tests
    // In tests, we can panic if the bridge isn't set up correctly
    crate::bridge::get_bridge().expect("Test bridge not initialized. Did you forget to call init_test_bridge() or set up the bridge in your test?");
}

/// Helper to connect and subscribe to tables in tests
///
/// This combines the manual steps needed for testing into one function.
///
/// # Example
/// ```ignore
/// let connection = TestConnection::setup(
///     &mut app,
///     "http://localhost:3000",
///     "test-module",
///     None,
/// ).await?;
///
/// connection.subscribe_table::<Player>(&mut app.world, "player");
/// ```
pub struct TestConnection {
    pub bridge: crate::bridge::SpacetimeDBBridge,
    pub connection_id: u32,
}

impl TestConnection {
    /// Set up a test connection
    pub async fn setup(
        app: &mut App,
        uri: &str,
        module_name: &str,
        auth_token: Option<String>,
    ) -> Result<Self, String> {
        let bridge = crate::bridge::get_bridge()?;

        // Create connection
        let connection_id = bridge.create_connection(uri, module_name, auth_token);

        // Connect
        JsFuture::from(bridge.connect(connection_id))
            .await
            .map_err(|e| format!("Failed to connect: {:?}", e))?;

        // Insert StdbConnection resource (needed for Commands extension)
        app.insert_resource(crate::StdbConnection::new(bridge.clone(), connection_id));

        Ok(Self {
            bridge,
            connection_id,
        })
    }

    /// Subscribe to a table
    pub async fn subscribe_table<T>(&self, world: &mut World, _table_name: &str) -> Result<(), String>
    where
        T: DeserializeOwned + Clone + Send + Sync + 'static,
    {
        crate::table_events::subscribe_to_table::<T>(
            world,
            &self.bridge,
            self.connection_id,
        )
        .await
    }

    /// Disconnect and cleanup
    pub async fn cleanup(self) -> Result<(), String> {
        JsFuture::from(self.bridge.disconnect(self.connection_id))
            .await
            .map_err(|e| format!("Failed to disconnect: {:?}", e))?;
        Ok(())
    }
}

/// Wait for a condition with timeout (for use in tests)
///
/// This helper allows tests to wait for async events to propagate through
/// the Bevy event system.
///
/// # Example
/// ```ignore
/// let received = wait_for_condition(&mut app, 1000.0, || {
///     events.lock().map(|e| !e.is_empty()).unwrap_or(false)
/// }).await;
///
/// assert!(received, "Timed out waiting for events");
/// ```
pub async fn wait_for_condition<F>(
    app: &mut App,
    timeout_ms: f64,
    mut condition: F,
) -> bool
where
    F: FnMut() -> bool,
{
    let start = js_sys::Date::now();

    while !condition() && js_sys::Date::now() - start < timeout_ms {
        app.update();

        // Small async yield to let events process
        if let Some(window) = web_sys::window() {
            let promise = js_sys::Promise::new(&mut |resolve, _| {
                let _ = window.set_timeout_with_callback_and_timeout_and_arguments_0(&resolve, 10);
            });
            let _ = JsFuture::from(promise).await;
        }
    }

    condition()
}