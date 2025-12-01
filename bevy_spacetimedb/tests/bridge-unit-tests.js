/**
 * Unit tests for SpacetimeDB bridge
 * Run with: node --test bridge-unit-tests.js
 */

import { test, describe, mock } from 'node:test';
import assert from 'node:assert';

// Mock SDK components
class MockIdentity {
    constructor(hex) {
        this.hex = hex;
    }
    toHexString() {
        return this.hex;
    }
}

class MockSubscriptionHandle {
    constructor(active = true) {
        this._active = active;
        this._ended = false;
    }
    isActive() { return this._active; }
    isEnded() { return this._ended; }
    unsubscribe() {
        this._active = false;
        this._ended = true;
    }
}

class MockTable {
    constructor(name) {
        this.name = name;
        this._rows = [];
        this._insertHandlers = [];
        this._deleteHandlers = [];
        this._updateHandlers = [];
    }
    count() { return BigInt(this._rows.length); }
    onInsert(handler) { this._insertHandlers.push(handler); }
    onDelete(handler) { this._deleteHandlers.push(handler); }
    onUpdate(handler) { this._updateHandlers.push(handler); }
    applyOperations(ops, ctx) {
        // Mock implementation
        return ops;
    }
}

class MockSubscriptionBuilder {
    constructor(db) {
        this._db = db;
        this._onApplied = null;
        this._onError = null;
    }

    onApplied(callback) {
        this._onApplied = callback;
        return this;
    }

    onError(callback) {
        this._onError = callback;
        return this;
    }

    subscribe(queries) {
        const handle = new MockSubscriptionHandle(true);

        // Simulate subscription being applied after a tick
        setTimeout(() => {
            if (this._onApplied) {
                const ctx = {
                    db: this._db,
                    event: { tag: 'SubscribeApplied' }
                };
                this._onApplied(ctx);
            }
        }, 10);

        return handle;  // ✅ Returns handle
    }

    subscribeToAllTables() {
        // ❌ BUG #1: Returns void instead of handle
        this.subscribe(['SELECT * FROM *']);
        // Returns nothing!
    }
}

class MockDbConnection {
    constructor(options = {}) {
        this.isActive = false;
        this.identity = null;
        this.token = null;
        this.db = {
            testPlayer: new MockTable('testPlayer')
        };
        this.reducers = {
            createPlayer: async (...args) => {
                // Mock reducer call
            }
        };
        this._onConnectCallbacks = [];
        this._onErrorCallbacks = [];

        // Simulate connection after a tick if not told to fail
        if (!options.failConnection) {
            setTimeout(() => {
                this.isActive = true;
                this.identity = new MockIdentity('test-identity-123');
                this.token = 'test-token-456';
                this._onConnectCallbacks.forEach(cb => {
                    cb(this, this.identity, this.token);
                });
            }, 10);
        }
    }

    onConnect(callback) {
        this._onConnectCallbacks.push(callback);
        return this;  // For chaining
    }

    onConnectError(callback) {
        this._onErrorCallbacks.push(callback);
        return this;
    }

    subscriptionBuilder() {
        return new MockSubscriptionBuilder(this.db);
    }

    static builder() {
        const config = {};
        return {
            withUri(uri) { config.uri = uri; return this; },
            withModuleName(name) { config.moduleName = name; return this; },
            withToken(token) { config.token = token; return this; },
            onConnect(callback) {
                config.onConnect = callback;
                return this;
            },
            onConnectError(callback) {
                config.onConnectError = callback;
                return this;
            },
            build() {
                const conn = new MockDbConnection(config);
                // ❌ BUG #2: If callbacks registered after build(), they don't fire
                // ✅ If registered on builder, they fire correctly
                if (config.onConnect) {
                    conn.onConnect(config.onConnect);
                }
                if (config.onConnectError) {
                    conn.onConnectError(config.onConnectError);
                }
                return conn;
            }
        };
    }
}

