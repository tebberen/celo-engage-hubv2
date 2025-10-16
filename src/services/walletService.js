// ========================= CELO ENGAGE HUB — WALLET SERVICE (FINAL FIXED WORKING) ========================= //
// 💳 MetaMask bağlantısı, ağ geçişi ve bağlantı durumu yönetimi (Celo Mainnet + Alfajores)

import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

// ✅ Ağ parametreleri
export const CELO_MAINNET_PARAMS = {
  chainId: "0xA4EC", // 42220
  chainName: "Celo Mainnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://forno.celo.org"],
  blockExplorerUrls: ["https://celoscan.io/"]
};

export const CELO_ALFAJORES_PARAMS = {
  chainId: "0xAEF3", // 44787
  chainName: "Celo Alfajores Testnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  blockExplorerUrls: ["https://alfajores.celoscan.io/"]
};

// 🔹 Global değişkenler
let provider = null;
let signer = null;
let userAddress = "";
let currentChainId = null;

// 🔹 DOM helper fonksiyonları
const walletStatusEl = () => document.getElementById("walletStatus");
const networkLabelEl = () => document.getElementById("networkLabel");
const connectBtnEl = () => document.getElementById("walletActionBtn");

// ✅ MetaMask kontrolü
export function hasMetaMask() {
  return typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask;
}

// ✅ CELO ağına geçiş
export async function switchToCeloNetwork() {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CELO_MAINNET_PARAMS.chainId }]
    });
    return true;
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [CELO_MAINNET_PARAMS]
      });
      return true;
    }

    // 🔁 Alfajores fallback
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CELO_ALFAJORES_PARAMS.chainId }]
      });
      return true;
    } catch (e2) {
      if (e2.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CELO_ALFAJORES_PARAMS]
        });
        return true;
      }
      console.error("❌ Network switch failed:", e2);
      return false;
    }
  }
}

// ✅ Cüzdan bağla (MetaMask popup)
export async function connectWalletMetaMask() {
  if (!hasMetaMask()) {
    alert("❌ MetaMask not detected. Please install MetaMask first.");
    return null;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await switchToCeloNetwork();

    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    await updateNetworkLabel();

    if (walletStatusEl()) {
      walletStatusEl().innerHTML = `<p>✅ Connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}</p>`;
    }
    if (connectBtnEl()) connectBtnEl().textContent = "Disconnect";

    console.log("🔗 Wallet connected:", userAddress);

    // Dinleyiciler (hesap veya ağ değişirse sayfayı yenile)
    window.ethereum.on("accountsChanged", () => location.reload());
    window.ethereum.on("chainChanged", () => location.reload());

    return { provider, signer, userAddress };
  } catch (err) {
    console.error("❌ Connect error:", err);
    if (err.code === 4001) alert("❌ Connection rejected by user.");
    else alert("⚠️ Connection failed: " + (err?.message || err));
    return null;
  }
}

// ✅ Ağ bilgisini güncelle
export async function updateNetworkLabel() {
  if (!provider) return false;

  const net = await provider.getNetwork();
  currentChainId = String(net.chainId);

  if (!networkLabelEl()) return false;

  if (currentChainId === "42220") {
    networkLabelEl().textContent = "🌕 Celo Mainnet";
    networkLabelEl().style.color = "#35D07F";
  } else if (currentChainId === "44787") {
    networkLabelEl().textContent = "🧪 Alfajores Testnet";
    networkLabelEl().style.color = "#F59E0B";
  } else {
    networkLabelEl().textContent = "⚠️ Wrong Network";
    networkLabelEl().style.color = "#EF4444";
  }

  return true;
}

// ✅ Bağlantıyı kes
export function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = "";
  currentChainId = null;

  if (walletStatusEl())
    walletStatusEl().innerHTML = "<p>🔴 Not connected</p><span id='networkLabel'>—</span>";
  if (connectBtnEl()) connectBtnEl().textContent = "Connect Wallet";

  if (window.ethereum && window.ethereum.removeAllListeners) {
    window.ethereum.removeAllListeners("accountsChanged");
    window.ethereum.removeAllListeners("chainChanged");
  }

  console.log("🔌 Wallet disconnected successfully.");
}

// ✅ Getter fonksiyonları
export function getProvider() { return provider; }
export function getSigner() { return signer; }
export function getUserAddress() { return userAddress; }

console.log("🧩 Wallet service loaded — final fixed version active.");
