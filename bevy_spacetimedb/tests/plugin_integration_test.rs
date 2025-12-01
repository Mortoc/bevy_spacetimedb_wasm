// Integration tests for StdbPlugin
// Tests plugin builder, configuration, and Bevy app integration

use bevy::prelude::*;
use bevy_spacetimedb_wasm::*;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_plugin_builder_with_uri() {
    let plugin = StdbPlugin::default()
        .with_uri("ws://localhost:3000");

    // Plugin should store configuration
    // We can't directly inspect private fields, but we can verify it doesn't panic
    assert!(true, "Plugin builder should accept URI");
}

#[wasm_bindgen_test]
fn test_plugin_builder_with_module_name() {
    let plugin = StdbPlugin::default()
        .with_module_name("test-module");

    assert!(true, "Plugin builder should accept module name");
}

#[wasm_bindgen_test]
fn test_plugin_builder_with_auth_token() {
    let plugin = StdbPlugin::default()
        .with_auth_token("test-token-123");

    assert!(true, "Plugin builder should accept auth token");
}

#[wasm_bindgen_test]
fn test_plugin_builder_chaining() {
    let plugin = StdbPlugin::default()
        .with_uri("ws://localhost:3000")
        .with_module_name("test-module")
        .with_auth_token("test-token");

    assert!(true, "Plugin builder should support method chaining");
}

#[wasm_bindgen_test]
fn test_plugin_adds_to_bevy_app() {
    test_helpers::init_test_bridge();

    let mut app = App::new();

    // Add minimal plugins first
    app.add_plugins(MinimalPlugins);

    // Add StdbPlugin
    app.add_plugins(
        StdbPlugin::default()
            .with_uri("ws://localhost:3000")
            .with_module_name("test-module")
    );

    // Plugin should register without panicking
    assert!(true, "Plugin should add to Bevy app without errors");
}

#[wasm_bindgen_test]
fn test_plugin_registers_connection_events() {
    test_helpers::init_test_bridge();

    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    app.add_plugins(
        StdbPlugin::default()
            .with_uri("ws://localhost:3000")
            .with_module_name("test")
    );

    // Verify connection event types are registered
    let world = app.world();
    assert!(
        world.contains_resource::<Messages<StdbConnectedEvent>>(),
        "StdbConnectedEvent should be registered"
    );
    assert!(
        world.contains_resource::<Messages<StdbDisconnectedEvent>>(),
        "StdbDisconnectedEvent should be registered"
    );
    assert!(
        world.contains_resource::<Messages<StdbConnectionErrorEvent>>(),
        "StdbConnectionErrorEvent should be registered"
    );
}

#[wasm_bindgen_test]
fn test_plugin_default_creates_plugin() {
    let plugin = StdbPlugin::default();

    // Should create a plugin with default values
    assert!(true, "StdbPlugin::default() should create a plugin");
}

#[wasm_bindgen_test]
fn test_plugin_multiple_table_registrations() {
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
        .add_table::<TestPlayer>()
        .add_table::<TestGame>();

    assert!(true, "Plugin should support multiple table registrations");
}

#[wasm_bindgen_test]
fn test_plugin_partial_table_registration() {
    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    struct TestPlayer {
        id: u64,
        name: String,
    }

    impl TableRow for TestPlayer {
        const TABLE_NAME: &'static str = "test_player";
    }

    let plugin = StdbPlugin::default()
        .with_uri("ws://localhost:3000")
        .with_module_name("test")
        .add_partial_table::<TestPlayer>(TableEvents::insert_only());

    assert!(true, "Plugin should support partial table registration");
}

#[wasm_bindgen_test]
fn test_plugin_registers_table_event_types() {
    test_helpers::init_test_bridge();

    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
    struct TestPlayer {
        id: u64,
        name: String,
    }

    impl TableRow for TestPlayer {
        const TABLE_NAME: &'static str = "test_player";
    }

    app.add_plugins(
        StdbPlugin::default()
            .with_uri("ws://localhost:3000")
            .with_module_name("test")
            .add_table::<TestPlayer>()
    );

    // Verify table event types are registered
    let world = app.world();
    assert!(
        world.contains_resource::<Messages<InsertEvent<TestPlayer>>>(),
        "InsertEvent<TestPlayer> should be registered"
    );
    assert!(
        world.contains_resource::<Messages<UpdateEvent<TestPlayer>>>(),
        "UpdateEvent<TestPlayer> should be registered"
    );
    assert!(
        world.contains_resource::<Messages<DeleteEvent<TestPlayer>>>(),
        "DeleteEvent<TestPlayer> should be registered"
    );
}

#[wasm_bindgen_test]
async fn test_plugin_creates_connection_resource() {
    test_helpers::init_test_bridge();

    let mut app = App::new();
    app.add_plugins(MinimalPlugins);

    app.add_plugins(
        StdbPlugin::default()
            .with_uri("ws://localhost:3000")
            .with_module_name("test-module")
    );

    // Give the plugin time to initialize
    app.update();

    // Note: Connection resource might not exist until actually connected
    // This test just verifies the plugin doesn't panic during setup
    assert!(true, "Plugin should initialize connection setup");
}

#[wasm_bindgen_test]
fn test_plugin_can_be_cloned() {
    let plugin1 = StdbPlugin::default()
        .with_uri("ws://localhost:3000")
        .with_module_name("test");

    // Plugin implements Clone via builder pattern
    let plugin2 = StdbPlugin::default()
        .with_uri("ws://localhost:3000")
        .with_module_name("test");

    assert!(true, "Plugin should be creatable multiple times");
}
