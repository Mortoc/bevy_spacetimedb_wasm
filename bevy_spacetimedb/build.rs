use std::process::Command;
use std::path::PathBuf;
use std::fs;
use std::env;

fn main() {
    // Tell cargo to rerun if important files change
    println!("cargo:rerun-if-changed=tests/test_module/src");
    println!("cargo:rerun-if-changed=tests/test_module/Cargo.toml");
    println!("cargo:rerun-if-changed=tests/spacetimedb-bridge.bundle.js");
    println!("cargo:rerun-if-changed=js/dist/spacetimedb-bridge.bundle.js");

    let manifest_dir = env::var("CARGO_MANIFEST_DIR").unwrap();

    // Check if we should enable verbose output
    let verbose = env::var("BEVY_SPACETIMEDB_VERBOSE_BUILD").is_ok();

    // Embed the bundled bridge for tests
    embed_test_bridge(&manifest_dir, verbose);

    // Check for production bundle (only warn if missing)
    check_production_bundle(&manifest_dir);

    // Only build/publish test module if explicitly requested or running tests
    let is_test_build = env::var("CARGO_CFG_TEST").is_ok()
        || env::var("BEVY_SPACETIMEDB_BUILD_TEST_MODULE").is_ok();

    if is_test_build {
        build_and_publish_test_module(&manifest_dir, verbose);
    }
}

fn embed_test_bridge(manifest_dir: &str, verbose: bool) {
    let bundle_path = PathBuf::from(manifest_dir)
        .join("tests")
        .join("spacetimedb-bridge.bundle.js");

    if bundle_path.exists() {
        let bundle_content = fs::read_to_string(&bundle_path)
            .expect("Failed to read bridge bundle");

        let out_dir = env::var("OUT_DIR").unwrap();
        let dest_path = PathBuf::from(out_dir).join("bridge_bundle.js");
        fs::write(&dest_path, bundle_content)
            .expect("Failed to write bridge bundle");

        if verbose {
            println!("cargo:warning=✓ Bundled bridge embedded for tests");
        }
    } else {
        println!("cargo:warning=⚠️  Bridge bundle not found at tests/spacetimedb-bridge.bundle.js");
        println!("cargo:warning=   Run: cd tests && npm install && npm run build-bridge");
    }
}

fn check_production_bundle(manifest_dir: &str) {
    let prod_bundle_path = PathBuf::from(manifest_dir)
        .join("js")
        .join("dist")
        .join("spacetimedb-bridge.bundle.js");

    if !prod_bundle_path.exists() {
        // Only warn once per build, not spamming
        static mut WARNED: bool = false;
        unsafe {
            if !WARNED {
                println!("cargo:warning=ℹ️  Production bundle not found. For browser deployment, run: cd js && npm install && npm run build");
                WARNED = true;
            }
        }
    }
}

fn build_and_publish_test_module(manifest_dir: &str, verbose: bool) {
    let test_module_path = PathBuf::from(manifest_dir)
        .join("tests")
        .join("test_module");

    if !test_module_path.exists() {
        if verbose {
            println!("cargo:warning=Test module not found, skipping");
        }
        return;
    }

    if verbose {
        println!("cargo:warning=Building SpacetimeDB test module...");
    }

    // Build the test module
    let build_result = Command::new("cargo")
        .args(&["build", "--release", "--target", "wasm32-unknown-unknown"])
        .current_dir(&test_module_path)
        .output();

    match build_result {
        Ok(output) if output.status.success() => {
            if verbose {
                println!("cargo:warning=✓ Test module built successfully");
            }

            // Try to publish (only if verbose or first time)
            try_publish_test_module(&test_module_path, manifest_dir, verbose);
        }
        Ok(output) => {
            let stderr = String::from_utf8_lossy(&output.stderr);
            println!("cargo:warning=⚠️  Failed to build test module");
            if !stderr.is_empty() {
                println!("cargo:warning=   {}", stderr.lines().next().unwrap_or(""));
            }
        }
        Err(e) => {
            println!("cargo:warning=⚠️  Failed to build test module: {}", e);
        }
    }
}

fn try_publish_test_module(test_module_path: &PathBuf, manifest_dir: &str, verbose: bool) {
    // Find spacetime CLI
    let home_spacetime = PathBuf::from(env::var("HOME").unwrap_or_default())
        .join(".local/bin/spacetime");
    let spacetime_cmd = if home_spacetime.exists() {
        home_spacetime.to_str().unwrap()
    } else {
        "spacetime"
    };

    if verbose {
        println!("cargo:warning=Publishing test module to SpacetimeDB...");
    }

    let publish_result = Command::new(spacetime_cmd)
        .args(&[
            "publish",
            "--server",
            "http://localhost:3000",
            "--project-path",
            ".",
            "--delete-data",
            "-y",
            "test-module",
        ])
        .current_dir(test_module_path)
        .output();

    match publish_result {
        Ok(output) if output.status.success() => {
            if verbose {
                println!("cargo:warning=✓ Test module published to SpacetimeDB");
            }

            // Generate TypeScript bindings
            generate_bindings(test_module_path, manifest_dir, spacetime_cmd, verbose);
        }
        Ok(_) => {
            // Server not running - this is fine, don't spam warnings
            if verbose {
                println!("cargo:warning=⚠️  SpacetimeDB server not running (this is OK for non-integration tests)");
            }
        }
        Err(_) => {
            // spacetime CLI not found - only warn if verbose
            if verbose {
                println!("cargo:warning=⚠️  'spacetime' CLI not found (install from https://install.spacetimedb.com)");
            }
        }
    }
}

fn generate_bindings(test_module_path: &PathBuf, manifest_dir: &str, spacetime_cmd: &str, verbose: bool) {
    let generated_dir = PathBuf::from(manifest_dir)
        .join("tests")
        .join("generated");

    if verbose {
        println!("cargo:warning=Generating TypeScript bindings...");
    }

    let generate_result = Command::new(spacetime_cmd)
        .args(&[
            "generate",
            "--lang", "typescript",
            "--out-dir", generated_dir.to_str().unwrap(),
            "--project-path", ".",
        ])
        .current_dir(test_module_path)
        .output();

    match generate_result {
        Ok(output) if output.status.success() => {
            if verbose {
                println!("cargo:warning=✓ TypeScript bindings generated");
            }
        }
        Ok(output) => {
            if verbose {
                let stderr = String::from_utf8_lossy(&output.stderr);
                println!("cargo:warning=⚠️  Could not generate TypeScript bindings");
                if !stderr.is_empty() {
                    println!("cargo:warning=   {}", stderr.lines().next().unwrap_or(""));
                }
            }
        }
        Err(e) => {
            if verbose {
                println!("cargo:warning=⚠️  Failed to generate bindings: {}", e);
            }
        }
    }
}
