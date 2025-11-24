# `server/` – Optional Express Helper

A lightweight Express server that previously powered Self ID verification checks for the hub. The front-end runs fully static; this service is only needed if you re-enable verification flows or want a simple health endpoint during development.

## Files
- **`index.js`** – Boots Express with CORS + JSON middleware. Exposes:
  - `GET /api/self/health` – Basic heartbeat for uptime monitors.
  - `GET /api/self/check` – Returns the in-memory list of verified addresses.
  - `POST /api/self/verify` – Verifies signatures with `ethers.utils.verifyMessage` and stores successful results in memory.

## Running locally
From the repository root:
```bash
npm run start:server
```
The server defaults to port **8787** (override with `PORT`). Because it uses in-memory storage, restart the process when you want a clean slate.

## Integration notes
- The front-end service layer (`src/services/identityService.js`) expects the endpoints above; coordinate any shape changes.
- If you need persistence, swap the in-memory store for a database while keeping response payloads minimal for browser polling.
- Keep responses CORS-friendly so they can be called from GitHub Pages or other static hosts.
