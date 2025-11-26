import { sdk as miniAppSdk } from "@farcaster/miniapp-sdk";

const FARCASTER_CHAIN_ID = "eip155:42220";
const SDK_GLOBAL = "farcaster";

function getSdk() {
  if (miniAppSdk && typeof miniAppSdk === "object") return miniAppSdk;
  if (typeof window === "undefined") return null;
  const sdk = window[SDK_GLOBAL];
  if (!sdk || typeof sdk !== "object") return null;
  return sdk;
}

async function waitForSdk(timeoutMs = 3000) {
  const existing = getSdk();
  if (existing) return existing;

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const check = () => {
      const sdk = getSdk();
      if (sdk) {
        resolve(sdk);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        resolve(null);
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });
}

async function markReady() {
  const sdk = await waitForSdk();
  if (!sdk?.actions?.ready) return false;
  try {
    await sdk.actions.ready();
    return true;
  } catch (error) {
    console.error("[Farcaster Mini App] Failed to mark ready", error);
    return false;
  }
}

async function getWalletProvider() {
  const sdk = await waitForSdk();
  if (!sdk?.wallet?.getEthereumProvider) return null;
  try {
    const provider = await sdk.wallet.getEthereumProvider();
    if (!provider) return null;

    let chainId = provider.chainId;
    if (!chainId && provider.request) {
      try {
        chainId = await provider.request({ method: "eth_chainId" });
      } catch (error) {
        console.warn("[Farcaster Mini App] Unable to read chainId from provider", error);
      }
    }

    const normalizedChainId = typeof chainId === "string" ? chainId.toLowerCase() : chainId;
    if (normalizedChainId && normalizedChainId !== FARCASTER_CHAIN_ID && normalizedChainId !== "0xa4ec") {
      return null;
    }

    return { sdk, provider };
  } catch (error) {
    console.warn("[Farcaster Mini App] Unable to get wallet provider", error);
    return null;
  }
}

export { FARCASTER_CHAIN_ID, getSdk as getFarcasterSdk, markReady as readyFarcasterMiniApp, getWalletProvider };
