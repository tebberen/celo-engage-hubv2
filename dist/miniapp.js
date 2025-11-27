import { sdk } from "https://cdn.jsdelivr.net/npm/@farcaster/miniapp-sdk/+esm";
import { ethers } from "./utils/cdn-modules.js";

// ==== FARCASTER MINI APP: BEGIN CHANGE ====
const miniAppState = {
  provider: null,
  signer: null,
  address: null,
};

function updateStatus(message) {
  const statusEl = document.getElementById("miniapp-status");
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function registerProviderListeners(provider) {
  if (!provider || typeof provider.on !== "function") return;

  provider.on("accountsChanged", (accounts = []) => {
    console.log("[MiniApp] accountsChanged:", accounts);
    const nextAddress = accounts[0] || null;
    miniAppState.address = nextAddress;
    updateStatus(nextAddress ? `Wallet connected: ${nextAddress}` : "Wallet disconnected");
  });

  provider.on("chainChanged", (chainId) => {
    console.log("[MiniApp] chainChanged:", chainId);
  });
}

async function initializeWallet() {
  console.log("[MiniApp] Requesting Farcaster wallet provider...");
  const ethProvider = await sdk.wallet.getEthereumProvider();
  const web3Provider = new ethers.providers.Web3Provider(ethProvider, "any");

  registerProviderListeners(ethProvider);

  const accounts = await ethProvider.request({ method: "eth_requestAccounts" });
  const signer = web3Provider.getSigner();
  const address = accounts?.[0] || (await signer.getAddress().catch(() => null));

  miniAppState.provider = web3Provider;
  miniAppState.signer = signer;
  miniAppState.address = address;

  console.log("[MiniApp] Wallet initialized", { address });
  updateStatus(address ? `Wallet connected: ${address}` : "Wallet detected but no address available");
}

async function signalReady() {
  console.log("[MiniApp] Calling sdk.actions.ready()...");
  try {
    await sdk.actions.ready();
    console.log("[MiniApp] sdk.actions.ready() completed successfully.");
  } catch (error) {
    console.error("[MiniApp] Failed to call sdk.actions.ready()", error);
    updateStatus("Unable to finalize mini app startup. Please reload inside Farcaster.");
  }
}

async function initMiniApp() {
  updateStatus("Preparing Farcaster Mini App...");
  console.log("[MiniApp] Initializing mini app...");

  let isInMiniApp = false;
  try {
    isInMiniApp = await sdk.isInMiniApp();
    console.log("[MiniApp] isInMiniApp:", isInMiniApp);
  } catch (error) {
    console.error("[MiniApp] Failed to detect mini app environment", error);
  }

  if (!isInMiniApp) {
    updateStatus("This view is designed for the Farcaster Mini App. Open inside Farcaster to use the wallet.");
    return;
  }

  try {
    await initializeWallet();
  } catch (error) {
    console.error("[MiniApp] Wallet connection failed", error);
    updateStatus("Wallet connection failed. Check Farcaster wallet permissions.");
  } finally {
    await signalReady();
  }
}

// Wait for DOM before starting the mini app lifecycle
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initMiniApp().catch((error) => console.error("[MiniApp] Unhandled init error", error));
  });
} else {
  initMiniApp().catch((error) => console.error("[MiniApp] Unhandled init error", error));
}
// ==== FARCASTER MINI APP: END CHANGE ====
