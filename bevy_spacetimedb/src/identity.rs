

//! SpacetimeDB identity and timestamp types
//!
//! Provides types for working with user identities, authentication, and timestamps.

use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

/// A SpacetimeDB identity (32-byte unique identifier)
///
/// Identities are assigned by the SpacetimeDB server and uniquely identify
/// a connected client. They can be used for authentication and access control.
///
/// # Example
/// ```ignore
/// use bevy_spacetimedb_wasm::Identity;
///
/// let identity = stdb.identity().expect("Should have identity after connection");
/// println!("User ID: {}", identity.short_hex());
/// ```
///
/// # Serialization
///
/// Identity automatically serializes/deserializes as a hex string when used with serde:
/// ```ignore
/// #[derive(Serialize, Deserialize)]
/// struct Player {
///     owner: Identity,  // Will serialize as hex string
/// }
/// ```
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Identity {
    /// The 32 bytes of the identity
    pub bytes: [u8; 32],
}

impl Identity {
    /// Convert identity to hex string (64 characters)
    ///
    /// # Example
    /// ```ignore
    /// let hex = identity.to_hex();
    /// assert_eq!(hex.len(), 64);
    /// ```
    pub fn to_hex(&self) -> String {
        self.bytes
            .iter()
            .map(|b| format!("{:02x}", b))
            .collect()
    }

    /// Parse identity from hex string
    ///
    /// # Errors
    /// Returns `IdentityError::InvalidLength` if string is not 64 characters.
    /// Returns `IdentityError::InvalidHex` if string contains non-hex characters.
    ///
    /// # Example
    /// ```ignore
    /// let identity = Identity::from_hex("1234567890abcdef...")?;
    /// ```
    pub fn from_hex(s: &str) -> Result<Self, IdentityError> {
        if s.len() != 64 {
            return Err(IdentityError::InvalidLength);
        }

        let mut bytes = [0u8; 32];
        for i in 0..32 {
            let byte_str = &s[i * 2..i * 2 + 2];
            bytes[i] = u8::from_str_radix(byte_str, 16)
                .map_err(|_| IdentityError::InvalidHex)?;
        }

        Ok(Identity { bytes })
    }

    /// Get the first 8 hex characters (for display purposes)
    ///
    /// Useful for showing a shortened version of the identity in UI.
    ///
    /// # Example
    /// ```ignore
    /// println!("User: {}", identity.short_hex()); // "User: 1a2b3c4d"
    /// ```
    pub fn short_hex(&self) -> String {
        self.to_hex()[..8].to_string()
    }
}

impl fmt::Display for Identity {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_hex())
    }
}

// Serialize as hex string
impl Serialize for Identity {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_hex())
    }
}

// Deserialize from hex string
impl<'de> Deserialize<'de> for Identity {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        Identity::from_hex(&s).map_err(serde::de::Error::custom)
    }
}

/// Errors that can occur when working with identities
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum IdentityError {
    /// Hex string has wrong length (expected 64 characters)
    InvalidLength,
    /// Hex string contains non-hexadecimal characters
    InvalidHex,
}

impl fmt::Display for IdentityError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            IdentityError::InvalidLength => {
                write!(f, "Invalid length: expected 64 hex characters (32 bytes)")
            }
            IdentityError::InvalidHex => {
                write!(f, "Invalid hex encoding")
            }
        }
    }
}

impl std::error::Error for IdentityError {}

/// A SpacetimeDB timestamp (microseconds since Unix epoch)
///
/// Timestamps represent time in SpacetimeDB, stored as microseconds since the Unix epoch.
///
/// # Example
/// ```ignore
/// use bevy_spacetimedb_wasm::Timestamp;
///
/// #[derive(Serialize, Deserialize)]
/// struct Event {
///     created_at: Timestamp,
/// }
/// ```
///
/// # Serialization
///
/// Timestamp serializes/deserializes as a u64 microseconds value:
/// ```ignore
/// let ts = Timestamp::from_micros(1234567890);
/// let micros = ts.as_micros();  // 1234567890
/// ```
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Timestamp {
    /// Microseconds since Unix epoch
    #[serde(rename = "microseconds")]
    micros: u64,
}

