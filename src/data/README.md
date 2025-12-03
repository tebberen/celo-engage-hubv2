# Data Documentation

This directory contains the static data used to populate the dynamic sections of the Celo Engage Hub. Using JSON files allowing for easy updates to the directory content without modifying the core application code.

## 📂 Files

### `celoMiniApps.json` (Hypothetical / Planned)
*Note: While ecosystem links are currently managed via `src/utils/constants.js` or inline structures in some versions, this directory is intended to house the structured data for the "Celo Farcaster Mini Apps" directory.*

**Structure:**
```json
[
  {
    "id": "app-id",
    "name": "App Name",
    "description": "Short description.",
    "url": "https://...",
    "icon": "assets/icons/app-icon.png",
    "category": "DeFi"
  }
]
```

## 🔄 Data Flow

1.  **Loading:** `appCore.js` imports or fetches these JSON files at initialization.
2.  **Rendering:** The `renderEcosystem` or `renderMiniApps` functions iterate over this data to generate the grid of cards displayed in the "Home" tab.

## ✍️ Contribution Guide

To add a new Mini App or Ecosystem Link:
1.  Open the relevant JSON file (or `src/utils/constants.js` if data is currently hardcoded there).
2.  Add a new object following the existing schema.
3.  Submit a Pull Request.
