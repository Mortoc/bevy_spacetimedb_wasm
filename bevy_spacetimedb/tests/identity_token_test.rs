// Integration test for identity and token access
// This test will FAIL until we implement the feature

use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
async fn test_identity_access_after_connection() {
    // This test demonstrates what we want the API to look like
    // It will fail until we implement:
    // 1. bridge.get_identity() in TypeScript
    // 2. Identity type in Rust
    // 3. stdb_connection.identity() method

    use bevy_spacetimedb_wasm::*;

    // Initialize test bridge (this works)
    test_helpers::init_test_bridge();

    let bridge = bevy_spacetimedb_wasm::get_bridge();

    // Create and connect (this works)
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    // Wait for connection (simplified for test)
    wasm_bindgen_futures::JsFuture::from(bridge.connect(conn_id))
        .await
        .expect("Connection should succeed");

    // TEST 1: Bridge should provide identity as hex string
    // This will FAIL - method doesn't exist yet
    let identity_hex = bridge.get_identity(conn_id)
        .expect("Should have identity after connection");

    // Identity should be 64 hex characters (32 bytes)
    assert_eq!(
        identity_hex.len(),
        64,
        "Identity should be 32 bytes as 64 hex chars"
    );

    // Should be valid hex
    assert!(
        identity_hex.chars().all(|c| c.is_ascii_hexdigit()),
        "Identity should be valid hex"
    );

    // TEST 2: Bridge should provide token
    // This will FAIL - method doesn't exist yet
    let token = bridge.get_token(conn_id)
        .expect("Should have token after connection");

    // Token should be JWT format
    assert!(
        token.starts_with("eyJ"),
        "Token should be JWT format (starts with eyJ)"
    );
}

#[wasm_bindgen_test]
async fn test_stdb_connection_identity_api() {
    // This test demonstrates the high-level Rust API
    // It will fail until we implement:
    // 1. Identity struct
    // 2. StdbConnection::identity() method
    // 3. StdbConnection::token() method

    use bevy_spacetimedb_wasm::*;
    use bevy::prelude::*;

    // Setup a test Bevy app with connection
    let mut app = App::new();

    test_helpers::init_test_bridge();

    let bridge = bevy_spacetimedb_wasm::get_bridge();
    let conn_id = bridge.create_connection(
        "ws://localhost:3000",
        "test-module",
        None,
    );

    // Connect
    wasm_bindgen_futures::JsFuture::from(bridge.connect(conn_id))
        .await
        .expect("Connection should succeed");

    // Create connection resource
    let connection = StdbConnection::new(bridge, conn_id);
    app.insert_resource(connection);

    // TEST 3: High-level API - get identity
    // This will FAIL - method doesn't exist yet
    let stdb = app.world().resource::<StdbConnection>();
    let identity = stdb.identity()
        .expect("Should have identity after connection");

    // Identity type should have bytes
    assert_eq!(identity.bytes.len(), 32, "Identity should be 32 bytes");

    // TEST 4: Identity should convert to hex
    // This will FAIL - to_hex() doesn't exist yet
    let hex = identity.to_hex();
    assert_eq!(hex.len(), 64, "Hex should be 64 chars");

    // TEST 5: Identity should parse from hex
    // This will FAIL - from_hex() doesn't exist yet
    let parsed = Identity::from_hex(&hex)
        .expect("Should parse valid hex");
    assert_eq!(parsed.bytes, identity.bytes, "Round-trip should work");

    // TEST 6: High-level API - get token
    // This will FAIL - method doesn't exist yet
    let token = stdb.token()
        .expect("Should have token after connection");
    assert!(token.starts_with("eyJ"), "Token should be JWT");
}

#[wasm_bindgen_test]
fn test_identity_hex_encoding() {
    // Test Identity type in isolation
    // This will FAIL - Identity type doesn't exist yet

    use bevy_spacetimedb_wasm::Identity;

    // Create identity from bytes
    let bytes = [42u8; 32];
    let identity = Identity { bytes };

    // Should convert to hex
    let hex = identity.to_hex();
    assert_eq!(hex.len(), 64);
    assert!(hex.chars().all(|c| c.is_ascii_hexdigit()));

    // Should parse back
    let parsed = Identity::from_hex(&hex).unwrap();
    assert_eq!(parsed.bytes, bytes);

    // Should reject invalid hex
    assert!(Identity::from_hex("not-hex").is_err());
    assert!(Identity::from_hex("abc").is_err()); // Wrong length
}

#[wasm_bindgen_test]
fn test_identity_short_hex() {
    // Test Identity display helpers
    // This will FAIL - short_hex() doesn't exist yet

    use bevy_spacetimedb_wasm::Identity;

    let identity = Identity {
        bytes: [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0]
    };

    let short = identity.short_hex();
    assert_eq!(short, "12345678", "Should show first 8 hex chars");
}
