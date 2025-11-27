import { ethers } from "./utils/cdn-modules.js";

let miniAppProvider = null;
let miniAppSigner = null;
let miniAppAddress = null;

async function initMiniApp() {
  if (!window.miniapp || !window.miniapp.sdk) {
    console.log("[MiniApp] miniapp SDK not found, probably opened in a normal browser.");
    updateStatus("Mini app SDK not detected. Open inside Farcaster to enable wallet.");
    return;
  }

  const sdk = window.miniapp.sdk;

  try {
    const ethProvider = await sdk.wallet.getEthereumProvider();
    const web3Provider = new ethers.providers.Web3Provider(ethProvider, "any");
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();

    miniAppProvider = web3Provider;
    miniAppSigner = signer;
    miniAppAddress = address;

    console.log("[MiniApp] Wallet connected:", miniAppAddress);
    updateStatus(`Wallet connected: ${miniAppAddress}`);
  } catch (err) {
    console.error("[MiniApp] Wallet connection failed:", err);
    updateStatus("Wallet connection failed. Check Farcaster wallet permissions.");
  }
}

function updateStatus(message) {
  const statusEl = document.getElementById("miniapp-status");
  if (statusEl) {
    statusEl.textContent = message;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMiniApp();
});
