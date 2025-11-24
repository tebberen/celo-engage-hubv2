# `contracts/` – Solidity Modules

Smart contracts related to the Celo Engage Hub. These sources are not required for the static front-end to run but document how on-chain verification could be integrated with the hub.

## Files
- **`CeloEngageHubSelf.sol`** – Extends `SelfVerificationRoot` (from `@selfxyz/contracts`) to record Self ID verifications on-chain. Includes a sample `gatedAction` modifier demonstrating how verified users could unlock hub actions.

## Usage & deployment
- Compile and deploy the contracts with your preferred Solidity workflow (Hardhat/Foundry/Remix) using **Solidity v0.8.20** to match the pragma.
- Surface deployed addresses and ABI snippets through `src/utils/constants.js` so the front-end services can consume them.
- If you add new modules, document expected flows in the root README and keep addresses synchronized in the constants file.

## Contribution guidelines
- Add additional contracts as separate `.sol` files with clear comments and events for any user-facing actions.
- Align access controls and verification checks with the existing `onlyVerified` pattern when gating actions.
- Keep compiler versions consistent across files to simplify deployment to Celo Mainnet or Alfajores.
