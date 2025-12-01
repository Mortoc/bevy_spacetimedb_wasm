//! Table events - SpacetimeDB table changes delivered as Bevy events
//!
//! This module provides an ECS-friendly way to react to database table changes.
//! When rows are inserted, updated, or deleted in SpacetimeDB, corresponding
//! Bevy events are sent.

use bevy::prelude::*;
use crate::log_utils::{log_error, log_info};
use serde::de::DeserializeOwned;
use std::sync::{mpsc, Mutex};
use wasm_bindgen::prelude::*;

/// Event fired when a row is inserted into a SpacetimeDB table
#[derive(Message)]
pub struct InsertEvent<T: DeserializeOwned + Clone + Send + Sync + 'static> {
    /// The inserted row
    pub row: T,
    /// Name of the reducer that caused this insert (if available)
    pub reducer_name: Option<String>,
    /// Identity of the caller that triggered the reducer (if available)
    pub caller_identity: Option<String>,
}

/// Event fired when a row is updated in a SpacetimeDB table
#[derive(Message)]
pub struct UpdateEvent<T: DeserializeOwned + Clone + Send + Sync + 'static> {
    /// The row before the update
    pub old_row: T,
    /// The row after the update
    pub new_row: T,
    /// Name of the reducer that caused this update (if available)
    pub reducer_name: Option<String>,
    /// Identity of the caller that triggered the reducer (if available)
    pub caller_identity: Option<String>,
}

/// Event fired when a row is deleted from a SpacetimeDB table
#[derive(Message)]
pub struct DeleteEvent<T: DeserializeOwned + Clone + Send + Sync + 'static> {
    /// The deleted row
    pub row: T,
    /// Name of the reducer that caused this delete (if available)
    pub reducer_name: Option<String>,
    /// Identity of the caller that triggered the reducer (if available)
    pub caller_identity: Option<String>,
}

/// Extension trait to add table event subscriptions to a Bevy app
pub trait AddTableEvents {
    /// Subscribe to table events for a specific SpacetimeDB table
    ///
    /// This registers Bevy events for insert, update, and delete operations
    /// on the specified table. The table name should match the SpacetimeDB
    /// table name (e.g., "test_player").
    ///
    /// # Type Parameters
    ///
    /// * `T` - The Rust type representing rows in this table. Must implement
    ///         `serde::Deserialize` to deserialize rows from SpacetimeDB.
    ///
    /// # Example
    ///
    /// ```rust,ignore
    /// #[derive(Debug, Clone, serde::Deserialize)]
    /// struct Player {
    ///     id: u32,
    ///     name: String,
    /// }
    ///
    /// app.add_plugins(SpacetimeDBPlugin)
    ///    .add_table_events::<Player>("test_player")
    ///    .add_systems(Update, handle_player_events);
    ///
    /// fn handle_player_events(mut events: EventReader<InsertEvent<Player>>) {
    ///     for event in events.read() {
    ///         println!("Player inserted: {:?}", event.row);
    ///     }
    /// }
    /// ```
    fn add_table_events<T>(&mut self, table_name: &str) -> &mut Self
    where
        T: DeserializeOwned + Clone + Send + Sync + 'static;
}

impl AddTableEvents for App {
    fn add_table_events<T>(&mut self, table_name: &str) -> &mut Self
    where
        T: DeserializeOwned + Clone + Send + Sync + 'static,
    {
        // Register the event types with Bevy
        self.add_message::<InsertEvent<T>>()
            .add_message::<UpdateEvent<T>>()
            .add_message::<DeleteEvent<T>>();

        // Create channels for table events
        let (insert_send, insert_recv) = mpsc::channel::<InsertEvent<T>>();
        let (update_send, update_recv) = mpsc::channel::<UpdateEvent<T>>();
        let (delete_send, delete_recv) = mpsc::channel::<DeleteEvent<T>>();

        // Add systems to forward channel events to Bevy events
        self.insert_resource(TableEventReceiver::<InsertEvent<T>>::new(insert_recv))
            .insert_resource(TableEventReceiver::<UpdateEvent<T>>::new(update_recv))
            .insert_resource(TableEventReceiver::<DeleteEvent<T>>::new(delete_recv))
            .add_systems(PreUpdate, forward_table_events::<InsertEvent<T>>)
            .add_systems(PreUpdate, forward_table_events::<UpdateEvent<T>>)
            .add_systems(PreUpdate, forward_table_events::<DeleteEvent<T>>);

        // Store the senders for later subscription
        // This allows tests or plugins to subscribe when connection is ready
        self.insert_resource(TableEventSenders::<T> {
            table_name: table_name.to_string(),
            insert_send,
            update_send,
            delete_send,
        });

        log_info(format!("[Table Events] Registered events for table '{}'", table_name));

        self
    }
}

