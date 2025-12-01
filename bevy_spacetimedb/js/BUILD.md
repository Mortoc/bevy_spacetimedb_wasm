# Building the SpacetimeDB Bridge Bundle

This document describes how to build the browser-ready bundle for production use.

## Prerequisites

- Node.js 16+
- npm 7+
- The project dependencies must be installed:

```bash
cd bevy_spacetimedb/js
npm install
```

## Building the Bundle

### Development Build

```bash
npm run build
```

This will:
1. Compile TypeScript source (`spacetimedb-bridge.ts`) to JavaScript (`dist/spacetimedb-bridge.js`)
2. Bundle with dependencies using esbuild (`dist/spacetimedb-bridge.bundle.js`)
3. Generate TypeScript type definitions (`dist/spacetimedb-bridge.d.ts`)

**Output files**:
- `dist/spacetimedb-bridge.bundle.js` - **Use this in browsers** (bundled ES module)
- `dist/spacetimedb-bridge.d.ts` - TypeScript type definitions

### Standalone Build (fully self-contained)

If you want a completely standalone bundle with no external dependencies:

```bash
npm run bundle:standalone
```

This bundles the SDK and all dependencies into one file (~300KB).

## What Gets Built

### The Bridge Class

The `SpacetimeDBBridge` class provides:
- `createConnection(uri, moduleName, authToken)` - Create a connection
- `connect(connectionId)` - Connect to the server
- `disconnect(connectionId)` - Disconnect
- `callReducer(connectionId, reducerName, args)` - Call a server function
- `subscribeTable(connectionId, tableName, callbacks)` - Subscribe to table events
- `registerCallback(fn)` - Register a JS callback callable from Rust
- And more...

### Type Definitions

`dist/spacetimedb-bridge.d.ts` provides full TypeScript support.

## Verification

After building, you can verify the bundle:

```bash
# Check bundle exists
ls -lh dist/spacetimedb-bridge.bundle.js

# Check it has no bare imports
grep -E "from\s+['\"](@?[a-z0-9-]+|[a-z0-9-]+/[a-z0-9-]*)['\"]" dist/spacetimedb-bridge.bundle.js

# Should return nothing - all imports are resolved
```

## Testing

Run the bundle test suite:

```bash
npm run test:bundle
```

This verifies:
- ✅ Bundle file exists
- ✅ Bundle has no bare module imports
- ✅ SpacetimeDBBridge is exported
- ✅ Bridge can be instantiated
- ✅ Bundle size is reasonable (100-400KB)
- ✅ Type definitions exist

## Usage

Once built, copy the bundle to your web assets and use in HTML:

```html
<script type="module">
  // Load the bundled bridge
  import { SpacetimeDBBridge } from './js/spacetimedb-bridge.bundle.js';

  // Initialize the global bridge for WASM
  window.__SPACETIMEDB_BRIDGE__ = new SpacetimeDBBridge();

  // Now load your WASM module
  import init from './pkg/my_game.js';
  await init();
</script>
```

## Troubleshooting

### "esbuild: command not found"

Make sure to install dev dependencies:
```bash
npm install
```

### Bundle won't import in browser

Check that:
1. Bundle is in the correct location
2. Path in HTML import matches actual file location
3. Browser console shows no errors
4. Bundle is `.bundle.js` not plain `.js` (plain has bare imports)

### Size is too large

The bundle includes the full SpacetimeDB SDK (~200KB). If this is too large, consider:
1. Using code splitting in your bundler
2. Loading the SDK separately as a peer dependency
3. Using the `--external:@clockworklabs/spacetimedb-sdk` flag to exclude it

See `package.json` scripts for details.

## CI/CD Integration

Add to your CI workflow:

```yaml
- name: Build SpacetimeDB Bridge
  run: |
    cd bevy_spacetimedb/js
    npm install
    npm run build
    npm run test:bundle

- name: Publish Bundle
  run: cp bevy_spacetimedb/js/dist/spacetimedb-bridge.bundle.js ./public/js/
```

## Next Steps

- Review the generated `dist/spacetimedb-bridge.bundle.js` (should be ~200KB)
- Test in your actual web application
- Report any issues with the bundle on GitHub
