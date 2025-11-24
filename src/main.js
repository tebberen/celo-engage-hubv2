import { ethers } from "./utils/cdn-modules.js";
import {
  OWNER_ADDRESS,
  UI_MESSAGES,
  MIN_DONATION,
  CURRENT_NETWORK,
  MODULES,
  MODULE_ADDRESS_BOOK,
  DEFAULT_NETWORK,
  CELO_ECOSYSTEM_LINKS,
} from "./utils/constants.js";
import {
  connectWalletMetaMask,
  connectWalletConnect,
  disconnectWallet,
  getInjectedProvider,
  getWalletDetails,
  onWalletEvent,
} from "./services/walletService.js";
import {
  registerToastHandler,
  doGM,
  doDeploy,
  doDonateCELO,
  doApproveCUSD,
  doDonateCUSD,
  doApproveCEUR,
  doDonateCEUR,
  doShareLink,
  govCreateProposal,
  govVote,
  registerProfile,
  withdrawDonations,
  loadProfile,
  loadGlobalStats,
  loadRecentLinks,
  loadGovernance,
  loadLeaderboard,
  loadUserDeployments,
  getAnalyticsConfig,
  getLink,
  getLinkEventContract,
} from "./services/contractService.js";
let deviceId = localStorage.getItem("celo-engage-device-id");
if (!deviceId) {
  deviceId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `device-${Date.now()}`;
  localStorage.setItem("celo-engage-device-id", deviceId);
}

const SUPPORT_STORAGE_KEY = "celo-engage-link-supports";
const COMPLETED_STORAGE_KEY = "completedLinks";
const storedSupportCounts = safeParseStorage(localStorage.getItem(SUPPORT_STORAGE_KEY), {});
const storedCompletedLinks = safeParseStorage(localStorage.getItem(COMPLETED_STORAGE_KEY), []);
const newLinkHighlights = new Set();
const liveLinkCache = new Set();

const COMPLETION_THRESHOLD = 3;
const MAX_COMPLETED_HISTORY = 50;
const MINI_APP_CATEGORIES = [
  "all",
  "Growth",
  "Games",
  "Identity",
  "Governance",
  "NFTs",
  "Finance",
  "Wallet",
  "Rewards",
  "Tools",
  "Messaging",
  "Ecosystem",
];
const MINI_APP_ICON_PLACEHOLDER = "./assets/miniapps/default.png";

function getEcosystemUrl(match) {
  if (!match) return match;
  const normalized = String(match).toLowerCase();
  const entry = (CELO_ECOSYSTEM_LINKS || []).find(({ url = "", name = "" }) => {
    return url.toLowerCase().includes(normalized) || name.toLowerCase().includes(normalized);
  });
  return entry?.url || match;
}

const CELO_ECOSYSTEM_MODULES = {
  official: {
    key: "official",
    label: "OFFICIAL",
    title: "Celo Official Links",
    description: "Core Celo sites like Foundation, Docs, Explorer, and governance.",
    items: [
      {
        label: "Celo.org",
        url: getEcosystemUrl("https://celo.org/"),
        description: "Overview of Celo as an Ethereum L2 and ecosystem entry point.",
        actionLabel: "Open",
      },
      {
        label: "Celo Foundation",
        url: getEcosystemUrl("https://celofoundation.org/"),
        description: "Mission, roadmap, programs, and grants.",
        actionLabel: "Open",
      },
      {
        label: "Discover Celo",
        url: getEcosystemUrl("https://docs.celo.org/home"),
        description: "High-level introduction, key features, and why build on Celo.",
        actionLabel: "Open",
      },
      {
        label: "Celo Docs",
        url: getEcosystemUrl("https://docs.celo.org/"),
        description: "Full developer documentation, guides, and tutorials.",
        actionLabel: "Open",
      },
      {
        label: "Celo Protocol",
        url: getEcosystemUrl("https://docs.celo.org/home/protocol"),
        description: "Protocol architecture and Celo L2 technical overview.",
        actionLabel: "Open",
      },
      {
        label: "Celo Governance (Docs)",
        url: getEcosystemUrl("https://docs.celo.org/home/protocol/governance/overview"),
        description: "How on-chain governance works and how to participate.",
        actionLabel: "Open",
      },
      {
        label: "Celo Forum",
        url: getEcosystemUrl("https://forum.celo.org/"),
        description: "Community discussions, governance threads, and ecosystem topics.",
        actionLabel: "Open",
      },
      {
        label: "Celo Explorer (Mainnet)",
        url: getEcosystemUrl("https://celoscan.io/"),
        description: "Track blocks, transactions, contracts, and addresses.",
        actionLabel: "Open",
      },
      {
        label: "Celo Testnet Explorer (Sepolia)",
        url: getEcosystemUrl("https://celo-sepolia.blockscout.com/"),
        description: "Explore Celo Sepolia testnet activity and contracts.",
        actionLabel: "Open",
      },
      {
        label: "Network & RPC Info",
        url: getEcosystemUrl("https://docs.celo.org/tooling/overview/network-overview"),
        description: "Official chain ID, RPC endpoints, and explorer links.",
        actionLabel: "Open",
      },
      {
        label: "Developer Tools & Resources",
        url: getEcosystemUrl("https://docs.celo.org/tooling/overview"),
        description: "Composer, dev tools, faucets, bridges, and more.",
        actionLabel: "Open",
      },
      {
        label: "Celo GitHub",
        url: getEcosystemUrl("https://github.com/celo-org"),
        description: "Core protocol repositories and developer tooling (celo-org).",
        actionLabel: "Open",
      },
      {
        label: "Celo Blog",
        url: getEcosystemUrl("https://blog.celo.org/"),
        description: "Official ecosystem updates, news, and deep dives.",
        actionLabel: "Open",
      },
      {
        label: "Whitepapers",
        url: getEcosystemUrl("https://celo.org/whitepapers"),
        description: "Technical and economic design papers for Celo.",
        actionLabel: "Open",
      },
      {
        label: "Security & Bug Bounty",
        url: getEcosystemUrl("https://celo.org/security"),
        description: "Security guidelines and vulnerability reporting.",
        actionLabel: "Open",
      },
    ],
  },
  dex: {
    key: "dex",
    label: "DEX",
    title: "Celo DEX",
    description: "Decentralized exchanges and liquidity venues on Celo.",
    items: [
      {
        label: "Mento",
        description:
          "Native AMM and FX DEX on Celo used to swap CELO and Celo stable assets like cUSD, cEUR and cREAL.",
        url: "https://mento.org/",
        actionLabel: "Open",
      },
      {
        label: "Ubeswap",
        description:
          "Mobile-first AMM DEX built for Celo assets, long-time core exchange in the Celo ecosystem.",
        url: "https://ubeswap.org/",
        actionLabel: "Open",
      },
      {
        label: "Mobius Money",
        description:
          "Stableswap AMM optimized for low-slippage swaps between stablecoins and other pegged assets on Celo.",
        url: "https://mobius.money/",
        actionLabel: "Open",
      },
      {
        label: "Symmetric (Celo)",
        description:
          "Balancer-style multi-token AMM on Celo with weighted index pools and liquidity mining opportunities.",
        url: "https://app.symmetric.finance/#/swap?chain=celo",
        actionLabel: "Open",
      },
      {
        label: "CeloDex",
        description: "Automated market maker DEX launched on Celo, offering token swaps and yield farming pools.",
        url: "https://celodex.com/",
        actionLabel: "Open",
      },
      {
        label: "Uniswap v3 (Celo)",
        description:
          "Concentrated-liquidity Uniswap v3 deployment on Celo, routing a large share of CELO and stablecoin volume.",
        url: "https://app.uniswap.org/explore/tokens/celo",
        actionLabel: "Open",
      },
      {
        label: "Curve Finance (Celo)",
        description:
          "Curve’s stable-swap DEX deployed on Celo, focusing on efficient swaps between stablecoins and correlated assets.",
        url: "https://curve.fi/#/celo/pools",
        actionLabel: "Open",
      },
      {
        label: "SushiSwap (Celo)",
        description:
          "Multichain AMM and DeFi hub deployed on Celo as part of DeFi for the People, supporting a variety of token pairs.",
        url: "https://app.sushi.com/swap?chainId=42220",
        actionLabel: "Open",
      },
      {
        label: "Velodrome Slipstream (Celo)",
        description:
          "Slipstream-style concentrated-liquidity DEX deployment on Celo from the Velodrome ecosystem.",
        url: "https://velodrome.finance/swap?chain=celo",
        actionLabel: "Open",
      },
    ],
  },
  cex: {
    key: "cex",
    label: "CEX",
    title: "Celo CEX",
    description: "Centralized exchanges where users can trade CELO or cUSD.",
    items: [
      {
        label: "Coinbase (CELO)",
        url: "https://www.coinbase.com/price/celo",
        description: "Buy or sell CELO pairs securely.",
      },
      {
        label: "Binance (CELO)",
        url: "https://www.binance.com/en/price/celo",
        description: "Access CELO spot markets and liquidity.",
      },
      {
        label: "Kraken (CELO)",
        url: "https://www.kraken.com/prices/celo-celo-price-chart",
        description: "Trade CELO with fiat and crypto pairs.",
      },
    ],
  },
  bridge: {
    key: "bridge",
    label: "BRIDGE",
    title: "Celo Bridge",
    description: "Cross-chain bridges to move assets to and from Celo.",
    items: [
      {
        label: "Portal Bridge",
        url: "https://www.portalbridge.com/#/transfer?source=CELO",
        description: "Bridge with Wormhole liquidity across chains.",
      },
      {
        label: "cBridge",
        url: "https://cbridge.celer.network/#/transfer?sourceChain=CELO",
        description: "Fast transfers powered by Celer Network.",
      },
      {
        label: "Squid Router",
        url: "https://app.squidrouter.com/?toChain=celo",
        description: "Cross-chain swaps that settle into Celo.",
      },
    ],
  },
  miniApps: {
    key: "miniApps",
    label: "FARCASTER",
    title: "Celo Farcaster Mini Apps",
    description: "Farcaster mini apps powered by Celo.",
    items: [
      {
        label: "Celo on Farcaster",
        url: "https://warpcast.com/~/channel/celo",
        description: "Discover community mini app launches and casts.",
        actionLabel: "Open channel",
      },
    ],
  },
  social: {
    key: "social",
    label: "SOCIAL",
    title: "Celo Social Media",
    description: "Official Celo community and social channels.",
    items: [
      {
        label: "Celo on X (Twitter)",
        url: getEcosystemUrl("https://x.com/Celo"),
        description: "Follow announcements and highlights.",
      },
      {
        label: "Celo Discord",
        url: getEcosystemUrl("https://chat.celo.org"),
        description: "Chat with builders and contributors.",
      },
      {
        label: "Celo Forum",
        url: getEcosystemUrl("https://forum.celo.org"),
        description: "Long-form discussions and proposals.",
      },
      {
        label: "Celo Blog",
        url: getEcosystemUrl("https://blog.celo.org"),
        description: "Stories, updates, and ecosystem news.",
      },
      {
        label: "Celo YouTube",
        url: getEcosystemUrl("https://www.youtube.com/@CeloOrg"),
        description: "Workshops, AMAs, and replays.",
      },
    ],
  },
};

