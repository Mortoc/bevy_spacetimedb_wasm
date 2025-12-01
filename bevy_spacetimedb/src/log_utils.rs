//! Logging utilities for browser console output

use wasm_bindgen::JsValue;

/// Log an error message to the browser console
pub(crate) fn log_error(msg: impl AsRef<str>) {
    web_sys::console::error_1(&JsValue::from_str(msg.as_ref()));
}

/// Log an info message to the browser console
pub(crate) fn log_info(msg: impl AsRef<str>) {
    web_sys::console::log_1(&JsValue::from_str(msg.as_ref()));
}
