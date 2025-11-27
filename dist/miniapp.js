import { sdk } from "@farcaster/miniapp-sdk";
import { initApp } from "./appCore.js";

async function getMiniAppProvider() {
  return await sdk.wallet.getEthereumProvider();
}

const root = document.getElementById("miniapp-root") || document.getElementById("app");
initApp({ root, getProvider: getMiniAppProvider, env: "miniapp" });
