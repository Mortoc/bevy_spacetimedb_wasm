// Quick test to see if we can connect to the SpacetimeDB server

const WebSocket = require('./tests/node_modules/ws');

const uri = 'ws://localhost:3000';
const moduleName = 'test_module';
const wsUrl = `${uri}/database/subscribe/${moduleName}`;

console.log(`Testing connection to: ${wsUrl}`);

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
    console.log('✅ SUCCESS: Connected to SpacetimeDB server!');
    console.log(`Module "${moduleName}" exists on the server`);
    ws.close();
    process.exit(0);
});

ws.on('error', (error) => {
    console.error('❌ FAILED: Could not connect to SpacetimeDB');
    console.error('Error:', error.message);
    console.error('\nMake sure:');
    console.error(`1. SpacetimeDB server is running on localhost:3000`);
    console.error(`2. The module "${moduleName}" is published to the server`);
    console.error('\nTo publish the test module:');
    console.error('  cd tests/test_module');
    console.error('  spacetime publish test_module');
    process.exit(1);
});

setTimeout(() => {
    console.error('❌ TIMEOUT: Connection attempt timed out');
    ws.close();
    process.exit(1);
}, 5000);