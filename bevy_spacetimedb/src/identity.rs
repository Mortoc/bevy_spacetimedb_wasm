

//! SpacetimeDB identity types
//!
//! Provides types for working with user identities and authentication.

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
}
