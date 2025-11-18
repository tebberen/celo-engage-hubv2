# Services Folder

Helper modules that connect the UI to wallets, contracts, identity flows, referrals, and off-chain data.

## File Overview
- **contractService.js**: Builds RPC/WebSocket providers, wraps hub module ABIs, registers toast callbacks, handles GM/deploy/donate/link/governance calls, tracks profile/global stats, and exposes analytics/link helpers. Uses `utils/constants.js` for addresses, ABIs, and network metadata.
- **walletService.js**: Manages MetaMask and WalletConnect connections, listens for account/network changes, and exposes signer/provider data used across the app.
- **identityService.js**: Coordinates Self ID verification. Loads Self SDK modules, renders QR codes, calls the backend verify endpoint, and caches verified addresses in localStorage with helper getters/setters.
- **talentService.js**: Fetches Talent Protocol profile data using the configured API key/username and surfaces loading/error states to `main.js`.
- **divviReferral.js**: Adds Divvi referral tags to contract transactions when possible and submits referral metadata after sends; falls back gracefully if tagging fails.

## Integration Notes
- `main.js` imports these helpers to keep UI code lean. Functions often expect constants such as `MODULE_ADDRESS_BOOK`, `MIN_DONATION`, and `OWNER_ADDRESS` defined in `utils/constants.js`.
- Network providers created here reuse `ethers` from `utils/cdn-modules.js` to match the browser environment.

## Contributor Notes
- When adding a new blockchain action, extend `contractService.js` and reuse `registerToastHandler` for consistent UX.
- Keep wallet listeners centralized in `walletService.js` to avoid duplicated event handling.
