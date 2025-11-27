import { sdk } from "@farcaster/miniapp-sdk";
import { initApp } from "./appCore.js";

async function getMiniAppProvider() {
  return await sdk.wallet.getEthereumProvider();
}

const root = document.getElementById("app") || document.getElementById("miniapp-root");
initApp({ root, getProvider: getMiniAppProvider, env: "miniapp" });
