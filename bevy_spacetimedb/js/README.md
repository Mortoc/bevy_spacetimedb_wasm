# SpacetimeDB Bridge for Bevy WASM

This directory contains the JavaScript bridge that connects Bevy WASM applications to SpacetimeDB servers.

## Architecture

The bridge wraps the official **SpacetimeDB TypeScript SDK** and provides a simplified imperative API for Rust/WASM code. The SDK handles all the complex protocol details:

- **BSATN encoding/decoding** - Binary serialization format
- **WebSocket protocol** - Connection management and message framing
- **Table subscriptions** - Reactive updates when database changes
- **Reducer calls** - RPC invocations with proper argument serialization

## Quick Start for Browser

### 1. Build the Bundle

```bash
cd bevy_spacetimedb/js
npm install
npm run build
```

This creates `dist/spacetimedb-bridge.bundle.js` - a self-contained ES module ready for browsers.

### 2. Copy to Your Web Assets

```bash
cp dist/spacetimedb-bridge.bundle.js /path/to/your/public/js/
```

### 3. Load in HTML

```html
<script type="module">
  // Import the bundled bridge
  import { SpacetimeDBBridge } from './js/spacetimedb-bridge.bundle.js';

  // Initialize for WASM access
  window.__SPACETIMEDB_BRIDGE__ = new SpacetimeDBBridge();

  // Now load your WASM
  import init from './pkg/my_game.js';
  await init();
</script>
```

### 4. Verify It Works

Open the browser console - you should see:
```
[SpacetimeDB Bridge] Initialized
```

**✅ That's it!** Your Bevy WASM app can now use the bridge.

### Testing the Bundle

To test the bundle locally:

```bash
cd bevy_spacetimedb/js
python -m http.server 8000
```

Open http://localhost:8000/example.html in your browser to see a working demo.

## Files

### `spacetimedb-bridge.js` - Production Bridge

This is the main bridge file for production use. It provides:

- Connection management via `DbConnectionBuilder`
- Reducer invocation via `DbConnection.call()`
- Table subscriptions via `DbConnection.subscribe()`
- Event forwarding (insert/update/delete) to Rust callbacks

**Usage:**

```html
<script type="module">
  // Import the bridge (adjust path as needed)
  import './js/spacetimedb-bridge.js';

  // Bridge is now available at window.__SPACETIMEDB_BRIDGE__

  // Load your WASM module
  import init from './pkg/my_game.js';
  await init();

  // Your Bevy app can now use the bridge through get_bridge()
</script>
```

## API Reference

### Bridge Methods

All methods are called through `window.__SPACETIMEDB_BRIDGE__`:

#### `createConnection(uri: string, moduleName: string, authToken: string|null): number`

Creates a new connection to a SpacetimeDB server.

**Parameters:**
- `uri`: Server URL (e.g., `"http://localhost:3000"`)
- `moduleName`: Database module to connect to
- `authToken`: Optional authentication token

**Returns:** Connection ID for use in other methods

**Example:**
```javascript
const connId = bridge.createConnection(
    "http://localhost:3000",
    "my-game-module",
    null
);
```

#### `connect(connectionId: number): Promise<void>`

Establishes the WebSocket connection to the server.

**Throws:** Error if connection fails

#### `disconnect(connectionId: number): Promise<void>`

Closes the WebSocket connection.

#### `callReducer(connectionId: number, reducerName: string, args: Array): Promise<void>`

Calls a reducer (stored procedure) on the server.

**Parameters:**
- `connectionId`: Connection ID from `createConnection()`
- `reducerName`: Name of the reducer to call
- `args`: Array of arguments (will be BSATN-encoded by SDK)

**Example:**
```javascript
await bridge.callReducer(connId, "create_player", [99, "Alice"]);
```

#### `subscribeTable(connectionId: number, tableName: string, onInsertId: number|null, onUpdateId: number|null, onDeleteId: number|null): void`

Subscribes to a table and sets up event callbacks.

**Parameters:**
- `connectionId`: Connection ID
- `tableName`: Name of table to subscribe to
- `onInsertId`: Callback ID for insert events (from `registerCallback()`)
- `onUpdateId`: Callback ID for update events
- `onDeleteId`: Callback ID for delete events

**Event Payload Format:**

Insert/Delete events:
```json
{
  "row": { ...table row data... },
  "reducer_name": "create_player",
  "caller_identity": "..."
}
```

Update events:
```json
{
  "old_row": { ...old data... },
  "new_row": { ...new data... },
  "reducer_name": "update_player",
  "caller_identity": "..."
}
```

#### `registerCallback(callback: Function): number`

Registers a JavaScript callback function.

**Returns:** Callback ID for use in other methods

**Example:**
```javascript
const callbackId = bridge.registerCallback((jsonPayload) => {
    const event = JSON.parse(jsonPayload);
    console.log("Insert:", event.row);
});
```

#### `unregisterCallback(callbackId: number): void`

Unregisters a callback.

## Event Flow

```
SpacetimeDB Server
       ↓
  (WebSocket + BSATN)
       ↓
TypeScript SDK
  (DbConnection)
       ↓
JavaScript Bridge
  (window.__SPACETIMEDB_BRIDGE__)
       ↓
  wasm-bindgen FFI
       ↓
Rust Bridge Module
  (bevy_spacetimedb::bridge)
       ↓
 Bevy ECS Events
  (InsertEvent<T>, UpdateEvent<T>, DeleteEvent<T>)
```

## Dependencies

The bridge requires:

1. **SpacetimeDB TypeScript SDK** (`spacetimedb` npm package)
2. **ES Module support** in the browser
3. **WebSocket support** (all modern browsers)

## Development

### Testing

The bridge is tested through:

1. **Integration tests** - Full end-to-end tests in `bevy_spacetimedb/tests/`
2. **Unit tests** - SDK wrapper tests in this directory

### Building

No build step required - the bridge is pure ES modules that can be loaded directly.

### Debugging

Enable detailed logging by checking the browser console. The bridge logs:
- ✓ Success messages (green checkmark)
- ❌ Error messages (red X)
- 📤 Outgoing operations (right arrow)
- 📥 Incoming events (down arrow)
- 🔄 State changes (circular arrow)

## Troubleshooting

### "Bridge Not Found" Error

**Problem:** Rust code panics with "SpacetimeDB Bridge Not Found!"

**Solution:** Ensure the bridge JS file is loaded BEFORE your WASM module:

```html
<script type="module">
  // Load bridge FIRST
  import './js/spacetimedb-bridge.js';

  // THEN load WASM
  import init from './pkg/my_game.js';
  await init();
</script>
```

### Events Not Firing

**Problem:** Table events (insert/update/delete) not received in Rust

**Checklist:**
1. ✅ Bridge loaded before WASM
2. ✅ Connection established (`connect()` called)
3. ✅ Table subscribed (`subscribeTable()` called)
4. ✅ Bevy app added table events (`app.add_table_events::<MyTable>()`)
5. ✅ System reading events (`EventReader<InsertEvent<MyTable>>`)

### Connection Fails

**Problem:** `connect()` promise rejects

**Common causes:**
- SpacetimeDB server not running
- Wrong URI or module name
- Network/CORS issues
- Server not accepting WebSocket connections

**Check:**
```javascript
try {
    await bridge.connect(connId);
} catch (error) {
    console.error("Connection failed:", error);
    // Check server is running at the specified URI
}
```

## License

Same license as `bevy_spacetimedb_wasm` crate.
