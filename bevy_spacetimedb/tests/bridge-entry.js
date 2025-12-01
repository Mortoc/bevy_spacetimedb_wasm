/**
 * FIXED Entry point for bundling the SpacetimeDB bridge with the SDK
 * This file is at the root where node_modules is, so esbuild can resolve the SDK
 */

// Import the generated SpacetimeDB bindings for the test module
import { DbConnection, reducers as reducerSchemas } from './generated/index.ts';
// Import Brotli decompression - manual WASM initialization
import * as brotliWasm from 'brotli-dec-wasm/web';

// The bridge class - FIXED VERSION
class SpacetimeDBBridge {
    constructor() {
        this.connections = new Map();
        this.callbacks = new Map();
        this.nextConnectionId = 1;
        this.nextCallbackId = 1;
        this.brotli = null;
        // Initialize Brotli WASM module from explicit URL
        fetch('brotli_dec_wasm_bg.wasm')
            .then(response => response.arrayBuffer())
            .then(bytes => brotliWasm.default(bytes))
            .then(() => {
                this.brotli = brotliWasm;
                console.log('✓ Brotli WASM initialized');
            })
            .catch(err => {
                console.error('❌ Failed to initialize Brotli WASM:', err);
            });
        console.log('✓ SpacetimeDB Bridge initialized (using real SDK)');
    }

