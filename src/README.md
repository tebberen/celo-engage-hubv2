# Source Code Documentation

This directory contains the core logic for the Celo Engage Hub frontend. The application is designed as a hybrid Single Page Application (SPA) that supports both a standard Web environment and a Farcaster Mini App environment.

## 📂 Structure Overview

- **`appCore.js`**: The central controller. It handles state management, UI rendering, event listeners, and dependency injection for environment-specific logic (Web vs. Mini App).
- **`main.js`**: Entry point for the Standard Web App (`index.html`).
- **`miniapp.js`**: Entry point for the Farcaster Mini App (`miniapp.html`).
- **`miniapp-clean.js`**: A stripped-down version for minimal frame implementations.

---

## 📱 Farcaster Mini App Logic

The Mini App implementation is located in `miniapp.js`. It bridges the standard web application logic with the `@farcaster/miniapp-sdk`.

### Key Implementation Details:

1.  **SDK Initialization:**
    It imports `sdk` from `@farcaster/miniapp-sdk` and initializes the app core with specific overrides for the Farcaster environment.

    ```javascript
    import { sdk } from "@farcaster/miniapp-sdk";
    import { initApp } from "./appCore.js";
    ```

2.  **Provider Injection:**
    The `getMiniAppProvider` function wraps the Farcaster SDK's wallet provider to make it compatible with `ethers.js`, ensuring that all blockchain transactions initiated within the frame use the user's Farcaster connected wallet.

3.  **Ready Signal:**
    Critically, the script calls `sdk.actions.ready()` once the DOM is fully loaded. This is a requirement for Farcaster Mini Apps to remove the loading splash screen.

    ```javascript
    async function markMiniAppReady() {
      // ...
      await sdk.actions.ready();
      // ...
    }
    ```

---

## 🧩 App Core (`appCore.js`)

`appCore.js` is the "brain" of the application. It is environment-agnostic but accepts configuration during initialization.

### Responsibilities:
- **Navigation:** Handles tab switching (Home, GM, Deploy, Donate, Profile).
- **Dynamic Content:** Loads ecosystem data from `src/data/`.
- **Modals:** Manages the visibility of "Connect Wallet", "Share", and "Success" modals.
- **Language:** Basic i18n support via `lang.json`.

### Dependency Injection Pattern
To support both Web and Mini App with a single codebase, `initApp` accepts an `env` parameter:

```javascript
initApp({
  root: document.getElementById('app'),
  getProvider: ..., // Custom provider strategy (WalletConnect vs Farcaster)
  env: 'miniapp',   // 'web' or 'miniapp'
  onShare: ...      // Custom sharing logic (window.open vs sdk.actions.openUrl)
});
```

## 📦 Sub-modules

- **`services/`**: Contains the business logic for blockchain interactions (Wallet, Contracts).
- **`data/`**: JSON files defining the content (Ecosystem links, Mini App directory).
- **`styles/`**: CSS modules for styling.
- **`utils/`**: Utility functions (formatting, constants).
