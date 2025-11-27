# `assets/` – Static Media

This folder holds all branding and imagery used by the Celo Engage Hub experience. Assets are referenced by `index.html`, `src/main.js`, and the JSON data that powers the mini app directory.

## Contents
- **`logo-celo-engage-hub.svg` / `logo-celo-engage-hub.png`** – Primary logomark for headers, previews, and social embeds.
- **`miniapps/` (expected)** – Optional folder for Farcaster mini app icons referenced from `src/data/celoMiniApps.json`. If an icon is missing, the UI falls back to `./assets/miniapps/default.png`.
- Additional illustrations or badges can live alongside these files when needed for new sections.

## Naming & organization
- Use descriptive, kebab-cased filenames (e.g., `logo-celo-engage-hub.svg`, `miniapps/celo-builder-rewards.png`).
- Keep reusable icons in `miniapps/` so cards can reference consistent dimensions.
- Maintain stable filenames once referenced in data or markup to prevent broken links in production.

## Format & optimization
- Prefer **SVG** for logos and line art; use **PNG** for detailed artwork or screenshots with transparent backgrounds.
- Optimize images before committing to keep the GitHub Pages payload lightweight for MiniPay and mobile users.
- Align new icons to a square canvas (e.g., 256×256 or 512×512) for best results in the card grid.
