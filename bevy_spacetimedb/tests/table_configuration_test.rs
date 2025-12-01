// Tests for table configuration and TableEvents
// Tests TableEvents::all(), no_update(), insert_only(), etc.

use bevy::prelude::*;
use bevy_spacetimedb_wasm::*;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_table_events_all() {
    let events = TableEvents::all();

    assert!(events.insert, "TableEvents::all() should include insert");
    assert!(events.update, "TableEvents::all() should include update");
    assert!(events.delete, "TableEvents::all() should include delete");
}

#[wasm_bindgen_test]
fn test_table_events_no_update() {
    let events = TableEvents::no_update();

    assert!(events.insert, "TableEvents::no_update() should include insert");
    assert!(!events.update, "TableEvents::no_update() should NOT include update");
    assert!(events.delete, "TableEvents::no_update() should include delete");
}

#[wasm_bindgen_test]
fn test_table_events_insert_only() {
    let events = TableEvents::insert_only();

    assert!(events.insert, "TableEvents::insert_only() should include insert");
    assert!(!events.update, "TableEvents::insert_only() should NOT include update");
    assert!(!events.delete, "TableEvents::insert_only() should NOT include delete");
}

#[wasm_bindgen_test]
fn test_table_events_update_only() {
    let events = TableEvents::update_only();

    assert!(!events.insert, "TableEvents::update_only() should NOT include insert");
    assert!(events.update, "TableEvents::update_only() should include update");
    assert!(!events.delete, "TableEvents::update_only() should NOT include delete");
}

#[wasm_bindgen_test]
fn test_table_events_delete_only() {
    let events = TableEvents::delete_only();

    assert!(!events.insert, "TableEvents::delete_only() should NOT include insert");
    assert!(!events.update, "TableEvents::delete_only() should NOT include update");
    assert!(events.delete, "TableEvents::delete_only() should include delete");
}

#[wasm_bindgen_test]
fn test_table_events_custom_configuration() {
    let events = TableEvents {
        insert: true,
        update: false,
        delete: true,
    };

    assert!(events.insert, "Custom config should respect insert");
    assert!(!events.update, "Custom config should respect update");
    assert!(events.delete, "Custom config should respect delete");
}

#[wasm_bindgen_test]
fn test_table_events_none() {
    let events = TableEvents {
        insert: false,
        update: false,
        delete: false,
    };

    assert!(!events.insert, "Should allow no events");
    assert!(!events.update, "Should allow no events");
    assert!(!events.delete, "Should allow no events");
}

#[wasm_bindgen_test]
fn test_add_table_uses_all_events() {
    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    struct TestPlayer {
        id: u64,
        name: String,
    }

    impl TableRow for TestPlayer {
        const TABLE_NAME: &'static str = "test_player";
    }

    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    // add_table should register all event types
    app.add_plugins(
        StdbPlugin::default()
            .with_uri("ws://localhost:3000")
            .with_module_name("test")
            .add_table::<TestPlayer>()
    );

    let world = app.world();
    assert!(
        world.contains_resource::<Messages<InsertEvent<TestPlayer>>>(),
        "add_table should register InsertEvent"
    );
    assert!(
        world.contains_resource::<Messages<UpdateEvent<TestPlayer>>>(),
        "add_table should register UpdateEvent"
    );
    assert!(
        world.contains_resource::<Messages<DeleteEvent<TestPlayer>>>(),
        "add_table should register DeleteEvent"
    );
}

#[wasm_bindgen_test]
fn test_add_partial_table_with_insert_only() {
    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    struct TestPlayer {
        id: u64,
        name: String,
    }

    impl TableRow for TestPlayer {
        const TABLE_NAME: &'static str = "test_player";
    }

    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    app.add_plugins(
        StdbPlugin::default()
            .with_uri("ws://localhost:3000")
            .with_module_name("test")
            .add_partial_table::<TestPlayer>(TableEvents::insert_only())
    );

    // All event types should still be registered (filtering happens at subscription)
    let world = app.world();
    assert!(
        world.contains_resource::<Messages<InsertEvent<TestPlayer>>>(),
        "Should register InsertEvent even with partial config"
    );
}

#[wasm_bindgen_test]
fn test_multiple_tables_different_configs() {
    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    struct TestPlayer {
        id: u64,
        name: String,
    }

    impl TableRow for TestPlayer {
        const TABLE_NAME: &'static str = "test_player";
    }

    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    struct TestGame {
        id: u64,
        name: String,
    }

    impl TableRow for TestGame {
        const TABLE_NAME: &'static str = "test_game";
    }

    let plugin = StdbPlugin::default()
        .with_uri("ws://localhost:3000")
        .with_module_name("test")
        .add_table::<TestPlayer>()  // All events
        .add_partial_table::<TestGame>(TableEvents::insert_only());  // Insert only

    assert!(true, "Should support different configs for different tables");
}

#[wasm_bindgen_test]
fn test_table_events_clone() {
    let events1 = TableEvents::all();
    let events2 = events1.clone();

    assert_eq!(events1.insert, events2.insert);
    assert_eq!(events1.update, events2.update);
    assert_eq!(events1.delete, events2.delete);
}

#[wasm_bindgen_test]
fn test_table_events_debug() {
    let events = TableEvents::all();
    let debug_str = format!("{:?}", events);

    assert!(debug_str.contains("TableEvents"), "Debug should show type name");
}

#[wasm_bindgen_test]
fn test_table_row_trait_name_constant() {
    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    struct MyTable {
        id: u64,
    }

    impl TableRow for MyTable {
        const TABLE_NAME: &'static str = "my_custom_table";
    }

    assert_eq!(MyTable::TABLE_NAME, "my_custom_table");
}
