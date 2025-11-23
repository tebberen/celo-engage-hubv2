# `server/` – Optional Express Backend

Lightweight Express service previously used for Self ID verification. The frontend ships fully static; this server is only required if you re-enable the verification flow.

## Files
- **`index.js`** – Boots Express with CORS and JSON middleware. Exposes `/api/self/health` for heartbeat checks, `/api/self/check` to query verified addresses, and `/api/self/verify` to validate signatures with `ethers.utils.verifyMessage` and store results in memory.

## Usage
- Start from the repository root:
  ```bash
  npm run start:server
  ```
- Defaults to port `8787` (override with `PORT`).
- Designed to be stateless; if persistence is needed, swap the in-memory store for a database.

## Contributing
- Keep responses minimal to support polling from the browser.
- If you reintroduce frontend verification, coordinate request/response shapes with `src/services/identityService.js` and consider hardening rate limits/auth.
