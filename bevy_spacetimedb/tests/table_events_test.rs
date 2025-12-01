//! Integration tests for table events pattern
//!
//! These tests verify that SpacetimeDB table changes (insert/update/delete)
//! are delivered as Bevy events.
//!
//! NOTE: These tests are SKIPPED by default because they require:
//! 1. Production bridge loaded (not the mock)
//! 2. SpacetimeDB server running on localhost:3000
//! 3. Test module published: bevy-spacetimedb-test-module
//! 4. Browser environment (headless Firefox/Chrome)
//!
//! To enable these tests, you need to set up production bridge loading.

use wasm_bindgen_test::*;
use bevy::prelude::*;
use bevy_spacetimedb_wasm::{
    get_bridge,
    table_events::{subscribe_to_table, AddTableEvents, InsertEvent, UpdateEvent, DeleteEvent},
};
use wasm_bindgen_futures::JsFuture;
use std::sync::{Arc, Mutex};

wasm_bindgen_test_configure!(run_in_browser);

/// Helper to wait for events with timeout
async fn wait_for_events<F>(
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
        JsFuture::from(js_sys::Promise::new(&mut |resolve, _| {
            web_sys::window()
                .unwrap()
                .set_timeout_with_callback_and_timeout_and_arguments_0(&resolve, 10)
                .unwrap();
        }))
        .await
        .unwrap();
    }

    condition()
}

/// Test table type matching the SpacetimeDB test_player table
#[derive(Debug, Clone, PartialEq, serde::Deserialize)]
pub struct TestPlayer {
    pub id: u32,
    pub name: String,
}

/// Test that insert events are delivered when rows are created
#[wasm_bindgen_test]
async fn test_table_insert_event() {
    use bevy_spacetimedb_wasm::init_test_bridge;
    init_test_bridge();

    web_sys::console::log_1(&"TEST: Table Insert Event".into());

    let mut app = App::new();

    // Track received events
    let received_inserts = Arc::new(Mutex::new(Vec::new()));
    let received_inserts_clone = received_inserts.clone();

    // Set up Bevy app with SpacetimeDB plugin
    app.add_plugins(MinimalPlugins)
        // Plugin setup would go here - tests use manual setup for now
        // Subscribe to test_player table insert events
        .add_table_events::<TestPlayer>("test_player")
        // System to capture insert events
        .add_systems(Update, move |mut events: MessageReader<InsertEvent<TestPlayer>>| {
            for event in events.read() {
                web_sys::console::log_1(&format!("Insert event received: {:?}", event.row).into());
                received_inserts_clone.lock().unwrap().push(event.row.clone());
            }
        });

    // Initialize test bridge and connect to SpacetimeDB
    let bridge = get_bridge();
    let connection_id = bridge.create_connection(
        "http://localhost:3000",
        "test-module",  // Use the actual test module published to SpacetimeDB
        None
    );

    JsFuture::from(bridge.connect(connection_id))
        .await
        .expect("Failed to connect");

    // Wait a bit for module schema to sync
    web_sys::console::log_1(&"Waiting for module schema to sync...".into());
    JsFuture::from(js_sys::Promise::new(&mut |resolve, _| {
        web_sys::window()
            .unwrap()
            .set_timeout_with_callback_and_timeout_and_arguments_0(&resolve, 500)
            .unwrap();
    }))
    .await
    .unwrap();

    // Subscribe to table events now that connection is established
    subscribe_to_table::<TestPlayer>(app.world_mut(), &bridge, connection_id)
        .await
        .expect("Failed to subscribe to TestPlayer table");

    // Wait for connection to establish
    app.update();

    // Call reducer to insert a player
    let args = js_sys::Array::new();
    args.push(&wasm_bindgen::JsValue::from(999_u32)); // id
    args.push(&wasm_bindgen::JsValue::from_str("EventTestPlayer")); // name

    JsFuture::from(bridge.call_reducer(
        connection_id,
        "create_player",
        wasm_bindgen::JsValue::from(args)
    ))
    .await
    .expect("Failed to call reducer");

    // Wait for events with timeout
    let received = wait_for_events(&mut app, 1000.0, || {
        !received_inserts.lock().unwrap().is_empty()
    }).await;

    assert!(received, "Timed out waiting for insert event");

    // Assert: InsertEvent was received
    let inserts = received_inserts.lock().unwrap();
    assert!(
        inserts.iter().any(|p| p.id == 999 && p.name == "EventTestPlayer"),
        "Expected InsertEvent for player with id=999, but received: {:?}",
        inserts
    );

    web_sys::console::log_1(&"✓ Insert event delivered successfully".into());

    // Cleanup
    let cleanup_args = js_sys::Array::new();
    cleanup_args.push(&wasm_bindgen::JsValue::from(999_u32));
    let _ = JsFuture::from(bridge.call_reducer(
        connection_id,
        "delete_player",
        wasm_bindgen::JsValue::from(cleanup_args)
    )).await;

    let _ = JsFuture::from(bridge.disconnect(connection_id)).await;
}