const state = {
  address: null,
  profile: null,
  global: null,
  governance: { active: [], completed: [] },
  leaderboard: null,
  isOwner: false,
  theme: "golden",
  language: localStorage.getItem("celo-engage-lang") || "tr",
  translations: {},
  supportCounts: sanitizeSupportCounts(storedSupportCounts),
  completedLinks: [],
  unseenLinkCount: 0,
  sharePromptLink: null,
  deviceId,
  feedEntries: [],
  miniApps: [],
  filteredMiniApps: [],
  miniAppFilters: {
    search: "",
    category: "all",
  },
  activeEcosystemModule: "official",
};

const elements = {
  app: document.getElementById("app"),
  navButtons: document.querySelectorAll(".nav-btn"),
  sections: document.querySelectorAll(".section"),
  breadcrumb: document.getElementById("breadcrumb"),
  navLanguageButton: document.getElementById("navLanguageButton"),
  walletActions: document.querySelector(".wallet-actions"),
  connectModal: document.getElementById("connectModal"),
  connectOptions: document.querySelectorAll("[data-connect-option]"),
  disconnectWallet: document.getElementById("disconnectWallet"),
  navbarConnectButton: document.getElementById("navbarConnectButton"),
  walletPill: document.getElementById("walletPill"),
  walletPillButton: document.getElementById("walletPillButton"),
  walletDropdown: document.getElementById("walletDropdown"),
  walletStatusIcon: document.querySelector(".wallet-pill__status"),
  walletAddressLabel: document.getElementById("walletAddressLabel"),
  walletNetworkName: document.getElementById("walletNetworkName"),
  profilePlaceholder: document.getElementById("profilePlaceholder"),
  profileAddressLabel: document.getElementById("profileAddressLabel"),
  profileAddressValue: document.getElementById("profileAddressValue"),
  feedSpinner: document.getElementById("feedSpinner"),
  feedBadge: document.getElementById("feedBadge"),
  linkFeed: document.getElementById("linkFeed"),
  completedFeed: document.getElementById("completedFeed"),
  completedCounter: document.getElementById("completedCounter"),
  completedBadge: document.getElementById("completedBadge"),
  gmForm: document.getElementById("gmForm"),
  deployForm: document.getElementById("deployForm"),
  donateTabs: document.querySelectorAll("#donate .tab-btn"),
  donatePanels: document.querySelectorAll("#donate .tab-panel"),
  donateCeloForm: document.getElementById("donateCeloForm"),
  approveCusdForm: document.getElementById("approveCusdForm"),
  donateCusdForm: document.getElementById("donateCusdForm"),
  approveCeurForm: document.getElementById("approveCeurForm"),
  donateCeurForm: document.getElementById("donateCeurForm"),
  proposalForm: document.getElementById("proposalForm"),
  proposalFormWrapper: document.getElementById("proposalFormWrapper"),
  proposalAccessMessage: document.getElementById("proposalAccessMessage"),
  activeProposals: document.getElementById("activeProposals"),
  pastProposals: document.getElementById("pastProposals"),
  badgeDetails: document.getElementById("badgeDetails"),
  badgeShowcase: document.getElementById("badgeShowcase"),
  leaderboardTabs: document.querySelectorAll("#leaderboard .tab-btn"),
  leaderboardPanels: document.querySelectorAll("#leaderboard .tab-panel"),
  leaderboardLists: {
    topLinks: document.getElementById("leaderboardLinks"),
    topGM: document.getElementById("leaderboardGM"),
    topDeploy: document.getElementById("leaderboardDeploy"),
    topCelo: document.getElementById("leaderboardCelo"),
    topCusd: document.getElementById("leaderboardCusd"),
    topVotes: document.getElementById("leaderboardVotes"),
    topBadges: document.getElementById("leaderboardBadges"),
  },
  ownerPanel: document.getElementById("ownerPanel"),
  withdrawCeloForm: document.getElementById("withdrawCeloForm"),
  withdrawCusdForm: document.getElementById("withdrawCusdForm"),
  withdrawCeurForm: document.getElementById("withdrawCeurForm"),
  globalCounters: document.getElementById("globalCounters"),
  toastContainer: document.getElementById("toastContainer"),
  usernameModal: document.getElementById("usernameModal"),
  usernameForm: document.getElementById("usernameForm"),
  usernameInput: document.getElementById("usernameInput"),
  languageToggle: document.getElementById("languageToggle"),
  ecosystemModal: document.getElementById("ecosystemModal"),
  ecosystemMore: document.getElementById("ecosystemMore"),
  ecosystemSidebarButtons: document.querySelectorAll(".ecosystem-links [data-module-key]"),
  ecosystemSection: document.getElementById("ecosystem-modules"),
  shareModal: document.getElementById("shareModal"),
  shareLinkForm: document.getElementById("shareLinkForm"),
  shareLinkInput: document.getElementById("shareLinkInput"),
  sharePromptLink: document.getElementById("sharePromptLink"),
  sharePromptForm: document.getElementById("sharePromptForm"),
  sharePromptInput: document.getElementById("sharePromptInput"),
  donateQuickButtons: document.querySelectorAll("[data-donate-amount]"),
  duneLink: document.getElementById("duneLink"),
  graphLink: document.getElementById("graphLink"),
  deployedContracts: document.getElementById("deployedContracts"),
  feedSkeleton: document.getElementById("feedSkeleton"),
  governanceSkeleton: document.getElementById("governanceSkeleton"),
  miniAppGrid: document.getElementById("miniAppGrid"),
  miniAppEmpty: document.getElementById("miniAppEmpty"),
  miniAppSearch: document.getElementById("miniAppSearch"),
  miniAppCategories: document.getElementById("miniAppCategories"),
  ecosystemModuleGrid: document.getElementById("ecosystemModuleGrid"),
  ecosystemDetail: document.getElementById("ecosystemDetail"),
  ecosystemDetailLabel: document.getElementById("ecosystemDetailLabel"),
  ecosystemDetailTitle: document.getElementById("ecosystemDetailTitle"),
  ecosystemDetailDescription: document.getElementById("ecosystemDetailDescription"),
  ecosystemDetailList: document.getElementById("ecosystemDetailList"),
};

let activeSectionId = null;
let wsProvider = null;
let linkEventContract = null;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';
const modalFocusState = new WeakMap();
const modalStack = [];
let walletDropdownFocusCleanup = null;

const LOADING_TEXT = {
  connecting: "Connecting…",
  pending: "Pending…",
  sendingGM: "Sending GM…",
  deploying: "Deploying…",
  donating: "Sending Donation…",
  approving: "Approving…",
  sharingLink: "Submitting Link…",
  creatingProposal: "Submitting Proposal…",
  withdrawing: "Processing Withdrawal…",
  registering: "Saving Profile…",
  voting: "Processing Vote…",
};

const WITHDRAW_TOKENS = new Set(["CELO", "cUSD", "cEUR"]);

function getLoadingText(key, fallback) {
  const base = LOADING_TEXT[key] || fallback;
  return t ? t(`status.${key}`, base) || base : base;
}

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => {
    if (el.hasAttribute("disabled")) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    const rect = el.getBoundingClientRect?.();
    return Boolean(el.offsetParent || el === document.activeElement || (rect && rect.width && rect.height));
  });
}

function bindFocusTrap(container) {
  if (!container) return () => {};
  const handleKeydown = (event) => {
    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(container);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  };
  container.addEventListener("keydown", handleKeydown);
  return () => container.removeEventListener("keydown", handleKeydown);
}

function openModalEl(modal, { focusTarget, trigger } = {}) {
  if (!modal) return;
  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const cleanup = bindFocusTrap(modal);
  const restoreTarget = trigger instanceof HTMLElement ? trigger : previouslyFocused;
  modalFocusState.set(modal, { cleanup, restoreTarget });
  const existingIndex = modalStack.indexOf(modal);
  if (existingIndex !== -1) {
    modalStack.splice(existingIndex, 1);
  }
  modalStack.push(modal);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  updateBodyModalState();
  const directTarget = focusTarget instanceof HTMLElement ? focusTarget : null;
  const initialFocus = directTarget || modal.querySelector("[data-autofocus]") || getFocusableElements(modal)[0];
  if (initialFocus instanceof HTMLElement) {
    initialFocus.focus({ preventScroll: true });
  }
}

function closeModalEl(modal) {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  const state = modalFocusState.get(modal);
  if (state?.cleanup) {
    state.cleanup();
  }
  modalFocusState.delete(modal);
  const index = modalStack.lastIndexOf(modal);
  if (index !== -1) {
    modalStack.splice(index, 1);
  }
  updateBodyModalState();
  const target = state?.restoreTarget;
  if (target && typeof target.focus === "function") {
    target.focus({ preventScroll: true });
  }
}

function toggleSkeleton(element, show) {
  if (!element) return;
  if (show) {
    element.removeAttribute("hidden");
  } else {
    element.setAttribute("hidden", "true");
  }
}

async function withButtonLoading(button, options, task) {
  const opts = options || {};
  const action = typeof task === "function" ? task : async () => {};
  if (!button) {
    return action();
  }
  if (button.dataset.loading === "true") {
    return undefined;
  }
  const originalHtml = button.innerHTML;
  const originalMinWidth = button.style.minWidth;
  const keepWidth = opts.keepWidth !== false;
  const measuredWidth = keepWidth ? button.getBoundingClientRect().width : null;
  if (measuredWidth) {
    button.style.minWidth = `${Math.ceil(measuredWidth)}px`;
  }
  button.dataset.loading = "true";
  button.disabled = true;
  button.classList.add("is-loading");
  button.setAttribute("aria-busy", "true");
  if (opts.loadingText) {
    button.textContent = opts.loadingText;
  }
  try {
    return await action();
  } finally {
    delete button.dataset.loading;
    button.disabled = false;
    button.classList.remove("is-loading");
    button.removeAttribute("aria-busy");
    if (opts.loadingText) {
      button.innerHTML = originalHtml;
    } else {
      button.innerHTML = originalHtml;
    }
    if (measuredWidth) {
      if (originalMinWidth) {
        button.style.minWidth = originalMinWidth;
      } else {
        button.style.removeProperty("min-width");
      }
    }
  }
}

function init() {
  applyTheme();
  setupLanguage();
  setupNavigation();
  setupMiniAppDirectory();
  setupEcosystemModules();
  const initialSection = document.querySelector(".section.active") || (elements.sections && elements.sections[0]);
  if (initialSection) {
    activeSectionId = initialSection.id || "home";
    requestAnimationFrame(() => initialSection.classList.add("fade-in"));
  }
  setupTabs();
  setupLeaderboardTabs();
  setupForms();
  setupDonateShortcuts();
  setupConnectModal();
  setupWalletButtons();
  setupWalletDropdown();
  setupProfileModal();
  setupUsernameModal();
  setupEcosystemModal();
  setupToastBridge();
  updateAnalyticsLinks();
  renderNetworkInfo(false);
  updateWalletUI();
  renderOwnerPanel();
  renderGovernanceAccess();
  loadInitialData();
  initWalletListeners();
  initWebsocket();
}

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("beforeunload", cleanupLinkLiveUpdates);

function t(key, fallback = "") {
  if (!key) return fallback;
  const segments = key.split(".");
  let result = state.translations?.[state.language];
  for (const segment of segments) {
    if (result && Object.prototype.hasOwnProperty.call(result, segment)) {
      result = result[segment];
    } else {
      return fallback;
    }
  }
  return typeof result === "string" ? result : fallback;
}

