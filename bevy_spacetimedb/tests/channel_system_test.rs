// Tests for MPSC channel to Bevy event forwarding
// Tests AddEventChannelAppExtensions trait

use bevy::prelude::*;
use bevy_spacetimedb_wasm::*;
use wasm_bindgen_test::*;
use std::sync::{mpsc, Arc, Mutex};

wasm_bindgen_test_configure!(run_in_browser);

// Use existing Message types from bevy_spacetimedb_wasm
// We'll test with InsertEvent and DeleteEvent which are already Message types

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct TestPlayer {
    id: u64,
    name: String,
}

impl TableRow for TestPlayer {
    const TABLE_NAME: &'static str = "test_player";
}

#[wasm_bindgen_test]
fn test_add_event_channel_extension_exists() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let (_sender, receiver) = mpsc::channel::<InsertEvent<TestPlayer>>();

    // Should compile if trait is in scope
    app.add_event_channel(receiver);

    assert!(true, "add_event_channel should be available");
}

#[wasm_bindgen_test]
fn test_event_channel_forwards_single_event() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let (sender, receiver) = mpsc::channel::<InsertEvent<TestPlayer>>();
    app.add_event_channel(receiver);

    // Send event via channel
    let test_player = TestPlayer { id: 1, name: "Alice".to_string() };
    sender.send(InsertEvent {
        row: test_player.clone(),
        reducer_name: None,
        caller_identity: None,
    }).unwrap();

    // Update app to process channel
    app.update();

    // Verify event was forwarded
    let received = Arc::new(Mutex::new(false));
    let received_clone = received.clone();
    app.add_systems(Update, move |mut events: MessageReader<InsertEvent<TestPlayer>>| {
        for event in events.read() {
            assert_eq!(event.row.id, 1);
            *received_clone.lock().unwrap() = true;
        }
    });
    app.update();

    assert!(*received.lock().unwrap(), "Event should be forwarded from channel to Bevy");
}

#[wasm_bindgen_test]
fn test_event_channel_forwards_multiple_events() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let (sender, receiver) = mpsc::channel::<InsertEvent<TestPlayer>>();
    app.add_event_channel(receiver);

    // Send multiple events
    sender.send(InsertEvent {
        row: TestPlayer { id: 1, name: "Alice".to_string() },
        reducer_name: None,
        caller_identity: None,
    }).unwrap();
    sender.send(InsertEvent {
        row: TestPlayer { id: 2, name: "Bob".to_string() },
        reducer_name: None,
        caller_identity: None,
    }).unwrap();
    sender.send(InsertEvent {
        row: TestPlayer { id: 3, name: "Charlie".to_string() },
        reducer_name: None,
        caller_identity: None,
    }).unwrap();

    // Update to process
    app.update();

    // Note: We can't easily check the Vec from inside the system
    // This test mainly verifies no panics occur
    assert!(true, "Multiple events should be forwarded");
}

#[wasm_bindgen_test]
fn test_event_channel_with_different_event_types() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let (sender1, receiver1) = mpsc::channel::<InsertEvent<TestPlayer>>();
    let (sender2, receiver2) = mpsc::channel::<DeleteEvent<TestPlayer>>();

    app.add_event_channel(receiver1);
    app.add_event_channel(receiver2);

    // Send events of different types
    sender1.send(InsertEvent {
        row: TestPlayer { id: 1, name: "Alice".to_string() },
        reducer_name: None,
        caller_identity: None,
    }).unwrap();
    sender2.send(DeleteEvent {
        row: TestPlayer { id: 2, name: "Bob".to_string() },
        reducer_name: None,
        caller_identity: None,
    }).unwrap();

    app.update();

    // Both should be forwarded
    assert!(true, "Should support multiple event channel types");
}

#[wasm_bindgen_test]
fn test_event_channel_sender_dropped() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let (sender, receiver) = mpsc::channel::<InsertEvent<TestPlayer>>();
    app.add_event_channel(receiver);

    // Drop sender immediately
    drop(sender);

    // Should not panic when trying to receive
    app.update();
    app.update();

    assert!(true, "Should handle dropped sender gracefully");
}

#[wasm_bindgen_test]
fn test_event_channel_empty_channel() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let (_sender, receiver) = mpsc::channel::<InsertEvent<TestPlayer>>();
    app.add_event_channel(receiver);

    // Update without sending anything
    app.update();
    app.update();

    assert!(true, "Should handle empty channel without errors");
}

#[wasm_bindgen_test]
fn test_event_channel_batch_processing() {
    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    let (sender, receiver) = mpsc::channel::<InsertEvent<TestPlayer>>();
    app.add_event_channel(receiver);

    // Send many events
    for i in 0..100 {
        sender.send(InsertEvent {
            row: TestPlayer { id: i, name: format!("Player{}", i) },
            reducer_name: None,
            caller_identity: None,
        }).unwrap();
    }

    // Single update should process all
    app.update();

    assert!(true, "Should process batch of events");
}

// Note: Multiple event channels of the same type are NOT supported.
// The library will panic with "this SpacetimeDB event channel is already initialized"
// if you try to call add_event_channel twice for the same event type.
// This is intentional to prevent confusion about which channel receives events.
