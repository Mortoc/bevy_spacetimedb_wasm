#!/usr/bin/env node

// Direct SDK test in Node.js (no browser needed)
import { DbConnection } from './generated/index.js';

console.log('=== Direct SDK Test in Node.js ===\n');

async function runTest() {
    try {
        // Create connection
        console.log('1. Creating connection...');
        const conn = DbConnection.builder()
            .withUri('http://localhost:3000')
            .withModuleName('test-module')
            .build();

        // Wait for connection
        console.log('2. Waiting for connection...');
        await new Promise((resolve, reject) => {
            conn.onConnect((ctx, identity, token) => {
                console.log(`   ✓ Connected! Identity: ${identity.toHexString().substring(0, 16)}...`);
                resolve();
            });
            conn.onConnectError((ctx, error) => {
                console.error(`   ❌ Connection failed:`, error);
                reject(error);
            });
        });

        // Subscribe and set up event handlers
        console.log('3. Subscribing to all tables...');
        let insertEventCount = 0;
        let updateEventCount = 0;
        let deleteEventCount = 0;

        await new Promise((resolve, reject) => {
            conn.subscriptionBuilder()
                .onApplied((ctx) => {
                    console.log('4. ✓ Subscription applied!');
                    console.log(`   Tables: ${Object.keys(conn.db).join(', ')}`);

                    if (conn.db.testPlayer) {
                        console.log(`   testPlayer count: ${conn.db.testPlayer.count()}`);

                        // Register event handlers
                        conn.db.testPlayer.onInsert((ctx, row) => {
                            insertEventCount++;
                            console.log(`\n📥 INSERT EVENT #${insertEventCount}:`);
                            console.log(`   Row:`, row);
                            console.log(`   Event tag: ${ctx.event.tag}`);
                            if (ctx.event.tag === 'Reducer') {
                                console.log(`   Reducer: ${ctx.event.value.reducer.name}`);
                            }
                        });

                        conn.db.testPlayer.onUpdate((ctx, oldRow, newRow) => {
                            updateEventCount++;
                            console.log(`\n🔄 UPDATE EVENT #${updateEventCount}:`);
                            console.log(`   Old:`, oldRow);
                            console.log(`   New:`, newRow);
                        });

                        conn.db.testPlayer.onDelete((ctx, row) => {
                            deleteEventCount++;
                            console.log(`\n🗑️ DELETE EVENT #${deleteEventCount}:`);
                            console.log(`   Row:`, row);
                        });

                        console.log('5. ✓ Event handlers registered\n');
                        resolve();
                    } else {
                        reject(new Error('testPlayer table not found'));
                    }
                })
                .onError((ctx, error) => {
                    console.error(`   ❌ Subscription error:`, error);
                    reject(error);
                })
                .subscribeToAllTables();
        });

        // Wait a moment
        await new Promise(r => setTimeout(r, 500));

        // Call create_player reducer
        console.log('6. Calling create_player reducer (id=777, name="NodeTest")...');
        conn.callReducer('create_player', 777, 'NodeTest');
        console.log('   Reducer call sent\n');

        // Wait for events
        console.log('7. Waiting 2 seconds for events...');
        await new Promise(r => setTimeout(r, 2000));

        console.log(`\n=== Results ===`);
        console.log(`Insert events received: ${insertEventCount}`);
        console.log(`Update events received: ${updateEventCount}`);
        console.log(`Delete events received: ${deleteEventCount}`);

        if (insertEventCount > 0) {
            console.log('\n✅ SUCCESS! SDK table events ARE working!');
        } else {
            console.log('\n❌ PROBLEM! No insert events received.');
            console.log('   SDK table events are NOT firing even with direct SDK usage.');
        }

        // Cleanup
        console.log('\n8. Cleaning up...');
        conn.callReducer('delete_player', 777);
        await new Promise(r => setTimeout(r, 500));
        conn.disconnect();

        process.exit(insertEventCount > 0 ? 0 : 1);

    } catch (error) {
        console.error('\n❌ ERROR:', error);
        process.exit(1);
    }
}

runTest();
