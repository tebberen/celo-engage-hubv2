# Smart Contracts Documentation

This directory contains the Solidity smart contracts that power the on-chain logic of the Celo Engage Hub.

## 📄 Contracts

### `CeloEngageHubSelf.sol`
This contract inherits from `@selfxyz/contracts/SelfVerificationRoot.sol` and provides the logic for the "Self" identity verification system.

- **Purpose:** Verifies user identity proofs generated off-chain.
- **Key Functions:**
    - `verifySelfProof(...)`: Validates the cryptographic proof and marks the user as verified.
    - `gatedAction()`: An example function restricted to verified users (`onlyVerified` modifier).

## 🛠 Development

The contracts are developed using **Hardhat** (implied by the structure, though `hardhat.config.js` might be in the root).

### Prerequisites
- Solidity `^0.8.20`

### Compilation
To compile the contracts (if Hardhat is set up):
```bash
npx hardhat compile
```

### Deployment
Deployment scripts are typically located in a `scripts/` or `deploy/` folder (check root).

---

## 🔗 Addresses

| Network | Address |
| :--- | :--- |
| **Celo Mainnet** | `[INSERT ADDRESS]` |
| **Alfajores** | `[INSERT ADDRESS]` |
