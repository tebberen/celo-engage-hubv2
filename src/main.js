import { initApp } from "./appCore.js";
import { getWalletDetails } from "./services/walletService.js";

async function getWebProvider() {
  const { provider } = getWalletDetails();
  return provider;
}

const root = document.getElementById("app");
initApp({ root, getProvider: getWebProvider, env: "web" });
