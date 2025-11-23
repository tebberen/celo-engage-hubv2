# `src/` – Frontend Source

All browser-facing logic for Celo Engage Hub lives in this folder. The app is served from `index.html` and powered by vanilla JavaScript, CSS, and JSON data.

## Key entry points
- **`main.js`** – Central controller that wires navigation (Home/GM/Deploy/Donate/Profile), handles wallet connection, triggers on-chain actions, renders mini app cards, and coordinates toasts, modals, and live updates.
- **`lang.json`** – Translation map for UI labels and messages. The language toggle in the header reads from this file.

## Subdirectories
- **`services/`** – Wallet, contract, and referral helpers used by `main.js` for blockchain I/O.
- **`utils/`** – Shared constants, CDN module bridges, and formatting helpers.
- **`data/`** – Static JSON such as the Farcaster mini app directory.
- **`styles/`** – Global CSS for layout, theming, and components.

## Navigation model
Sections are defined directly in `index.html` and toggled by `main.js` based on `.nav-btn` targets. The Home section exposes the mini app directory; GM/Deploy/Donate trigger on-chain flows; Profile shows wallet state, username registration, and recent activity.

## Contributing
- Extend `main.js` with small, composable functions instead of duplicating DOM selectors.
- Keep translations in `lang.json` synchronized with any new UI strings.
- Align new styles with existing class names so JS-driven selectors remain stable.
