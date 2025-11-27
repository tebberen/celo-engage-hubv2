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
initApp({ root, getProvider: getMiniAppProvider, env: "miniapp" });
