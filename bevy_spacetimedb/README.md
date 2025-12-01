# bevy_spacetimedb_wasm

WASM-only SpacetimeDB integration for Bevy using the TypeScript SDK bridge.

This crate provides a Bevy plugin that connects to SpacetimeDB in browser environments via the official TypeScript SDK. It enables real-time multiplayer games and applications using Bevy with SpacetimeDB as the backend.

## ⚠️ Important Limitations

- **WASM-only**: This crate only works on `wasm32-unknown-unknown` targets (browsers)
- **For native builds**, use the original [bevy_spacetimedb](https://github.com/JulienLavocat/bevy_spacetimedb) crate
- **Requires browser environment**: The TypeScript SDK must be loaded in the browser before your WASM module

## Features

- ✅ Real-time connection to SpacetimeDB via TypeScript SDK 1.9.x
- ✅ Automatic table event subscriptions (Insert/Update/Delete)
- ✅ Reducer calls from Bevy systems
- ✅ Identity and token access after connection
- ✅ Bevy event system integration with metadata (reducer name, caller identity)
- ✅ Type-safe reducer definitions
- ✅ Connection lifecycle events
- ✅ Selective event subscriptions (insert-only, no-update, etc.)

## Quick Start

### 1. Add to your Cargo.toml

```toml
[dependencies]
bevy = "0.14"
bevy_spacetimedb_wasm = { path = "../bevy_spacetimedb_wasm/bevy_spacetimedb" }
serde = { version = "1.0", features = ["derive"] }

[target.wasm32-unknown-unknown.dependencies]
wasm-bindgen = "0.2"
```

### 2. Set up your HTML

Your HTML needs to load the TypeScript SDK and the bridge before your WASM module:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My SpacetimeDB Game</title>
</head>
<body>
    <script type="module">
        // 1. Import the bridge (built from js/spacetimedb-bridge.ts)
        import { SpacetimeDBBridge } from './js/dist/spacetimedb-bridge.bundle.js';

        // 2. Initialize the global bridge BEFORE loading WASM
        window.__SPACETIMEDB_BRIDGE__ = new SpacetimeDBBridge();

        // 3. Now load your WASM module
        import init from './pkg/my_game.js';
        await init();
    </script>
</body>
</html>
```

### 3. Add the Plugin to your Bevy App

```rust
use bevy::prelude::*;
use bevy_spacetimedb_wasm::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(
            StdbPlugin::default()
                .with_uri("ws://localhost:3000")
                .with_module_name("my-game-module")
                // Optional: Provide auth token
                .with_auth_token("my-auth-token")
                // Register your tables
                .add_table::<Player>()
                .add_table::<GameState>()
        )
        .add_systems(Update, handle_player_spawns)
        .run();
}
```

## Generating Client Code for Reducers

SpacetimeDB generates TypeScript client code from your server module. To use reducers from Rust/WASM, you'll define them manually:

### Server-Side (Rust SpacetimeDB Module)

First, define your reducers in your SpacetimeDB server module:

```rust
// In your SpacetimeDB module (server/src/lib.rs)
use spacetimedb::{reducer, Identity, Timestamp};

#[spacetimedb::table(name = player, public)]
pub struct Player {
    #[primary_key]
    pub id: u64,
    pub name: String,
    pub x: f32,
    pub y: f32,
    pub owner: Identity,
}

#[reducer]
pub fn create_player(ctx: &ReducerContext, name: String, x: f32, y: f32) -> Result<(), String> {
    Player::insert(Player {
        id: ctx.timestamp.elapsed().as_millis() as u64,
        name,
        x,
        y,
        owner: ctx.sender,
    });
    Ok(())
}

#[reducer]
pub fn move_player(ctx: &ReducerContext, player_id: u64, x: f32, y: f32) -> Result<(), String> {
    Player::filter_by_id(&player_id)
        .update(|player| {
            player.x = x;
            player.y = y;
        });
    Ok(())
}
```

### Client-Side (Bevy WASM)

Define matching types and reducers in your Bevy app:

```rust
use bevy::prelude::*;
use bevy_spacetimedb_wasm::*;
use serde::{Deserialize, Serialize};

