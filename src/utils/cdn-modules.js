// Centralized ESM re-exports for third-party CDNs.
// Replace these URLs with bundled assets during build time to avoid runtime CDN dependencies.
export { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
export { default as EthereumProvider } from "https://esm.sh/@walletconnect/ethereum-provider@2.9.1";
