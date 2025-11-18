# Server Folder

Express-based backend used for Self ID signature verification.

## File Overview
- **index.js**: Boots an Express server with CORS and JSON parsing, exposes `/api/self/check` to query verification status and `/api/self/verify` to validate signed messages with `ethers.utils.verifyMessage`. Verified wallets are cached in-memory; `/api/self/health` returns a simple heartbeat.

## Relationships
- Works with the client identity flow in `src/services/identityService.js`, which calls the verify endpoint after Self QR flows.
- Shares address normalization logic with the smart contract intent in `contracts/CeloEngageHubSelf.sol` by validating signatures before on-chain gating.

## Running
- Default port: `8787` (configurable via `PORT`). Start with `npm run start:server` from the repo root.

## Contributor Notes
- Keep responses lightweight for the front-end polling in `src/main.js`.
- Consider persisting `verifiedWallets` if durability is required; currently stored in-memory only.