/// Resource holding channel receivers for a table event type
#[derive(Resource)]
struct TableEventReceiver<T: Message> {
    receiver: Mutex<mpsc::Receiver<T>>,
}

impl<T: Message> TableEventReceiver<T> {
    fn new(receiver: mpsc::Receiver<T>) -> Self {
        Self {
            receiver: Mutex::new(receiver),
        }
    }
}

/// Resource holding channel senders for table events
#[derive(Resource)]
pub struct TableEventSenders<T: DeserializeOwned + Clone + Send + Sync + 'static> {
    pub table_name: String,
    pub insert_send: mpsc::Sender<InsertEvent<T>>,
    pub update_send: mpsc::Sender<UpdateEvent<T>>,
    pub delete_send: mpsc::Sender<DeleteEvent<T>>,
}

/// System that forwards events from channels to Bevy events
fn forward_table_events<T: Message>(
    receiver: Res<TableEventReceiver<T>>,
    mut events: MessageWriter<T>,
) {
    let recv = match receiver.receiver.lock() {
        Ok(recv) => recv,
        Err(e) => {
            log_error(format!("Failed to lock table event receiver: {}", e));
            return;
        }
    };
    for event in recv.try_iter() {
        events.write(event);
    }
}

/// Subscribe to table events from SpacetimeDB
///
/// This function should be called after both `add_table_events()` and connection
/// establishment. It creates the actual subscription to the SpacetimeDB table.
///
/// # Example
/// ```rust,ignore
/// app.add_table_events::<Player>("test_player");
///
/// let bridge = get_bridge();
/// let connection_id = bridge.create_connection(...);
/// // ... connect ...
///
/// subscribe_to_table::<Player>(&mut app.world, &bridge, connection_id).expect("Failed to subscribe");
/// ```
pub async fn subscribe_to_table<T>(
    world: &mut World,
    bridge: &crate::bridge::SpacetimeDBBridge,
    connection_id: u32,
) -> Result<(), String>
where
    T: DeserializeOwned + Clone + Send + Sync + 'static,
{
    // Get the table event senders from the world
    let senders = world
        .get_resource::<TableEventSenders<T>>()
        .ok_or_else(|| "TableEventSenders not found - did you call add_table_events()?".to_string())?
        .clone_senders();

    let table_name = senders.table_name.clone();

    log_info(format!("[Table Events] Subscribing to table '{}'", table_name));

    // Create insert callback
    let insert_send = senders.insert_send.clone();
    let insert_cb = Closure::wrap(Box::new(move |json: JsValue| {
        if let Some(json_str) = json.as_string() {
            match parse_table_event::<T>(&json_str) {
                Ok((row, reducer_name, caller_identity)) => {
                    let event = InsertEvent {
                        row,
                        reducer_name,
                        caller_identity,
                    };
                    if let Err(e) = insert_send.send(event) {
                        log_error(format!("Failed to send insert event: {:?}", e));
                    }
                }
                Err(e) => {
                    log_error(format!("Failed to parse insert event: {}", e));
                }
            }
        }
    }) as Box<dyn Fn(JsValue)>);

    // Create update callback
    let update_send = senders.update_send.clone();
    let update_cb = Closure::wrap(Box::new(move |json: JsValue| {
        if let Some(json_str) = json.as_string() {
            match parse_update_event::<T>(&json_str) {
                Ok((old_row, new_row, reducer_name, caller_identity)) => {
                    let event = UpdateEvent {
                        old_row,
                        new_row,
                        reducer_name,
                        caller_identity,
                    };
                    if let Err(e) = update_send.send(event) {
                        log_error(format!("Failed to send update event: {:?}", e));
                    }
                }
                Err(e) => {
                    log_error(format!("Failed to parse update event: {}", e));
                }
            }
        }
    }) as Box<dyn Fn(JsValue)>);

    // Create delete callback
    let delete_send = senders.delete_send.clone();
    let delete_cb = Closure::wrap(Box::new(move |json: JsValue| {
        if let Some(json_str) = json.as_string() {
            match parse_table_event::<T>(&json_str) {
                Ok((row, reducer_name, caller_identity)) => {
                    let event = DeleteEvent {
                        row,
                        reducer_name,
                        caller_identity,
                    };
                    if let Err(e) = delete_send.send(event) {
                        log_error(format!("Failed to send delete event: {:?}", e));
                    }
                }
                Err(e) => {
                    log_error(format!("Failed to parse delete event: {}", e));
                }
            }
        }
    }) as Box<dyn Fn(JsValue)>);

    // Register callbacks with bridge
    let insert_id = bridge.register_callback(insert_cb.as_ref().unchecked_ref());
    let update_id = bridge.register_callback(update_cb.as_ref().unchecked_ref());
    let delete_id = bridge.register_callback(delete_cb.as_ref().unchecked_ref());

    // Subscribe to the table and wait for subscription to be applied
    let promise = bridge.subscribe_table(
        connection_id,
        &table_name,
        Some(insert_id),
        Some(update_id),
        Some(delete_id),
    );

    // Keep callbacks alive
    insert_cb.forget();
    update_cb.forget();
    delete_cb.forget();

    // Wait for subscription to complete
    use wasm_bindgen_futures::JsFuture;
    JsFuture::from(promise)
        .await
        .map_err(|e| format!("Failed to subscribe to table '{}': {:?}", table_name, e))?;

    log_info(format!("[Table Events] ✓ Subscribed to table '{}'", table_name));

    Ok(())
}

