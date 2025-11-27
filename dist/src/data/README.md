# `src/data/` – Static Data Sets

Configuration and curated content that power the Celo Engage Hub cards and filters. These JSON files are loaded directly by `src/main.js` and rendered into the Home directory and ecosystem sections.

## Files
- **`celoMiniApps.json`** – List of Farcaster mini apps highlighted on the Home page.
  - `name` (string) – Display name shown on the card.
  - `author` (string, optional) – Creator attribution.
  - `description` (string) – Short summary rendered beneath the title.
  - `category` (string) – One of the categories surfaced in the filter chips (e.g., Growth, Games, Identity, Finance).
  - `farcasterUrl` (string) – Link opened when the card is clicked.
  - `iconUrl` (string) – Relative path to the mini app icon. Defaults to `./assets/miniapps/default.png` when absent.

## Adding new entries
1. Append a new object to `celoMiniApps.json` using the keys above.
2. Keep `category` aligned with the filter list defined in `src/main.js` so chips recognize the new entry.
3. Store any new icons in `assets/miniapps/` and reference them with a relative path from this JSON file.
4. Validate URLs (especially Farcaster deep links) to ensure they open correctly from mobile and desktop contexts.

## Maintenance tips
- Keep descriptions concise (1–2 sentences) to preserve card layout.
- When expanding to other dataset types (official links, bridges, social media), mirror the field naming conventions for consistency across cards and filters.
