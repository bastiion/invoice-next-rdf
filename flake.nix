{
    description = "invoice generation frontend";

    inputs = {
         nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
         flake-utils.url = "github:numtide/flake-utils";
         jiml-renderer-flake.url = "github:bastiion/jiml-renderer";
    };


    outputs = { self, nixpkgs, flake-utils, jiml-renderer-flake  }:
         flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.x86_64-linux;
        jiml-renderer = jiml-renderer-flake.defaultPackage.${system};
        buildInputs = with pkgs; [ texlive.combined.scheme-full jiml-renderer ];
        startScript = pkgs.writeShellScriptBin "invoice-next-rdf" ''
          ${pkgs.yarn}/bin/yarn start
        ''; 
        invoiceNextClient = pkgs.mkYarnPackage {
            name = "invoice-next-rdf";
            version = "0.0.1";
            src = ./.;
            packageJSON = ./package.json;
            yarnLock = ./yarn.lock;

            nativeBuildInputs = with pkgs; [ nodejs-16_x makeWrapper ];

            buildPhase = ''
              yarn --offline build
            '';

            postInstall = ''
              ln -s ${startScript}/bin/invoice-next-rdf $out/bin/invoice-next-rdf
            '';

            meta = with pkgs.lib; {
              license = licenses.gpl3Plus;
            };
          };
      in {
        packages.invoice-next-client = invoiceNextClient;
        defaultPackage = invoiceNextClient;
        devShell = pkgs.mkShell {
          name = "invoice-next-rdf";
          buildInputs = with pkgs; with pkgs.nodePackages; [
            nodejs
            yarn
          ];
        shellHook = ''export PATH="./node_modules/.bin:$PATH"'';
        };
      });
}