/// Test that update events are delivered when rows are modified
#[wasm_bindgen_test]
async fn test_table_update_event() {
    use bevy_spacetimedb_wasm::init_test_bridge;
    init_test_bridge();

    web_sys::console::log_1(&"TEST: Table Update Event".into());

    let mut app = App::new();

    // Track received events
    let received_updates = Arc::new(Mutex::new(Vec::new()));
    let received_updates_clone = received_updates.clone();

    // Set up Bevy app with SpacetimeDB plugin
    app.add_plugins(MinimalPlugins)
        // Plugin setup would go here - tests use manual setup for now
        .add_table_events::<TestPlayer>("test_player")
        .add_systems(Update, move |mut events: MessageReader<UpdateEvent<TestPlayer>>| {
            for event in events.read() {
                web_sys::console::log_1(&format!(
                    "Update event received: {:?} -> {:?}",
                    event.old_row, event.new_row
                ).into());
                received_updates_clone.lock().unwrap().push((
                    event.old_row.clone(),
                    event.new_row.clone()
                ));
            }
        });

    let bridge = get_bridge();
    let connection_id = bridge.create_connection(
        "http://localhost:3000",
        "test-module",  // Use the actual test module published to SpacetimeDB
        None
    );

    JsFuture::from(bridge.connect(connection_id))
        .await
        .expect("Failed to connect");

    // Subscribe to table events
    subscribe_to_table::<TestPlayer>(app.world_mut(), &bridge, connection_id)
        .await
        .expect("Failed to subscribe to TestPlayer table");

    app.update();

    // Create a player first
    let create_args = js_sys::Array::new();
    create_args.push(&wasm_bindgen::JsValue::from(998_u32));
    create_args.push(&wasm_bindgen::JsValue::from_str("OriginalName"));

    JsFuture::from(bridge.call_reducer(
        connection_id,
        "create_player",
        wasm_bindgen::JsValue::from(create_args)
    ))
    .await
    .expect("Failed to create player");

    app.update();

    // Update the player's name
    let update_args = js_sys::Array::new();
    update_args.push(&wasm_bindgen::JsValue::from(998_u32));
    update_args.push(&wasm_bindgen::JsValue::from_str("UpdatedName"));

    JsFuture::from(bridge.call_reducer(
        connection_id,
        "update_player",
        wasm_bindgen::JsValue::from(update_args)
    ))
    .await
    .expect("Failed to update player");

    // Give time for events to propagate
    for _ in 0..5 {
        app.update();
    }

    // Assert: UpdateEvent was received
    let updates = received_updates.lock().unwrap();
    assert!(
        updates.iter().any(|(old, new)| {
            old.id == 998 && old.name == "OriginalName" &&
            new.id == 998 && new.name == "UpdatedName"
        }),
        "Expected UpdateEvent for player id=998 name change, but received: {:?}",
        updates
    );

    web_sys::console::log_1(&"✓ Update event delivered successfully".into());

    // Cleanup
    let cleanup_args = js_sys::Array::new();
    cleanup_args.push(&wasm_bindgen::JsValue::from(998_u32));
    let _ = JsFuture::from(bridge.call_reducer(
        connection_id,
        "delete_player",
        wasm_bindgen::JsValue::from(cleanup_args)
    )).await;

    let _ = JsFuture::from(bridge.disconnect(connection_id)).await;
}