// 1. Define your table row type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: u64,
    pub name: String,
    pub x: f32,
    pub y: f32,
    pub owner: String, // Identity as hex string
}

// 2. Implement TableRow trait
impl TableRow for Player {
    const TABLE_NAME: &'static str = "player";
}

// 3. Define your reducers
define_reducer!(CreatePlayer, "create_player", (String, f32, f32));
define_reducer!(MovePlayer, "move_player", (u64, f32, f32));

// 4. Call reducers from your systems
fn spawn_player_system(
    connection: Res<StdbConnection>,
    keyboard: Res<ButtonInput<KeyCode>>,
) {
    if keyboard.just_pressed(KeyCode::Space) {
        // Call the create_player reducer
        connection.reducers()
            .call::<CreatePlayer>(("Alice".to_string(), 0.0, 0.0))
            .expect("Failed to call create_player");
    }
}

// 5. React to table events
fn handle_player_spawns(
    mut insert_events: EventReader<InsertEvent<Player>>,
) {
    for event in insert_events.read() {
        info!("New player spawned: {:?}", event.row);
    }
}
```

### ⚠️ Important: Manual Type Translation Required

**SpacetimeDB generates TypeScript client bindings, not Rust bindings.** This means you need to:

1. **Manually translate types** - Copy your server structs to client, adapting types:
   ```rust
   // Server (SpacetimeDB module)
   use spacetimedb::Identity;
   pub struct Player {
       pub owner: Identity,  // SpacetimeDB Identity type
   }

   // Client (Bevy WASM)
   pub struct Player {
       pub owner: String,    // Identity becomes hex string on client
   }
   ```

2. **Match field names exactly** - Field names must match between server and client
3. **Match field types** - Use compatible types:
   - `Identity` (server) → `String` (client, as hex string)
   - `Timestamp` (server) → Not directly accessible on client
   - `u64`, `String`, `f32`, etc. → Same on both sides
   - `Vec<T>` → Same on both sides

4. **No automatic code generation for Rust** - SpacetimeDB's `generate` command creates TypeScript bindings. You can:
   - Reference the TypeScript bindings to see field types
   - Manually create matching Rust structs
   - Keep your types in sync manually

Example workflow:
```bash
# Generate TypeScript bindings (for reference)
cd server
spacetime generate --lang typescript --out-dir ../client-bindings

# Look at client-bindings/player_type.ts to see the structure
# Manually create matching Rust struct in your Bevy app
```

### Quick Reference: define_reducer! Macro

The `define_reducer!` macro creates a type-safe reducer definition:

```rust
// No arguments
define_reducer!(ResetGame, "reset_game", ());

// Single argument
define_reducer!(DeletePlayer, "delete_player", u64);

// Multiple arguments (use tuple)
define_reducer!(
    CreatePlayer,
    "create_player",
    (String, f32, f32)
);

// Complex types
define_reducer!(
    UpdateInventory,
    "update_inventory",
    (u64, Vec<String>)
);
```

## Table Events

Subscribe to table changes using Bevy events:

```rust
fn setup(mut app: App) {
    app.add_plugins(
        StdbPlugin::default()
            .with_uri("ws://localhost:3000")
            .with_module_name("my-game")
            // All events (insert, update, delete)
            .add_table::<Player>()
            // Only specific events
            .add_partial_table::<GameState>(TableEvents::insert_only())
    );
}

