# Service Layer Documentation

The `services` directory isolates the business logic and external interactions of the application. It follows a modular design pattern to separate concerns between the UI (`appCore.js`) and the underlying data/blockchain layers.

## 📂 Key Files

### `walletService.js`
Handles all wallet connection and network management logic.
- **`connectWallet(providerType)`**: Connects to MetaMask or WalletConnect.
- **`switchNetwork(targetChainId)`**: Handles chain switching (e.g., Celo Mainnet vs. Alfajores), including adding the chain if it doesn't exist in the user's wallet.
- **`getSigner()`**: Returns the ethers.js signer for transaction execution.

### `contractService.js`
Manages interactions with Smart Contracts.
- **`doGM()`**: Sends a "GM" transaction to the contract.
- **`doDeploy()`**: Handles the deployment of new contracts (for the "Deploy" module).
- **`doDonateCELO()`, `doDonateToken()`**: Executes donation transactions in native CELO or ERC-20 tokens (cUSD, cEUR).
- **Tx Handling**: Implements optimistic UI updates—toasts are triggered on transaction hash generation to prevent UI hanging during long block times.

### `identityService.js`
Manages user identity and verification.
- **`checkSelfVerification()`**: Checks if a user is verified via the backend API.
- **`verifySelf()`**: Submits a cryptographic proof to the backend to verify identity.

### `divviReferral.js`
A specific service for handling referral logic within the Divvi wallet ecosystem or similar integration points.

## 🔄 Interaction Flow

1.  **User Action:** User clicks "Donate" in the UI.
2.  **App Core:** `appCore.js` captures the event and calls `contractService.doDonateCELO()`.
3.  **Contract Service:**
    - Calls `walletService.ensureNetwork()` to verify the chain.
    - Uses `walletService.getSigner()` to prepare the transaction.
    - Sends the transaction via `ethers.js`.
4.  **Feedback:** Returns the transaction hash to `appCore.js` to display the "Success" modal.