/// Helper struct for cloning senders
struct ClonedSenders<T: DeserializeOwned + Clone + Send + Sync + 'static> {
    table_name: String,
    insert_send: mpsc::Sender<InsertEvent<T>>,
    update_send: mpsc::Sender<UpdateEvent<T>>,
    delete_send: mpsc::Sender<DeleteEvent<T>>,
}

impl<T: DeserializeOwned + Clone + Send + Sync + 'static> TableEventSenders<T> {
    fn clone_senders(&self) -> ClonedSenders<T> {
        ClonedSenders {
            table_name: self.table_name.clone(),
            insert_send: self.insert_send.clone(),
            update_send: self.update_send.clone(),
            delete_send: self.delete_send.clone(),
        }
    }
}

/// Helper struct for deserializing reducer event metadata from JSON
#[derive(serde::Deserialize)]
struct ReducerEventData {
    #[serde(rename = "reducerName")]
    reducer_name: String,
    #[serde(rename = "callerIdentity")]
    caller_identity: String,
}

/// Parse table event JSON from the bridge
fn parse_table_event<T: DeserializeOwned>(
    json_str: &str,
) -> Result<(T, Option<String>, Option<String>), String> {
    #[derive(serde::Deserialize)]
    struct EventData<T> {
        row: Option<T>,
        #[serde(rename = "reducerEvent")]
        reducer_event: Option<ReducerEventData>,
    }

    let data: EventData<T> = serde_json::from_str(json_str)
        .map_err(|e| format!("JSON parse error: {}", e))?;

    let row = data.row.ok_or_else(|| "Missing row field".to_string())?;

    let (reducer_name, caller_identity) = if let Some(reducer_event) = data.reducer_event {
        (
            Some(reducer_event.reducer_name),
            Some(reducer_event.caller_identity),
        )
    } else {
        (None, None)
    };

    Ok((row, reducer_name, caller_identity))
}

/// Parse update event JSON from the bridge
fn parse_update_event<T: DeserializeOwned>(
    json_str: &str,
) -> Result<(T, T, Option<String>, Option<String>), String> {
    #[derive(serde::Deserialize)]
    struct UpdateEventData<T> {
        #[serde(rename = "oldRow")]
        old_row: Option<T>,
        #[serde(rename = "newRow")]
        new_row: Option<T>,
        #[serde(rename = "reducerEvent")]
        reducer_event: Option<ReducerEventData>,
    }

    let data: UpdateEventData<T> = serde_json::from_str(json_str)
        .map_err(|e| format!("JSON parse error: {}", e))?;

    let old_row = data.old_row.ok_or_else(|| "Missing oldRow field".to_string())?;
    let new_row = data.new_row.ok_or_else(|| "Missing newRow field".to_string())?;

    let (reducer_name, caller_identity) = if let Some(reducer_event) = data.reducer_event {
        (
            Some(reducer_event.reducer_name),
            Some(reducer_event.caller_identity),
        )
    } else {
        (None, None)
    };

    Ok((old_row, new_row, reducer_name, caller_identity))
}