async function setupLanguage() {
  try {
    const response = await fetch("./src/lang.json");
    if (response.ok) {
      state.translations = await response.json();
    }
  } catch (error) {
    console.error("❌ [App] Language load error", error);
  } finally {
    applyLanguage(state.language);
  }

  const handleToggle = () => {
    const nextLang = state.language === "tr" ? "en" : "tr";
    applyLanguage(nextLang);
  };

  if (elements.languageToggle) {
    elements.languageToggle.addEventListener("click", handleToggle);
  }

  if (elements.navLanguageButton) {
    elements.navLanguageButton.addEventListener("click", handleToggle);
  }
}

function applyLanguage(lang) {
  if (!state.translations?.[lang]) {
    lang = "tr";
  }
  state.language = lang;
  document.documentElement.lang = lang;
  localStorage.setItem("celo-engage-lang", lang);

  if (elements.languageToggle) {
    elements.languageToggle.setAttribute("data-current-lang", lang.toUpperCase());
    elements.languageToggle.title = lang.toUpperCase();
  }

  if (elements.navLanguageButton) {
    elements.navLanguageButton.title = lang.toUpperCase();
  }

  translateDocument();
  renderProfile(state.profile);
  renderBadgeDetails(state.profile);
  renderGlobalCounters(state.global);
  renderNavigationAria();
  renderMiniApps();
  refreshBreadcrumb();
}

function translateDocument() {
  const allElements = document.querySelectorAll("[data-i18n]");
  allElements.forEach((el) => {
    const text = t(el.dataset.i18n, el.textContent?.trim() || "");
    if (text) {
      el.textContent = text;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const value = t(el.dataset.i18nPlaceholder, el.getAttribute("placeholder") || "");
    if (value) {
      el.setAttribute("placeholder", value);
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const value = t(el.dataset.i18nAriaLabel, el.getAttribute("aria-label") || "");
    if (value) {
      el.setAttribute("aria-label", value);
    }
  });
}

function renderNavigationAria() {
  elements.navButtons.forEach((btn) => {
    const label = btn.dataset.i18n ? t(btn.dataset.i18n, btn.textContent) : btn.textContent;
    btn.setAttribute("aria-label", label);
  });
}

function setupProfileModal() {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (modalStack.length) {
      const currentModal = modalStack[modalStack.length - 1];
      if (currentModal === elements.shareModal) {
        closeShareModal();
        return;
      }
      if (currentModal === elements.connectModal) {
        closeConnectModal();
        return;
      }
      if (currentModal === elements.ecosystemModal) {
        closeEcosystemModal();
        return;
      }
      if (currentModal === elements.usernameModal) {
        closeUsernameModal();
        return;
      }
    }
    if (elements.walletDropdown?.classList.contains("open")) {
      closeWalletDropdown({ restoreFocus: true });
    }
  });
}

function setupShareModal() {
  if (!elements.shareModal) return;
  elements.shareModal.setAttribute("aria-hidden", "true");
  const dismissElements = elements.shareModal.querySelectorAll('[data-dismiss="shareModal"]');
  dismissElements.forEach((btn) => {
    btn.addEventListener("click", closeShareModal);
  });
  if (elements.sharePromptInput && !elements.sharePromptInput.value) {
    elements.sharePromptInput.value = "https://";
  }
  if (elements.shareLinkInput && !elements.shareLinkInput.value) {
    elements.shareLinkInput.value = "https://";
  }
}

function setupUsernameModal() {
  if (!elements.usernameModal) return;
  elements.usernameModal.setAttribute("aria-hidden", "true");
  const dismissButtons = elements.usernameModal.querySelectorAll('[data-dismiss="usernameModal"]');
  dismissButtons.forEach((btn) => btn.addEventListener("click", closeUsernameModal));
}

function openShareModal(link, trigger) {
  if (!elements.shareModal) return;
  state.sharePromptLink = link || null;
  if (elements.sharePromptLink) {
    elements.sharePromptLink.textContent = link || "—";
  }
  if (elements.sharePromptInput) {
    elements.sharePromptInput.value = "https://";
  }
  openModalEl(elements.shareModal, { focusTarget: elements.sharePromptInput, trigger });
}

function closeShareModal() {
  if (!elements.shareModal) return;
  closeModalEl(elements.shareModal);
  if (elements.sharePromptInput) {
    elements.sharePromptInput.value = "https://";
  }
  if (elements.sharePromptLink) {
    elements.sharePromptLink.textContent = "—";
  }
  state.sharePromptLink = null;
}

function setupFeedInteractions() {
  if (elements.linkFeed) {
    elements.linkFeed.addEventListener("click", handleFeedSupportClick);
  }
}

function handleFeedSupportClick(event) {
  const button = event.target.closest("button[data-support]");
  if (!button) return;
  event.preventDefault();
  const key = button.dataset.support;
  if (!key) return;
  handleSupportAction(key);
}

function handleSupportAction(key) {
  const current = getSupportCount(key);
  const next = Math.min(COMPLETION_THRESHOLD, current + 1);
  state.supportCounts[key] = next;
  persistSupportCounts();
  const entry = findLinkEntryByKey(key);
  if (next >= COMPLETION_THRESHOLD && entry) {
    moveLinkToCompleted(entry);
  }
  updateLinkFeedView();
}

function persistSupportCounts() {
  localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(state.supportCounts));
}

function findLinkEntryByKey(key) {
  if (!key) return null;
  return (
    state.feedEntries.find((item) => item.key === key) ||
    state.completedLinks.find((item) => item.key === key) ||
    null
  );
}

function syncLiveLinkCache(entries = []) {
  liveLinkCache.clear();
  entries.forEach((item) => {
    if (item?.key) {
      liveLinkCache.add(item.key);
    }
  });
}

function mergeLinkEntries(entries, options = {}) {
  const mode = options.mode || "merge";
  const trackNew = options.trackNew ?? mode !== "replace";
  const base = mode === "replace" ? [] : Array.isArray(state.feedEntries) ? state.feedEntries.slice() : [];
  const map = new Map();
  base.forEach((item) => {
    if (item?.key) {
      map.set(item.key, { ...item });
    }
  });
  const incoming = Array.isArray(entries) ? entries : [];
  const newKeys = [];
  incoming
    .map((entry) => normalizeLinkEntry(entry))
    .filter(Boolean)
    .forEach((item) => {
      const existing = map.get(item.key);
      const merged = {
        ...(existing || {}),
        ...item,
        addedAt: item.addedAt || existing?.addedAt || Date.now(),
      };
      if (!existing && trackNew) {
        newKeys.push(item.key);
      }
      map.set(item.key, merged);
    });
  const combined = Array.from(map.values());
  combined.sort((a, b) => {
    const blockDiff = (b.blockNumber || 0) - (a.blockNumber || 0);
    if (blockDiff !== 0) return blockDiff;
    return (b.addedAt || 0) - (a.addedAt || 0);
  });
  state.feedEntries = combined;
  syncLiveLinkCache(combined);
  return newKeys;
}

function getSupportCount(key) {
  const value = state.supportCounts?.[key];
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function moveLinkToCompleted(entry) {
  if (!entry?.key) return;
  const existingIndex = state.completedLinks.findIndex((item) => item.key === entry.key);
  const completedEntry = { ...entry, completedAt: Date.now() };
  if (existingIndex !== -1) {
    state.completedLinks.splice(existingIndex, 1);
  }
  state.completedLinks = [completedEntry, ...state.completedLinks].slice(0, MAX_COMPLETED_HISTORY);
  state.supportCounts[entry.key] = COMPLETION_THRESHOLD;
  persistSupportCounts();
  persistCompletedLinks();
  updateCompletedBadge();
}

function persistCompletedLinks() {
  const serializable = state.completedLinks.map(({ key, user, link, transactionHash, blockNumber, completedAt }) => ({
    key,
    user,
    link,
    transactionHash,
    blockNumber,
    completedAt,
  }));
  localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(serializable));
}

function toggleFeedSpinner(show) {
  if (!elements.feedSpinner) return;
  elements.feedSpinner.hidden = !show;
}

function setFeedBusy(isBusy) {
  if (!elements.linkFeed) return;
  if (isBusy) {
    elements.linkFeed.setAttribute("aria-busy", "true");
  } else {
    elements.linkFeed.removeAttribute("aria-busy");
  }
}

function updateLinkFeedView() {
  if (!elements.linkFeed) return;
  const activeEntries = getActiveLinkEntries();
  if (!activeEntries.length) {
    elements.linkFeed.innerHTML = `<p class="feed-empty">${t("feed.empty", "Henüz bağlantı paylaşılmadı.")}</p>`;
  } else {
    elements.linkFeed.innerHTML = activeEntries.map(renderFeedCard).join("");
  }
  if (activeSectionId === "home") {
    applyLinkHighlights();
  }
  updateCompletedView();
}

function renderRecentLinks() {
  updateLinkFeedView();
}

function getActiveLinkEntries() {
  if (!Array.isArray(state.feedEntries)) return [];
  return state.feedEntries.filter((entry) => !isLinkCompleted(entry));
}

function updateCompletedView() {
  if (elements.completedFeed) {
    const completedEntries = getCompletedLinkEntries();
    if (!completedEntries.length) {
      elements.completedFeed.innerHTML = `<p class="feed-empty">${t("feed.completedEmpty", "Tamamlanan bağlantı yok.")}</p>`;
    } else {
      elements.completedFeed.innerHTML = completedEntries.map(renderCompletedCard).join("");
    }
  }
  const completedCount = getCompletedLinkEntries().length;
  if (elements.completedCounter) {
    elements.completedCounter.textContent = `✅ ${completedCount} ${t("feed.counter", "Bağlantı tamamlandı")}`;
  }
  updateCompletedBadge();
}

function getCompletedLinkEntries() {
  if (!Array.isArray(state.completedLinks)) return [];
  return state.completedLinks.slice();
}

function updateCompletedBadge() {
  if (!elements.completedBadge) return;
  const count = getCompletedLinkEntries().length;
  if (count > 0) {
    elements.completedBadge.textContent = count;
    elements.completedBadge.removeAttribute("hidden");
  } else {
    elements.completedBadge.textContent = "0";
    elements.completedBadge.setAttribute("hidden", "true");
  }
}

function updateLinkBadge() {
  if (!elements.feedBadge) return;
  const count = state.unseenLinkCount || 0;
  if (count > 0) {
    elements.feedBadge.textContent = count;
    elements.feedBadge.removeAttribute("hidden");
  } else {
    elements.feedBadge.textContent = "0";
    elements.feedBadge.setAttribute("hidden", "true");
  }
}

function applyLinkHighlights() {
  if (activeSectionId !== "home") return;
  newLinkHighlights.forEach((key) => {
    const card = document.querySelector(`[data-feed-key="${key}"]`);
    if (card) {
      card.classList.add("feed-card--highlight");
      setTimeout(() => card.classList.remove("feed-card--highlight"), 1200);
    }
  });
  newLinkHighlights.clear();
}

function markLinksAsSeen() {
  if (state.unseenLinkCount === 0) return;
  state.unseenLinkCount = 0;
  updateLinkBadge();
}

