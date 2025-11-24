# `src/utils/` – Shared Constants & Helpers

Utility modules that keep blockchain configuration, CDN imports, and formatting consistent across the hub. These files are imported by `src/main.js` and the service layer.

## Files
- **`constants.js`** – Central registry for network metadata, contract addresses/ABIs, module definitions (GM/Donate/Deploy/Profile), analytics links, and UI message templates. Also stores donation minimums and chain IDs for Celo Mainnet and Alfajores.
- **`cdn-modules.js`** – Re-exports browser-safe builds of `ethers` and WalletConnect directly from CDN endpoints so the app can run without a bundler.
- **`formatters.js`** – Number/token formatting helpers for CELO and stable assets with compact display, localization, and fallback handling.

## Usage guidelines
- Update `constants.js` whenever RPC endpoints, project IDs, ABIs, or module metadata change so services and UI stay synchronized.
- Keep helpers pure and side-effect-free; avoid wrapping imports in `try/catch` so errors surface clearly during debugging.
- When adding new utility modules, export functions explicitly and document expected shapes to keep the import surface predictable.