fn handle_events(
    mut inserts: EventReader<InsertEvent<Player>>,
    mut updates: EventReader<UpdateEvent<Player>>,
    mut deletes: EventReader<DeleteEvent<Player>>,
) {
    // Handle new rows
    for event in inserts.read() {
        info!("New player: {:?}", event.row);
        if let Some(reducer_name) = &event.reducer_name {
            info!("  Caused by: {}", reducer_name);
        }
        if let Some(caller) = &event.caller_identity {
            info!("  By user: {}", caller);
        }
    }

    // Handle updates
    for event in updates.read() {
        info!("Player updated: {:?} -> {:?}", event.old_row, event.new_row);
    }

    // Handle deletions
    for event in deletes.read() {
        info!("Player deleted: {:?}", event.row);
    }
}
```

### TableEvents Configuration

Control which events you want to receive:

```rust
TableEvents::all()           // Insert, Update, Delete (default)
TableEvents::no_update()     // Insert, Delete (skip updates)
TableEvents::insert_only()   // Only inserts
TableEvents::update_only()   // Only updates
TableEvents::delete_only()   // Only deletes

// Custom configuration
TableEvents {
    insert: true,
    update: false,
    delete: true,
}
```

## Connection Lifecycle

Monitor connection state changes:

```rust
fn handle_connection_events(
    mut connected: EventReader<StdbConnectedEvent>,
    mut disconnected: EventReader<StdbDisconnectedEvent>,
    mut errors: EventReader<StdbConnectionErrorEvent>,
) {
    for event in connected.read() {
        info!("Connected to SpacetimeDB!");
    }

    for event in disconnected.read() {
        warn!("Disconnected: {:?}", event.error_message);
    }

    for event in errors.read() {
        error!("Connection error: {}", event.message);
    }
}
```

## Identity and Authentication

Access the connected client's identity and token:

```rust
fn show_identity(connection: Res<StdbConnection>) {
    if let Some(identity) = connection.identity() {
        info!("My identity: {}", identity.to_hex());
        info!("Short ID: {}", identity.short_hex()); // First 8 chars
    }

    if let Some(token) = connection.token() {
        info!("Auth token: {}", token);
    }
}
```

## Building for WASM

### Build the TypeScript Bridge

Before building your WASM app, build the TypeScript bridge:

```bash
cd bevy_spacetimedb/js
npm install
npm run build
```

This creates `dist/spacetimedb-bridge.bundle.js` which you reference in your HTML.

### Build Your WASM App

```bash
# Install wasm-pack if you haven't
cargo install wasm-pack

# Build your game
wasm-pack build --target web --out-dir www/pkg

# Or for development with debugging
wasm-pack build --dev --target web --out-dir www/pkg
```

### Serve Your App

```bash
# Simple HTTP server
python3 -m http.server 8000

# Or use any other static file server
# Then open http://localhost:8000
```

## Testing

### Running Unit Tests

The identity module has comprehensive unit tests:

```bash
cd bevy_spacetimedb
wasm-pack test --headless --firefox --lib
```

### Running Integration Tests

Integration tests require a running SpacetimeDB server:

```bash
# Terminal 1: Start SpacetimeDB
spacetime start

# Terminal 2: Publish test module
cd tests/test_module
spacetime publish test-module

# Terminal 3: Run tests
cd ../..
wasm-pack test --headless --firefox
```

### Comprehensive Test Suite

Run all tests including compilation checks:

```bash
./run-comprehensive-tests.sh
```

## Examples

### Complete Multiplayer Game Example

```rust
use bevy::prelude::*;
use bevy_spacetimedb_wasm::*;
use serde::{Deserialize, Serialize};

// Define your game data
#[derive(Debug, Clone, Serialize, Deserialize, Component)]
pub struct Player {
    pub id: u64,
    pub name: String,
    pub x: f32,
    pub y: f32,
}

impl TableRow for Player {
    const TABLE_NAME: &'static str = "player";
}

// Define reducers
define_reducer!(SpawnPlayer, "spawn_player", (String, f32, f32));
define_reducer!(MovePlayer, "move_player", (u64, f32, f32));

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(
            StdbPlugin::default()
                .with_uri("ws://localhost:3000")
                .with_module_name("multiplayer-game")
                .add_table::<Player>()
        )
        .add_systems(Startup, setup)
        .add_systems(Update, (
            spawn_player_on_key,
            handle_player_inserts,
            handle_player_updates,
            move_local_player,
        ))
        .run();
}

fn setup(mut commands: Commands) {
    commands.spawn(Camera2dBundle::default());
}

