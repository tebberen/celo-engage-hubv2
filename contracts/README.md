# `contracts/` – Solidity Sources

Solidity contracts associated with Celo Engage Hub. These files document the on-chain components that can be referenced by the frontend or during future deployments.

## Files
- **`CeloEngageHubSelf.sol`** – Extends `SelfVerificationRoot` to persist self-verifications on-chain. The current UI does not call this contract by default but it remains available for experiments with on-chain identity.

## Integration
- Contract addresses and ABI references should be surfaced through `src/utils/constants.js` so the frontend and services remain synchronized.
- If you deploy new modules, add their addresses/ABIs to `constants.js` and document expected flows in the root README.

## Contributing
- Add new contracts as separate `.sol` files with clear comments and access control.
- Keep ownership and verification guards consistent with the patterns used in existing modules.
- Align Solidity compiler versions and dependencies with the rest of the project before deploying to Celo Mainnet or Alfajores.
