/**
 * SpacetimeDB TypeScript SDK Bridge for Rust WASM
 *
 * This bridge allows Rust WASM code to interact with the SpacetimeDB TypeScript SDK v1.3.3+.
 * It provides a generic interface to SpacetimeDB without requiring generated code.
 *
 * IMPORTANT: This bridge must be loaded and initialized BEFORE the WASM module.
 *
 * Usage:
 * ```html
 * <script type="module">
 *   import { SpacetimeDBBridge } from './js/spacetimedb-bridge.js';
 *   window.__SPACETIMEDB_BRIDGE__ = new SpacetimeDBBridge();
 *
 *   // Then load your WASM module
 *   import init from './pkg/my_game.js';
 *   await init();
 * </script>
 * ```
 */

import {
    DbConnectionBuilder,
    DbConnectionImpl,
    ClientCache,
    Identity,
    BinaryWriter,
    BinaryReader,
} from '@clockworklabs/spacetimedb-sdk';

/** Callback function type for Rust WASM */
type WasmCallback = (...args: any[]) => void;

/** Data structure for table events passed to Rust */
interface TableEventData {
    row?: any;
    oldRow?: any;
    newRow?: any;
    reducerEvent: {
        callerIdentity: string;
        reducerName: string;
        args: any[];
    } | null;
}

/**
 * Wrapper for DbConnectionImpl that we create manually
 */
interface ConnectionWrapper {
    /** The actual SDK connection */
    connection: DbConnectionImpl<any, any, any>;
    /** Connection state tracking */
    state: 'disconnected' | 'connecting' | 'connected' | 'error';
    /** Registered callbacks */
    callbacks: {
        onConnect: WasmCallback[];
        onDisconnect: WasmCallback[];
        onError: WasmCallback[];
    };
}

/**
 * Minimal RemoteModule implementation for generic connections
 *
 * The SDK normally expects generated code with table/reducer definitions,
 * but for a generic bridge we create a minimal module dynamically.
 */
function createMinimalModule() {
    return {
        tables: new Map(),
        reducers: new Map(),
    };
}

/**
 * Bridge class that connects Rust WASM to the SpacetimeDB TypeScript SDK
 */
export class SpacetimeDBBridge {
    private connections: Map<number, ConnectionWrapper>;
    private nextConnectionId: number;
    private callbacks: Map<number, WasmCallback>;
    private nextCallbackId: number;

    constructor() {
        this.connections = new Map();
        this.nextConnectionId = 0;
        this.callbacks = new Map();
        this.nextCallbackId = 0;

        console.log('[SpacetimeDB Bridge] Initialized for SDK v1.3.3');
    }

    /**
     * Create a new connection to SpacetimeDB
     *
     * NOTE: In SDK 1.3.3, connections are created via DbConnectionBuilder and connect automatically.
     * This method prepares the connection but doesn't actually connect yet - call connect() separately.
     *
     * @param uri - WebSocket URI (e.g., "ws://localhost:3000" or "wss://example.com")
     * @param moduleName - Name or address of the SpacetimeDB module
     * @param authToken - Optional authentication token
     * @returns Connection ID for subsequent operations
     */
    createConnection(uri: string, moduleName: string, authToken: string | null): number {
        const id = this.nextConnectionId++;

        console.log(`[SpacetimeDB Bridge] Creating connection ${id} to ${uri}/${moduleName}`);

        // Create wrapper with placeholder - actual connection created on connect()
        const wrapper: ConnectionWrapper = {
            connection: null as any, // Will be set in connect()
            state: 'disconnected',
            callbacks: {
                onConnect: [],
                onDisconnect: [],
                onError: [],
            },
        };

        this.connections.set(id, wrapper);

        // Store connection params for later use
        (wrapper as any)._pendingParams = { uri, moduleName, authToken };

        return id;
    }