fn spawn_player_on_key(
    keyboard: Res<ButtonInput<KeyCode>>,
    connection: Res<StdbConnection>,
) {
    if keyboard.just_pressed(KeyCode::Space) {
        connection.reducers()
            .call::<SpawnPlayer>(("Player".to_string(), 0.0, 0.0))
            .expect("Failed to spawn player");
    }
}

fn handle_player_inserts(
    mut commands: Commands,
    mut inserts: EventReader<InsertEvent<Player>>,
) {
    for event in inserts.read() {
        // Spawn Bevy entity for each new player
        commands.spawn((
            event.row.clone(),
            SpriteBundle {
                transform: Transform::from_xyz(event.row.x, event.row.y, 0.0),
                ..default()
            },
        ));
        info!("Spawned player: {}", event.row.name);
    }
}

fn handle_player_updates(
    mut query: Query<(&Player, &mut Transform)>,
    mut updates: EventReader<UpdateEvent<Player>>,
) {
    for event in updates.read() {
        // Update entity position
        for (player, mut transform) in query.iter_mut() {
            if player.id == event.new_row.id {
                transform.translation.x = event.new_row.x;
                transform.translation.y = event.new_row.y;
            }
        }
    }
}

fn move_local_player(
    keyboard: Res<ButtonInput<KeyCode>>,
    connection: Res<StdbConnection>,
    identity: Res<StdbConnection>, // To check ownership
    query: Query<&Player>,
) {
    let Some(my_identity) = connection.identity() else {
        return;
    };

    // Find our player
    let my_player = query.iter()
        .find(|p| p.owner == my_identity.to_hex());

    let Some(player) = my_player else {
        return;
    };

    // Move with arrow keys
    let mut dx = 0.0;
    let mut dy = 0.0;

    if keyboard.pressed(KeyCode::ArrowLeft) { dx -= 5.0; }
    if keyboard.pressed(KeyCode::ArrowRight) { dx += 5.0; }
    if keyboard.pressed(KeyCode::ArrowUp) { dy += 5.0; }
    if keyboard.pressed(KeyCode::ArrowDown) { dy -= 5.0; }

    if dx != 0.0 || dy != 0.0 {
        connection.reducers()
            .call::<MovePlayer>((player.id, player.x + dx, player.y + dy))
            .expect("Failed to move player");
    }
}
```

## Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  Browser Environment                                         │
│                                                              │
│  ┌──────────────────┐         ┌───────────────────────┐    │
│  │  SpacetimeDB     │◄────────┤  TypeScript SDK       │    │
│  │  Server          │  WebSo  │  (Official)           │    │
│  │  ws://localhost  │  cket   │  @clockworklabs/...   │    │
│  └──────────────────┘         └───────────┬───────────┘    │
│                                            │                 │
│                               ┌────────────▼───────────┐    │
│                               │  spacetimedb-bridge.ts │    │
│                               │  (This crate's bridge) │    │
│                               └────────────┬───────────┘    │
│                                            │ wasm_bindgen   │
│                               ┌────────────▼───────────┐    │
│                               │  bevy_spacetimedb_wasm │    │
│                               │  (Rust/WASM)           │    │
│                               └────────────┬───────────┘    │
│                                            │                 │
│                               ┌────────────▼───────────┐    │
│                               │  Your Bevy App         │    │
│                               │  (Game/Application)    │    │
│                               └────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

1. **SpacetimeDB Server**: Your backend module with tables and reducers
2. **TypeScript SDK**: Official SpacetimeDB SDK for browsers
3. **spacetimedb-bridge.ts**: Bridge layer (this crate provides)
4. **bevy_spacetimedb_wasm**: Rust API exposed to Bevy (this crate)
5. **Your Bevy App**: Your game/app using the plugin

## API Reference

### StdbPlugin

Main plugin for SpacetimeDB integration.

```rust
StdbPlugin::default()
    .with_uri(uri: &str)                    // Set WebSocket URI
    .with_module_name(name: &str)           // Set module name/address
    .with_auth_token(token: &str)           // Set auth token (optional)
    .add_table::<T: TableRow>()             // Subscribe to all events
    .add_partial_table::<T>(events)         // Subscribe to specific events
