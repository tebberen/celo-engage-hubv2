# Utils Folder

Shared utilities for constants, formatting, and CDN-provided libraries.

## File Overview
- **constants.js**: Central configuration for network metadata, contract addresses/ABIs, module versions, donation thresholds, UI messages, and third-party keys (WalletConnect, Talent Protocol, Divvi). Consumed by services and `main.js`.
- **cdn-modules.js**: Re-exports ESM builds of `ethers` and WalletConnect provider from CDNs to simplify browser imports.
- **formatters.js**: Numeric helpers for rendering CELO token amounts and generic numbers with fallbacks and compact display options.

## Integration Notes
These helpers are imported throughout `src/services` and `src/main.js`. Update `constants.js` when contract addresses or network defaults change so downstream modules stay in sync.

## Contributor Notes
- Avoid wrapping imports in try/catch; keep exports deterministic for bundling.
- Keep ABI/address changes atomic and documented in the root README.
