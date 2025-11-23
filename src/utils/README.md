# `src/utils/` – Shared Helpers

Shared constants and helper functions that keep blockchain configuration and formatting consistent across the app.

## Files
- **`constants.js`** – Central source for network metadata, contract addresses/ABIs, module definitions, donation minimums, analytics links, and UI message templates. Imported by services and `main.js`.
- **`cdn-modules.js`** – Re-exports browser-safe builds of `ethers` and WalletConnect from CDN endpoints so the app can run without a bundler.
- **`formatters.js`** – Number/token formatting helpers with compact display and graceful fallbacks for CELO and stable assets.

## Usage notes
- Update `constants.js` when changing chain IDs, RPC endpoints, contract deployments, or module settings; it keeps UI and services in sync.
- Avoid wrapping imports in `try/catch`—surface errors explicitly so debugging stays straightforward.
- Keep helpers pure and side-effect-free where possible to simplify testing and reuse.
