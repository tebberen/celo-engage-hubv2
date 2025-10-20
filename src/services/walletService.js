// ========================= CELO ENGAGE HUB — WALLET SERVICE (FIXED) ========================= //

// ✅ Ethers kontrolü - window.ethers kullan
const getEthers = () => {
  if (typeof window !== 'undefined' && window.ethers) {
    return window.ethers;
  }
  throw new Error('Ethers.js not loaded. Please refresh the page.');
};

// ✅ Multi-provider MetaMask fix
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    if (window.ethereum && window.ethereum.providers) {
      const metamaskProvider = window.ethereum.providers.find(p => p.isMetaMask);
      if (metamaskProvider && !Object.isFrozen(window.ethereum)) {
        window.ethereum = Object.assign({}, metamaskProvider);
      }
    }
  });
}

// ✅ Ağ parametreleri
export const CELO_MAINNET_PARAMS = {
  chainId: "0xA4EC",
  chainName: "Celo Mainnet", 
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://forno.celo.org"],
  blockExplorerUrls: ["https://celoscan.io/"]
};

export const CELO_ALFAJORES_PARAMS = {
  chainId: "0xAEF3",
  chainName: "Celo Alfajores Testnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  blockExplorerUrls: ["https://alfajores.celoscan.io/"]
};

// Global değişkenler
let provider = null;
let signer = null;
let userAddress = "";
let currentChainId = null;

// DOM elementleri
const walletStatusEl = () => document.getElementById("walletStatus");
const networkLabelEl = () => document.getElementById("networkLabel");
const connectBtnEl = () => document.getElementById("walletActionBtn");

// 🔹 MetaMask kontrolü
export function hasMetaMask() {
  return typeof window.ethereum !== "undefined";
}

// 🔹 CELO ağına geçiş
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
    return false;
  }
}

// 🔹 Cüzdan bağla - BASİT VERSİYON
export async function connectWalletMetaMask() {
  if (!hasMetaMask()) {
    alert("❌ MetaMask not detected. Please install MetaMask first.");
    return null;
  }

  try {
    // Ethers kontrolü
    const ethers = getEthers();
    
    // Provider oluştur
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    
    // Hesapları iste
    const accounts = await window.ethereum.request({ 
      method: "eth_requestAccounts" 
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found");
    }

    // Signer ve adres al
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    // Ağ etiketini güncelle
    await updateNetworkLabel();

    // UI güncelle
    if (walletStatusEl()) {
      walletStatusEl().innerHTML = `<p>✅ Connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}</p>`;
    }
    if (connectBtnEl()) {
      connectBtnEl().textContent = "Disconnect";
    }

    console.log("🔗 Wallet connected:", userAddress);
    return { provider, signer, userAddress };
  } catch (err) {
    console.error("❌ Connect error:", err);
    if (err.code === 4001) {
      alert("❌ Connection rejected by user.");
    } else {
      alert("⚠️ Connection failed. Please try again.");
    }
    return null;
  }
}

// 🔹 Ağ bilgisini güncelle
export async function updateNetworkLabel() {
  if (!provider) return false;
  
  try {
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
  } catch (err) {
    console.error("Update network label error:", err);
    return false;
  }
}

// 🔹 Bağlantıyı kes
export function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = "";
  currentChainId = null;

  if (walletStatusEl()) {
    walletStatusEl().innerHTML = "<p>🔴 Not connected</p><span id='networkLabel'>—</span>";
  }
  if (connectBtnEl()) {
    connectBtnEl().textContent = "Connect Wallet";
  }

  console.log("🔌 Wallet disconnected successfully.");
}

// Getter fonksiyonları
export function getProvider() { return provider; }
export function getSigner() { return signer; }
export function getUserAddress() { return userAddress; }

console.log("🧩 Wallet service loaded — fixed version active.");
