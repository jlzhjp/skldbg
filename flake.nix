{
  description = "Electron development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;

          config = {
            allowUnfree = true;
          };
        };
        electronRuntimeLibraries = with pkgs; [
          alsa-lib
          at-spi2-core
          cairo
          cups
          dbus
          expat
          fontconfig
          freetype
          gdk-pixbuf
          glib
          gtk3
          libdrm
          libgbm
          libGL
          libnotify
          libpulseaudio
          libsecret
          libx11
          libxcomposite
          libxcursor
          libxdamage
          libxext
          libxfixes
          libxi
          libxkbcommon
          libxrandr
          libxrender
          libxscrnsaver
          libxtst
          libxcb
          mesa
          nspr
          nss
          pango
          pipewire
          systemd
          udev
          vulkan-loader
          wayland
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_latest
            pnpm

            nixd
            nixfmt
            deadnix
            statix
          ];

          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"
            export NIX_LD="${pkgs.stdenv.cc.bintools.dynamicLinker}"
            export NIX_LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath electronRuntimeLibraries}''${NIX_LD_LIBRARY_PATH:+:$NIX_LD_LIBRARY_PATH}"
          '';
        };
      }
    );
}
