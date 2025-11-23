# `src/data/` – Static Data Sources

Static JSON payloads that power the directory and other non-contract data displayed by the UI.

## Files
- **`celoMiniApps.json`** – List of Farcaster mini apps highlighted on the Home page. Each object supports:
  - `name` (string): Display name of the mini app.
  - `author` (string, optional): Creator attribution shown when provided.
  - `description` (string): Short summary rendered on the mini app card.
  - `category` (string): One of the categories surfaced in the filter chips (e.g., Growth, Games, Identity).
  - `farcasterUrl` (string): Link opened when users click the card.
  - `iconUrl` (string): Path to the icon displayed in the grid (defaults to the bundled placeholder).

## Adding a mini app entry
1. Append a new object to `celoMiniApps.json` following the key names above.
2. Keep categories aligned with the filter list in `src/main.js` to ensure the chip selector recognizes the new entry.
3. Store new icons under `assets/` (or reuse the default placeholder) and reference them via relative paths.
