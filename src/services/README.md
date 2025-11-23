# `src/services/` – App & Web3 Services

Service layer modules connect the UI to wallets, smart contracts, and referral metadata. They expose promise-based helpers consumed by `src/main.js`.

## Files
- **`walletService.js`** – Manages MetaMask and WalletConnect sessions, listens for account/network changes, and returns provider/signer objects used throughout the app.
- **`contractService.js`** – Loads contract instances from `utils/constants.js`, registers toast handlers, and orchestrates GM, Deploy, Donate (CELO/cUSD/cEUR), governance, leaderboard, and profile reads.
- **`identityService.js`** – Lightweight helpers for storing and retrieving local identity/verification state.
- **`divviReferral.js`** – Optionally tags transactions with Divvi referral metadata and safely ignores failures.

## Extending services
- Centralize new blockchain actions here so UI code stays declarative.
- Reuse constants from `utils/constants.js` (addresses, ABIs, thresholds) instead of hardcoding values.
- Keep wallet listeners in `walletService.js` single-sourced to avoid duplicate event handling.
