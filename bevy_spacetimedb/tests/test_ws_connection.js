#!/usr/bin/env node

const WebSocket = require('ws');

const wsUrl = 'ws://localhost:3000/v1/database/test-module/subscribe';
const protocol = 'v1.bsatn.spacetimedb';

console.log(`Testing WebSocket connection to: ${wsUrl}`);
console.log(`Using protocol: ${protocol}`);

const ws = new WebSocket(wsUrl, [protocol]);

ws.on('open', () => {
    console.log('✅ WebSocket connection opened successfully!');
    console.log('Protocol selected:', ws.protocol);
    ws.close();
});

ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
    console.error('Full error:', error);
});

ws.on('unexpected-response', (request, response) => {
    console.error(`❌ Unexpected response: ${response.statusCode} ${response.statusMessage}`);
    let body = '';
    response.on('data', (chunk) => {
        body += chunk.toString();
    });
    response.on('end', () => {
        console.error('Response body:', body);
    });
});

ws.on('close', () => {
    console.log('Connection closed');
});
