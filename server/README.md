# Backend Server Documentation

This directory contains the optional backend server for the Celo Engage Hub. It is primarily used to support the **Self ID** verification flow, which requires server-side validation of cryptographic proofs.

## 📂 Key Files

### `index.js`
The main entry point for the Express server.

- **Stack:** Node.js, Express, Ethers.js.
- **Port:** Defaults to `8787`.

## 🚀 API Endpoints

### `GET /api/self/check`
Checks if a given wallet address is verified.
- **Query Params:** `address`
- **Response:** `{ verified: boolean }`

### `POST /api/self/verify`
Submits a verification payload to be validated.
- **Body:** `{ signature, message, address }`
- **Logic:**
    1.  Recovers the signer address from the signature and message.
    2.  Compares the recovered address with the claimed address.
    3.  Stores the verification status in memory (`verifiedWallets` Map).
- **Response:** `{ verified: boolean }`

### `GET /api/self/health`
Simple health check endpoint.
- **Response:** `{ status: "ok" }`

## ⚠️ Notes
- **In-Memory Storage:** The current implementation uses a JavaScript `Map` to store verification status. This is non-persistent and will reset on server restart. For production, this should be replaced with a database (Redis, Postgres, etc.).

## 🛠 Running the Server

```bash
# From project root
npm run start:server
```