function isLinkCompleted(entry) {
  if (!entry?.key) return false;
  const supportCount = getSupportCount(entry.key);
  if (supportCount >= COMPLETION_THRESHOLD) return true;
  return state.completedLinks.some((item) => item.key === entry.key);
}

function renderFeedCard(entry) {
  const rawLink = entry.link || "";
  const safeLink = escapeHtml(rawLink);
  const encodedLink = encodeURIComponent(rawLink);
  const supportCount = getSupportCount(entry.key);
  const remaining = Math.max(0, COMPLETION_THRESHOLD - supportCount);
  const explorerLink = entry.transactionHash ? `${CURRENT_NETWORK.explorer}/tx/${entry.transactionHash}` : "";
  const hashLabel = entry.transactionHash ? escapeHtml(shorten(entry.transactionHash)) : t("feed.pending", "Bekliyor");
  const blockLabel = entry.blockNumber ? `#${entry.blockNumber}` : t("feed.new", "Yeni");
  return `
    <article class="feed-card" data-feed-key="${entry.key}">
      <div class="feed-card__meta">
        <span class="feed-card__user">${escapeHtml(shorten(entry.user || "0x0"))}</span>
        ${explorerLink ? `<a href="${explorerLink}" target="_blank" rel="noopener">${hashLabel}</a>` : `<span>${hashLabel}</span>`}
      </div>
      <a class="feed-card__link" data-feed-link="${encodedLink}" href="${safeLink}" target="_blank" rel="noopener">${safeLink}</a>
      <div class="feed-card__details">${blockLabel}</div>
      <div class="feed-card__footer">
        <button type="button" class="support-btn" data-support="${entry.key}" ${supportCount >= COMPLETION_THRESHOLD ? "disabled" : ""}>
          <span>${t("feed.support", "Support")}</span>
        </button>
        <div class="support-stats">
          <strong>${supportCount}/${COMPLETION_THRESHOLD}</strong>
          <span>${t("feed.supportLabel", "Destek")}</span>
        </div>
        <span class="feed-card__remaining">${remaining ? `${remaining} ${t("feed.remaining", "kaldı")}` : t("feed.ready", "Hazır!")}</span>
      </div>
    </article>
  `;
}

function renderCompletedCard(entry) {
  const rawLink = entry.link || "";
  const safeLink = escapeHtml(rawLink);
  const encodedLink = encodeURIComponent(rawLink);
  const explorerLink = entry.transactionHash ? `${CURRENT_NETWORK.explorer}/tx/${entry.transactionHash}` : "";
  const hashLabel = entry.transactionHash ? escapeHtml(shorten(entry.transactionHash)) : t("feed.pending", "Bekliyor");
  const blockLabel = entry.blockNumber ? `#${entry.blockNumber}` : t("feed.new", "Yeni");
  return `
    <article class="feed-card feed-card--completed" data-feed-key="${entry.key}">
      <div class="feed-card__meta">
        <span class="feed-card__user">${escapeHtml(shorten(entry.user || "0x0"))}</span>
        ${explorerLink ? `<a href="${explorerLink}" target="_blank" rel="noopener">${hashLabel}</a>` : `<span>${hashLabel}</span>`}
      </div>
      <a class="feed-card__link" data-feed-link="${encodedLink}" href="${safeLink}" target="_blank" rel="noopener">${safeLink}</a>
      <div class="feed-card__details">${blockLabel}</div>
      <div class="feed-card__footer">
        <span class="feed-card__badge">✅ ${t("feed.completedBadge", "Tamamlandı")}</span>
        <div class="support-stats">
          <strong>${COMPLETION_THRESHOLD}/${COMPLETION_THRESHOLD}</strong>
          <span>${t("feed.supportLabel", "Destek")}</span>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/[&<>"]|'/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function updateBodyModalState() {
  document.body.classList.toggle("modal-open", modalStack.length > 0);
}

function safeParseStorage(value, fallback = {}) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : fallback;
  } catch (error) {
    console.warn("storage parse error", error);
    return fallback;
  }
}

function sanitizeSupportCounts(map) {
  if (!map || typeof map !== "object") return {};
  return Object.entries(map).reduce((acc, [key, value]) => {
    if (!key) return acc;
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      acc[key] = Math.min(COMPLETION_THRESHOLD, Math.max(0, Math.floor(numeric)));
    }
    return acc;
  }, {});
}

function sanitizeCompletedLinks(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const sanitized = [];
  list.forEach((item) => {
    const entry = normalizeLinkEntry(item);
    if (!entry || seen.has(entry.key)) return;
    const completedAt = Number(item?.completedAt || Date.now());
    sanitized.push({ ...entry, completedAt: Number.isFinite(completedAt) ? completedAt : Date.now() });
    seen.add(entry.key);
  });
  sanitized.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  return sanitized.slice(0, MAX_COMPLETED_HISTORY);
}

function initializeFeedState() {
  state.completedLinks = sanitizeCompletedLinks(storedCompletedLinks);
  if (Array.isArray(state.completedLinks)) {
    state.completedLinks.forEach((entry) => {
      if (entry?.key) {
        state.supportCounts[entry.key] = COMPLETION_THRESHOLD;
      }
    });
    persistSupportCounts();
  }
  localStorage.removeItem("celo-engage-link-clickers");
  updateCompletedView();
  updateLinkBadge();
}

function normalizeLinkEntry(entry, options = {}) {
  if (!entry) return null;
  const rawLink = typeof entry.link === "string" ? entry.link.trim() : "";
  const transactionHash = entry.transactionHash ? String(entry.transactionHash) : null;
  const key = getLinkKey(rawLink, transactionHash);
  if (!key) return null;
  const blockNumber = Number(entry.blockNumber);
  const addedAt = Number(entry.addedAt || Date.now());
  return {
    key,
    user: entry.user || entry.address || "0x0",
    link: rawLink,
    transactionHash,
    blockNumber: Number.isFinite(blockNumber) && blockNumber > 0 ? blockNumber : 0,
    addedAt: Number.isFinite(addedAt) ? addedAt : Date.now(),
    isNew: Boolean(options.isNew || entry.isNew),
  };
}

function getLinkKey(link, hash) {
  if (hash) {
    return String(hash).toLowerCase();
  }
  const normalized = normalizeLink(link);
  return normalized ? encodeURIComponent(normalized) : "";
}

function normalizeLink(link) {
  if (typeof link !== "string") return "";
  const trimmed = link.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    return parsed.toString().toLowerCase();
  } catch (error) {
    return trimmed.toLowerCase();
  }
}

function applyTheme() {
  state.theme = "golden";
  if (elements.app) {
    elements.app.dataset.theme = "golden";
  }
  localStorage.setItem("celo-engage-theme", "golden");
}

function getSectionLabel(section) {
  if (!section) return "";
  const heading = section.querySelector(".section-header h2");
  if (heading?.textContent?.trim()) {
    return heading.textContent.trim();
  }
  if (section.dataset?.sectionLabel) {
    return section.dataset.sectionLabel;
  }
  return section.id || "";
}

function updateBreadcrumb(sectionName) {
  if (!elements.breadcrumb) return;
  const navButtons = Array.from(elements.navButtons || []);
  const homeButton = navButtons.find((btn) => btn.dataset?.target === "home");
  const homeLabel = homeButton?.textContent?.trim() || homeButton?.dataset?.sectionLabel || "Home";
  const currentLabel = sectionName?.trim() || homeLabel;
  elements.breadcrumb.innerHTML = `<span>🏠 ${homeLabel}</span><span class="separator">/</span><span>${currentLabel}</span>`;
}

function refreshBreadcrumb() {
  const activeSection = document.getElementById(activeSectionId) || (elements.sections && elements.sections[0]);
  updateBreadcrumb(getSectionLabel(activeSection));
}

function showSection(sectionId, options = {}) {
  if (!sectionId) return;
  const { labelOverride, suppressBreadcrumb, updateUrl = true } = options;
  const sections = Array.from(elements.sections || []);
  let targetSection = null;
  sections.forEach((section) => {
    const isTarget = section.id === sectionId;
    section.classList.toggle("active", isTarget);
    if (isTarget) {
      targetSection = section;
      section.style.display = "flex";
      section.classList.remove("fade-in");
      void section.offsetWidth;
      section.classList.add("fade-in");
    } else {
      section.style.display = "none";
      section.classList.remove("fade-in");
    }
  });

  Array.from(elements.navButtons || []).forEach((btn) => {
    const isTarget = btn.dataset?.target === sectionId;
    btn.classList.toggle("active", isTarget);
  });

  activeSectionId = sectionId;

  if (sectionId === "home") {
    markLinksAsSeen();
    requestAnimationFrame(() => {
      applyLinkHighlights();
    });
  }

  if (updateUrl && window.location.hash !== `#${sectionId}`) {
    history.replaceState(null, "", `#${sectionId}`);
  }

  if (!suppressBreadcrumb) {
    const label = labelOverride || getSectionLabel(targetSection);
    updateBreadcrumb(label);
  }

  if (targetSection) {
    requestAnimationFrame(() => {
      targetSection.focus({ preventScroll: true });
    });
  }
}

function setupNavigation() {
  const sections = Array.from(elements.sections || []);
  if (!sections.length) return;

  sections.forEach((section) => {
    if (!section.hasAttribute("tabindex")) {
      section.setAttribute("tabindex", "-1");
    }
  });

  const sectionButtons = Array.from(elements.navButtons || []).filter((btn) => btn.dataset?.target);

  sectionButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const target = btn.dataset?.target;
      if (!target) return;
      const section = document.getElementById(target);
      const label = getSectionLabel(section) || btn.textContent?.trim();
      showSection(target, { labelOverride: label });
    });
  });

  const initialHash = window.location.hash ? window.location.hash.replace("#", "") : "";
  const hashSection = initialHash ? document.getElementById(initialHash) : null;
  if (hashSection) {
    showSection(initialHash, {
      labelOverride: getSectionLabel(hashSection),
      updateUrl: false,
    });
    return;
  }

  const initialSection = document.querySelector(".section.active") || sections[0];
  if (initialSection) {
    showSection(initialSection.id, {
      labelOverride: getSectionLabel(initialSection),
      updateUrl: false,
    });
  }
}

function setupMiniAppDirectory() {
  setupMiniAppFilters();
  loadMiniAppsData();
}

function setupMiniAppFilters() {
  if (elements.miniAppSearch) {
    elements.miniAppSearch.addEventListener("input", (event) => {
      state.miniAppFilters.search = event.target.value || "";
      applyMiniAppFilters();
    });
  }

  if (elements.miniAppCategories) {
    const categoryButtons = elements.miniAppCategories.querySelectorAll("[data-category]");
    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const category = button.dataset.category || "all";
        state.miniAppFilters.category = category;
        setActiveMiniAppCategory(category);
        applyMiniAppFilters();
      });
    });
  }

  setActiveMiniAppCategory(state.miniAppFilters.category);
}

