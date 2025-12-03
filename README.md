# Celo Engage Hub v2

**A responsive Celo community hub optimized for MiniPay, Farcaster Mini Apps, and AI Agent interaction.**

---

## 🚀 Project Overview

**Celo Engage Hub v2** is a modular, lightweight decentralized application (dApp) designed to be the primary entry point for the Celo ecosystem. It unifies essential user actions—donating, deploying contracts, sending "GM" messages, and managing profiles—into a single, optimized interface.

This project is architected with a **dual-entry strategy**:
1.  **Web dApp:** A full-featured browser experience.
2.  **Farcaster Mini App:** A streamlined, "One Action" optimized experience embedded directly within Farcaster frames.

## 🏆 Proof of Ship Alignment

This project specifically targets the **Proof of Ship 10** competition tracks:

### 📱 Track: Mini Apps
- **Farcaster Native:** Fully integrated with `@farcaster/miniapp-sdk`.
- **"One Action" Philosophy:** The Mini App entry point (`miniapp.html`) bypasses landing pages to present immediate, actionable modules (Home, GM, Donate, Deploy).
- **Mobile First:** UI is optimized for mobile viewports (`375x667`), ensuring seamless interaction within the Farcaster client.
- **Wallet Integration:** Leverages Farcaster's native wallet provider for frictionless signing and transactions.

### 🤖 Track: Noah AI (AI Agent Optimization)
- **Structured Documentation:** This codebase is documented to be easily parsed by AI agents for code review and automated deployment understanding.
- **Semantic Codebase:** Clear separation of concerns in `src/services`, `src/data`, and `contracts` allows AI agents to easily reason about the application logic.
- **Verifiable Logic:** Smart contracts include self-verification mechanics accessible via API, enabling AI agents to verify user identity and on-chain actions.

---

## 🏗 Architecture

The application is built as a static client-side application with optional server-side components for legacy verification.

```mermaid
graph TD
    User((User))
    FC[Farcaster Client]
    Web[Web Browser]

    subgraph "Frontend (Static)"
        MA[Mini App (miniapp.html)]
        WA[Web App (index.html)]
        SDK[@farcaster/miniapp-sdk]
        Core[appCore.js]
        Services[Services: Wallet, Contract, Identity]
    end

    subgraph "Blockchain (Celo)"
        RPC[JSON-RPC Provider]
        Contracts[Smart Contracts]
    end

    User -->|Opens Frame| FC
    User -->|Visits URL| Web
    FC -->|Loads| MA
    Web -->|Loads| WA
    MA -->|Uses| SDK
    MA -->|Imports| Core
    WA -->|Imports| Core
    Core -->|Calls| Services
    Services -->|Tx/Read| RPC
    RPC -->|Interacts| Contracts
```

### Key Components
- **`miniapp.html`**: Specialized entry point for Farcaster. Initializes the SDK and handles the handshake.
- **`src/appCore.js`**: The central controller that manages state, DOM updates, and event routing.
- **`src/services/`**: Isolated modules for Blockchain interactions (`walletService`, `contractService`).
- **`contracts/`**: Solidity contracts for on-chain identity verification.

---

## 📜 Contract Addresses

| Network | Contract Name | Address |
| :--- | :--- | :--- |
| **Celo Mainnet** | CeloEngageHub | `[INSERT ADDRESS]` |
| **Alfajores** | CeloEngageHub | `[INSERT ADDRESS]` |

> *Note: If addresses are not yet deployed, these are placeholders for the competition judging phase.*

---

## 🛠 Tech Stack

- **Languages:** JavaScript (ES6+), Solidity (v0.8.20), HTML5, CSS3
- **Frameworks:** Vanilla JS (Frontend), Express (Backend), Hardhat (Contracts)
- **Libraries:**
  - `ethers.js` (v5.7.2): Blockchain interaction
  - `@farcaster/miniapp-sdk`: Farcaster Frame integration
  - `@walletconnect/web3-provider`: Wallet connectivity
- **Build Tools:** `esbuild` (Fast bundling)
- **Design:** Custom CSS variables (Golden Theme), Mobile-first responsive grid.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/tebberen/celo-engage-hubv2.git
cd celo-engage-hubv2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Project
Generates the `dist/` folder containing the optimized bundles for Web and Mini App.
```bash
npm run build
```

### 4. Run Local Development Server
The application is static. You can serve it using any static file server.
```bash
# Example using python
python3 -m http.server 8080
# Or using a VS Code extension "Live Server"
```
Access the Web App at `http://localhost:8080/index.html` and the Mini App at `http://localhost:8080/miniapp.html`.

### 5. (Optional) Run Backend Server
For Self ID verification features:
```bash
npm run start:server
```

---

## 📱 Farcaster Mini App Integration

The **Mini App** implementation represents the core "Proof of Ship" value.

- **Entry Point:** `src/miniapp.js`
- **Logic:**
    1.  **Initialization:** The app waits for `DOMContentLoaded`.
    2.  **SDK Handshake:** Calls `sdk.actions.ready()` to signal the Farcaster client that the frame is loaded.
    3.  **Context Injection:** Injects specific Farcaster wallet providers via `getMiniAppProvider`.
    4.  **UI Adaptation:** Hides standard web headers/footers to maximize screen real estate within the frame.

### Debugging Mini Apps
To debug the Mini App flow in a standard browser:
1.  Open `miniapp.html` in your browser.
2.  Open Developer Tools (F12) > Console.
3.  Observe the `[MiniApp]` logs simulating the SDK handshake.

---

## 📂 Directory Structure

- **`assets/`**: Static images and icons.
- **`contracts/`**: Smart contract source code (Solidity).
- **`dist/`**: Production build artifacts (generated).
- **`server/`**: Node.js backend for verification.
- **`src/`**: Source code for the frontend application.
  - **`data/`**: JSON configuration for ecosystem links.
  - **`services/`**: Blockchain and API service layers.
  - **`styles/`**: CSS source files.
  - **`utils/`**: Helper functions and constants.

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
