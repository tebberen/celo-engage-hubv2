# `src/services/` – App & Web3 Services

Service modules that connect the UI to wallets, smart contracts, and referral metadata. They provide promise-based helpers consumed by `src/main.js` to keep the UI declarative.

## Files
- **`walletService.js`** – Manages MetaMask and WalletConnect v2 sessions, listens for account/network changes, and exposes provider/signer helpers for CELO and stable asset interactions.
- **`contractService.js`** – Loads contract instances using values from `utils/constants.js`. Orchestrates GM, Deploy, Donate (CELO/cUSD/cEUR), governance create/vote flows, leaderboard/profile reads, link sharing, and donation withdrawals while delegating toast handling.
- **`identityService.js`** – Stores and retrieves lightweight identity/verification state in local storage; coordinates with the optional Express backend when enabled.
- **`divviReferral.js`** – Attaches Divvi referral metadata to transactions when available, safely degrading if the endpoint is unreachable.

## Extending services
- Centralize new blockchain actions here to keep `main.js` focused on rendering and event handling.
- Reuse constants (addresses, ABIs, thresholds, analytics) from `utils/constants.js` instead of hardcoding values.
- Keep wallet event listeners single-sourced in `walletService.js` to avoid duplicated network/account handling across the app.