function setActiveMiniAppCategory(category) {
  const normalized =
    MINI_APP_CATEGORIES.find((cat) => cat.toLowerCase() === String(category).toLowerCase()) || "all";
  if (elements.miniAppCategories) {
    const categoryButtons = elements.miniAppCategories.querySelectorAll("[data-category]");
    categoryButtons.forEach((button) => {
      const isActive = button.dataset.category === normalized;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
  }
  state.miniAppFilters.category = normalized;
}

async function loadMiniAppsData() {
  if (!elements.miniAppGrid) return;
  try {
    const response = await fetch("./src/data/celoMiniApps.json");
    if (!response.ok) {
      throw new Error(`Failed to load mini app data: ${response.status}`);
    }
    const payload = await response.json();
    const parsed = Array.isArray(payload) ? payload.map((item) => sanitizeMiniApp(item)).filter(Boolean) : [];
    state.miniApps = parsed;
    updateMiniAppsModuleItems(parsed);
    applyMiniAppFilters();
  } catch (error) {
    console.error("❌ [MiniApps] Failed to load directory", error);
    state.miniApps = [];
    state.filteredMiniApps = [];
    renderMiniApps();
    if (elements.miniAppEmpty) {
      elements.miniAppEmpty.textContent = t("home.error", "Mini apps could not be loaded. Try again later.");
      elements.miniAppEmpty.hidden = false;
    }
  }
}

function sanitizeMiniApp(entry) {
  if (!entry) return null;
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  const description = typeof entry.description === "string" ? entry.description.trim() : "";
  const author = typeof entry.author === "string" ? entry.author.trim() : "";
  const farcasterUrl = typeof entry.farcasterUrl === "string" ? entry.farcasterUrl.trim() : "";
  const rawCategory = typeof entry.category === "string" ? entry.category.trim() : "";
  const categoryMatch = MINI_APP_CATEGORIES.find(
    (cat) => cat.toLowerCase() === rawCategory.toLowerCase()
  );
  const category = categoryMatch || "Tools";
  const iconUrl =
    typeof entry.iconUrl === "string" && entry.iconUrl.trim()
      ? entry.iconUrl.trim()
      : MINI_APP_ICON_PLACEHOLDER;
  if (!name || !farcasterUrl) return null;
  return {
    name,
    description,
    author,
    farcasterUrl,
    category,
    iconUrl,
  };
}

function applyMiniAppFilters() {
  const { search = "", category = "all" } = state.miniAppFilters || {};
  const query = search.trim().toLowerCase();
  const selectedCategory =
    MINI_APP_CATEGORIES.find((cat) => cat.toLowerCase() === String(category).toLowerCase()) || "all";
  const filtered = (state.miniApps || []).filter((app) => {
    if (!app) return false;
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    const searchable = `${app.name} ${app.description}`.toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    return matchesCategory && matchesSearch;
  });
  state.filteredMiniApps = filtered;
  setActiveMiniAppCategory(selectedCategory);
  renderMiniApps(filtered);
}

function renderMiniApps(list = state.filteredMiniApps || []) {
  if (!elements.miniAppGrid) return;
  if (!Array.isArray(list) || list.length === 0) {
    elements.miniAppGrid.innerHTML = "";
    if (elements.miniAppEmpty) {
      elements.miniAppEmpty.textContent = t("home.empty", "No mini apps match your search yet.");
      elements.miniAppEmpty.hidden = false;
    }
    return;
  }

  if (elements.miniAppEmpty) {
    elements.miniAppEmpty.hidden = true;
  }

  const cards = list.map(renderMiniAppCard).join("");
  elements.miniAppGrid.innerHTML = cards;
}

function renderMiniAppCard(app) {
  if (!app) return "";
  const name = escapeHtml(app.name);
  const author = escapeHtml(app.author || "");
  const description = escapeHtml(app.description || "");
  const category = escapeHtml(app.category || "");
  const farcasterUrl = escapeHtml(app.farcasterUrl || "#");
  const ctaLabel = t("home.openButton", "Open on Farcaster");

  return `
    <article class="miniapp-card">
      <div class="miniapp-card__header">
        <p class="miniapp-card__title">${name}</p>
        ${author ? `<p class="miniapp-card__author">${author}</p>` : ""}
      </div>
      <p class="miniapp-card__description">${description}</p>
      <div class="miniapp-card__meta">
        <span class="miniapp-category-badge"># ${category}</span>
        <a class="primary-btn" href="${farcasterUrl}" target="_blank" rel="noopener">${ctaLabel}</a>
      </div>
    </article>
  `;
}

function setupEcosystemModules() {
  renderEcosystemModuleCards();

  if (elements.ecosystemModuleGrid) {
    elements.ecosystemModuleGrid.addEventListener("click", (event) => {
      const target = event.target.closest("[data-module-key]");
      if (!target) return;
      selectEcosystemModule(target.dataset.moduleKey);
    });
  }

  if (elements.ecosystemSidebarButtons?.length) {
    elements.ecosystemSidebarButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const { moduleKey } = button.dataset;
        if (moduleKey) {
          selectEcosystemModule(moduleKey);
        }
      });
    });
  }

  setActiveEcosystemModule(state.activeEcosystemModule);
}

function renderEcosystemModuleCards() {
  if (!elements.ecosystemModuleGrid) return;
  const cards = Object.values(CELO_ECOSYSTEM_MODULES).map((module) => {
    const label = escapeHtml(module.label || "");
    const title = escapeHtml(module.title || "");
    const description = escapeHtml(module.description || "");
    const isActive = state.activeEcosystemModule === module.key;

    return `
      <article class="module-card ${isActive ? "active" : ""}" data-module-key="${module.key}">
        <p class="module-card__label">${label}</p>
        <h3 class="module-card__title">${title}</h3>
        <p class="module-card__description">${description}</p>
        <button type="button" class="secondary-btn module-card__cta" data-module-key="${module.key}">
          View links
        </button>
      </article>
    `;
  });

  elements.ecosystemModuleGrid.innerHTML = cards.join("");
}

function selectEcosystemModule(moduleKey) {
  const didUpdate = setActiveEcosystemModule(moduleKey);
  if (didUpdate) {
    scrollToEcosystemSection();
  }
}

function scrollToEcosystemSection() {
  const section = document.getElementById("ecosystem-modules") || elements.ecosystemSection;
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setActiveEcosystemModule(key) {
  if (!key || !CELO_ECOSYSTEM_MODULES[key]) return false;
  state.activeEcosystemModule = key;

  const cards = elements.ecosystemModuleGrid?.querySelectorAll("[data-module-key]") || [];
  cards.forEach((card) => {
    card.classList.toggle("active", card.dataset.moduleKey === key);
  });

  renderEcosystemDetail(CELO_ECOSYSTEM_MODULES[key]);

  return true;
}

function renderEcosystemDetail(module) {
  if (!module || !elements.ecosystemDetailList) return;
  if (elements.ecosystemDetailLabel) {
    elements.ecosystemDetailLabel.textContent = module.label || "";
  }
  if (elements.ecosystemDetailTitle) {
    elements.ecosystemDetailTitle.textContent = module.title || "";
  }
  if (elements.ecosystemDetailDescription) {
    elements.ecosystemDetailDescription.textContent = module.description || "";
  }

  if (!module.items?.length) {
    elements.ecosystemDetailList.innerHTML = `<p class="ecosystem-detail__description">Links coming soon.</p>`;
    return;
  }

  elements.ecosystemDetailList.innerHTML = module.items.map(renderEcosystemLink).join("");
}

function renderEcosystemLink(item) {
  if (!item) return "";
  const title = escapeHtml(item.label || "View link");
  const url = escapeHtml(item.url || "#");
  const description = escapeHtml(item.description || "");
  const actionLabel = escapeHtml(item.actionLabel || "Open");

  return `
    <a class="ecosystem-link" href="${url}" target="_blank" rel="noopener">
      <div class="ecosystem-link__meta">
        <p class="ecosystem-link__title">${title}</p>
        ${description ? `<p class="ecosystem-link__description">${description}</p>` : ""}
      </div>
      <span class="ecosystem-link__action">${actionLabel}</span>
    </a>
  `;
}

function updateMiniAppsModuleItems(miniApps = []) {
  const miniAppModule = CELO_ECOSYSTEM_MODULES.miniApps;
  if (!miniAppModule) return;

  const curated = (miniApps || [])
    .filter(Boolean)
    .slice(0, 5)
    .map((app) => ({
      label: app.name,
      url: app.farcasterUrl,
      description: app.description,
      actionLabel: t("home.openButton", "Open on Farcaster"),
    }));

  if (curated.length) {
    miniAppModule.items = curated;
    if (state.activeEcosystemModule === miniAppModule.key) {
      renderEcosystemDetail(miniAppModule);
    }
  }
}

function setupTabs() {
  elements.donateTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      elements.donateTabs.forEach((t) => t.classList.toggle("active", t === tab));
      elements.donatePanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.content === target));
    });
  });
}

function setupLeaderboardTabs() {
  elements.leaderboardTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      elements.leaderboardTabs.forEach((t) => t.classList.toggle("active", t === tab));
      elements.leaderboardPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.content === target));
    });
  });
}

function setupForms() {
  elements.gmForm.addEventListener("submit", handleGMSubmit);
  elements.deployForm.addEventListener("submit", handleDeploySubmit);
  elements.donateCeloForm.addEventListener("submit", handleDonateCeloSubmit);
  elements.approveCusdForm.addEventListener("submit", handleApproveCusdSubmit);
  elements.donateCusdForm.addEventListener("submit", handleDonateCusdSubmit);
  if (elements.approveCeurForm) {
    elements.approveCeurForm.addEventListener("submit", handleApproveCeurSubmit);
  }
  if (elements.donateCeurForm) {
    elements.donateCeurForm.addEventListener("submit", handleDonateCeurSubmit);
  }
  if (elements.shareLinkForm) {
    elements.shareLinkForm.addEventListener("submit", handleShareLinkSubmit);
  }
  if (elements.sharePromptForm) {
    elements.sharePromptForm.addEventListener("submit", handleShareLinkSubmit);
  }
  elements.proposalForm.addEventListener("submit", handleProposalSubmit);
  elements.withdrawCeloForm.addEventListener("submit", (e) => handleWithdrawSubmit(e, "CELO"));
  elements.withdrawCusdForm.addEventListener("submit", (e) => handleWithdrawSubmit(e, "cUSD"));
  if (elements.withdrawCeurForm) {
    elements.withdrawCeurForm.addEventListener("submit", (e) => handleWithdrawSubmit(e, "cEUR"));
  }
  elements.usernameForm.addEventListener("submit", handleRegisterSubmit);
}

function setupDonateShortcuts() {
  if (!elements.donateQuickButtons?.length) return;
  elements.donateQuickButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const amount = Number(button.dataset.donateAmount || 0);
      if (!amount) return;
      if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
      if (amount < MIN_DONATION) return showToast("error", UI_MESSAGES.minDonation);
      try {
        await withButtonLoading(
          button,
          { loadingText: getLoadingText("donating", "Sending Donation…") },
          async () => {
            await doDonateCELO(amount);
            refreshAfterTransaction();
          }
        );
      } catch (error) {
        console.error("❌ [Donate] Quick donate failed", error);
        showToast("error", parseError(error));
      }
    });
  });
}

function setupConnectModal() {
  if (!elements.connectModal) return;
  elements.connectModal.setAttribute("aria-hidden", "true");
  const dismissButtons = elements.connectModal.querySelectorAll('[data-dismiss="connectModal"]');
  dismissButtons.forEach((btn) => btn.addEventListener("click", closeConnectModal));
}

