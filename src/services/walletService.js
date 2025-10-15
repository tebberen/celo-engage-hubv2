// ========================= CELO ENGAGE HUB V2 - WALLET SERVICE ========================= //
// 💳 MetaMask bağlantısını, ağ geçişini ve cüzdan durumunu yönetir (tek buton versiyon).

import { CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from "../utils/constants.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

let provider = null;
let signer = null;
let userAddress = "";
let currentChainId = null;

// DOM elementleri
const connectBtnEl = () => document.getElementById("connectWalletBtn");
const walletStatusEl = () => document.getElementById("walletStatus");
const networkLabelEl = () => document.getElementById("networkLabel");

// 🦊 FIX: MetaMask injection bekle
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    // Bazı Chrome sürümlerinde MetaMask `window.ethereum.providers` içinde olur
    if (!window.ethereum && window.ethereum?.providers) {
      window.ethereum = window.ethereum.providers.find(p => p.isMetaMask);
    }

    console.log("🧩 Wallet service loaded — single button connection mode active.");
  });
}

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
      // Eğer ağ ekli değilse, ekle
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
      console.error("⚠️ Network switch failed:", e2);
      return false;
    }
  }
}

// 🔹 Wallet bağla (tek buton)
export async function connectWalletMetaMask() {
  if (!hasMetaMask()) {
    alert("❌ MetaMask not detected. Please install or enable it first.");
    return null;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await switchToCeloNetwork();

    // Kullanıcıdan izin iste
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    await updateNetworkLabel();

    // UI güncelle
    if (walletStatusEl())
      walletStatusEl().textContent = `✅ Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    if (connectBtnEl()) connectBtnEl().textContent = "🔌 Disconnect";

    // Disconnect işlevini bağla
    connectBtnEl().onclick = disconnectWallet;

    console.log("🔗 Wallet connected manually:", userAddress);
    return { provider, signer, userAddress };
  } catch (err) {
    console.error("connect error:", err);
    if (err.code === 4001) alert("❌ Connection rejected by user.");
    else alert("⚠️ Connection failed: " + (err?.message || err));
    return null;
  }
}

// 🔹 Disconnect (tek buton)
export async function disconnectWallet() {
  try {
    provider = null;
    signer = null;
    userAddress = "";

    if (walletStatusEl()) walletStatusEl().textContent = "🔴 Not connected";
    if (networkLabelEl()) networkLabelEl().textContent = "—";

    if (connectBtnEl()) {
      connectBtnEl().textContent = "🔗 Connect Wallet";
      connectBtnEl().onclick = connectWalletMetaMask;
    }

    // Event’leri ve cache’i temizle
    if (window.ethereum?.removeAllListeners) {
      window.ethereum.removeAllListeners("accountsChanged");
      window.ethereum.removeAllListeners("chainChanged");
    }

    localStorage.clear();
    sessionStorage.clear();

    console.log("🔌 Wallet disconnected manually.");
    alert("🔌 Wallet disconnected successfully!");
  } catch (error) {
    console.error("Disconnect error:", error);
  }
}

// 🔹 Ağ bilgisini güncelle
export async function updateNetworkLabel() {
  if (!provider) return false;
  const net = await provider.getNetwork();
  currentChainId = String(net.chainId);

  if (networkLabelEl()) {
    if (currentChainId === "42220") {
      networkLabelEl().textContent = "🌕 Celo Mainnet";
      networkLabelEl().style.color = "#35D07F";
      return true;
    } else if (currentChainId === "44787") {
      networkLabelEl().textContent = "🧪 Alfajores Testnet";
      networkLabelEl().style.color = "#F59E0B";
      return true;
    } else {
      networkLabelEl().textContent = "⚠️ Wrong Network";
      networkLabelEl().style.color = "#EF4444";
      return false;
    }
  }
  return false;
}

// Getter fonksiyonları
export function getProvider() { return provider; }
export function getSigner() { return signer; }
export function getUserAddress() { return userAddress; }
