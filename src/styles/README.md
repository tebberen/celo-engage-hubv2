# `src/styles/` – Global Styles

Global styling for the Celo Engage Hub interface, including theming, layout, and component rules shared across sections.

## Files
- **`main.css`** – Defines the Celo color system, typography scale, layout grid, navigation, cards, modals, badges, leaderboard lists, and responsive breakpoints. Loaded directly by `index.html`.

## Usage notes
- Keep class names aligned with those referenced in `src/main.js` to avoid breaking DOM selectors used for stateful behaviors.
- Prefer extending existing CSS variables and utility classes before adding new bespoke styles; maintain contrast and focus states for accessibility.
- If you introduce new sections, co-locate their styles here so the single stylesheet stays the source of truth for theming.
