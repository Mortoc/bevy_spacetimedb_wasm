//! WASM-only SpacetimeDB integration for Bevy using TypeScript SDK bridge.
//!
//! This crate provides a Bevy plugin that connects to SpacetimeDB via the TypeScript SDK
//! in the browser environment. It maintains API compatibility with `bevy_spacetimedb` but
//! only works on WASM targets (wasm32-unknown-unknown).
//!
//! # Requirements
//!
//! - Must be compiled for WASM target: `wasm32-unknown-unknown`
//! - Requires SpacetimeDB TypeScript SDK loaded in the browser
//! - Requires the JavaScript bridge (`js/spacetimedb-bridge.js`) loaded before WASM

#![cfg_attr(not(target_arch = "wasm32"), allow(unused))]

#[cfg(not(target_arch = "wasm32"))]
compile_error!(
    "bevy_spacetimedb_wasm only supports WASM targets (wasm32-unknown-unknown). \
    For native builds, use the original bevy_spacetimedb crate at \
    https://github.com/JulienLavocat/bevy_spacetimedb"
);

mod bridge;
mod channel_receiver;
mod events;
mod identity;
mod log_utils;
mod plugin;
mod reducers;
mod stdb_connection;
mod tables;
pub mod table_events;
pub mod test_helpers;

#[cfg(target_arch = "wasm32")]
pub mod test_bridge_loader;

pub use bridge::get_bridge;
pub use channel_receiver::AddEventChannelAppExtensions;
pub use events::*;
pub use identity::{Identity, IdentityError, Timestamp};
pub use plugin::*;
pub use reducers::*;
pub use stdb_connection::{StdbConnection, ConnectionState};
pub use tables::*;
pub use table_events::{AddTableEvents, InsertEvent, UpdateEvent, DeleteEvent};

#[cfg(target_arch = "wasm32")]
pub use test_bridge_loader::init_test_bridge;
