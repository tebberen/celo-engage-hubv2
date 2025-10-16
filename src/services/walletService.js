// ========================= CELO ENGAGE HUB — WALLET SERVICE (SAFE) =========================
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import { CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from "../utils/constants.js";

// Multi-provider (Brave/MetaMask) – doğru sağlayıcıyı seç
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    if (window.ethereum && window.ethereum.providers) {
      const mm = window.ethereum.providers.find(p => p.isMetaMask);
      if (mm) window.ethereum = mm; // getter setmeye çalışmıyoruz
    }
  });
}

let provider = null;
let signer = null;
let userAddress = "";
let currentChainId = null;

const walletStatusEl = () => document.getElementById("walletStatus");
const networkLabelEl = () => document.getElementById("networkLabel");
const connectBtnEl   = () => document.getElementById("walletActionBtn");

export function hasMetaMask() { return typeof window.ethereum !== "undefined"; }

export async function switchToCeloNetwork() {
  if (!window.ethereum) return false;
  try {
    await window.ethereum.request({ method:"wallet_switchEthereumChain", params:[{ chainId: CELO_MAINNET_PARAMS.chainId }]});
    return true;
  } catch (e) {
    if (e.code === 4902) {
      await window.ethereum.request({ method:"wallet_addEthereumChain", params:[CELO_MAINNET_PARAMS] });
      return true;
    }
    try {
      await window.ethereum.request({ method:"wallet_switchEthereumChain", params:[{ chainId: CELO_ALFAJORES_PARAMS.chainId }]});
      return true;
    } catch (e2) {
      if (e2.code === 4902) {
        await window.ethereum.request({ method:"wallet_addEthereumChain", params:[CELO_ALFAJORES_PARAMS] });
        return true;
      }
      console.error("Network switch failed:", e2);
      return false;
    }
  }
}

export async function connectWalletMetaMask() {
  if (!hasMetaMask()) { alert("❌ MetaMask not detected."); return null; }
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await switchToCeloNetwork();
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    await updateNetworkLabel();
    if (walletStatusEl()) walletStatusEl().innerHTML = `<p>✅ Connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}</p>`;
    if (connectBtnEl()) connectBtnEl().textContent = "Disconnect";
    return { provider, signer, userAddress };
  } catch (err) {
    console.error("Connect error:", err);
    alert("⚠️ Connection failed: " + (err?.message || err));
    return null;
  }
}

export async function updateNetworkLabel() {
  if (!provider) return false;
  const net = await provider.getNetwork();
  currentChainId = String(net.chainId);
  if (!networkLabelEl()) return false;
  if (currentChainId === "42220") { networkLabelEl().textContent = "🌕 Celo Mainnet"; networkLabelEl().style.color="#35D07F"; }
  else if (currentChainId === "44787") { networkLabelEl().textContent = "🧪 Alfajores Testnet"; networkLabelEl().style.color="#F59E0B"; }
  else { networkLabelEl().textContent = "⚠️ Wrong Network"; networkLabelEl().style.color="#EF4444"; }
  return true;
}

export function disconnectWallet() {
  provider = null; signer = null; userAddress = ""; currentChainId = null;
  if (walletStatusEl()) walletStatusEl().innerHTML = "<p>🔴 Not connected</p><span id='networkLabel'>—</span>";
  if (connectBtnEl()) connectBtnEl().textContent = "Connect Wallet";
  if (window.ethereum?.removeAllListeners) {
    window.ethereum.removeAllListeners("accountsChanged");
    window.ethereum.removeAllListeners("chainChanged");
  }
}

export function getProvider(){ return provider; }
export function getSigner(){ return signer; }
export function getUserAddress(){ return userAddress; }

console.log("🧩 Wallet service loaded.");
