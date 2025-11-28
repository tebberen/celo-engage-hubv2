import { sdk } from "@farcaster/miniapp-sdk";
import { initApp } from "./appCore.js";

async function getMiniAppProvider() {
  const provider = await sdk.wallet.getEthereumProvider();
  console.log("[MiniApp] got Farcaster provider", provider);
  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    console.log("[MiniApp] userAddress", accounts?.[0]);
  } catch (error) {
    console.warn("[MiniApp] Failed to request accounts", error);
  }
  return provider;
}

const root = document.getElementById("miniapp-root") || document.getElementById("app");

const handleShare = (url) => {
  sdk.actions.openUrl(url);
};

initApp({ root, getProvider: getMiniAppProvider, env: "miniapp", onShare: handleShare });

let readyCalled = false;

async function markMiniAppReady() {
  if (readyCalled) return;
  readyCalled = true;
  try {
    console.log("[MiniApp] calling sdk.actions.ready()…");
    await sdk.actions.ready();
    console.log("[MiniApp] sdk.actions.ready() resolved");
  } catch (error) {
    console.error("[MiniApp] sdk.actions.ready() failed:", error);
  }
}

function setupMiniAppReady() {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    markMiniAppReady();
  } else {
    window.addEventListener("DOMContentLoaded", markMiniAppReady, { once: true });
  }
}

setupMiniAppReady();