function hasInjectedWalletProvider() {
  return Boolean(getInjectedProvider());
}

function getInjectedWalletConnector() {
  if (!getInjectedProvider()) {
    return null;
  }
  return connectWalletMetaMask;
}

function updateConnectOptionAvailability() {
  if (!elements.connectOptions?.length) return;
  const hasInjected = hasInjectedWalletProvider();
  elements.connectOptions.forEach((option) => {
    if (option.dataset.connectOption !== "metamask") return;
    option.disabled = !hasInjected;
    option.setAttribute("aria-disabled", hasInjected ? "false" : "true");
  });
}

function requestWalletConnection(trigger) {
  updateConnectOptionAvailability();
  openConnectModal(trigger);
}

async function startWalletConnection(trigger) {
  if (state.address) {
    toggleWalletDropdown(true);
    return;
  }
  const injectedConnector = getInjectedWalletConnector();
  if (injectedConnector) {
    let connected = false;
    try {
      await withButtonLoading(
        trigger,
        { loadingText: getLoadingText("connecting", "Connecting…"), keepWidth: true },
        async () => {
          await connectWallet(injectedConnector);
          connected = Boolean(state.address);
        }
      );
    } catch (error) {
      console.error("❌ [Wallet] Direct connect failed", error);
    }
    if (connected) {
      return;
    }
  }
  openConnectModal(trigger);
}

function setupWalletButtons() {
  updateConnectOptionAvailability();
  if (typeof window !== "undefined") {
    window.addEventListener("ethereum#initialized", updateConnectOptionAvailability, { once: true });
    setTimeout(updateConnectOptionAvailability, 1000);
  }

  elements.connectOptions.forEach((option) => {
    option.addEventListener("click", async () => {
      const type = option.dataset.connectOption;
      const connector = type === "walletconnect" ? connectWalletConnect : connectWalletMetaMask;
      try {
        await withButtonLoading(option, { loadingText: getLoadingText("connecting", "Connecting…"), keepWidth: true }, async () => {
          await connectWallet(connector);
        });
      } catch (error) {
        console.error("❌ [Wallet] Connection option failed", error);
      }
    });
  });

  if (elements.navbarConnectButton) {
    elements.navbarConnectButton.addEventListener("click", () => {
      requestWalletConnection(elements.navbarConnectButton);
    });
  }

  if (elements.disconnectWallet) {
    elements.disconnectWallet.addEventListener("click", async () => {
      const button = elements.disconnectWallet;
      try {
        await withButtonLoading(button, { loadingText: getLoadingText("pending", "Pending…") }, async () => {
          await disconnectWallet();
        });
        state.address = null;
        state.profile = null;
        state.isOwner = false;
        renderProfile(null);
        renderOwnerPanel();
        closeWalletDropdown();
        updateWalletUI();
        renderNetworkInfo(false);
        showToast("success", "Cüzdan bağlantısı kesildi.");
      } catch (error) {
        console.error("❌ [Wallet] Disconnect failed", error);
        showToast("error", parseError(error));
      }
    });
  }
}

function setupWalletDropdown() {
  if (!elements.walletPillButton || !elements.walletDropdown) return;
  elements.walletDropdown.setAttribute("aria-hidden", "true");
  elements.walletPillButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!state.address) {
      requestWalletConnection(elements.walletPillButton);
      return;
    }
    toggleWalletDropdown();
  });

  elements.walletPillButton.addEventListener("keydown", (event) => {
    const isActivateKey = event.key === "Enter" || event.key === " " || event.key === "Spacebar" || event.key === "Space";
    if (isActivateKey) {
      event.preventDefault();
      if (!state.address) {
        requestWalletConnection(elements.walletPillButton);
      } else {
        toggleWalletDropdown();
      }
    }
    if (state.address && event.key === "ArrowDown" && !elements.walletDropdown.classList.contains("open")) {
      event.preventDefault();
      openWalletDropdown();
    }
  });

  elements.walletDropdown.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeWalletDropdown({ restoreFocus: true });
    }
  });

  document.addEventListener("click", (event) => {
    if (!elements.walletDropdown?.classList.contains("open")) return;
    if (event.target.closest("#walletPill")) return;
    closeWalletDropdown();
  });
}

function openWalletDropdown() {
  if (!elements.walletDropdown || !elements.walletPillButton) return;
  elements.walletDropdown.classList.add("open");
  elements.walletDropdown.setAttribute("aria-hidden", "false");
  elements.walletPillButton.setAttribute("aria-expanded", "true");
  walletDropdownFocusCleanup?.();
  walletDropdownFocusCleanup = bindFocusTrap(elements.walletDropdown);
  const focusable = getFocusableElements(elements.walletDropdown);
  if (focusable[0]) {
    focusable[0].focus({ preventScroll: true });
  }
}

function toggleWalletDropdown(forceOpen = null) {
  if (!elements.walletDropdown || !elements.walletPillButton) return;
  const shouldOpen = forceOpen ?? !elements.walletDropdown.classList.contains("open");
  if (shouldOpen) {
    openWalletDropdown();
  } else {
    closeWalletDropdown({ restoreFocus: true });
  }
}

function closeWalletDropdown({ restoreFocus = false } = {}) {
  if (!elements.walletDropdown) return;
  elements.walletDropdown.classList.remove("open");
  elements.walletDropdown.setAttribute("aria-hidden", "true");
  if (walletDropdownFocusCleanup) {
    walletDropdownFocusCleanup();
    walletDropdownFocusCleanup = null;
  }
  if (elements.walletPillButton) {
    elements.walletPillButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) {
      elements.walletPillButton.focus({ preventScroll: true });
    }
  }
}

function setupEcosystemModal() {
  if (elements.ecosystemMore) {
    elements.ecosystemMore.addEventListener("click", openEcosystemModal);
  }
  if (!elements.ecosystemModal) return;
  elements.ecosystemModal.setAttribute("aria-hidden", "true");
  const dismissButtons = elements.ecosystemModal.querySelectorAll('[data-dismiss="ecosystemModal"]');
  dismissButtons.forEach((btn) => btn.addEventListener("click", closeEcosystemModal));
}

function openConnectModal(trigger) {
  if (!elements.connectModal) return;
  const defaultFocus = elements.connectOptions?.[0];
  openModalEl(elements.connectModal, { focusTarget: defaultFocus, trigger });
}

function closeConnectModal() {
  if (!elements.connectModal) return;
  closeModalEl(elements.connectModal);
}

function openEcosystemModal() {
  if (!elements.ecosystemModal) return;
  openModalEl(elements.ecosystemModal, { trigger: elements.ecosystemMore });
}

function closeEcosystemModal() {
  if (!elements.ecosystemModal) return;
  closeModalEl(elements.ecosystemModal);
}

function setupToastBridge() {
  registerToastHandler(({ type, message, hash, explorer }) => {
    showToast(type, message, hash, explorer);
    if (type === "success") {
      refreshAfterTransaction();
    }
  });
}

function updateAnalyticsLinks() {
  const analytics = getAnalyticsConfig();
  if (elements.duneLink) {
    elements.duneLink.href = analytics.dune;
  }
  if (elements.graphLink) {
    elements.graphLink.href = analytics.graph;
  }
}

async function connectWallet(connector) {
  try {
    const details = await connector();
    state.address = details.address;
    state.isOwner = state.address?.toLowerCase() === OWNER_ADDRESS.toLowerCase();
    updateWalletUI();
    renderNetworkInfo(true);
    closeConnectModal();
    showToast("success", "Cüzdan bağlandı.");
    await afterWalletConnected();
  } catch (error) {
    console.error("❌ [Wallet] Connection error", error);
    showToast("error", error?.message || UI_MESSAGES.error);
  }
}

async function afterWalletConnected() {
  await refreshProfile();
  await refreshGlobalStats();
  await refreshGovernance();
  await refreshLeaderboard();
  await refreshFeed({ showLoading: false });
  renderOwnerPanel();
}

function initWalletListeners() {
  onWalletEvent(async ({ event, address, valid }) => {
    switch (event) {
      case "connected":
        state.address = address;
        state.isOwner = state.address?.toLowerCase() === OWNER_ADDRESS.toLowerCase();
        updateWalletUI();
        renderNetworkInfo(true);
        closeConnectModal();
        await afterWalletConnected();
        break;
      case "accountsChanged":
        state.address = address;
        state.isOwner = state.address?.toLowerCase() === OWNER_ADDRESS.toLowerCase();
        updateWalletUI();
        await afterWalletConnected();
        break;
      case "disconnected": {
        const previousAddress = state.address || address;
        state.address = null;
        state.profile = null;
        state.isOwner = false;
        renderProfile(null);
        renderOwnerPanel();
        closeWalletDropdown();
        updateWalletUI();
        renderNetworkInfo(false);
        break;
      }
      case "networkChanged":
        renderNetworkInfo(valid);
        if (!valid) {
          showToast("error", UI_MESSAGES.wrongNetwork);
        } else {
          await refreshGlobalStats();
        }
        break;
      default:
        break;
    }
  });
}

function renderNetworkInfo(valid) {
  if (elements.walletNetworkName) {
    elements.walletNetworkName.textContent = CURRENT_NETWORK.name;
  }
  if (elements.walletStatusIcon) {
    const online = Boolean(valid && state.address);
    elements.walletStatusIcon.textContent = "•";
    elements.walletStatusIcon.setAttribute("data-status", online ? "online" : "offline");
    elements.walletStatusIcon.setAttribute(
      "aria-label",
      online ? t("network.online", "Online") : t("network.offline", "Offline")
    );
  }
}

function updateWalletUI() {
  const connected = Boolean(state.address);
  if (elements.walletActions) {
    elements.walletActions.classList.toggle("is-connected", connected);
    elements.walletActions.classList.toggle("is-disconnected", !connected);
  }
  if (elements.navbarConnectButton) {
    elements.navbarConnectButton.hidden = connected;
    elements.navbarConnectButton.setAttribute("aria-hidden", connected ? "true" : "false");
  }
  if (elements.walletPill) {
    elements.walletPill.hidden = !connected;
    elements.walletPill.setAttribute("aria-hidden", connected ? "false" : "true");
  }
  if (elements.walletAddressLabel) {
    elements.walletAddressLabel.textContent = connected ? shorten(state.address) : t("wallet.statusIdle", "Wallet");
  }
  if (elements.walletPillButton) {
    const expanded = connected && elements.walletDropdown?.classList.contains("open") ? "true" : "false";
    elements.walletPillButton.setAttribute("aria-expanded", expanded);
    elements.walletPillButton.setAttribute("aria-haspopup", connected ? "true" : "dialog");
    elements.walletPillButton.classList.toggle("is-disconnected", !connected);
  }
  if (!connected) {
    closeWalletDropdown();
  }
}

