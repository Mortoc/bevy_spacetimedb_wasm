#!/usr/bin/env node

// Check if test module exists on SpacetimeDB server

const http = require('http');

const MODULE_NAME = 'test-module';
const SERVER_URL = 'http://localhost:3000';

function checkModule() {
    return new Promise((resolve, reject) => {
        // Try to connect to the module's WebSocket endpoint (SpacetimeDB 1.x format)
        // If it returns 404, the module doesn't exist
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/v1/database/${MODULE_NAME}/subscribe`,
            method: 'GET',
            headers: {
                'Upgrade': 'websocket',
                'Connection': 'Upgrade'
            }
        };

        const req = http.request(options, (res) => {
            if (res.statusCode === 404) {
                reject(new Error('Module not found'));
            } else if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve(true);
            } else {
                reject(new Error(`Unexpected status: ${res.statusCode}`));
            }
            req.abort();
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.setTimeout(2000, () => {
            req.abort();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

async function main() {
    try {
        await checkModule();
        console.log(`✅ Module '${MODULE_NAME}' exists on server`);
        process.exit(0);
    } catch (e) {
        if (e.message === 'Module not found') {
            console.error(`❌ Module '${MODULE_NAME}' not found on server`);
            console.error('\nTo fix this, publish the test module:');
            console.error('  cd tests/test_module');
            console.error('  spacetime publish test-module');
            console.error('\nOr if spacetime CLI is not available:');
            console.error('  1. Install SpacetimeDB: curl -sSf https://install.spacetimedb.com | sh');
            console.error('  2. Run the publish command above');
        } else {
            console.error(`❌ Failed to check module: ${e.message}`);
        }
        process.exit(1);
    }
}

main();