// Simple bridge implementation for testing
class TestBridge {
    constructor(DbConnectionClass = MockDbConnection) {
        this.DbConnection = DbConnectionClass;
        this.connections = new Map();
        this.callbacks = new Map();
        this.nextConnectionId = 1;
        this.nextCallbackId = 1;
    }

    toCamelCase(str) {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    createConnection(uri, moduleName, authToken) {
        const connectionId = this.nextConnectionId++;

        let builder = this.DbConnection.builder()
            .withUri(uri)
            .withModuleName(moduleName);

        if (authToken) {
            builder = builder.withToken(authToken);
        }

        const sdk = builder.build();

        const connectionState = {
            sdk,
            connected: false,
            connectionPromise: new Promise((resolve, reject) => {
                // ❌ BUG #2: Registering callbacks AFTER build()
                sdk.onConnect((_, identity, token) => {
                    connectionState.connected = true;
                    resolve({ identity: identity.toHexString(), token });
                });
                sdk.onConnectError((_, error) => {
                    reject(error);
                });
            })
        };

        this.connections.set(connectionId, connectionState);
        return connectionId;
    }

    async connect(connectionId) {
        const conn = this.connections.get(connectionId);
        if (!conn) throw new Error(`Connection ${connectionId} not found`);
        return conn.connectionPromise;
    }

    subscribeTable(connectionId, tableName, onInsertId, onUpdateId, onDeleteId) {
        const conn = this.connections.get(connectionId);
        if (!conn) {
            return Promise.reject(new Error(`Connection ${connectionId} not found`));
        }

        // ❌ BUG #3-4: Silent failures if callbacks don't exist
        const callbacks = {
            onInsert: onInsertId ? this.callbacks.get(onInsertId) : null,
            onUpdate: onUpdateId ? this.callbacks.get(onUpdateId) : null,
            onDelete: onDeleteId ? this.callbacks.get(onDeleteId) : null
        };

        const tableNameCamel = this.toCamelCase(tableName);

        return new Promise((resolve, reject) => {
            if (!conn.globalSubscription) {
                conn.subscriptionApplied = new Promise((resolveApplied) => {
                    // ❌ BUG #1: subscribeToAllTables() returns void!
                    conn.globalSubscription = conn.sdk.subscriptionBuilder()
                        .onApplied((ctx) => {
                            const table = conn.sdk.db[tableNameCamel];
                            if (!table) {
                                reject(new Error(`Table not found: ${tableName}`));
                                return;
                            }

                            if (callbacks.onInsert) {
                                table.onInsert((ctx, row) => {
                                    callbacks.onInsert(JSON.stringify({ row }));
                                });
                            }

                            resolveApplied();
                            resolve();
                        })
                        .onError((ctx, error) => {
                            reject(error);
                        })
                        .subscribeToAllTables();  // ❌ Returns void!
                });
            }
        });
    }

    registerCallback(callback) {
        const callbackId = this.nextCallbackId++;
        this.callbacks.set(callbackId, callback);
        return callbackId;
    }
}

// ============================================================================
// TESTS
// ============================================================================

describe('Bridge Bug Isolation Tests', () => {

    describe('Bug #1: Subscription handle is lost when using subscribeToAllTables()', () => {
        test('FAILING: subscribeToAllTables() should return a subscription handle', () => {
            const builder = new MockSubscriptionBuilder({});

            const handle = builder.subscribeToAllTables();

            // This SHOULD pass but will FAIL because subscribeToAllTables returns void
            assert.ok(handle, 'Handle should exist');
            assert.strictEqual(typeof handle.isActive, 'function', 'Handle should have isActive method');
        });

        test('subscribe() with query DOES return a handle', () => {
            const builder = new MockSubscriptionBuilder({});

            const handle = builder.subscribe(['SELECT * FROM *']);

            // This SHOULD and WILL pass
            assert.ok(handle, 'Handle should exist');
            assert.strictEqual(typeof handle.isActive, 'function', 'Handle should have isActive method');
        });

        test('FAILING: Bridge stores subscription handle for later access', async () => {
            const bridge = new TestBridge();
            const connId = bridge.createConnection('ws://localhost:3000', 'test', null);

            await bridge.connect(connId);

            const insertCalled = [];
            const callbackId = bridge.registerCallback((data) => {
                insertCalled.push(data);
            });

            await bridge.subscribeTable(connId, 'test_player', callbackId, null, null);

            const conn = bridge.connections.get(connId);

            // This SHOULD pass but will FAIL because subscribeToAllTables() returns void
            assert.ok(conn.globalSubscription, 'Subscription handle should be stored');
            assert.strictEqual(typeof conn.globalSubscription?.isActive, 'function',
                'Stored handle should have isActive method');
        });
    });

    describe('Bug #2: Connection callbacks registered after build()', () => {
        test('FAILING: Callbacks registered after build() might miss connection event', async () => {
            const conn = MockDbConnection.builder()
                .withUri('ws://localhost:3000')
                .withModuleName('test')
                .build();

            // Simulate the bug: registering callback AFTER build
            let connectCalled = false;
            setTimeout(() => {
                conn.onConnect(() => {
                    connectCalled = true;
                });
            }, 5);  // Register after connection might already happen

            // Wait for connection
            await new Promise(resolve => setTimeout(resolve, 50));

            // This might FAIL due to race condition
            assert.ok(connectCalled, 'Connect callback should have been called');
        });

        test('Callbacks registered on builder BEFORE build() always fire', async () => {
            let connectCalled = false;

            const conn = MockDbConnection.builder()
                .withUri('ws://localhost:3000')
                .withModuleName('test')
                .onConnect(() => {
                    connectCalled = true;
                })
                .build();

            // Wait for connection
            await new Promise(resolve => setTimeout(resolve, 50));

            // This SHOULD and WILL pass
            assert.ok(connectCalled, 'Connect callback should have been called');
        });
    });

    describe('Bug #3-4: Silent failures when IDs are invalid', () => {
        test('FAILING: Invalid callback ID should throw, not silently fail', async () => {
            const bridge = new TestBridge();
            const connId = bridge.createConnection('ws://localhost:3000', 'test', null);

            await bridge.connect(connId);

            const invalidCallbackId = 999;  // Doesn't exist

            // This SHOULD throw but currently silently ignores the bad ID
            await assert.rejects(
                async () => bridge.subscribeTable(connId, 'test_player', invalidCallbackId, null, null),
                /Callback.*not found/,
                'Should throw error for invalid callback ID'
            );
        });

        test('FAILING: Invalid connection ID should throw immediately', () => {
            const bridge = new TestBridge();

            const invalidConnId = 999;

            // This SHOULD throw but currently returns rejected promise
            assert.throws(
                () => bridge.subscribeTable(invalidConnId, 'test_player', null, null, null),
                /Connection.*not found/,
                'Should throw error for invalid connection ID'
            );
        });
    });

    describe('Subscription lifecycle', () => {
        test('onApplied callback fires after subscription is created', async () => {
            let appliedCalled = false;

            const db = { testPlayer: new MockTable('testPlayer') };
            const builder = new MockSubscriptionBuilder(db);

            const handle = builder
                .onApplied(() => {
                    appliedCalled = true;
                })
                .subscribe(['SELECT * FROM *']);

            // Wait for async callback
            await new Promise(resolve => setTimeout(resolve, 50));

            assert.ok(appliedCalled, 'onApplied should have been called');
            assert.ok(handle.isActive(), 'Subscription should be active');
        });
    });
});

console.log('\n' + '='.repeat(70));
console.log('🧪 Running Bridge Bug Isolation Tests');
console.log('Expected: Some tests will FAIL, demonstrating the bugs');
console.log('After fixes: All tests should PASS');
console.log('='.repeat(70) + '\n');
