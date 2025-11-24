# Celo Engage Hub v2

**Modular Celo ecosystem hub + Farcaster mini app directory with GM, Deploy, Donate, and Profile engagement flows.**

## Overview
Celo Engage Hub v2 is a lightweight, mini-app–friendly web experience that spotlights the Celo ecosystem and gives users quick on-chain actions. Builders can showcase Farcaster mini apps, while users can explore the directory, send a GM, donate to ecosystem efforts, deploy starter modules, and manage wallet-connected profiles. The experience is designed for desktop and mobile browsers, as well as Farcaster mini app surfaces and MiniPay-friendly flows.

### Who it is for
- **Celo community members** who want a curated starting point for official links, wallets, bridges, and social channels.
- **Farcaster users** looking to launch or discover Celo-focused mini apps.
- **Builders and grantees** who need a public landing zone to share tools, track engagement, and experiment with lightweight deployments.

## Key Features
- **GM & on-chain engagement:** Trigger GM messages and lightweight interactions from the homepage and dedicated section.
- **Donate / Support Hub:** CELO, cUSD, and cEUR donation helpers with minimum thresholds and feedback toasts.
- **Deploy module concept:** Client-side deploy helpers for modular contracts and engagement experiments.
- **Profile (wallet-based):** Wallet connection, identity checks, and recent activity surfaced in the Profile section.
- **Celo Ecosystem cards:** Curated official links, DEX/CEX/Bridge options, social media, and Farcaster mini apps rendered as cards with clear CTAs.
- **Home “how to use / why / who” guidance:** Landing copy that orients new users and builders.
- **Mini-app friendly design:** Optimized for Farcaster embeds and MiniPay-aware flows using WalletConnect v2.

## Tech Stack
- **Frontend:** Vanilla HTML, CSS, and JavaScript shipped from `index.html` with no bundler requirement.
- **Wallet integration:** MetaMask/injected providers plus WalletConnect v2, driven by `ethers.js` from CDN imports.
- **Tooling:** Minimal npm footprint (for the optional server); static assets and JSON data drive the UI.

## Architecture & Project Structure
- **`index.html`** – Static entry that mounts all sections and loads scripts/styles.
- **`src/`** – Main application logic, translations, styles, and data loaders.
  - **`src/data/`** – JSON definitions for Farcaster mini apps and ecosystem modules.
  - **`src/services/`** – Wallet and contract service layer for GM/Donate/Deploy/Profile actions.
  - **`src/styles/`** – Design system and responsive layout rules.
  - **`src/utils/`** – Constants, CDN module shims, and formatting helpers.
- **`assets/`** – Logos and iconography referenced by cards and layouts.
- **`contracts/`** – Solidity sources for optional on-chain verification modules.
- **`server/`** – Optional Express server used for legacy Self ID verification flows.

### Folder tree
```
.
├─ index.html
├─ assets/
├─ contracts/
├─ server/
├─ src/
│  ├─ data/
│  ├─ services/
│  ├─ styles/
│  └─ utils/
└─ package.json
```

## Getting Started
### Prerequisites
- Node.js 18+ and npm installed locally.
- A CELO-compatible wallet (MetaMask or any WalletConnect v2 client) for testing interactions.

### Installation
```bash
git clone https://github.com/tebberen/celo-engage-hubv2.git
cd celo-engage-hubv2
npm install
```

### Local development
The frontend is fully static. Serve the repository root with any static server (e.g., VS Code Live Server, `npx http-server .`, or similar) and open `index.html` in your browser.

### Optional backend
If you want to experiment with the legacy Self verification helper:
```bash
npm run start:server
```
The Express server listens on port `8787` by default and can be accessed at `http://localhost:8787`.

### Building & deployment
There is no build step. Publish `index.html`, `src/`, `assets/`, and supporting JSON files to GitHub Pages or any static host. The live demo is served from GitHub Pages at https://tebberen.github.io/celo-engage-hubv2/.

## Using the dApp
1. **Connect a wallet** via MetaMask or WalletConnect from the header/Profile section; the app targets Celo Mainnet (`chainId 42220`) and recognizes Alfajores (`44787`).
2. **Explore Home** for “How to use/Why/Who” guidance and a searchable Farcaster mini app grid.
3. **Browse the Celo Ecosystem** cards to open official links, DEX/CEX/Bridge options, and social channels.
4. **Run GM / Donate / Deploy flows** from their dedicated sections to trigger on-chain actions or simulated module flows.
5. **Profile** shows the connected wallet context, recent deployments, governance data, and saved analytics links.

### User journeys
- **New user:** Land on Home → read the “How to use/Why/Who” tips → connect wallet → try a GM or Donate → open a featured mini app.
- **Builder:** Land on Home → open Celo ecosystem links and Farcaster mini apps → connect wallet → test Deploy/Profile to verify wallet integration → submit new mini app data via PR.

## Celo Ecosystem Integration
- Official links, CEX/DEX/bridge entries, social channels, and Farcaster mini apps are curated as JSON in `src/data/` and constant maps in `src/utils/constants.js`.
- Cards render title, description, and CTA labels so users can open resources directly from the hub.
- New modules or mini apps can be added by appending JSON entries; icons live in `assets/miniapps/` and default fallbacks are provided.

## Roadmap / Future Work
- Expand the mini app directory with richer metadata (tags, chains, screenshots).
- Add on-chain stats, streaks, or NFT badges for repeat engagement.
- Introduce persistent storage for verification history and social leaderboards.
- Package more deployment templates and governance shortcuts for builders.

## Contributing
- Open an issue or PR with proposed changes, new ecosystem links, or updated metadata.
- Follow the existing data shapes in `src/data/celoMiniApps.json` and `src/utils/constants.js` when adding entries.
- Keep UX consistent with current styles and class names; prefer small, composable changes.

## License
This project is released under the **MIT License**. See [`LICENSE`](LICENSE) for details.
