#!/usr/bin/env node

/**
 * Build script to bundle the production SpacetimeDB bridge with the SDK
 * into a single JavaScript file that can be used in tests.
 */

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildBridge() {
    console.log('Building bundled SpacetimeDB bridge...');

    // Bundle the bridge with all dependencies
    const result = await esbuild.build({
        entryPoints: [join(__dirname, 'bridge-entry.js')],
        bundle: true,
        format: 'iife',
        globalName: '__initSpacetimeDBBridge',
        platform: 'browser',
        target: 'es2020',
        write: false,
        minify: false, // Keep readable for debugging
    });

    // Get the bundled code
    const bundledCode = result.outputFiles[0].text;

    // Write to output file
    const outputPath = join(__dirname, 'spacetimedb-bridge.bundle.js');
    writeFileSync(outputPath, bundledCode);

    console.log(`✓ Bundle created: ${outputPath}`);
    console.log(`  Size: ${(bundledCode.length / 1024).toFixed(2)} KB`);
}

buildBridge().catch(err => {
    console.error('Failed to build bridge:', err);
    process.exit(1);
});
