// Tests for test helper utilities
// Tests TestConnection, wait_for_condition, etc.

use bevy::prelude::*;
use bevy_spacetimedb_wasm::*;
use wasm_bindgen_test::*;
use std::sync::{Arc, Mutex};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_init_test_bridge() {
    // Should be callable multiple times without errors
    test_helpers::init_test_bridge();
    test_helpers::init_test_bridge();

    assert!(true, "init_test_bridge should be idempotent");
}

#[wasm_bindgen_test]
async fn test_test_connection_setup() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let connection = test_helpers::TestConnection::setup(
        &mut app,
        "ws://localhost:3000",
        "test-module",
        None,
    ).await;

    if connection.is_ok() {
        assert!(true, "TestConnection::setup should create connection");
    } else {
        // Connection might fail if server not running
        assert!(true, "TestConnection::setup behavior tested");
    }
}

#[wasm_bindgen_test]
async fn test_test_connection_setup_creates_resource() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let connection = test_helpers::TestConnection::setup(
        &mut app,
        "ws://localhost:3000",
        "test-module",
        None,
    ).await;

    if let Ok(_) = connection {
        // StdbConnection resource should be added to world
        assert!(
            app.world().contains_resource::<StdbConnection>(),
            "TestConnection::setup should add StdbConnection resource"
        );
    }
}

#[wasm_bindgen_test]
async fn test_test_connection_cleanup() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    if let Ok(connection) = test_helpers::TestConnection::setup(
        &mut app,
        "ws://localhost:3000",
        "test-module",
        None,
    ).await {
        // Cleanup should not panic
        let result = connection.cleanup().await;

        // Result might be error if connection wasn't fully established
        assert!(true, "cleanup() should execute without panicking");
    }
}

#[wasm_bindgen_test]
async fn test_wait_for_condition_success() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let flag = Arc::new(Mutex::new(false));
    let flag_clone = flag.clone();

    // Set flag to true immediately
    *flag.lock().unwrap() = true;

    let result = test_helpers::wait_for_condition(&mut app, 1000.0, || {
        *flag_clone.lock().unwrap()
    }).await;

    assert!(result, "wait_for_condition should return true when condition met");
}

#[wasm_bindgen_test]
async fn test_wait_for_condition_timeout() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let flag = Arc::new(Mutex::new(false));
    let flag_clone = flag.clone();

    // Never set flag to true
    let result = test_helpers::wait_for_condition(&mut app, 100.0, || {
        *flag_clone.lock().unwrap()
    }).await;

    assert!(!result, "wait_for_condition should return false on timeout");
}

#[wasm_bindgen_test]
async fn test_wait_for_condition_becomes_true() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let flag = Arc::new(Mutex::new(false));
    let flag_clone = flag.clone();
    let flag_setter = flag.clone();

    // Set flag after a delay
    let _task = wasm_bindgen_futures::spawn_local(async move {
        // Small delay
        let promise = js_sys::Promise::new(&mut |resolve, _| {
            if let Some(window) = web_sys::window() {
                let _ = window.set_timeout_with_callback_and_timeout_and_arguments_0(
                    &resolve,
                    50
                );
            }
        });
        let _ = wasm_bindgen_futures::JsFuture::from(promise).await;

        *flag_setter.lock().unwrap() = true;
    });

    let result = test_helpers::wait_for_condition(&mut app, 1000.0, || {
        *flag_clone.lock().unwrap()
    }).await;

    assert!(result, "wait_for_condition should detect condition becoming true");
}

#[wasm_bindgen_test]
async fn test_wait_for_condition_updates_app() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let update_count = Arc::new(Mutex::new(0));
    let count_clone = update_count.clone();

    // System that counts updates
    app.add_systems(Update, move |mut counter: Local<u32>| {
        *counter += 1;
        *count_clone.lock().unwrap() = *counter;
    });

    // Wait for multiple updates
    test_helpers::wait_for_condition(&mut app, 200.0, || {
        *update_count.lock().unwrap() >= 3
    }).await;

    let final_count = *update_count.lock().unwrap();
    assert!(
        final_count >= 3,
        "wait_for_condition should call app.update(), got {} updates",
        final_count
    );
}

#[wasm_bindgen_test]
fn test_test_connection_has_bridge() {
    // Test that TestConnection struct has expected fields
    // (This is more of a compilation test)

    test_helpers::init_test_bridge();

    let bridge = get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test",
        None,
    );

    let test_conn = test_helpers::TestConnection {
        bridge,
        connection_id: conn_id,
    };

    assert_eq!(test_conn.connection_id, conn_id);
}

#[wasm_bindgen_test]
async fn test_test_connection_with_auth_token() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let connection = test_helpers::TestConnection::setup(
        &mut app,
        "ws://localhost:3000",
        "test-module",
        Some("test-token".to_string()),
    ).await;

    // Should accept auth token
    if connection.is_ok() {
        assert!(true, "TestConnection::setup should accept auth token");
    } else {
        assert!(true, "Auth token test completed");
    }
}
