import { sdk } from "@farcaster/miniapp-sdk";
import { ethers } from "ethers";
import {
  CELO_CHAIN_ID_HEX,
  CELO_CHAIN_NAME,
  CELO_NATIVE_SYMBOL,
  CELO_RPC_URL,
  MODULES,
  DEFAULT_GM_MESSAGE,
  MIN_DONATION,
} from "./utils/constants.js";

const ROOT_ID = "miniapp-clean-root";
const DEFAULT_DONATION = MIN_DONATION || 0.1;
let readyCalled = false;

function renderMiniApp(root) {
  root.innerHTML = `
    <div class="app-shell miniapp-clean" data-theme="golden">
      <header class="app-header miniapp-clean__header">
        <div class="brand-area">
          <span class="app-brand">Celo Engage Hub – Mini App</span>
          <p class="app-subtitle">GM and Donate on Celo directly from Farcaster.</p>
        </div>
      </header>

      <main class="app-main miniapp-clean__main">
        <section class="card hero">
          <div class="hero-content">
            <p class="eyebrow">Farcaster Native</p>
            <h1>Welcome back to Celo Engage Hub</h1>
            <p>Send an on-chain GM or support the hub with a CELO donation — all without a connect button.</p>
          </div>
          <div class="hero-actions">
            <button id="miniapp-clean-gm-btn" class="primary-btn">Send GM</button>
            <button id="miniapp-clean-donate-btn" class="secondary-btn">Donate on Celo</button>
          </div>
        </section>

        <section class="card status-card">
          <div class="status-row">
            <div>
              <p class="eyebrow">Wallet</p>
              <p id="miniapp-clean-status-text" class="status-text">Farcaster wallet: checking…</p>
            </div>
            <div class="chip chip--gold" id="miniapp-clean-network-chip">${CELO_CHAIN_NAME}</div>
          </div>
          <div class="status-row subtle">
            <p class="status-sub">Built for MiniApps • Uses ${CELO_NATIVE_SYMBOL} on ${CELO_CHAIN_NAME}</p>
          </div>
        </section>

        <section class="card info-card">
          <h2>How it works</h2>
          <ol class="miniapp-steps">
            <li>Farcaster wallet is requested automatically via the MiniApp SDK.</li>
            <li>Tap <strong>Send GM</strong> to call the GM module with your message.</li>
            <li>Tap <strong>Donate on Celo</strong> to send ${DEFAULT_DONATION} ${CELO_NATIVE_SYMBOL} using donateCELO.</li>
          </ol>
        </section>
      </main>
    </div>
  `;
}

async function getMiniAppProvider() {
  const provider = await sdk.wallet.getEthereumProvider();
  console.log("[MiniAppClean] got Farcaster provider", provider);

  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    console.log("[MiniAppClean] userAddress", accounts?.[0]);
  } catch (error) {
    console.warn("[MiniAppClean] Failed to request accounts", error);
  }

  return provider;
}

async function ensureCeloChain(provider) {
  try {
    const chainId = await provider.request({ method: "eth_chainId" });
    if (chainId !== CELO_CHAIN_ID_HEX) {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CELO_CHAIN_ID_HEX }],
      });
    }
  } catch (error) {
    console.warn("[MiniAppClean] failed to switch chain", error);
    // attempt to add chain if needed
    if (error?.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: CELO_CHAIN_ID_HEX,
              chainName: CELO_CHAIN_NAME,
              rpcUrls: [CELO_RPC_URL],
              nativeCurrency: { name: CELO_NATIVE_SYMBOL, symbol: CELO_NATIVE_SYMBOL, decimals: 18 },
            },
          ],
        });
      } catch (addError) {
        console.warn("[MiniAppClean] add chain failed", addError);
      }
    }
  }
}

function getInterface(moduleAbi) {
  return new ethers.utils.Interface(moduleAbi);
}

async function handleMiniAppGm(provider) {
  console.log("[MiniAppClean] GM clicked");
  const gmInterface = getInterface(MODULES.GM.abi);
  const message = DEFAULT_GM_MESSAGE || "Hello from Celo Engage Hub!";

  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const from = accounts?.[0];
    if (!from) {
      alert("No Farcaster account found");
      return;
    }

    await ensureCeloChain(provider);

    const tx = {
      from,
      to: MODULES.GM.address,
      data: gmInterface.encodeFunctionData("sendGM", [from, message]),
    };

    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [tx],
    });

    console.log("[MiniAppClean] GM tx sent", txHash);
    alert(`GM sent! Tx hash: ${txHash}`);
  } catch (error) {
    console.error("[MiniAppClean] GM failed", error);
    alert("GM failed: " + (error?.message || String(error)));
  }
}

async function handleMiniAppDonate(provider) {
  console.log("[MiniAppClean] Donate clicked");
  const donateInterface = getInterface(MODULES.DONATE.abi);
  const donationAmount = DEFAULT_DONATION;

  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const from = accounts?.[0];
    if (!from) {
      alert("No Farcaster account found");
      return;
    }

    await ensureCeloChain(provider);

    const valueHex = ethers.utils.parseEther(String(donationAmount)).toHexString();
    const tx = {
      from,
      to: MODULES.DONATE.address,
      data: donateInterface.encodeFunctionData("donateCELO", [from]),
      value: valueHex,
    };

    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [tx],
    });

    console.log("[MiniAppClean] Donate tx sent", txHash);
    alert(`Thanks for donating ${donationAmount} ${CELO_NATIVE_SYMBOL}! Tx: ${txHash}`);
  } catch (error) {
    console.error("[MiniAppClean] Donate failed", error);
    alert("Donate failed: " + (error?.message || String(error)));
  }
}

async function bootstrapMiniApp() {
  const root = document.getElementById(ROOT_ID);
  if (!root) {
    console.error("[MiniAppClean] Root element not found");
    return;
  }

  renderMiniApp(root);

  const provider = await getMiniAppProvider();

  const statusEl = root.querySelector("#miniapp-clean-status-text");
  try {
    const accounts = await provider.request({ method: "eth_accounts" });
    const address = accounts?.[0] || "Unknown";
    if (statusEl) {
      statusEl.textContent = `Farcaster wallet connected: ${address}`;
    }
  } catch (error) {
    console.warn("[MiniAppClean] failed to read accounts", error);
    if (statusEl) {
      statusEl.textContent = "Farcaster wallet connected (address unavailable)";
    }
  }

  const gmBtn = root.querySelector("#miniapp-clean-gm-btn");
  gmBtn?.addEventListener("click", () => handleMiniAppGm(provider));

  const donateBtn = root.querySelector("#miniapp-clean-donate-btn");
  donateBtn?.addEventListener("click", () => handleMiniAppDonate(provider));
}

async function markMiniAppReady() {
  if (readyCalled) return;
  readyCalled = true;
  try {
    console.log("[MiniAppClean] calling sdk.actions.ready()…");
    await sdk.actions.ready();
    console.log("[MiniAppClean] sdk.actions.ready() resolved");
  } catch (error) {
    console.error("[MiniAppClean] sdk.actions.ready() failed:", error);
  }
}

bootstrapMiniApp()
  .then(() => markMiniAppReady())
  .catch((err) => {
    console.error("[MiniAppClean] bootstrap failed", err);
    markMiniAppReady();
  });
