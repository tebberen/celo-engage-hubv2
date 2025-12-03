# Celo Engage Hub v2

**The Unified "One Action" Gateway for the Celo Ecosystem.**

A modular, lightweight decentralized application (dApp) optimized for **Farcaster Mini Apps**, **MiniPay**, and **AI Agent** interaction. It unifies essential user actions—donating, deploying contracts, sending "GM" messages, and managing profiles—into a single, optimized interface.

---

## 🏆 Proof of Ship Alignment

This project is explicitly architected to address the **Proof of Ship 10** competition tracks.

### 📱 Track 1: Mini Apps
*   **Farcaster Native Integration:** The application is built with the `@farcaster/miniapp-sdk`, providing a seamless experience within Farcaster Frames.
*   **"One Action" Philosophy:** The user interface is stripped of friction, presenting immediate, actionable modules (Home, GM, Donate, Deploy) without landing page redirects.
*   **Mobile-First Design:** The layout is strictly optimized for mobile viewports (`375x667`), ensuring native-like performance on iOS and Android clients.
*   **Zero-Friction Onboarding:** Utilizes Farcaster's injected wallet provider for instant signing and transactions, removing the need for external wallet connections in the Mini App context.

### 🤖 Track 2: Noah AI (AI Agent Optimization)
*   **Semantic Codebase:** The project structure separates concerns (`src/services`, `src/data`, `contracts`) in a way that allows AI agents to easily parse, reason about, and verify application logic.
*   **AI-Parsable Documentation:** This README and the `src/README.md` are written in structured Markdown with clear context boundaries, enabling "AI Agent Judges" to ingest and evaluate the project's technical merit autonomously.
*   **Verifiable On-Chain Logic:** All core interactions are backed by verified smart contracts on Celo Mainnet, allowing AI agents to query and validate state changes programmatically.

---

## 🚀 Deployed Contracts (Celo Mainnet)

The following contracts have been deployed and verified on the Celo Mainnet. They serve as the backbone for the application's functionality.

| Module / Contract Name | Contract Address | Explorer Link |
| :--- | :--- | :--- |
| **Celo Engage Hub (Core)** | `0x18351438b1bD20ee433Ea7D25589e913f14ca1A5` | [View on CeloScan](https://celoscan.io/address/0x18351438b1bD20ee433Ea7D25589e913f14ca1A5) |
| **GM Module** | `0x06E065AE4dDa7b669D6381D1F7ec523bfD83e2D7` | [View on CeloScan](https://celoscan.io/address/0x06E065AE4dDa7b669D6381D1F7ec523bfD83e2D7) |
| **Deployed Module** | `0xD567149Cf3a2bd97d905408c87Cc8194eb246785` | [View on CeloScan](https://celoscan.io/address/0xD567149Cf3a2bd97d905408c87Cc8194eb246785) |
| **Donate Module** | `0x76CA7FCBCdB46881c2715EBf351BCc1aAC7d70FA` | [View on CeloScan](https://celoscan.io/address/0x76CA7FCBCdB46881c2715EBf351BCc1aAC7d70FA) |
| **Profile Module** | `0xb7574975e18b64d18886D03CCC710d62cdD7E743` | [View on CeloScan](https://celoscan.io/address/0xb7574975e18b64d18886D03CCC710d62cdD7E743) |
| **Link Module** | `0x5ae32ab13f0458f4fb7a434120747e7e5944ce97` | [View on CeloScan](https://celoscan.io/address/0x5ae32ab13f0458f4fb7a434120747e7e5944ce97) |
| **Governance Module** | `0xe71c701d66f8c27fba15f3b4a607c741ffedeed1` | [View on CeloScan](https://celoscan.io/address/0xe71c701d66f8c27fba15f3b4a607c741ffedeed1) |
| **Badge Module** | `0xd11896d5ba8aa3ed906b37b941a27849e74fd300` | [View on CeloScan](https://celoscan.io/address/0xd11896d5ba8aa3ed906b37b941a27849e74fd300) |

---

## 🏗 System Architecture

The project employs a **Dual-Entry Strategy** to maximize reach across both standard web browsers and the Farcaster ecosystem.

### 1. The Web dApp (`index.html`)
*   **Target:** Desktop and mobile web users.
*   **Features:** Full connectivity (WalletConnect, MetaMask), comprehensive ecosystem exploration, and educational guides.
*   **Entry Point:** `src/main.js`

### 2. The Farcaster Mini App (`miniapp.html`)
*   **Target:** Users within the Warpcast/Farcaster mobile client.
*   **Features:** Streamlined UI, auto-injected wallet provider, removal of non-essential navigation to focus on core actions.
*   **Entry Point:** `src/miniapp.js`

```mermaid
graph TD
    User((User))
    FC[Farcaster Client]
    Web[Web Browser]

    subgraph "Frontend"
        MA[Mini App (miniapp.html)]
        WA[Web App (index.html)]
        Core[src/appCore.js]
    end

    subgraph "Services"
        WS[Wallet Service]
        CS[Contract Service]
    end

    User -->|In-Frame| FC
    User -->|Direct URL| Web
    FC --> MA
    Web --> WA
    MA -->|Init| Core
    WA -->|Init| Core
    Core --> WS
    Core --> CS
```

---

## 🛠 Tech Stack

*   **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (Variables-based theming)
*   **Bundling:** `esbuild` (High-performance bundler)
*   **Blockchain Integration:** `ethers.js` v5.7.2
*   **Farcaster Integration:** `@farcaster/miniapp-sdk`
*   **Identity:** `Siwe` (Sign-In with Ethereum) & Custom Verification Contracts
*   **Backend (Optional):** Node.js / Express (for advanced verification logic)

---

## ⚙️ Installation & Usage

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn

### Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/tebberen/celo-engage-hubv2.git
    cd celo-engage-hubv2
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Build the Project**
    This compiles the source code into the `dist/` directory using `esbuild`.
    ```bash
    npm run build
    ```

4.  **Run Development Server**
    You can use any static file server. For example:
    ```bash
    npx http-server .
    ```
    *   **Web App:** Visit `http://localhost:8080/index.html`
    *   **Mini App:** Visit `http://localhost:8080/miniapp.html` (Use browser developer tools to simulate mobile view).

---

## 📂 Directory Structure

*   **`src/`**: Contains the core application logic. See [`src/README.md`](./src/README.md) for detailed documentation.
*   **`contracts/`**: Solidity smart contracts.
*   **`server/`**: Backend verification service.
*   **`dist/`**: Compiled production assets.
*   **`assets/`**: Images, logos, and static resources.

---

## 📄 License

This project is open-source and licensed under the **MIT License**.
