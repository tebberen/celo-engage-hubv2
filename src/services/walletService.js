import { ethers, EthereumProvider } from "../utils/cdn-modules.js";
import {
  APP_NAME,
  NETWORKS,
  NETWORK_KEYS,
  DEFAULT_NETWORK,
  CURRENT_NETWORK,
  CELO_PARAMS,
  WALLETCONNECT_PROJECT_ID,
  UI_MESSAGES,
} from "../utils/constants.js";

let provider = null;
let signer = null;
let selectedAddress = null;
let connectionType = null;
let walletConnectProvider = null;

const walletSubscribers = new Set();

function isMiniPayEnvironment() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /MiniPay/i.test(ua) || /CeloMiniPay/i.test(ua);
}

function notify(event, payload = {}) {
  walletSubscribers.forEach((cb) => {
    try {
      cb({ event, ...payload });
    } catch (err) {
      console.error("Wallet subscriber error", err);
    }
  });
}

function formatChainId(hexId) {
  if (!hexId) return null;
  if (typeof hexId === "number") {
    return `0x${hexId.toString(16)}`;
  }
  return hexId;
}

export function getWalletDetails() {
  return {
    provider,
    signer,
    address: selectedAddress,
    connectionType,
  };
}

export function onWalletEvent(callback) {
  walletSubscribers.add(callback);
  return () => walletSubscribers.delete(callback);
}

export async function checkCurrentNetwork(currentProvider = provider) {
  if (!currentProvider) return false;
  const network = await currentProvider.getNetwork();
  const expected = parseInt(CURRENT_NETWORK.chainId, 16);
  return network.chainId === expected;
}

async function requestSwitchNetwork() {
  if (typeof window === "undefined" || !window.ethereum) {
    return false;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CURRENT_NETWORK.chainId }],
    });
    return true;
  } catch (error) {
    if (error?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [CELO_PARAMS],
      });
      return true;
    }
    console.warn("Network switch rejected", error);
    return false;
  }
}

function bindMetaMaskEvents(web3Provider) {
  if (!window.ethereum) return;

  window.ethereum.on("accountsChanged", (accounts) => {
    if (!accounts?.length) {
      disconnectWallet();
      return;
    }
    selectedAddress = ethers.utils.getAddress(accounts[0]);
    signer = web3Provider.getSigner();
    notify("accountsChanged", { address: selectedAddress });
  });

  window.ethereum.on("chainChanged", async () => {
    const valid = await checkCurrentNetwork(web3Provider);
    notify("networkChanged", { valid });
  });
}

function bindWalletConnectEvents(wcProvider, web3Provider) {
  if (!wcProvider) return;

  wcProvider.on("accountsChanged", (accounts) => {
    if (!accounts?.length) {
      disconnectWallet();
      return;
    }
    selectedAddress = ethers.utils.getAddress(accounts[0]);
    signer = web3Provider.getSigner();
    notify("accountsChanged", { address: selectedAddress });
  });

  wcProvider.on("chainChanged", async () => {
    const valid = await checkCurrentNetwork(web3Provider);
    notify("networkChanged", { valid });
  });

  wcProvider.on("disconnect", () => {
    disconnectWallet();
  });
}

export async function connectWalletMetaMask() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(UI_MESSAGES.walletNotConnected);
  }

  provider = new ethers.providers.Web3Provider(window.ethereum, "any");

  try {
    const accounts = await provider.send("eth_requestAccounts", []);
    selectedAddress = ethers.utils.getAddress(accounts[0]);
    const networkOk = await checkCurrentNetwork(provider);

    if (!networkOk) {
      const switched = await requestSwitchNetwork();
      if (!switched) {
        throw new Error(UI_MESSAGES.wrongNetwork);
      }
    }

    signer = provider.getSigner();
    connectionType = "metamask";
    bindMetaMaskEvents(provider);
    notify("connected", { address: selectedAddress, connectionType });
    return getWalletDetails();
  } catch (error) {
    provider = null;
    signer = null;
    selectedAddress = null;
    connectionType = null;
    throw error;
  }
}

export async function connectWalletConnect() {
  const chainIdDecimal = parseInt(CURRENT_NETWORK.chainId, 16);
  const isMiniPay = isMiniPayEnvironment();

  walletConnectProvider = await EthereumProvider.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    showQrModal: !isMiniPay,
    chains: [chainIdDecimal],
    optionalChains: NETWORK_KEYS.filter((key) => key !== DEFAULT_NETWORK).map((key) => parseInt(NETWORKS[key].chainId, 16)),
    rpcMap: {
      [chainIdDecimal]: CURRENT_NETWORK.rpcUrl,
    },
    metadata: {
      name: APP_NAME,
      description: "Celo Engage Hub",
      url: "https://celoscan.io/address/0x18351438b1bD20ee433Ea7D25589e913f14ca1A5",
      icons: ["https://storage.googleapis.com/ceibalancer/celo-icon.png"],
    },
    qrModalOptions: {
      themeVariables: {
        "--w3m-z-index": "80",
      },
    },
  });

  if (isMiniPay) {
    walletConnectProvider.on("display_uri", (uri) => {
      try {
        const deepLink = `celo://wallet/wc?uri=${encodeURIComponent(uri)}`;
        window.location.href = deepLink;
      } catch (err) {
        console.warn("MiniPay deep link error", err);
      }
    });
  }

  await walletConnectProvider.connect();
  provider = new ethers.providers.Web3Provider(walletConnectProvider, "any");

  const accounts = await provider.listAccounts();
  if (!accounts?.length) {
    throw new Error(UI_MESSAGES.walletNotConnected);
  }

  selectedAddress = ethers.utils.getAddress(accounts[0]);
  signer = provider.getSigner();
  connectionType = "walletconnect";
  bindWalletConnectEvents(walletConnectProvider, provider);
  notify("connected", { address: selectedAddress, connectionType });
  return getWalletDetails();
}

export async function disconnectWallet() {
  if (walletConnectProvider) {
    try {
      await walletConnectProvider.disconnect();
    } catch (err) {
      console.warn("WalletConnect disconnect error", err);
    }
    walletConnectProvider = null;
  }

  provider = null;
  signer = null;
  selectedAddress = null;
  connectionType = null;
  notify("disconnected");
}

export function isWalletConnected() {
  return Boolean(provider && signer && selectedAddress);
}

export function getConnectionType() {
  return connectionType;
}

export async function switchNetwork(networkKey) {
  const config = NETWORKS[networkKey];
  if (!config) return false;
  if (!provider) return false;

  const hexChainId = formatChainId(config.chainId);

  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: hexChainId }]);
    return true;
  } catch (error) {
    if (error?.code === 4902) {
      await provider.send("wallet_addEthereumChain", [
        {
          chainId: hexChainId,
          chainName: config.name,
          nativeCurrency: {
            name: "Celo",
            symbol: "CELO",
            decimals: 18,
          },
          rpcUrls: [config.rpcUrl],
          blockExplorerUrls: [config.explorer],
        },
      ]);
      return true;
    }
    console.warn("switchNetwork error", error);
    return false;
  }
}
