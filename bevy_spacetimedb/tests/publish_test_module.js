#!/usr/bin/env node

// Publish test module to SpacetimeDB using HTTP API
// This works without the spacetime CLI

const fs = require('fs');
const path = require('path');
const http = require('http');

const SERVER_URL = 'http://localhost:3000';
const MODULE_NAME = 'test_module';
const MODULE_WASM_PATH = path.join(__dirname, 'test_module/target/wasm32-unknown-unknown/release/test_module.wasm');

console.log('Publishing test module to SpacetimeDB...');

// First, build the module if needed
const { execSync } = require('child_process');
try {
    console.log('Building test module...');
    execSync('cargo build --release --target wasm32-unknown-unknown', {
        cwd: path.join(__dirname, 'test_module'),
        stdio: 'inherit'
    });
    console.log('✓ Test module built');
} catch (e) {
    console.error('Failed to build test module:', e.message);
    process.exit(1);
}

// Check if WASM file exists
if (!fs.existsSync(MODULE_WASM_PATH)) {
    console.error(`Module WASM not found at: ${MODULE_WASM_PATH}`);
    console.error('Make sure to build the module first');
    process.exit(1);
}

// Read the WASM module
const wasmBytes = fs.readFileSync(MODULE_WASM_PATH);
console.log(`Module size: ${wasmBytes.length} bytes`);

// Create the publish request
const publishData = {
    name: MODULE_NAME,
    wasm: wasmBytes.toString('base64'),
    clear_database: true
};

const postData = JSON.stringify(publishData);

// Publish via HTTP API
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/database/publish',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log(`✅ Module '${MODULE_NAME}' published successfully!`);
            console.log('Response:', data);
            process.exit(0);
        } else {
            console.error(`❌ Failed to publish module: HTTP ${res.statusCode}`);
            console.error('Response:', data);
            process.exit(1);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Failed to connect to SpacetimeDB server');
    console.error('Error:', e.message);
    console.error('\nMake sure SpacetimeDB is running:');
    console.error('  spacetime start');
    process.exit(1);
});

// Send the request
req.write(postData);
req.end();

// Timeout after 10 seconds
setTimeout(() => {
    console.error('❌ Publish request timed out');
    req.destroy();
    process.exit(1);
}, 10000);