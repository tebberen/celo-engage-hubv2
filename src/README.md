# Src Folder

Front-end source for Celo Engage Hub built with vanilla JS, CSS, and CDN-loaded dependencies.

## Key Files
- **main.js**: Primary UI controller handling wallet connections, module actions (GM, deploy, donate, link, governance), toast handling, real-time updates, identity verification prompts, analytics links, and Talent Protocol loading.
- **lang.json**: Centralized translations for UI strings; language toggles read from this file.

## Subfolders
- **services/**: Interaction layer for blockchain, wallet connectors, identity verification, and third-party data.
- **styles/**: CSS theme and layout rules for the app shell and components.
- **utils/**: Shared constants, CDN shims, and formatting helpers referenced throughout `main.js` and service modules.

## Integration Notes
`index.html` imports `src/main.js` and links to `src/styles/main.css`. The constants in `utils/constants.js` provide addresses/ABIs consumed by `services/contractService.js` and the UI.

## Contributor Notes
- Update `lang.json` when adding new UI copy.
- Keep new modules composable by extending the service helpers instead of embedding logic directly into `main.js`.
