import { initApp } from "./appCore.js";
import { getWalletDetails } from "./services/walletService.js";

async function getWebProvider() {
  const { provider } = getWalletDetails();
  return provider;
}

const root = document.getElementById("app");

const handleShare = (url) => {
  window.open(url, "_blank");
};

initApp({ root, getProvider: getWebProvider, env: "web", onShare: handleShare });
