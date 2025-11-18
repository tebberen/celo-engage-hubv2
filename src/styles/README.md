# Styles Folder

Global styling for the Celo Engage Hub UI.

## File Overview
- **main.css**: Defines the golden/light theme tokens, typography, layout primitives, buttons, modals, feed cards, navigation elements, badges, and responsive tweaks used by `index.html` and components rendered from `main.js`.

## Integration Notes
- Loaded by `index.html` for all pages; CSS variables align with branding colors referenced in assets.
- Classes are referenced directly in DOM elements managed by `main.js`, so renaming selectors requires coordinated JS updates.

## Contributor Notes
- Prefer extending existing variables and utility classes instead of adding inline styles in JavaScript.
- Keep accessibility in mind: maintain sufficient contrast and focus states when modifying components.