    /**
     * Connect to the SpacetimeDB server
     *
     * SDK 1.3.3 uses DbConnectionBuilder pattern and connects automatically on build().
     */
    async connect(connectionId: number): Promise<void> {
        const wrapper = this.connections.get(connectionId);
        if (!wrapper) {
            throw new Error(`Invalid connection ID: ${connectionId}`);
        }

        const params = (wrapper as any)._pendingParams;
        if (!params) {
            throw new Error(`Connection ${connectionId} already initialized`);
        }

        wrapper.state = 'connecting';
        console.log(`[SpacetimeDB Bridge] Connecting ${connectionId} to ${params.uri}/${params.moduleName}...`);

        try {
            // Create connection using builder pattern
            // NOTE: The builder creates and connects in one step
            const builder = DbConnectionBuilder as any; // Type assertions needed for generic usage

            // Create a minimal remote module for generic operation
            const remoteModule = createMinimalModule();

            // Build the connection with builder pattern
            let connectionBuilder = builder
                .create((impl: DbConnectionImpl) => impl) // Pass through constructor
                .withUri(params.uri)
                .withModuleName(params.moduleName);

            if (params.authToken) {
                connectionBuilder = connectionBuilder.withToken(params.authToken);
            }

            // Register connection event handlers
            connectionBuilder
                .onConnect((conn: DbConnectionImpl, identity: Identity, token: string) => {
                    wrapper.state = 'connected';
                    console.log(`[SpacetimeDB Bridge] Connection ${connectionId} connected`, {
                        identity: identity.toHexString(),
                        token,
                    });

                    // Call registered callbacks
                    for (const cb of wrapper.callbacks.onConnect) {
                        try {
                            cb();
                        } catch (err) {
                            console.error(`[SpacetimeDB Bridge] Error in onConnect callback:`, err);
                        }
                    }
                })
                .onDisconnect((ctx: any, error?: Error) => {
                    wrapper.state = 'disconnected';
                    console.log(`[SpacetimeDB Bridge] Connection ${connectionId} disconnected`, error);

                    // Call registered callbacks
                    for (const cb of wrapper.callbacks.onDisconnect) {
                        try {
                            cb(error?.message || null);
                        } catch (err) {
                            console.error(`[SpacetimeDB Bridge] Error in onDisconnect callback:`, err);
                        }
                    }
                })
                .onConnectError((ctx: any, error: Error) => {
                    wrapper.state = 'error';
                    console.error(`[SpacetimeDB Bridge] Connection ${connectionId} error:`, error);

                    // Call registered callbacks
                    for (const cb of wrapper.callbacks.onError) {
                        try {
                            cb(error?.message || 'Unknown error');
                        } catch (err) {
                            console.error(`[SpacetimeDB Bridge] Error in onConnectionError callback:`, err);
                        }
                    }
                });

            // Build the connection (this initiates the connection)
            const connection = connectionBuilder.build();
            wrapper.connection = connection;

            // Clean up pending params
            delete (wrapper as any)._pendingParams;

            console.log(`[SpacetimeDB Bridge] Connection ${connectionId} initialized`);
        } catch (error) {
            wrapper.state = 'error';
            console.error(`[SpacetimeDB Bridge] Failed to connect ${connectionId}:`, error);
            throw error;
        }
    }

    /**
     * Disconnect from the SpacetimeDB server
     */
    async disconnect(connectionId: number): Promise<void> {
        const wrapper = this.connections.get(connectionId);
        if (!wrapper) {
            throw new Error(`Invalid connection ID: ${connectionId}`);
        }

        if (!wrapper.connection) {
            console.warn(`[SpacetimeDB Bridge] Connection ${connectionId} not initialized, skipping disconnect`);
            this.connections.delete(connectionId);
            return;
        }

        console.log(`[SpacetimeDB Bridge] Disconnecting ${connectionId}...`);
        wrapper.connection.disconnect();
        this.connections.delete(connectionId);
        console.log(`[SpacetimeDB Bridge] Disconnected ${connectionId}`);
    }

    /**
     * Register a callback for connection events
     */
    onConnect(connectionId: number, callbackId: number): void {
        const wrapper = this.connections.get(connectionId);
        const callback = this.callbacks.get(callbackId);
        if (!wrapper || !callback) {
            console.error(`[SpacetimeDB Bridge] onConnect: Invalid connection or callback ID`);
            return;
        }

        wrapper.callbacks.onConnect.push(callback);
    }

    /**
     * Register a callback for disconnection events
     */
    onDisconnect(connectionId: number, callbackId: number): void {
        const wrapper = this.connections.get(connectionId);
        const callback = this.callbacks.get(callbackId);
        if (!wrapper || !callback) {
            console.error(`[SpacetimeDB Bridge] onDisconnect: Invalid connection or callback ID`);
            return;
        }

        wrapper.callbacks.onDisconnect.push(callback);
    }

    /**
     * Register a callback for connection error events
     */
    onConnectionError(connectionId: number, callbackId: number): void {
        const wrapper = this.connections.get(connectionId);
        const callback = this.callbacks.get(callbackId);
        if (!wrapper || !callback) {
            console.error(`[SpacetimeDB Bridge] onConnectionError: Invalid connection or callback ID`);
            return;
        }

        wrapper.callbacks.onError.push(callback);
    }

    /**
     * Call a reducer on the SpacetimeDB server
     *
     * SDK 1.3.3 uses callReducer() with serialized binary args
     */
    async callReducer(connectionId: number, reducerName: string, args: any): Promise<void> {
        const wrapper = this.connections.get(connectionId);
        if (!wrapper || !wrapper.connection) {
            throw new Error(`Invalid or uninitialized connection ID: ${connectionId}`);
        }

        console.log(`[SpacetimeDB Bridge] Calling reducer ${reducerName} on connection ${connectionId}`, args);

        // TODO: Serialize args properly based on reducer schema
        // For now, create a minimal serialization
        const writer = new BinaryWriter(1024);
        // This is a placeholder - proper serialization requires knowing the reducer's argument types
        const argsBuffer = writer.getBuffer();

        wrapper.connection.callReducer(reducerName, argsBuffer, 'FullUpdate');
    }

