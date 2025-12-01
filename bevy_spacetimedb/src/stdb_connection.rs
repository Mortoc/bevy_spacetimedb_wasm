use bevy::prelude::Resource;
use crate::bridge::SpacetimeDBBridge;
use crate::identity::Identity;
use crate::log_utils::{log_error, log_info};
use crate::reducers::ReducerCaller;

/// A connection to the SpacetimeDB server via the TypeScript SDK bridge
#[derive(Resource, Clone)]
pub struct StdbConnection {
    /// The JavaScript bridge instance (wrapped in SendSyncWrapper for WASM single-threaded context)
    pub(crate) bridge: SendSyncWrapper<SpacetimeDBBridge>,
    /// The connection ID
    pub(crate) connection_id: u32,
}

/// Wrapper to make JS types Send + Sync in WASM single-threaded context
/// SAFETY: WASM is single-threaded, so Send + Sync are safe.
/// This assumes single-threaded WASM without atomics. If WASM gains threading support,
/// this wrapper will need to be reevaluated for soundness.
#[cfg(target_feature = "atomics")]
compile_error!("SendSyncWrapper assumes single-threaded WASM. Review safety with atomics enabled.");

#[derive(Clone)]
pub(crate) struct SendSyncWrapper<T>(T);

unsafe impl<T> Send for SendSyncWrapper<T> {}
unsafe impl<T> Sync for SendSyncWrapper<T> {}

impl<T> std::ops::Deref for SendSyncWrapper<T> {
    type Target = T;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl StdbConnection {
    /// Create a new connection resource
    ///
    /// This is exposed publicly to allow tests to create connections directly.
    /// In normal usage, connections are created via the StdbPlugin.
    pub fn new(bridge: SpacetimeDBBridge, connection_id: u32) -> Self {
        Self {
            bridge: SendSyncWrapper(bridge),
            connection_id,
        }
    }

    /// Get a reducer caller for invoking reducers on the SpacetimeDB server
    ///
    /// # Example
    /// ```ignore
    /// fn my_system(stdb: Res<StdbConnection>) {
    ///     stdb.reducers()
    ///         .call::<SpawnPlayer>(("Alice".to_string(), 0.0, 0.0))
    ///         .expect("Failed to call reducer");
    /// }
    /// ```
    pub fn reducers(&self) -> ReducerCaller<'_> {
        ReducerCaller {
            bridge: &self.bridge,
            connection_id: self.connection_id,
        }
    }

    /// Get the connection ID
    pub fn connection_id(&self) -> u32 {
        self.connection_id
    }

    /// Disconnect from the SpacetimeDB server
    ///
    /// This returns immediately and the disconnection happens asynchronously.
    pub fn disconnect(&self) {
        let connection_id = self.connection_id;

        // Call disconnect directly - no async needed since it returns a Promise
        let promise = self.bridge.disconnect(connection_id);

        wasm_bindgen_futures::spawn_local(async move {
            match wasm_bindgen_futures::JsFuture::from(promise).await {
                Ok(_) => {
                    log_info(format!("Disconnected from SpacetimeDB"));
                }
                Err(e) => {
                    log_error(format!("Failed to disconnect: {:?}", e));
                }
            }
        });
    }

    /// Get the current user's identity
    ///
    /// Returns `None` if not connected or if the identity is not yet available.
    ///
    /// # Example
    /// ```ignore
    /// fn display_user_id(stdb: Res<StdbConnection>) {
    ///     if let Some(identity) = stdb.identity() {
    ///         println!("User ID: {}", identity.short_hex());
    ///     }
    /// }
    /// ```
    pub fn identity(&self) -> Option<Identity> {
        let hex = self.bridge.get_identity(self.connection_id)?;
        Identity::from_hex(&hex).ok()
    }

    /// Get the authentication token
    ///
    /// Returns `None` if not connected or using anonymous authentication.
    ///
    /// The token can be saved to localStorage for session persistence.
    ///
    /// # Example
    /// ```ignore
    /// fn save_session(stdb: Res<StdbConnection>) {
    ///     if let Some(token) = stdb.token() {
    ///         // Save to localStorage or other storage
    ///         save_to_storage("spacetime_token", &token);
    ///     }
    /// }
    /// ```
    pub fn token(&self) -> Option<String> {
        self.bridge.get_token(self.connection_id)
    }

    /// Get the current connection state
    ///
    /// # Example
    /// ```ignore
    /// fn show_connection_status(stdb: Res<StdbConnection>) {
    ///     match stdb.state() {
    ///         ConnectionState::Connected => println!("✅ Connected"),
    ///         ConnectionState::Connecting => println!("⏳ Connecting..."),
    ///         ConnectionState::Disconnected => println!("❌ Disconnected"),
    ///     }
    /// }
    /// ```
    pub fn state(&self) -> ConnectionState {
        let state_str = self.bridge.get_connection_state(self.connection_id);
        match state_str.as_str() {
            "connected" => ConnectionState::Connected,
            "connecting" => ConnectionState::Connecting,
            _ => ConnectionState::Disconnected,
        }
    }
}

/// Connection state enum
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConnectionState {
    /// Not connected to the server
    Disconnected,
    /// Currently establishing connection
    Connecting,
    /// Connected to the server
    Connected,
}
