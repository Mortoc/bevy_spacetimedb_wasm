//! Test to reproduce the subscription state bug
//!
//! BUG: globalSubscription is set before onApplied fires, causing subsequent
//! subscriptions to skip waiting for completion and events to not fire.
//!
//! Scenario:
//! 1. First table subscribes, creates globalSubscription (but onApplied never fires)
//! 2. Second table sees globalSubscription exists, resolves immediately
//! 3. Events don't fire because subscription was never actually applied

use bevy::prelude::*;
use bevy_spacetimedb_wasm::*;
use serde::{Deserialize, Serialize};
use wasm_bindgen_test::*;
use wasm_bindgen_futures::JsFuture;
use std::sync::{Arc, Mutex};

wasm_bindgen_test_configure!(run_in_browser);

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Player {
    pub id: u32,
    pub name: String,
}

impl TableRow for Player {
    const TABLE_NAME: &'static str = "player";
}

/// Test that verifies subscription state is tracked correctly
///
/// This test should FAIL if the bug exists (subscription Promise resolves
/// even though onApplied never fired, causing events to not fire).
#[wasm_bindgen_test]
async fn test_subscription_waits_for_on_applied() {
    init_test_bridge();

    web_sys::console::log_1(&"TEST: Subscription waits for onApplied callback".into());

    let mut app = App::new();
    let received_events = Arc::new(Mutex::new(Vec::new()));
    let received_clone = received_events.clone();

    app.add_plugins(MinimalPlugins)
        .add_plugins(
            StdbPlugin::default()
                .with_uri("http://localhost:3000")
                .with_module_name("test-module")
                .add_table::<Player>()
        )
        .add_systems(Update, move |mut events: EventReader<InsertEvent<Player>>| {
            for event in events.read() {
                web_sys::console::log_1(&format!("✅ Event received: {:?}", event.row).into());
                received_clone.lock().unwrap().push(event.row.clone());
            }
        });

    // Wait for connection and subscription
    web_sys::console::log_1(&"Waiting for connection and subscription...".into());

    // Give time for connection and subscription to complete
    for i in 0..50 {
        app.update();
        JsFuture::from(js_sys::Promise::new(&mut |resolve, _| {
            web_sys::window()
                .unwrap()
                .set_timeout_with_callback_and_timeout_and_arguments_0(&resolve, 100)
                .unwrap();
        }))
        .await
        .unwrap();

        // Check if connected
        if let Some(conn) = app.world().get_resource::<StdbConnection>() {
            if conn.identity().is_some() {
                web_sys::console::log_1(&format!("✓ Connected after {}00ms", i).into());
                break;
            }
        }
    }

    // Additional wait for subscription to complete
    for _ in 0..10 {
        app.update();
        JsFuture::from(js_sys::Promise::new(&mut |resolve, _| {
            web_sys::window()
                .unwrap()
                .set_timeout_with_callback_and_timeout_and_arguments_0(&resolve, 100)
                .unwrap();
        }))
        .await
        .unwrap();
    }

    web_sys::console::log_1(&"Calling reducer to trigger event...".into());

    // Get connection to call reducer
    let conn = app.world().resource::<StdbConnection>();
    let connection_id = conn.connection_id();
    let bridge = get_bridge();

    // Call reducer
    let args = js_sys::Array::new();
    args.push(&wasm_bindgen::JsValue::from(99999_u32));
    args.push(&wasm_bindgen::JsValue::from_str("SubscriptionTestPlayer"));

    JsFuture::from(bridge.call_reducer(
        connection_id,
        "create_player",
        wasm_bindgen::JsValue::from(args)
    ))
    .await
    .expect("Failed to call reducer");

    web_sys::console::log_1(&"Reducer called, waiting for events...".into());

    // Wait for events
    let mut event_received = false;
    for i in 0..30 {
        app.update();

        if !received_events.lock().unwrap().is_empty() {
            event_received = true;
            web_sys::console::log_1(&format!("✓ Event received after {}00ms", i).into());
            break;
        }

        JsFuture::from(js_sys::Promise::new(&mut |resolve, _| {
            web_sys::window()
                .unwrap()
                .set_timeout_with_callback_and_timeout_and_arguments_0(&resolve, 100)
                .unwrap();
        }))
        .await
        .unwrap();
    }

    // Cleanup
    let cleanup_args = js_sys::Array::new();
    cleanup_args.push(&wasm_bindgen::JsValue::from(99999_u32));
    let _ = JsFuture::from(bridge.call_reducer(
        connection_id,
        "delete_player",
        wasm_bindgen::JsValue::from(cleanup_args)
    )).await;

    // This assertion will FAIL if the bug exists
    // (subscription Promise resolves even though onApplied never fired)
    assert!(
        event_received,
        "BUG: Event not received! This happens when subscription Promise resolves \
        before onApplied fires, causing globalSubscription to be set prematurely. \
        Subsequent subscriptions see it exists and skip waiting, but events don't fire \
        because the subscription was never actually applied."
    );

    web_sys::console::log_1(&"✓ Test passed: Events fire correctly after subscription".into());
}