```

### StdbConnection (Resource)

Connection handle available as a Bevy resource after connection.

```rust
impl StdbConnection {
    fn reducers(&self) -> ReducerCaller     // Get reducer caller
    fn identity(&self) -> Option<Identity>  // Get client identity
    fn token(&self) -> Option<String>       // Get auth token
    fn state(&self) -> ConnectionState      // Get connection state
    fn disconnect(&self)                    // Disconnect from server
}
```

### Reducer Trait

Define and call reducers.

```rust
impl Reducer for MyReducer {
    const NAME: &'static str = "my_reducer";
    type Args = (String, u32);  // Or single type, or ()
}

// Call a reducer
connection.reducers()
    .call::<MyReducer>(("arg1", 42))
    .expect("Reducer call failed");
```

### TableRow Trait

Mark types as SpacetimeDB table rows.

```rust
impl TableRow for MyRow {
    const TABLE_NAME: &'static str = "my_table";
}
```

### Events

All events are sent as Bevy events:

- `StdbConnectedEvent` - Connection established
- `StdbDisconnectedEvent` - Connection lost
- `StdbConnectionErrorEvent` - Connection error
- `InsertEvent<T>` - Row inserted
- `UpdateEvent<T>` - Row updated
- `DeleteEvent<T>` - Row deleted

## Troubleshooting

### "Bridge not found" Error

Make sure the TypeScript bridge is loaded **before** your WASM module:

```html
<script type="module">
    // CORRECT ORDER:
    // 1. Import bridge
    import { SpacetimeDBBridge } from './js/dist/spacetimedb-bridge.bundle.js';
    // 2. Set global
    window.__SPACETIMEDB_BRIDGE__ = new SpacetimeDBBridge();
    // 3. Load WASM
    import init from './pkg/my_game.js';
    await init();
</script>
```

### "Connection failed" Errors

1. Check SpacetimeDB server is running: `spacetime start`
2. Verify correct WebSocket URI (use `ws://` not `http://`)
3. Check module is published: `spacetime publish your-module`
4. Check browser console for detailed errors

### Events Not Firing

1. Make sure you called `.add_table::<YourType>()` on the plugin
2. Verify `TableRow::TABLE_NAME` matches server table name exactly
3. Check that `EventReader<InsertEvent<YourType>>` is in your systems
4. Ensure Bevy app is calling `.update()` to process events

### Type Mismatches

Make sure your Rust types match the SpacetimeDB schema:

```rust
// Server schema
#[spacetimedb::table(name = player)]
pub struct Player {
    pub id: u64,        // <-- Must match
    pub name: String,   // <-- Must match
}

// Client type
#[derive(Serialize, Deserialize)]
pub struct Player {
    pub id: u64,        // <-- Same type
    pub name: String,   // <-- Same type
}
```

**Common type translation mistakes:**

```rust
// ❌ WRONG - Using Identity on client
pub owner: Identity,  // This won't deserialize!

// ✅ CORRECT - Identity becomes String
pub owner: String,    // SpacetimeDB sends identity as hex string

// ❌ WRONG - Field name doesn't match server
pub player_name: String,  // Server has "name"

// ✅ CORRECT - Field names must match exactly
pub name: String,

// ❌ WRONG - Missing #[derive(Serialize, Deserialize)]
pub struct Player { ... }

// ✅ CORRECT - Must be serializable
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player { ... }
```

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass: `./run-comprehensive-tests.sh`
2. Code is formatted: `cargo fmt`
3. No compiler warnings: `cargo clippy`
4. Tests added for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built on top of the official [SpacetimeDB TypeScript SDK](https://spacetimedb.com/)
- Inspired by [bevy_spacetimedb](https://github.com/JulienLavocat/bevy_spacetimedb) by JulienLavocat
- Powered by [Bevy](https://bevyengine.org/) game engine