    // Convert snake_case to camelCase for SDK table names
    toCamelCase(str) {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    createConnection(uri, moduleName, authToken) {
        const connectionId = this.nextConnectionId++;

        console.log(`Creating connection ${connectionId} to ${uri}/${moduleName}`);

        // FIX #2: Register callbacks on builder BEFORE build()
        // This ensures they're set up before the connection completes
        const connectionState = {
            connected: false,
            connectionPromise: null  // Will be set below
        };

        let builder = DbConnection.builder()
            .withUri(uri)
            .withModuleName(moduleName)
            .withCompression('gzip')  // FIX: SDK 1.9.0 bug - 'none' mode still uses decompression adapter!
            .onConnect((conn, identity, token) => {
                console.log(`✓ Connected ${connectionId}, identity:`, identity.toHexString());
                connectionState.connected = true;
                connectionState.sdk = conn;  // Store the connection
                if (connectionState.resolveConnection) {
                    connectionState.resolveConnection({ identity: identity.toHexString(), token });
                }
            })
            .onConnectError((conn, error) => {
                console.error(`❌ Connection ${connectionId} failed:`, error);
                if (connectionState.rejectConnection) {
                    connectionState.rejectConnection(error);
                }
            });

        if (authToken) {
            builder = builder.withToken(authToken);
        }

        console.log('Builder created with real generated bindings');

        // Intercept WebSocket for LOGGING ONLY (no modification)
        const originalWebSocket = window.WebSocket;
        let interceptedWs = null;

        window.WebSocket = function(url, protocols) {
            const ws = new originalWebSocket(url, protocols);

            if (url.includes('localhost:3000') || url.includes(uri)) {
                console.log(`✓ Intercepting WebSocket to ${url}`);
                interceptedWs = ws;

                // Log all messages for debugging
                ws.addEventListener('message', function(event) {
                    if (event?.data instanceof ArrayBuffer) {
                        const view = new Uint8Array(event.data);
                        console.log(`📩 WS RECV: ${view.length} bytes, compression: ${view[0]}`);
                        if (view.length <= 200) {
                            // Log full hex for small messages
                            const hex = Array.from(view).map(b => b.toString(16).padStart(2, '0')).join(' ');
                            console.log(`  Hex: ${hex}`);
                        }
                    }
                }, { capture: true });

                // Log close events
                ws.addEventListener('close', function(event) {
                    console.log(`🔴 WS CLOSED: code=${event.code}, reason="${event.reason}", wasClean=${event.wasClean}`);
                    console.trace('WebSocket close stack trace');
                });

                // Log error events
                ws.addEventListener('error', function(event) {
                    console.error(`❌ WS ERROR:`, event);
                });

                // Intercept send to log outgoing messages
                const originalSend = ws.send.bind(ws);
                ws.send = function(data) {
                    let bytes;
                    if (data instanceof ArrayBuffer) {
                        bytes = new Uint8Array(data);
                        console.log(`📤 WS SEND: ArrayBuffer ${bytes.length} bytes, compression: ${bytes[0]}`);
                    } else if (data instanceof Uint8Array) {
                        bytes = data;
                        console.log(`📤 WS SEND: Uint8Array ${bytes.length} bytes, compression: ${bytes[0]}`);
                    } else if (typeof data === 'string') {
                        console.log(`📤 WS SEND: String ${data.length} bytes: ${data.substring(0, 100)}`);
                    } else {
                        console.log(`📤 WS SEND: ${data?.constructor?.name || typeof data} (${data?.length || data?.byteLength || 0} bytes)`);
                    }

                    // Log first 50 bytes in hex for debugging
                    if (bytes && bytes.length > 0) {
                        const hex = Array.from(bytes.slice(0, Math.min(50, bytes.length)))
                            .map(b => b.toString(16).padStart(2, '0'))
                            .join(' ');
                        console.log(`  Hex: ${hex}${bytes.length > 50 ? '...' : ''}`);
                    }

                    // Check WebSocket state before sending
                    console.log(`  WS readyState: ${ws.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);

                    return originalSend(data);
                };

                console.log(`✓ WebSocket logging installed`);
            }

            return ws;
        };

        // Build the SDK connection
        const sdk = builder.build();
        connectionState.sdk = sdk;

        // Restore original WebSocket after connection is established
        sdk.wsPromise.then(() => {
            console.log(`✓ WebSocket established for connection ${connectionId}`);
            window.WebSocket = originalWebSocket;
        }).catch(err => console.error(`❌ WebSocket promise failed:`, err));

        // Create the connection promise
        connectionState.connectionPromise = new Promise((resolve, reject) => {
            connectionState.resolveConnection = resolve;
            connectionState.rejectConnection = reject;
        });

        this.connections.set(connectionId, connectionState);

        console.log(`✓ Created connection ${connectionId}`);
        return connectionId;
    }

    async connect(connectionId) {
        const conn = this.connections.get(connectionId);
        if (!conn) throw new Error(`Connection ${connectionId} not found`);

        console.log(`Waiting for connection ${connectionId} to complete...`);

        // Wait for the connection to complete (it was initiated in createConnection)
        return conn.connectionPromise;
    }

    async disconnect(connectionId) {
        const conn = this.connections.get(connectionId);
        if (!conn) throw new Error(`Connection ${connectionId} not found`);

        console.log(`Disconnecting connection ${connectionId}...`);
        await conn.sdk.disconnect();
        console.log(`✓ Disconnected ${connectionId}`);
    }

    // FIX #3: Fail fast instead of silently ignoring invalid IDs
    onConnect(connectionId, callbackId) {
        const conn = this.connections.get(connectionId);
        if (!conn) throw new Error(`Connection ${connectionId} not found`);

        const callback = this.callbacks.get(callbackId);
        if (!callback) throw new Error(`Callback ${callbackId} not found`);

        conn.sdk.on('connect', callback);
    }

    onDisconnect(connectionId, callbackId) {
        const conn = this.connections.get(connectionId);
        if (!conn) throw new Error(`Connection ${connectionId} not found`);

        const callback = this.callbacks.get(callbackId);
        if (!callback) throw new Error(`Callback ${callbackId} not found`);

        conn.sdk.on('disconnect', callback);
    }

    onConnectionError(connectionId, callbackId) {
        const conn = this.connections.get(connectionId);
        if (!conn) throw new Error(`Connection ${connectionId} not found`);

        const callback = this.callbacks.get(callbackId);
        if (!callback) throw new Error(`Callback ${callbackId} not found`);

        conn.sdk.on('connectError', callback);
    }

    async callReducer(connectionId, reducerName, args) {
        const conn = this.connections.get(connectionId);
        if (!conn) throw new Error(`Connection ${connectionId} not found`);

        console.log(`📤 Calling reducer ${reducerName} on connection ${connectionId} with args:`, args);

        try {
            // Convert JsValue array to JavaScript array
            const argsArray = Array.from(args);
            console.log(`  - Converted args:`, argsArray);

            // Convert snake_case to camelCase for reducer name
            const reducerNameCamel = this.toCamelCase(reducerName);
            console.log(`  - Looking for reducer: ${reducerNameCamel}`);

            // WORKAROUND: SDK 1.9.0 bug - generated reducers only accept single param.
            // For create_player(id, name), convert [999, "MinimalTest"] -> { id: 999, name: "MinimalTest" }
            let paramsObject;
            if (reducerName === 'create_player') {
                paramsObject = { id: argsArray[0], name: argsArray[1] };
            } else if (reducerName === 'update_player') {
                paramsObject = { id: argsArray[0], name: argsArray[1] };
            } else if (reducerName === 'delete_player') {
                paramsObject = { id: argsArray[0] };
            } else {
                // For unknown reducers, try the array as-is
                paramsObject = argsArray;
            }

            console.log(`  - Converted args to params object:`, paramsObject);

            // Use the generated reducer function which has the correct params type
            const reducerFn = conn.sdk.reducers[reducerNameCamel];
            if (!reducerFn) {
                console.error(`  - Available reducers:`, Object.keys(conn.sdk.reducers));
                throw new Error(`Reducer ${reducerNameCamel} not found in generated reducers`);
            }

            // Call with the params object
            reducerFn(paramsObject);
            console.log(`✓ Reducer ${reducerName} called successfully`);
        } catch (error) {
            console.error(`❌ Failed to call reducer ${reducerName}:`, error);
            throw error;
        }
    }

    async subscribe(connectionId, query) {
        const conn = this.connections.get(connectionId);
        if (!conn) throw new Error(`Connection ${connectionId} not found`);

        console.log(`📋 Subscribing to query on connection ${connectionId}: ${query}`);

        try {
            const handle = await conn.sdk.subscribe([query]);
            console.log(`✓ Subscribed to query: ${query}`);
            return handle;
        } catch (error) {
            console.error(`❌ Failed to subscribe:`, error);
            throw error;
        }
    }

    subscribeTable(connectionId, tableName, onInsertId, onUpdateId, onDeleteId) {
        const conn = this.connections.get(connectionId);
        if (!conn) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        console.log(`📋 Subscribing to table: ${tableName}`);

        const getValidatedCallback = (id, name) => {
            if (!id) return null;
            const cb = this.callbacks.get(id);
            if (!cb) throw new Error(`Callback ${name} (ID: ${id}) not found`);
            return cb;
        };

        const callbacks = {
            onInsert: getValidatedCallback(onInsertId, 'onInsert'),
            onUpdate: getValidatedCallback(onUpdateId, 'onUpdate'),
            onDelete: getValidatedCallback(onDeleteId, 'onDelete')
        };

        const tableNameCamel = this.toCamelCase(tableName);

        // CRITICAL FIX: Register event handlers BEFORE subscribing (official SDK pattern from quickstart-chat)
        const table = conn.sdk.db[tableNameCamel];
        if (!table) {
            const available = Object.keys(conn.sdk.db).join(', ');
            throw new Error(`Table ${tableName} (${tableNameCamel}) not found. Available: ${available}`);
        }

        console.log(`✓ Table ${tableName} available, count: ${table.count()}`);

        // Register handlers FIRST (following official quickstart-chat pattern)
        if (callbacks.onInsert) {
            console.log(`  Registering onInsert handler for ${tableName}...`);
            table.onInsert((ctx, row) => {
                console.log(`📥 INSERT EVENT FIRED on ${tableName}:`, row);
                const event = ctx.event || {};
                const payload = JSON.stringify({
                    row,
                    reducerEvent: event.tag === 'Reducer' ? {
                        reducerName: event.value?.reducer?.name,
                        callerIdentity: event.value?.callerIdentity?.toHexString()
                    } : null
                });
                callbacks.onInsert(payload);
            });
            console.log(`  ✓ onInsert handler registered`);
        }

        if (callbacks.onUpdate) {
            console.log(`  Registering onUpdate handler for ${tableName}...`);
            table.onUpdate((ctx, oldRow, newRow) => {
                console.log(`🔄 UPDATE EVENT FIRED on ${tableName}:`, { oldRow, newRow });
                const event = ctx.event || {};
                const payload = JSON.stringify({
                    oldRow,
                    newRow,
                    reducerEvent: event.tag === 'Reducer' ? {
                        reducerName: event.value?.reducer?.name,
                        callerIdentity: event.value?.callerIdentity?.toHexString()
                    } : null
                });
                callbacks.onUpdate(payload);
            });
            console.log(`  ✓ onUpdate handler registered`);
        }

        if (callbacks.onDelete) {
            console.log(`  Registering onDelete handler for ${tableName}...`);
            table.onDelete((ctx, row) => {
                console.log(`🗑️ DELETE EVENT FIRED on ${tableName}:`, row);
                const event = ctx.event || {};
                const payload = JSON.stringify({
                    row,
                    reducerEvent: event.tag === 'Reducer' ? {
                        reducerName: event.value?.reducer?.name,
                        callerIdentity: event.value?.callerIdentity?.toHexString()
                    } : null
                });
                callbacks.onDelete(payload);
            });
            console.log(`  ✓ onDelete handler registered`);
        }

        console.log(`✓ Event handlers registered for ${tableName}`);

        // THEN subscribe (official pattern: handlers first, subscribe second)
        return new Promise((resolve, reject) => {
            // Check if subscription is already applied (not just created)
            if (conn.subscriptionApplied) {
                console.log(`  - Using existing applied subscription`);
                console.log(`✓ Table count: ${table.count()}`);
                resolve();
            } else if (conn.subscriptionPending) {
                // Subscription was created but onApplied hasn't fired yet
                // Wait for it to complete
                console.log(`  - Subscription pending, waiting for onApplied...`);
                conn.subscriptionPending.then(resolve).catch(reject);
            } else {
                // Create new subscription
                console.log(`  - Creating global subscription to all tables`);

                // Create a promise that resolves when onApplied fires
                conn.subscriptionPending = new Promise((resolveSubscription, rejectSubscription) => {
                    const subscription = conn.sdk.subscriptionBuilder()
                        .onApplied(() => {
                            console.log(`✓ Global subscription applied`);
                            console.log(`✓ Table count: ${table.count()}`);

                            // Mark as applied and store the subscription
                            conn.subscriptionApplied = true;
                            conn.globalSubscription = subscription;
                            conn.subscriptionPending = null;

                            resolveSubscription();
                        })
                        .onError((ctx, error) => {
                            console.error(`❌ Global subscription error:`, error);
                            conn.subscriptionPending = null;
                            rejectSubscription(error);
                        })
                        .subscribe(['SELECT * FROM *']);

                    console.log(`✓ Subscription created, waiting for onApplied...`);
                });

                // Wait for the subscription to be applied
                conn.subscriptionPending.then(resolve).catch(reject);
            }
        });
    }


    registerCallback(callback) {
        const callbackId = this.nextCallbackId++;
        this.callbacks.set(callbackId, callback);
        console.log(`Registered callback ${callbackId}`);
        return callbackId;
    }

    unregisterCallback(callbackId) {
        this.callbacks.delete(callbackId);
        console.log(`Unregistered callback ${callbackId}`);
    }
}

// Initialize bridge on window
if (typeof window !== 'undefined') {
    window.__SPACETIMEDB_BRIDGE__ = new SpacetimeDBBridge();
    console.log('✓ Bridge attached to window.__SPACETIMEDB_BRIDGE__');
} else {
    console.error('❌ Window not available - bridge requires browser environment');
}