function showToast(type, message, hash, explorer) {
  if (!message) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type || "info"}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.innerHTML = `
    <strong>${message}</strong>
    ${hash ? `<span class="hash"><a href="${explorer || `${CURRENT_NETWORK.explorer}/tx/${hash}`}" target="_blank" rel="noopener">${shorten(hash)}</a></span>` : ""}
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

function shorten(value, start = 6, end = 4) {
  if (!value) return "—";
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

async function handleGMSubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const message = document.getElementById("gmMessage").value.trim();
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("sendingGM", "Sending GM…") },
      async () => {
        await doGM(message);
        document.getElementById("gmMessage").value = "";
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("❌ [GM] Submission failed", error);
    showToast("error", parseError(error));
  }
}

async function handleDeploySubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const name = document.getElementById("deployName").value.trim();
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("deploying", "Deploying…") },
      async () => {
        await doDeploy(name);
        document.getElementById("deployName").value = "";
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("❌ [Deploy] Submission failed", error);
    showToast("error", parseError(error));
  }
}

async function handleDonateCeloSubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const amount = Number(document.getElementById("celoAmount").value || 0);
  if (amount < MIN_DONATION) return showToast("error", UI_MESSAGES.minDonation);
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("donating", "Sending Donation…") },
      async () => {
        await doDonateCELO(amount);
        document.getElementById("celoAmount").value = "";
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("❌ [Donate] CELO donation error", error);
    showToast("error", parseError(error));
  }
}

async function handleApproveCusdSubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const amount = Number(document.getElementById("cusdApproveAmount").value || 0);
  if (amount < MIN_DONATION) return showToast("error", UI_MESSAGES.minDonation);
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("approving", "Approving…") },
      async () => {
        await doApproveCUSD(amount);
      }
    );
  } catch (error) {
    console.error("❌ [Donate] cUSD approval error", error);
    showToast("error", parseError(error));
  }
}

async function handleDonateCusdSubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const amount = Number(document.getElementById("cusdAmount").value || 0);
  if (amount < MIN_DONATION) return showToast("error", UI_MESSAGES.minDonation);
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("donating", "Sending Donation…") },
      async () => {
        await doDonateCUSD(amount);
        document.getElementById("cusdAmount").value = "";
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("❌ [Donate] cUSD donation error", error);
    showToast("error", parseError(error));
  }
}

async function handleApproveCeurSubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const amount = Number(document.getElementById("ceurApproveAmount").value || 0);
  if (amount < MIN_DONATION) return showToast("error", UI_MESSAGES.minDonation);
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("approving", "Approving…") },
      async () => {
        await doApproveCEUR(amount);
      }
    );
  } catch (error) {
    console.error("❌ [Donate] cEUR approval error", error);
    showToast("error", parseError(error));
  }
}

async function handleDonateCeurSubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const amount = Number(document.getElementById("ceurAmount").value || 0);
  if (amount < MIN_DONATION) return showToast("error", UI_MESSAGES.minDonation);
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("donating", "Sending Donation…") },
      async () => {
        await doDonateCEUR(amount);
        document.getElementById("ceurAmount").value = "";
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("❌ [Donate] cEUR donation error", error);
    showToast("error", parseError(error));
  }
}

async function handleShareLinkSubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const form = event.currentTarget;
  const input = form?.querySelector("[data-share-input]") || elements.shareLinkInput || elements.sharePromptInput;
  const rawUrl = input?.value.trim() || "";
  let sanitizedUrl = null;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") {
      return showToast("error", UI_MESSAGES.invalidLink);
    }
    sanitizedUrl = parsed.toString();
  } catch (error) {
    return showToast("error", UI_MESSAGES.invalidLink);
  }
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("sharingLink", "Submitting Link…") },
      async () => {
        await doShareLink(sanitizedUrl);
        if (input) {
          input.value = "https://";
        }
        closeShareModal();
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("❌ [Link] Share action failed", error);
    showToast("error", parseError(error));
  }
}

async function handleProposalSubmit(event) {
  event.preventDefault();
  const { address } = getWalletDetails();
  if (!address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const isOwnerWallet = address.toLowerCase() === OWNER_ADDRESS.toLowerCase();
  state.isOwner = isOwnerWallet;
  renderGovernanceAccess();
  if (!isOwnerWallet) return showToast("error", UI_MESSAGES.ownerOnly);
  const title = document.getElementById("proposalTitle").value.trim();
  const description = document.getElementById("proposalDescription").value.trim();
  const link = document.getElementById("proposalLink").value.trim();
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("creatingProposal", "Submitting Proposal…") },
      async () => {
        await govCreateProposal(title, description, link);
        event.target.reset();
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("❌ [Governance] Proposal submission failed", error);
    showToast("error", parseError(error));
  }
}

async function handleWithdrawSubmit(event, token) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  if (!state.isOwner) return showToast("error", UI_MESSAGES.ownerOnly);
  if (!WITHDRAW_TOKENS.has(token)) {
    console.warn("Withdraw attempted with unsupported token", token);
    return showToast("error", UI_MESSAGES.error);
  }
  const amountInput = event.target.querySelector("input");
  const rawAmount = amountInput?.value?.trim() || "";
  const amountValue = Number(rawAmount);
  if (!rawAmount || Number.isNaN(amountValue) || amountValue <= 0) {
    return showToast("error", UI_MESSAGES.invalidAmount);
  }
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("withdrawing", "Processing Withdrawal…") },
      async () => {
        await withdrawDonations(token, rawAmount);
        if (amountInput) amountInput.value = "";
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("❌ [Donate] Withdraw failed", error);
    showToast("error", parseError(error));
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const username = elements.usernameInput.value.trim();
  if (!username) return;
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("registering", "Saving Profile…") },
      async () => {
        await registerProfile(username);
        closeUsernameModal();
        await refreshProfile();
      }
    );
  } catch (error) {
    console.error("❌ [Profile] Registration flow failed", error);
    showToast("error", parseError(error));
  }
}

function refreshAfterTransaction() {
  return Promise.all([
    refreshProfile(),
    refreshGlobalStats(),
    refreshGovernance(),
    refreshLeaderboard(),
  ]);
}

async function refreshProfile() {
  if (!state.address) {
    renderProfile(null);
    renderDeployments([]);
    return;
  }
  try {
    const [profile, deployments] = await Promise.all([
      loadProfile(state.address),
      loadUserDeployments(state.address),
    ]);
    state.profile = profile;
    renderProfile(profile);
    renderDeployments(deployments);
    if (!profile?.exists) {
      openUsernameModal();
    } else {
      closeUsernameModal();
    }
  } catch (error) {
    console.error("❌ [Profile] Failed to refresh profile", error);
    state.profile = { address: state.address };
    renderProfile(state.profile);
  }
}

async function refreshGlobalStats() {
  try {
    const stats = await loadGlobalStats();
    state.global = stats;
    renderGlobalCounters(stats);
  } catch (error) {
    console.error("❌ [Hub] Failed to refresh global stats", error);
  }
}

async function refreshFeed({ showLoading = true } = {}) {
  if (showLoading) {
    toggleSkeleton(elements.feedSkeleton, true);
    toggleFeedSpinner(true);
  }
  setFeedBusy(true);
  try {
    const links = await loadRecentLinks(40);
    mergeLinkEntries(links, { mode: "replace", trackNew: false });
    renderRecentLinks();
    markLinksAsSeen();
  } catch (error) {
    console.error("❌ [Link] Failed to refresh feed", error);
    if (elements.linkFeed) {
      elements.linkFeed.innerHTML = `<p class="feed-empty feed-empty--error">${t(
        "feed.error",
        "Bağlantılar yüklenemedi. Lütfen tekrar deneyin."
      )}</p>`;
    }
    showToast("error", t("feed.errorToast", "Community links could not be loaded. Try again soon."));
  } finally {
    if (showLoading) {
      toggleSkeleton(elements.feedSkeleton, false);
      toggleFeedSpinner(false);
    }
    setFeedBusy(false);
  }
}

function setupLinkLiveUpdates() {
  cleanupLinkLiveUpdates();
  try {
    const contract = getLinkEventContract();
    if (contract?.on) {
      linkEventContract = contract;
      contract.on("LinkShared", handleLinkSharedEvent);
      const provider = contract.provider;
      const ws = provider?._websocket;
      ws?.on?.("error", (error) => {
        console.error("❌ [Link] Event provider error", error);
      });
      ws?.on?.("close", () => {
        console.warn("⚠️ [Link] Event provider closed. Rebinding listener.");
        setupLinkLiveUpdates();
      });
    } else {
      linkEventContract = null;
      console.warn("Link contract does not support event subscriptions");
    }
  } catch (error) {
    console.error("❌ [Link] Failed to initialize live updates", error);
  }
}

function cleanupLinkLiveUpdates() {
  if (!linkEventContract) return;
  try {
    linkEventContract.removeAllListeners?.("LinkShared");
  } catch (error) {
    console.warn("link listener cleanup error", error);
  }
  linkEventContract = null;
}

function handleLinkSharedEvent(user, link, event) {
  try {
    const entry = normalizeLinkEntry({
      user,
      link,
      transactionHash: event?.transactionHash,
      blockNumber: event?.blockNumber,
      addedAt: Date.now(),
      isNew: true,
    });
    if (!entry) return;
    if (entry.key && liveLinkCache.has(entry.key)) {
      return;
    }
    const newKeys = mergeLinkEntries([entry]);
    if (!newKeys.length) return;
    newKeys.forEach((key) => newLinkHighlights.add(key));
    if (activeSectionId !== "home") {
      state.unseenLinkCount += newKeys.length;
      updateLinkBadge();
    } else {
      markLinksAsSeen();
    }
    renderRecentLinks();
    showToast("info", t("feed.newLinkToast", "New link detected on-chain!"));
  } catch (error) {
    console.error("❌ [Link] Failed to handle live link", error);
  }
}

async function refreshGovernance() {
  toggleSkeleton(elements.governanceSkeleton, true);
  try {
    const data = await loadGovernance();
    state.governance = data;
    renderGovernance(data);
  } catch (error) {
    console.error("❌ [Governance] Failed to refresh proposals", error);
  } finally {
    toggleSkeleton(elements.governanceSkeleton, false);
  }
}

async function refreshLeaderboard() {
  try {
    const data = await loadLeaderboard();
    state.leaderboard = data;
    renderLeaderboard(data);
  } catch (error) {
    console.error("❌ [Leaderboard] Failed to refresh data", error);
  }
}

function renderProfile(profile) {
  if (!profile) {
    if (elements.profilePlaceholder) {
      elements.profilePlaceholder.hidden = false;
    }
    if (elements.profileAddressLabel) {
      elements.profileAddressLabel.hidden = true;
    }
    if (elements.profileAddressValue) {
      elements.profileAddressValue.textContent = "—";
    }
    return;
  }

  if (elements.profilePlaceholder) {
    elements.profilePlaceholder.hidden = true;
  }
  if (elements.profileAddressLabel) {
    elements.profileAddressLabel.hidden = false;
  }
  if (elements.profileAddressValue) {
    elements.profileAddressValue.textContent = shorten(profile.address);
    elements.profileAddressValue.title = profile.address;
  }
}

function renderBadgeDetails(profile = state.profile) {
  if (!elements.badgeDetails) return;
  if (elements.badgeShowcase) {
    elements.badgeShowcase.innerHTML = renderBadgeShowcase(profile);
  }

  const xp = profile?.totalXP || 0;
  const level = profile?.level || 0;
  const tier = profile?.tier || 0;
  if (!profile) {
    elements.badgeDetails.innerHTML = `
      <div class="badge-detail__header">
        <h3>${t("badge.detailTitle", "Rozet Durumu")}</h3>
        <p>${t("profile.empty", "Profil bilgisi bulunamadı.")}</p>
      </div>
    `;
    return;
  }

  elements.badgeDetails.innerHTML = `
    <div class="badge-detail__header">
      <h3>${t("badge.detailTitle", "Rozet Durumu")}</h3>
      <p class="badge-detail__stats">${t("profile.stats.xp", "XP")}: <strong>${formatNumber(xp)}</strong></p>
      <p class="badge-detail__stats">${t("profile.stats.level", "Seviye")}: <strong>${formatNumber(level)}</strong> · ${t("profile.stats.tier", "Tier")}: <strong>${formatNumber(tier)}</strong></p>
    </div>
    <ul class="badge-detail__list">
      <li>${t("badge.detailGm", "GM: +1 XP")}</li>
      <li>${t("badge.detailDeploy", "Deploy: +1 XP")}</li>
      <li>${t("badge.detailDonate", "Donate: +3 XP")}</li>
      <li>${t("badge.detailLink", "Link: +2 XP")}</li>
      <li>${t("badge.detailVote", "Vote: +1 XP")}</li>
    </ul>
  `;
}

function renderBadgeShowcase(profile = state.profile) {
  const badges = [
    { tier: 1, icon: "🥇" },
    { tier: 2, icon: "🥈" },
    { tier: 3, icon: "🥉" },
    { tier: 4, icon: "💎" },
    { tier: 5, icon: "🌟" },
  ];
  const tooltipTemplate = t("badge.tooltip", "Tier {tier} – Achieved after 3 uses of each feature.");
  return badges
    .map(({ tier, icon }) => {
      const active = profile?.tier >= tier ? "active" : "";
      const tooltip = tooltipTemplate.replace("{tier}", tier);
      const badgeLabel = t("profile.tierBadgeLabel", "Tier {value} Badge").replace("{value}", tier);
      const safeTooltip = escapeHtml(tooltip);
      return `
        <div class="badge-card ${active}" data-tooltip="${safeTooltip}" aria-label="${safeTooltip}">
          <span>${icon}</span>
          <p>${escapeHtml(badgeLabel)}</p>
        </div>
      `;
    })
    .join("");
}

function renderGlobalCounters(stats) {
  if (!stats || !elements.globalCounters) return;
  const counters = [
    { label: t("global.visitors", "Ziyaretçi"), value: stats.visitors },
    { label: t("global.gm", "GM"), value: stats.gm },
    { label: t("global.deploy", "Deploy"), value: stats.deploy },
    { label: t("global.link", "Link"), value: stats.links },
    { label: t("global.vote", "Vote"), value: stats.votes },
    { label: t("global.badge", "Badge"), value: stats.badges },
    { label: t("global.donor", "Donor"), value: stats.donors },
    { label: t("global.totalCelo", "Toplam CELO"), value: formatCurrency(stats.totalCelo) },
    { label: t("global.totalCusd", "Toplam cUSD"), value: formatCurrency(stats.totalCusd) },
  ];
  elements.globalCounters.innerHTML = counters
    .map(
      (counter) => `
      <div class="counter-card">
        <span>${counter.label}</span>
        <strong>${counter.value}</strong>
      </div>
    `
    )
    .join("");
}

function renderDeployments(contracts) {
  if (!elements.deployedContracts) return;
  if (!contracts?.length) {
    elements.deployedContracts.innerHTML = `<li>${t("deployments.empty", "Henüz deploy edilmiş kontrat yok.")}</li>`;
    return;
  }
  elements.deployedContracts.innerHTML = contracts
    .map((addr) => `<li><a href="${CURRENT_NETWORK.explorer}/address/${addr}" target="_blank" rel="noopener">${shorten(addr)}</a></li>`)
    .join("");
}

function renderGovernance({ active, completed }) {
  elements.activeProposals.innerHTML = active.length
    ? active.map(renderProposalCard).join("")
    : `<li>${t("governance.noneActive", "Aktif öneri yok.")}</li>`;
  elements.pastProposals.innerHTML = completed.length
    ? completed.map((proposal) => renderProposalCard(proposal, true)).join("")
    : `<li>${t("governance.noneCompleted", "Tamamlanan öneri yok.")}</li>`;
}

function renderProposalCard(proposal, readonly = false) {
  const now = Math.floor(Date.now() / 1000);
  const remaining = proposal.endTime > now ? formatDuration(proposal.endTime - now) : t("governance.completedLabel", "Tamamlandı");
  const votes = `${t("governance.voteYes", "✅ Evet")}: ${proposal.yesVotes} / ${t("governance.voteNo", "❌ Hayır")}: ${proposal.noVotes}`;
  const actions = readonly
    ? ""
    : `<div class="vote-actions">
        <button class="secondary-btn" data-proposal="${proposal.id}" data-vote="true">${t("governance.voteYesShort", "Evet")}</button>
        <button class="secondary-btn" data-proposal="${proposal.id}" data-vote="false">${t("governance.voteNoShort", "Hayır")}</button>
      </div>`;

  return `
    <li class="proposal-card">
      <header>
        <strong>${proposal.title}</strong>
        <small>${remaining}</small>
      </header>
      <p>${proposal.description}</p>
      ${proposal.link ? `<a href="${proposal.link}" target="_blank" rel="noopener">${t("governance.detail", "Detay")}</a>` : ""}
      <footer>
        <span>${votes}</span>
        ${actions}
      </footer>
    </li>
  `;
}

elements.activeProposals.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-proposal]");
  if (!button) return;
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const proposalId = Number(button.dataset.proposal);
  const support = button.dataset.vote === "true";
  try {
    await withButtonLoading(
      button,
      { loadingText: getLoadingText("voting", "Processing Vote…") },
      async () => {
        await govVote(proposalId, support);
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("❌ [Governance] Vote flow failed", error);
    showToast("error", parseError(error));
  }
});

function renderLeaderboard(data) {
  if (!data) return;
  renderLeaderboardList(elements.leaderboardLists.topLinks, data.links);
  renderLeaderboardList(elements.leaderboardLists.topGM, data.gm);
  renderLeaderboardList(elements.leaderboardLists.topDeploy, data.deploy);
  renderLeaderboardList(elements.leaderboardLists.topCelo, data.donors);
  renderLeaderboardList(elements.leaderboardLists.topCusd, data.cusdDonors);
  renderLeaderboardList(elements.leaderboardLists.topVotes, data.votes);
  renderLeaderboardList(elements.leaderboardLists.topBadges, data.badges);
}

function renderLeaderboardList(container, list) {
  if (!container) return;
  if (!list?.length) {
    container.innerHTML = `<li class="leaderboard-item">${t("leaderboard.empty", "Veri bulunamadı.")}</li>`;
    return;
  }
  container.innerHTML = list
    .map(
      (entry, index) => `
      <li class="leaderboard-item">
        <span>${index + 1}. ${shorten(entry.address)}</span>
        <strong>${formatNumber(entry.value)}</strong>
      </li>
    `
    )
    .join("");
}

function renderGovernanceAccess() {
  if (elements.proposalFormWrapper) {
    elements.proposalFormWrapper.hidden = !state.isOwner;
  }

  if (elements.proposalAccessMessage) {
    const ownerLabel = shorten(OWNER_ADDRESS);
    if (state.isOwner) {
      elements.proposalAccessMessage.textContent = t(
        "governance.createHelperReady",
        "Connected as owner. Submit a proposal for the community."
      );
    } else if (state.address) {
      elements.proposalAccessMessage.textContent = t(
        "governance.createHelperWrong",
        "Proposal creation is limited to the owner wallet ({address})."
      ).replace("{address}", ownerLabel);
    } else {
      elements.proposalAccessMessage.textContent = t(
        "governance.createHelper",
        "Connect with the owner wallet to open a new proposal for the community."
      );
    }
  }
}

function renderOwnerPanel() {
  if (!elements.ownerPanel) return;
  elements.ownerPanel.hidden = !state.isOwner;
  renderGovernanceAccess();
}

function formatNumber(value) {
  if (value === undefined || value === null) return "0";
  if (typeof value === "number") {
    return value.toLocaleString(getLocale(), { maximumFractionDigits: 2 });
  }
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString(getLocale(), { maximumFractionDigits: 2 });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(getLocale(), { maximumFractionDigits: 2 });
}

function getLocale() {
  return state.language === "en" ? "en-US" : "tr-TR";
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.max(0, Math.floor(seconds));
  if (hours > 0) {
    return state.language === "en"
      ? `${hours}h ${minutes}m`
      : `${hours} saat ${minutes} dk`;
  }
  if (minutes > 0) {
    return state.language === "en" ? `${minutes}m` : `${minutes} dk`;
  }
  return state.language === "en" ? `${secs}s` : `${secs} sn`;
}

function parseError(error) {
  if (!error) return UI_MESSAGES.error;
  const code = error?.code ?? error?.error?.code;
  const rawMessage = String(
    error?.data?.message || error?.error?.message || error?.message || error?.reason || ""
  ).trim();
  const normalized = rawMessage.toLowerCase();
  if (code === 4001 || normalized.includes("user rejected") || normalized.includes("user denied")) {
    return UI_MESSAGES.txRejected;
  }
  if (normalized.includes("insufficient funds") || normalized.includes("insufficient balance")) {
    return UI_MESSAGES.insufficientFunds || UI_MESSAGES.error;
  }
  if (normalized.includes("network") && normalized.includes("mismatch")) {
    return UI_MESSAGES.wrongNetwork;
  }
  return UI_MESSAGES.error;
}

function openUsernameModal(trigger) {
  if (!elements.usernameModal) return;
  openModalEl(elements.usernameModal, { focusTarget: elements.usernameInput, trigger });
}

function closeUsernameModal() {
  if (!elements.usernameModal) return;
  closeModalEl(elements.usernameModal);
}

async function loadInitialData() {
  await Promise.all([
    refreshGlobalStats(),
    refreshGovernance(),
    refreshLeaderboard(),
    loadMiniAppsData(),
  ]);
}

function initWebsocket() {
  try {
    if (wsProvider?.removeAllListeners) {
      wsProvider.removeAllListeners();
    }
    wsProvider = new ethers.providers.JsonRpcProvider(CURRENT_NETWORK.rpcUrl);
    subscribeToEvents();
  } catch (error) {
    console.error("❌ [Provider] Initialization error", error);
  }
}

function subscribeToEvents() {
  if (!wsProvider) return;
  const modules = [
    { contract: "PROFILE", events: ["UserRegistered", "ProfileUpdated", "UsernameUpdated"] },
    { contract: "GM", events: ["GMSent"] },
    { contract: "DONATE", events: ["DonationMade", "Withdrawn"] },
    { contract: "GOVERNANCE", events: ["ProposalCreated", "Voted", "ProposalExecuted"] },
    { contract: "BADGE", events: ["BadgeEarned", "LevelUp"] },
  ];

  modules.forEach(({ contract, events }) => {
    try {
      const address = MODULE_ADDRESS_BOOK[DEFAULT_NETWORK]?.[contract] || MODULES[contract]?.address;
      if (!address) return;
      const wsContract = new ethers.Contract(address, MODULES[contract].abi, wsProvider);
      events.forEach((eventName) => {
        wsContract.on(eventName, () => {
          console.info(`Event: ${eventName}`);
          refreshAfterTransaction();
        });
      });
    } catch (error) {
      console.error(`❌ [Provider] WS event subscribe error for ${contract}`, error);
    }
  });
}

export { state };
