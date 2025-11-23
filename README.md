# Celo Engage Hub v2 – Farcaster Celo Mini App Directory and On-Chain Engagement Hub

Celo Engage Hub v2 is a Farcaster-focused mini app directory and engagement surface for the Celo ecosystem. The web app ships a Celo-themed experience with quick actions for GM, Deploy, Donate, and Profile, plus a discoverable list of ecosystem mini apps.

## Overview
- **Navigation-first UI:** Header navigation surfaces Home, GM, Deploy, Donate, and Profile sections with clear breadcrumbs.
- **Home directory:** Presents Celo-related Farcaster mini apps with search and category filters so users can find the right tool quickly.
- **On-chain engagement:** GM, Deploy, Donate, and governance interactions are coordinated through the client-side modules.
- **Wallet connectivity:** Supports MetaMask and WalletConnect, with Celo Mainnet/Alfajores awareness built into the UI.

## Features
- **Celo mini app directory:** Searchable, filterable grid populated from `src/data/celoMiniApps.json`.
- **GM / Deploy / Donate actions:** Frontend flows for sending GM messages, deploying lightweight contracts, and donating in CELO, cUSD, or cEUR.
- **Profile page:** Shows the connected wallet, username flow, recent deployments, and participation stats.
- **Clean Celo-styled UI:** Responsive layout, dark/golden theme toggle, and ecosystem links for quick navigation.

## Tech Stack
- **Frontend:** HTML, CSS, and vanilla JavaScript served from `index.html` with assets in `/assets`.
- **Web3:** `ethers.js` (via CDN) plus WalletConnect support for browser wallets.
- **Network focus:** Celo Mainnet by default with support for Alfajores and other configured networks.
- **Backend (optional):** Lightweight Express server for legacy Self ID verification (disabled by default).

## Project Structure
- **`index.html`** – Static entry point that wires styles, scripts, and semantic markup for all sections.
- **`src/`** – Main frontend source (controllers, translations, helpers, and styles).
- **`src/services/`** – Wallet, contract, and referral service layer handling blockchain interactions.
- **`src/utils/`** – Constants, CDN module bridges, and formatting helpers reused across the app.
- **`src/data/`** – JSON data sources such as the Celo mini app directory.
- **`src/styles/`** – Global CSS theme, layout rules, and component styling.
- **`assets/`** – Logos and other static assets consumed by the UI.
- **`contracts/`** – Solidity sources referenced by the project (currently optional/self-verification oriented).
- **`server/`** – Optional Express server for Self verification health checks and signature validation.

## Getting Started
1. **Prerequisites:** Node.js 18+ and npm installed. A Celo-compatible wallet (MetaMask or a WalletConnect client) is recommended for testing.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the optional backend (only if you need Self verification testing):**
   ```bash
   npm run start:server
   ```
   The frontend itself is static. You can serve `index.html` with any static server (e.g., VS Code Live Server or `npx http-server`).
4. **Build & deploy:** This repository is static and can be hosted on GitHub Pages, Vercel, or any static host. Ensure `index.html`, `src/`, and `assets/` are published together.

## Wallet Connection
- **Profile flow:** Use the Profile section’s “Connect Wallet” action to link MetaMask or WalletConnect. The header wallet pill mirrors status and lets users disconnect.
- **Supported options:**
  - **MetaMask / injected providers** via `src/services/walletService.js`.
  - **WalletConnect v2** with the configured project ID.
- **Network expectations:** Targets Celo Mainnet (`chainId 42220`) by default. Alfajores (`44787`) is also recognized. The UI prompts if the wallet is on an unsupported network.

## Environment & Configuration
- RPC and WebSocket endpoints, contract addresses, module ABIs, donation thresholds, and UI strings are centralized in `src/utils/constants.js`.
- If you provide environment variables (e.g., `CELO_ENGAGE_RPC_URL`, `CELO_ENGAGE_WS_URL`), ensure they are injected by your hosting stack; no secrets should be committed.
- Update `manifest.json` and `miniapp.config.json` if you deploy to a new host or need to adjust mini app metadata.

## Contributing
- Fork or branch from `main`, then open a PR with concise descriptions of your changes.
- Keep new helpers modular; extend `src/services/` for blockchain interactions and `src/utils/constants.js` for shared config.
- To add a new Celo mini app to the directory, append an entry to `src/data/celoMiniApps.json` with `name`, `description`, `category`, `farcasterUrl`, and `iconUrl` fields.
- Prefer semantic HTML, accessible labels, and the existing class names used by `src/main.js` when adjusting the UI.

## License
This project is released under the **MIT License**. See `LICENSE` for full terms.
