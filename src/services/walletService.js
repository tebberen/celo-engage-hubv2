// ========================= CELO ENGAGE HUB V2 - WALLET SERVICE ========================= //
// 💳 MetaMask bağlantısını, ağ geçişini ve cüzdan durumunu yönetir.

import { CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from "../utils/constants.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

let provider = null;
let signer = null;
let userAddress = "";
let currentChainId = null;

// DOM elementleri (tek buton yapısına göre)
const walletStatusEl = () => document.getElementById("walletStatus");
const networkLabelEl = () => document.getElementById("networkLabel");
const walletActionBtn = () => document.getElementById("walletActionBtn");

// 🔹 MetaMask var mı?
export function hasMetaMask() {
  return typeof window.ethereum !== "undefined";
}

// 🔹 Celo ağına geçiş yap
export async function switchToCeloNetwork() {
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
    // Alfajores fallback
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
      console.error("Network switch failed:", e2);
      return false;
    }
  }
}

// 🔹 Wallet bağla (MetaMask popup ile)
export async function connectWalletMetaMask() {
  if (!hasMetaMask()) {
    alert("❌ MetaMask not detected. Please install it first.");
    return null;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await switchToCeloNetwork();
    // 🦊 MetaMask popup burada açılır
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    await updateNetworkLabel();

    if (walletStatusEl())
      walletStatusEl().innerHTML = `<p>✅ Connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}</p><span id="networkLabel"></span>`;
    if (walletActionBtn()) walletActionBtn().textContent = "Disconnect";

    console.log("🔗 Wallet connected manually:", userAddress);
    return { provider, signer, userAddress };
  } catch (err) {
    console.error("connect error:", err);
    if (err.code === 4001) alert("❌ Connection rejected by user.");
    else alert("⚠️ Connection failed: " + (err?.message || err));
    return null;
  }
}

// 🔹 Ağ etiketini güncelle
export async function updateNetworkLabel() {
  if (!provider) return false;
  const net = await provider.getNetwork();
  currentChainId = String(net.chainId);
  const label = networkLabelEl();
  if (label) {
    if (currentChainId === "42220") {
      label.textContent = "🌕 Celo Mainnet";
      label.style.color = "#35D07F";
    } else if (currentChainId === "44787") {
      label.textContent = "🧪 Alfajores Testnet";
      label.style.color = "#F59E0B";
    } else {
      label.textContent = "⚠️ Wrong Network";
      label.style.color = "#EF4444";
    }
  }
}

// 🔹 Wallet bağlantısını kes
export function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = "";
  if (walletStatusEl()) walletStatusEl().innerHTML = "<p>🔴 Not connected</p><span id='networkLabel'>—</span>";
  if (walletActionBtn()) walletActionBtn().textContent = "Connect Wallet";
  console.log("🔌 Wallet disconnected manually.");
}

// Getter fonksiyonları
export function getProvider() { return provider; }
export function getSigner() { return signer; }
export function getUserAddress() { return userAddress; }

console.log("🧩 Wallet service loaded — single button connection mode active.");
