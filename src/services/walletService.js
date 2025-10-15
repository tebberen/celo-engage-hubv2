// ========================= CELO ENGAGE HUB V2 - WALLET SERVICE ========================= //
// 💼 MetaMask bağlantısı, ağ değiştirme ve cüzdan yönetimi işlemlerini içerir.

import { CELO_MAINNET_PARAMS, CELO_ALFAJORES_PARAMS } from "../utils/constants.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

let provider = null;
let signer = null;
let userAddress = "";
let currentChainId = null;

// ✅ MetaMask kontrolü
export function checkMetaMask() {
  if (typeof window.ethereum === "undefined") {
    alert("❌ MetaMask not detected. Please install MetaMask first.");
    return false;
  }
  return true;
}

// ✅ Celo ağına geçiş (önce mainnet, olmazsa testnet)
export async function switchToCeloNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CELO_MAINNET_PARAMS.chainId }]
    });
    return true;
  } catch (switchError) {
    if (switchError.code === 4902) {
      // ✅ Ağ ekle (mainnet)
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [CELO_MAINNET_PARAMS]
      });
      return true;
    }
    console.warn("Mainnet'e geçilemedi, testnet deneniyor...");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CELO_ALFAJORES_PARAMS.chainId }]
      });
      return true;
    } catch (testnetError) {
      if (testnetError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CELO_ALFAJORES_PARAMS]
        });
        return true;
      }
      console.error("❌ Ağ geçişi başarısız:", testnetError);
      return false;
    }
  }
}

// ✅ Cüzdan bağlama işlemi
export async function connectWalletMetaMask() {
  if (!checkMetaMask()) return null;

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await switchToCeloNetwork();
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("walletAddress").textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    document.getElementById("walletInfo").classList.remove("hidden");
    document.getElementById("connectWalletBtn").style.display = "none";

    await checkCurrentNetwork();

    return { provider, signer, userAddress };
  } catch (error) {
    console.error("❌ Wallet connection error:", error);
    if (error.code === 4001) {
      alert("❌ Connection rejected by user.");
    } else {
      alert("⚠️ Connection failed: " + error.message);
    }
    return null;
  }
}

// ✅ Ağ kontrolü (Mainnet / Testnet)
export async function checkCurrentNetwork() {
  if (!provider) return false;
  try {
    const network = await provider.getNetwork();
    currentChainId = network.chainId.toString();
    const networkInfo = document.getElementById("networkInfo");

    if (currentChainId === "42220") {
      networkInfo.innerHTML = "🌍 Celo Mainnet";
      networkInfo.style.color = "#35D07F";
      return true;
    } else if (currentChainId === "44787") {
      networkInfo.innerHTML = "🧪 Celo Alfajores Testnet";
      networkInfo.style.color = "#FBBF24";
      return true;
    } else {
      networkInfo.innerHTML = "⚠️ Wrong Network - Switch to Celo";
      networkInfo.style.color = "#EF4444";
      return false;
    }
  } catch (error) {
    console.error("Network check error:", error);
    return false;
  }
}

// ✅ Cüzdan bağlantısını koparma
export function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = "";
  document.getElementById("walletAddress").textContent = "";
  document.getElementById("walletInfo").classList.add("hidden");
  document.getElementById("connectWalletBtn").style.display = "block";
}

// ✅ Getters
export function getProvider() {
  return provider;
}
export function getSigner() {
  return signer;
}
export function getUserAddress() {
  return userAddress;
}