    /**
     * Subscribe to a SQL query
     *
     * SDK 1.3.3 uses subscription builder pattern
     */
    async subscribe(connectionId: number, query: string): Promise<void> {
        const wrapper = this.connections.get(connectionId);
        if (!wrapper || !wrapper.connection) {
            throw new Error(`Invalid or uninitialized connection ID: ${connectionId}`);
        }

        console.log(`[SpacetimeDB Bridge] Subscribing to query on connection ${connectionId}:`, query);

        // Use subscription builder
        wrapper.connection.subscriptionBuilder()
            .onApplied((ctx: any) => {
                console.log(`[SpacetimeDB Bridge] Subscription applied for connection ${connectionId}`);
            })
            .subscribe([query]);
    }

    /**
     * Subscribe to table events
     *
     * In SDK 1.3.3, table callbacks use ReducerEvent<Reducer> structure where
     * the reducer info is in event.reducer.name and event.reducer.args
     */
    subscribeTable(
        connectionId: number,
        tableName: string,
        onInsertId: number | null,
        onUpdateId: number | null,
        onDeleteId: number | null
    ): void {
        const wrapper = this.connections.get(connectionId);
        if (!wrapper || !wrapper.connection) {
            throw new Error(`Invalid or uninitialized connection ID: ${connectionId}`);
        }

        // Access table from client cache
        const table = wrapper.connection.db?.[tableName];
        if (!table) {
            console.error(`[SpacetimeDB Bridge] Table not found: ${tableName}`);
            throw new Error(`Table not found: ${tableName}`);
        }

        console.log(`[SpacetimeDB Bridge] Subscribing to table ${tableName} on connection ${connectionId}`);

        if (onInsertId !== null) {
            const cb = this.callbacks.get(onInsertId);
            if (cb) {
                table.onInsert((row: any, reducerEvent?: any) => {
                    const data: TableEventData = {
                        row,
                        reducerEvent: reducerEvent ? {
                            callerIdentity: reducerEvent.callerIdentity.toHexString(),
                            // SDK 1.3.3: reducer info is in event.reducer, not directly on event
                            reducerName: reducerEvent.reducer?.name || '',
                            args: reducerEvent.reducer?.args || [],
                        } : null
                    };
                    cb(JSON.stringify(data));
                });
            }
        }

        if (onUpdateId !== null) {
            const cb = this.callbacks.get(onUpdateId);
            if (cb) {
                table.onUpdate((oldRow: any, newRow: any, reducerEvent?: any) => {
                    const data: TableEventData = {
                        oldRow,
                        newRow,
                        reducerEvent: reducerEvent ? {
                            callerIdentity: reducerEvent.callerIdentity.toHexString(),
                            reducerName: reducerEvent.reducer?.name || '',
                            args: reducerEvent.reducer?.args || [],
                        } : null
                    };
                    cb(JSON.stringify(data));
                });
            }
        }

        if (onDeleteId !== null) {
            const cb = this.callbacks.get(onDeleteId);
            if (cb) {
                table.onDelete((row: any, reducerEvent?: any) => {
                    const data: TableEventData = {
                        row,
                        reducerEvent: reducerEvent ? {
                            callerIdentity: reducerEvent.callerIdentity.toHexString(),
                            reducerName: reducerEvent.reducer?.name || '',
                            args: reducerEvent.reducer?.args || [],
                        } : null
                    };
                    cb(JSON.stringify(data));
                });
            }
        }
    }

    /**
     * Register a JavaScript callback that can be called from Rust
     */
    registerCallback(callback: WasmCallback): number {
        const id = this.nextCallbackId++;
        this.callbacks.set(id, callback);
        return id;
    }

    /**
     * Unregister a callback
     */
    unregisterCallback(callbackId: number): void {
        this.callbacks.delete(callbackId);
    }

    /**
     * Get the identity for a connection
     * Returns hex-encoded identity (64 hex chars) or null if not connected
     */
    getIdentity(connectionId: number): string | null {
        const wrapper = this.connections.get(connectionId);
        if (!wrapper || !wrapper.connection) {
            return null;
        }

        if (wrapper.connection.identity) {
            return wrapper.connection.identity.toHexString();
        }

        return null;
    }

    /**
     * Get the authentication token for a connection
     * Returns token string or null if not available
     */
    getToken(connectionId: number): string | null {
        const wrapper = this.connections.get(connectionId);
        if (!wrapper || !wrapper.connection) {
            return null;
        }

        return wrapper.connection.token || null;
    }

    /**
     * Get connection state
     * Returns 'disconnected', 'connecting', 'connected', or 'error'
     */
    getConnectionState(connectionId: number): string {
        const wrapper = this.connections.get(connectionId);
        if (!wrapper) {
            return 'disconnected';
        }

        return wrapper.state;
    }
}

// Declare the global interface extension
declare global {
    interface Window {
        __SPACETIMEDB_BRIDGE__?: SpacetimeDBBridge;
    }
}
