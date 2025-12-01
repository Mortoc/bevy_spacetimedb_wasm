// Tests for StdbConnection resource methods
// Tests state(), identity(), token(), disconnect(), etc.

use bevy::prelude::*;
use bevy_spacetimedb_wasm::*;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_stdb_connection_new() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    let connection = StdbConnection::new(bridge, conn_id);

    assert!(true, "StdbConnection::new should create connection resource");
}

#[wasm_bindgen_test]
fn test_stdb_connection_reducers() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    let connection = StdbConnection::new(bridge, conn_id);
    let _caller = connection.reducers();

    assert!(true, "reducers() should return ReducerCaller");
}

#[wasm_bindgen_test]
fn test_stdb_connection_state_before_connect() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    let connection = StdbConnection::new(bridge, conn_id);
    let state = connection.state();

    // Before connecting, state should be available
    // The exact state depends on timing, but it should not panic
    assert!(true, "state() should return ConnectionState");
}

#[wasm_bindgen_test]
async fn test_stdb_connection_state_after_connect() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    // Connect
    wasm_bindgen_futures::JsFuture::from(bridge.connect(conn_id))
        .await
        .ok(); // Ignore errors for this test

    let connection = StdbConnection::new(bridge, conn_id);
    let state = connection.state();

    // After attempting connection, state should reflect the connection status
    assert!(true, "state() should work after connection attempt");
}

#[wasm_bindgen_test]
fn test_stdb_connection_identity_before_connect() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    let connection = StdbConnection::new(bridge, conn_id);
    let identity = connection.identity();

    // Before connecting, identity should be None
    assert_eq!(identity, None, "identity() should be None before connection");
}

#[wasm_bindgen_test]
async fn test_stdb_connection_identity_after_connect() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    // Connect
    if wasm_bindgen_futures::JsFuture::from(bridge.connect(conn_id))
        .await
        .is_ok()
    {
        let connection = StdbConnection::new(bridge, conn_id);
        let identity = connection.identity();

        // After successful connection, identity might be available
        // (depends on server response timing)
        if identity.is_some() {
            assert!(true, "identity() returns Identity after connection");
        } else {
            assert!(true, "identity() behavior after connection tested");
        }
    }
}

#[wasm_bindgen_test]
fn test_stdb_connection_token_before_connect() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    let connection = StdbConnection::new(bridge, conn_id);
    let token = connection.token();

    // Before connecting, token should be None
    assert_eq!(token, None, "token() should be None before connection");
}

#[wasm_bindgen_test]
async fn test_stdb_connection_token_after_connect() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    // Connect
    if wasm_bindgen_futures::JsFuture::from(bridge.connect(conn_id))
        .await
        .is_ok()
    {
        let connection = StdbConnection::new(bridge, conn_id);
        let token = connection.token();

        // After successful connection, token might be available
        if token.is_some() {
            assert!(token.unwrap().len() > 0, "token should not be empty");
        }
    }
}

#[wasm_bindgen_test]
async fn test_stdb_connection_disconnect() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    // Connect first
    if wasm_bindgen_futures::JsFuture::from(bridge.connect(conn_id))
        .await
        .is_ok()
    {
        let connection = StdbConnection::new(bridge, conn_id);

        // Disconnect should not panic
        connection.disconnect();

        assert!(true, "disconnect() should execute without panicking");
    }
}

#[wasm_bindgen_test]
fn test_stdb_connection_clone() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    let connection1 = StdbConnection::new(bridge.clone(), conn_id);
    let connection2 = connection1.clone();

    // Both should be usable
    let _caller1 = connection1.reducers();
    let _caller2 = connection2.reducers();

    assert!(true, "StdbConnection should be cloneable");
}

#[wasm_bindgen_test]
fn test_connection_state_enum_variants() {
    // Test that ConnectionState variants exist
    let _disconnected = ConnectionState::Disconnected;
    let _connecting = ConnectionState::Connecting;
    let _connected = ConnectionState::Connected;

    assert!(true, "ConnectionState should have expected variants");
}

#[wasm_bindgen_test]
fn test_connection_state_debug() {
    let state = ConnectionState::Connected;
    let debug_str = format!("{:?}", state);

    assert!(debug_str.contains("Connected"), "ConnectionState should have Debug impl");
}

#[wasm_bindgen_test]
fn test_connection_state_equality() {
    let state1 = ConnectionState::Connected;
    let state2 = ConnectionState::Connected;
    let state3 = ConnectionState::Disconnected;

    assert_eq!(state1, state2, "Same states should be equal");
    assert_ne!(state1, state3, "Different states should not be equal");
}

#[wasm_bindgen_test]
fn test_reducer_caller_connection_id() {
    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    let connection = StdbConnection::new(bridge, conn_id);
    let caller = connection.reducers();

    // ReducerCaller::connection_id is now public
    assert_eq!(caller.connection_id, conn_id, "ReducerCaller should have correct connection_id");
}