/// Test that delete events are delivered when rows are removed
#[wasm_bindgen_test]
async fn test_table_delete_event() {
    use bevy_spacetimedb_wasm::init_test_bridge;
    init_test_bridge();

    web_sys::console::log_1(&"TEST: Table Delete Event".into());

    let mut app = App::new();

    // Track received events
    let received_deletes = Arc::new(Mutex::new(Vec::new()));
    let received_deletes_clone = received_deletes.clone();

    // Set up Bevy app with SpacetimeDB plugin
    app.add_plugins(MinimalPlugins)
        // Plugin setup would go here - tests use manual setup for now
        .add_table_events::<TestPlayer>("test_player")
        .add_systems(Update, move |mut events: MessageReader<DeleteEvent<TestPlayer>>| {
            for event in events.read() {
                web_sys::console::log_1(&format!("Delete event received: {:?}", event.row).into());
                received_deletes_clone.lock().unwrap().push(event.row.clone());
            }
        });

    let bridge = get_bridge();
    let connection_id = bridge.create_connection(
        "http://localhost:3000",
        "test-module",  // Use the actual test module published to SpacetimeDB
        None
    );

    JsFuture::from(bridge.connect(connection_id))
        .await
        .expect("Failed to connect");

    // Subscribe to table events
    subscribe_to_table::<TestPlayer>(app.world_mut(), &bridge, connection_id)
        .await
        .expect("Failed to subscribe to TestPlayer table");

    app.update();

    // Create a player first
    let create_args = js_sys::Array::new();
    create_args.push(&wasm_bindgen::JsValue::from(997_u32));
    create_args.push(&wasm_bindgen::JsValue::from_str("ToDelete"));

    JsFuture::from(bridge.call_reducer(
        connection_id,
        "create_player",
        wasm_bindgen::JsValue::from(create_args)
    ))
    .await
    .expect("Failed to create player");

    app.update();

    // Delete the player
    let delete_args = js_sys::Array::new();
    delete_args.push(&wasm_bindgen::JsValue::from(997_u32));

    JsFuture::from(bridge.call_reducer(
        connection_id,
        "delete_player",
        wasm_bindgen::JsValue::from(delete_args)
    ))
    .await
    .expect("Failed to delete player");

    // Give time for events to propagate
    for _ in 0..5 {
        app.update();
    }

    // Assert: DeleteEvent was received
    let deletes = received_deletes.lock().unwrap();
    assert!(
        deletes.iter().any(|p| p.id == 997 && p.name == "ToDelete"),
        "Expected DeleteEvent for player with id=997, but received: {:?}",
        deletes
    );

    web_sys::console::log_1(&"✓ Delete event delivered successfully".into());

    let _ = JsFuture::from(bridge.disconnect(connection_id)).await;
}

/// Test that events include reducer context information
#[wasm_bindgen_test]
async fn test_event_includes_reducer_context() {
    use bevy_spacetimedb_wasm::init_test_bridge;
    init_test_bridge();

    web_sys::console::log_1(&"TEST: Event Includes Reducer Context".into());

    let mut app = App::new();

    // Track received events
    let received_events = Arc::new(Mutex::new(Vec::new()));
    let received_events_clone = received_events.clone();

    app.add_plugins(MinimalPlugins)
        // Plugin setup would go here - tests use manual setup for now
        .add_table_events::<TestPlayer>("test_player")
        .add_systems(Update, move |mut events: MessageReader<InsertEvent<TestPlayer>>| {
            for event in events.read() {
                web_sys::console::log_1(&format!(
                    "Insert event with context: reducer={:?}, caller={:?}",
                    event.reducer_name, event.caller_identity
                ).into());
                received_events_clone.lock().unwrap().push((
                    event.reducer_name.clone(),
                    event.caller_identity.clone()
                ));
            }
        });

    let bridge = get_bridge();
    let connection_id = bridge.create_connection(
        "http://localhost:3000",
        "test-module",  // Use the actual test module published to SpacetimeDB
        None
    );

    JsFuture::from(bridge.connect(connection_id))
        .await
        .expect("Failed to connect");

    // Subscribe to table events
    subscribe_to_table::<TestPlayer>(app.world_mut(), &bridge, connection_id)
        .await
        .expect("Failed to subscribe to TestPlayer table");

    app.update();

    // Call reducer to insert a player
    let args = js_sys::Array::new();
    args.push(&wasm_bindgen::JsValue::from(996_u32));
    args.push(&wasm_bindgen::JsValue::from_str("ContextTest"));

    JsFuture::from(bridge.call_reducer(
        connection_id,
        "create_player",
        wasm_bindgen::JsValue::from(args)
    ))
    .await
    .expect("Failed to call reducer");

    for _ in 0..5 {
        app.update();
    }

    // Assert: Event includes reducer context
    let events = received_events.lock().unwrap();
    assert!(
        events.iter().any(|(reducer_name, _)| {
            reducer_name.as_ref().map_or(false, |name| name == "create_player")
        }),
        "Expected event to include reducer name 'create_player', but received: {:?}",
        events
    );

    web_sys::console::log_1(&"✓ Event includes reducer context".into());

    // Cleanup
    let cleanup_args = js_sys::Array::new();
    cleanup_args.push(&wasm_bindgen::JsValue::from(996_u32));
    let _ = JsFuture::from(bridge.call_reducer(
        connection_id,
        "delete_player",
        wasm_bindgen::JsValue::from(cleanup_args)
    )).await;

    let _ = JsFuture::from(bridge.disconnect(connection_id)).await;
}
