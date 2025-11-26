# `src/` – Frontend Application Source

All browser-facing logic, copy, and styling for Celo Engage Hub live here. The app is delivered as a static experience from `index.html` and uses vanilla JavaScript with CDN imports.

## Entry points
- **`main.js`** – Central controller that wires navigation (Home, GM, Deploy, Donate, Profile), handles wallet lifecycle, loads ecosystem modules, renders mini app cards, and triggers toast/modals for on-chain flows.
- **`lang.json`** – String map for UI labels and instructional copy. The language toggle in the header reads from this file.

## Subdirectories
- **`data/`** – JSON definitions for Celo mini apps and curated ecosystem links.
- **`services/`** – Wallet, contract, identity, and referral helpers that wrap blockchain calls.
- **`styles/`** – Global CSS defining layout, theming, and responsive rules.
- **`utils/`** – Constants, CDN module shims, and formatting helpers shared across services and `main.js`.

## Navigation model
Sections are defined in `index.html` and toggled by `main.js` based on `.nav-btn` data attributes. Home renders the ecosystem directory; GM/Deploy/Donate surface action flows; Profile shows connected wallet context, governance snapshots, and saved analytics links.

## Extending the app
- Keep selectors and class names aligned with `main.css` so dynamic behaviors remain stable.
- Add new strings to `lang.json` when introducing UI copy, and mirror them in the DOM where needed.
- Prefer extending services and utils rather than duplicating blockchain logic inside `main.js`.
