# `assets/` – Static Assets

Logos and static imagery referenced by `index.html`, CSS, and mini app cards.

## Contents
- **`logo-celo-engage-hub.svg/png`** – Primary branding used in headers, favicons, and social previews.
- Additional icons can be added alongside these files; mini app cards read icon paths from `src/data/celoMiniApps.json` and default to `./assets/miniapps/default.png` if none is specified.

## Guidelines
- Keep filenames stable once referenced in markup or JSON to avoid broken links.
- Optimize images (prefer SVG or compressed PNG) to minimize payload size for mobile users.
- Store any new mini app icons under `assets/miniapps/` (create the folder if missing) and reference them via relative paths from the data file.
