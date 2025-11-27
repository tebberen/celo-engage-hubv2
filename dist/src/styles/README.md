# `src/styles/` – Design System & Layout

Global styles for the Celo Engage Hub. The stylesheet shapes the Celo-inspired color palette, layout grid, cards, modals, and responsive behavior used across all sections.

## Files
- **`main.css`** – Single source of truth for typography, spacing, buttons, cards, badges, navigation, hero sections, and media queries. Loaded directly by `index.html`.

## Design guidance
- **Color palette:** Celo gold/yellow accents paired with dark neutrals. Utility variables are defined near the top of `main.css` for quick updates.
- **Spacing & typography:** Rem-based sizes and consistent margins/padding keep cards and sections balanced. Reuse existing heading and body styles before introducing new variants.
- **Components:** Card, badge, CTA button, and pill styles are shared across mini app grids, ecosystem lists, and Profile widgets.
- **Responsive layout:** Flex/grid breakpoints adapt navigation, card columns, and modals for mobile screens and Farcaster mini app viewports.

## Extending styles safely
- Reuse existing variables and utility classes to maintain visual consistency.
- Keep class names aligned with those referenced in `src/main.js` (e.g., navigation buttons, modals) to avoid breaking selectors.
- Group new section-specific rules with clear comments inside `main.css` so future contributors can trace behaviors quickly.
