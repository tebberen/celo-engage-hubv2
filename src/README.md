# Frontend Source Code Documentation

This directory contains the source code for the Celo Engage Hub frontend. The application is architected as a modular, vanilla JavaScript Single Page Application (SPA) that dynamically adapts to its host environment (Standard Web vs. Farcaster Mini App).

## 🧠 Core Architecture

The frontend logic is centralized in `appCore.js`, which acts as the dependency injection container and state manager.

### Key Components

*   **`appCore.js`**: The heart of the application. It initializes the UI, sets up event listeners, and manages the transitions between different "tabs" (Home, GM, Deploy, Donate, Profile). It is designed to be environment-agnostic.
*   **`main.js`**: The entry point for the **Web App**. It initializes `appCore` with standard web configurations (e.g., standard WalletConnect providers).
*   **`miniapp.js`**: The entry point for the **Farcaster Mini App**. It initializes `appCore` with Farcaster-specific configurations (e.g., the Frame SDK provider).
*   **`services/`**: Contains pure business logic modules. These modules are stateless where possible and handle all external interactions (Blockchain, API).

---

## 📱 Farcaster Mini App Integration (`miniapp.js`)

This file is critical for the "Proof of Ship: Mini Apps" track. It handles the specific lifecycle and requirements of a Farcaster Frame.

### 1. SDK Initialization
We utilize the `@farcaster/miniapp-sdk` to bridge the gap between the Celo blockchain and the Farcaster client.

```javascript
import { sdk } from "@farcaster/miniapp-sdk";
```

### 2. Provider Injection Strategy
Unlike standard dApps that rely on `window.ethereum`, the Mini App must explicitly retrieve the provider from the SDK.

```javascript
const provider = sdk.provider; // The injected Farcaster provider
```

This provider is then passed into `appCore.js` during initialization, ensuring that all subsequent transactions (in `walletService.js` and `contractService.js`) automatically use the user's Farcaster wallet without prompting for a connection.

### 3. The "Ready" Signal
To ensure a smooth user experience, the Mini App explicitly signals when it is ready to be displayed. This prevents the user from seeing unstyled content or a broken UI.

```javascript
// Inside src/miniapp.js
window.addEventListener('DOMContentLoaded', async () => {
    // ... app initialization ...
    await sdk.actions.ready(); // Removes the loading splash screen
});
```

---

## 🧩 Services Layer (`src/services/`)

The application logic is broken down into specialized services:

*   **`walletService.js`**: Manages wallet connections, chain switching (handling Celo Mainnet enforcement), and account tracking. It abstracts the differences between standard Web3 providers and the Farcaster provider.
*   **`contractService.js`**: Handles all smart contract interactions. It contains the logic for:
    *   **GM Module:** Sending "GM" messages on-chain.
    *   **Donate Module:** Sending CELO to the Engage Hub treasury.
    *   **Deploy Module:** Deploying proxy contracts for user identity.
    *   **Profile Module:** Managing on-chain profiles.
*   **`divviReferral.js`**: Specific logic for handling referral tracking and rewards.

---

## 🎨 UI & UX Philosophy

The source code reflects a "Mobile-First" and "One Action" philosophy:

*   **No Framework Overhead:** We use Vanilla JS to keep the bundle size extremely small, ensuring instant load times on mobile networks.
*   **CSS Variables:** Theming is handled entirely via CSS variables in `src/styles/`, allowing for easy "Golden Theme" updates without touching the JS logic.
*   **DOM Manipulation:** UI updates are performed via efficient DOM manipulation in `appCore.js`, targeting specific IDs to minimize reflows.

---

## 🤝 Contribution Guide

1.  **Modify Logic:** Edit files in `src/`.
2.  **Test Locally:** Run the development server to see changes.
3.  **Build:** Run `npm run build` to update the `dist/` folder.
    *   *Note: Always rebuild before committing to ensure the production assets match the source.*