impl Timestamp {
    /// Create a timestamp from microseconds since Unix epoch
    pub fn from_micros(micros: u64) -> Self {
        Timestamp { micros }
    }

    /// Get microseconds since Unix epoch
    pub fn as_micros(&self) -> u64 {
        self.micros
    }

    /// Get milliseconds since Unix epoch
    pub fn as_millis(&self) -> u64 {
        self.micros / 1000
    }

    /// Get seconds since Unix epoch
    pub fn as_secs(&self) -> u64 {
        self.micros / 1_000_000
    }
}

impl fmt::Display for Timestamp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} μs", self.micros)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_identity_to_hex() {
        let identity = Identity {
            bytes: [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0]
        };

        let hex = identity.to_hex();
        assert_eq!(hex.len(), 64);
        assert!(hex.starts_with("123456789abcdef0"));
    }

    #[wasm_bindgen_test]
    fn test_identity_from_hex() {
        let hex = "123456789abcdef0000000000000000000000000000000000000000000000000";
        let identity = Identity::from_hex(hex).unwrap();

        assert_eq!(identity.bytes[0], 0x12);
        assert_eq!(identity.bytes[1], 0x34);
        assert_eq!(identity.bytes[7], 0xf0);
    }

    #[wasm_bindgen_test]
    fn test_identity_round_trip() {
        let original = Identity { bytes: [42u8; 32] };
        let hex = original.to_hex();
        let parsed = Identity::from_hex(&hex).unwrap();

        assert_eq!(parsed, original);
    }

    #[wasm_bindgen_test]
    fn test_identity_from_hex_invalid_length() {
        assert_eq!(
            Identity::from_hex("abc"),
            Err(IdentityError::InvalidLength)
        );
    }

    #[wasm_bindgen_test]
    fn test_identity_from_hex_invalid_chars() {
        let invalid = "g".repeat(64); // 'g' is not a hex digit
        assert_eq!(
            Identity::from_hex(&invalid),
            Err(IdentityError::InvalidHex)
        );
    }

    #[wasm_bindgen_test]
    fn test_identity_short_hex() {
        let identity = Identity {
            bytes: [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0]
        };

        assert_eq!(identity.short_hex(), "12345678");
    }

    #[wasm_bindgen_test]
    fn test_identity_serialization() {
        let identity = Identity {
            bytes: [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0]
        };

        // Serialize to JSON
        let json = serde_json::to_string(&identity).unwrap();
        assert_eq!(json, "\"123456789abcdef0000000000000000000000000000000000000000000000000\"");

        // Deserialize back
        let deserialized: Identity = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, identity);
    }

    #[wasm_bindgen_test]
    fn test_timestamp_creation() {
        let ts = Timestamp::from_micros(1234567890);
        assert_eq!(ts.as_micros(), 1234567890);
        assert_eq!(ts.as_millis(), 1234567);
        assert_eq!(ts.as_secs(), 1234);
    }

    #[wasm_bindgen_test]
    fn test_timestamp_serialization() {
        let ts = Timestamp::from_micros(1234567890);

        // Serialize to JSON
        let json = serde_json::to_string(&ts).unwrap();
        assert!(json.contains("\"microseconds\""));
        assert!(json.contains("1234567890"));

        // Deserialize back
        let deserialized: Timestamp = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, ts);
    }

    #[wasm_bindgen_test]
    fn test_timestamp_ordering() {
        let ts1 = Timestamp::from_micros(1000);
        let ts2 = Timestamp::from_micros(2000);

        assert!(ts1 < ts2);
        assert!(ts2 > ts1);
        assert_eq!(ts1, ts1);
    }
}
