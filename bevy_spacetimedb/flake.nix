{
  description = "Bevy SpacetimeDB development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, nixpkgs-unstable, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        pkgs-unstable = nixpkgs-unstable.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Rust toolchain from unstable (for edition2024 support)
            pkgs-unstable.rustc
            pkgs-unstable.cargo
            pkgs-unstable.rustfmt
            pkgs-unstable.clippy
            pkgs-unstable.rustup

            # WASM tools
            wasm-pack
            wasm-bindgen-cli

            # LLVM linker for WASM
            lld

            # Node.js for building bridge
            nodejs_20

            # SpacetimeDB CLI
            # Note: Add spacetimedb when available in nixpkgs

            # Browser for tests - Chromium as per spec
            chromium
            chromedriver

            # System libraries required by Playwright's Chromium
            glib
            nss
            nspr
            atk
            at-spi2-atk
            cups
            dbus
            libdrm
            gtk3
            pango
            cairo
            xorg.libX11
            xorg.libXcomposite
            xorg.libXdamage
            xorg.libXext
            xorg.libXfixes
            xorg.libXrandr
            xorg.libxcb
            mesa
            libxkbcommon
            alsa-lib
            expat
          ];

          shellHook = ''
            # Point wasm-pack to the nix-provided chromedriver
            export CHROMEDRIVER=${pkgs.chromedriver}/bin/chromedriver

            # Set LD_LIBRARY_PATH for Playwright's browsers
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [
              pkgs.glib
              pkgs.nss
              pkgs.nspr
              pkgs.atk
              pkgs.at-spi2-atk
              pkgs.cups
              pkgs.dbus
              pkgs.libdrm
              pkgs.gtk3
              pkgs.pango
              pkgs.cairo
              pkgs.xorg.libX11
              pkgs.xorg.libXcomposite
              pkgs.xorg.libXdamage
              pkgs.xorg.libXext
              pkgs.xorg.libXfixes
              pkgs.xorg.libXrandr
              pkgs.xorg.libxcb
              pkgs.mesa
              pkgs.libxkbcommon
              pkgs.alsa-lib
              pkgs.expat
            ]}:$LD_LIBRARY_PATH"

            # Configure rustup to use Nix-provided toolchain
            export RUSTUP_TOOLCHAIN=${pkgs-unstable.rustc}/bin

            # Ensure wasm32 target is installed
            if ! rustup target list --installed 2>/dev/null | grep -q "wasm32-unknown-unknown"; then
              echo "📦 Installing wasm32-unknown-unknown target..."
              rustup default stable 2>/dev/null || true
              rustup target add wasm32-unknown-unknown 2>/dev/null || true
            fi

            # Development environment ready
            echo "✓ Playwright libraries available in LD_LIBRARY_PATH"
          '';
        };
      }
    );
}
