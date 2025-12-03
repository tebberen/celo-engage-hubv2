# Utils Documentation

This directory contains helper functions, constants, and polyfills used throughout the application.

## 📂 Key Files

### `constants.js`
Defines application-wide constants to prevent magic strings and numbers.
- **`CHAINS`**: Definitions for Celo Mainnet and Alfajores (Chain IDs, RPC URLs, Block Explorer URLs).
- **`ECOSYSTEM_LINKS`**: Static data for the "Official Links", "Bridges", "DEX", "CEX", and "Social" modules.
- **`CONTRACT_ADDRESSES`**: Centralized storage for smart contract addresses.

### `formatting.js` (or similar helpers)
Contains utility functions for:
- **Address Truncation:** `0x1234...5678` for UI display.
- **Number Formatting:** Parsing and formatting token amounts (WEI to Ether).

### `env.js`
Helpers to detect the current running environment (Web vs. Mini App) if not explicitly passed during initialization.

---

## 🛠 Usage

Import these utilities into `appCore.js` or `services/` modules to ensure consistency.

```javascript
import { CHAINS } from './utils/constants.js';

const targetChain = CHAINS.mainnet;
```
