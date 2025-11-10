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
let injectedEthereumProvider = null;

const walletSubscribers = new Set();
const providerEventHandlers = new WeakMap();

function safeGet(target, property) {
  if (!target) return undefined;
  try {
    return Reflect.get(target, property);
  } catch (error) {
    console.debug(`Provider property access error [${property}]`, error);
    return undefined;
  }
}

function collectInjectedProviders() {
  if (typeof window === "undefined") return [];
  const { ethereum } = window;
  if (!ethereum) return [];

  const candidates = [];
  const seen = new WeakSet();

  const addCandidate = (prov) => {
    if (!prov || typeof prov !== "object") return;
    if (seen.has(prov)) return;
    seen.add(prov);
    candidates.push(prov);
  };

  const providers = safeGet(ethereum, "providers");
  if (Array.isArray(providers)) {
    providers.forEach(addCandidate);
  }

  const detected = safeGet(ethereum, "detected");
  if (Array.isArray(detected)) {
    detected.forEach(addCandidate);
  }

  const providerMap = safeGet(ethereum, "providerMap");
  if (providerMap) {
    if (typeof providerMap.forEach === "function") {
      providerMap.forEach((prov) => addCandidate(prov));
    } else {
      Object.values(providerMap).forEach((prov) => addCandidate(prov));
    }
  }

  addCandidate(ethereum);

  return candidates;
}

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

function providerSupportsRequests(prov) {
  const request = safeGet(prov, "request");
  const send = safeGet(prov, "send");
  const sendAsync = safeGet(prov, "sendAsync");
  return typeof request === "function" || typeof send === "function" || typeof sendAsync === "function";
}

function isMetaMaskProvider(prov) {
  return Boolean(safeGet(prov, "isMetaMask"));
}

function getInjectedEthereumProvider() {
  const candidates = collectInjectedProviders().filter((prov) => providerSupportsRequests(prov));
  if (!candidates.length) {
    return null;
  }

  const preferred = candidates.find((prov) => isMetaMaskProvider(prov));
  if (preferred) {
    return preferred;
  }

  return candidates[0] || null;
}

function detachInjectedProvider(providerInstance) {
  if (!providerInstance) return;
  const handlers = providerEventHandlers.get(providerInstance);
  if (handlers) {
    providerInstance.removeListener?.("accountsChanged", handlers.accountsChanged);
    providerInstance.removeListener?.("chainChanged", handlers.chainChanged);
    providerEventHandlers.delete(providerInstance);
  }
}

async function requestSwitchNetwork(targetProvider = injectedEthereumProvider) {
  const providerToUse = targetProvider || getInjectedEthereumProvider();
  if (!providerToUse?.request) {
    return false;
  }

  try {
    await providerToUse.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CURRENT_NETWORK.chainId }],
    });
    return true;
  } catch (error) {
    if (error?.code === 4902) {
      await providerToUse.request({
        method: "wallet_addEthereumChain",
        params: [CELO_PARAMS],
      });
      return true;
    }
    console.warn("Network switch rejected", error);
    return false;
  }
}

function bindMetaMaskEvents(rawProvider, web3Provider) {
  const targetProvider = rawProvider || injectedEthereumProvider || getInjectedEthereumProvider();
  if (!targetProvider?.on) return;

  detachInjectedProvider(targetProvider);

  const handleAccountsChanged = (accounts) => {
    if (!accounts?.length) {
      disconnectWallet();
      return;
    }
    selectedAddress = ethers.utils.getAddress(accounts[0]);
    signer = web3Provider.getSigner();
    notify("accountsChanged", { address: selectedAddress });
  };

  const handleChainChanged = async () => {
    const valid = await checkCurrentNetwork(web3Provider);
    notify("networkChanged", { valid });
  };

  targetProvider.on("accountsChanged", handleAccountsChanged);
  targetProvider.on("chainChanged", handleChainChanged);
  providerEventHandlers.set(targetProvider, {
    accountsChanged: handleAccountsChanged,
    chainChanged: handleChainChanged,
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
  if (typeof window === "undefined") {
    throw new Error(UI_MESSAGES.walletNotConnected);
  }

  try {
    const candidates = collectInjectedProviders().filter((prov) => providerSupportsRequests(prov));
    if (!candidates.length) {
      console.warn("No wallet provider detected");
      throw new Error(UI_MESSAGES.walletNotConnected);
    }

    const prioritized = [
      ...candidates.filter((prov) => isMetaMaskProvider(prov)),
      ...candidates.filter((prov) => !isMetaMaskProvider(prov)),
    ];

    let rawProvider = null;
    let web3Provider = null;
    let lastError = null;

    for (const candidate of prioritized) {
      try {
        web3Provider = new ethers.providers.Web3Provider(candidate, "any");
        rawProvider = candidate;
        break;
      } catch (candidateError) {
        lastError = candidateError;
        console.warn("Injected provider initialization failed", candidateError);
      }
    }

    if (!rawProvider || !web3Provider) {
      console.warn("No compatible injected provider available", lastError);
      throw new Error(UI_MESSAGES.walletNotConnected);
    }

    provider = web3Provider;
    injectedEthereumProvider = rawProvider;

    const accounts = await web3Provider.send("eth_requestAccounts", []);
    selectedAddress = ethers.utils.getAddress(accounts[0]);
    const networkOk = await checkCurrentNetwork(web3Provider);

    if (!networkOk) {
      const switched = await requestSwitchNetwork(rawProvider);
      if (!switched) {
        throw new Error(UI_MESSAGES.wrongNetwork);
      }
    }

    signer = web3Provider.getSigner();
    connectionType = "metamask";
    bindMetaMaskEvents(rawProvider, web3Provider);
    notify("connected", { address: selectedAddress, connectionType });
    return getWalletDetails();
  } catch (error) {
    provider = null;
    signer = null;
    selectedAddress = null;
    connectionType = null;
    detachInjectedProvider(injectedEthereumProvider);
    injectedEthereumProvider = null;
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
  const previousAddress = selectedAddress;
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
  detachInjectedProvider(injectedEthereumProvider);
  injectedEthereumProvider = null;
  notify("disconnected", { address: previousAddress });
}

export function isWalletConnected() {
  return Boolean(provider && signer && selectedAddress);
}

export function getConnectionType() {
  return connectionType;
}

export function getInjectedProvider() {
  return getInjectedEthereumProvider();
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
