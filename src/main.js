import { ethers } from "./utils/cdn-modules.js";
import {
  OWNER_ADDRESS,
  UI_MESSAGES,
  MIN_DONATION,
  CURRENT_NETWORK,
  MODULES,
  MODULE_ADDRESS_BOOK,
  DEFAULT_NETWORK,
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
import { syncVerifiedFlag, clearVerificationState, setVerifiedHuman } from "./services/identityService.js";
import { fetchTalentProfile } from "./services/talentService.js";
import { loadSelfStatus } from "./services/selfService.js";

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

const VERIFICATION_SUCCESS_MESSAGE = "✅ Verified with Self ID successfully.";
const VERIFICATION_FAILURE_MESSAGE = "⚠️ Verification failed. Try again.";
const WALLET_REQUIRED_MESSAGE = "Connect wallet to verify identity.";
const COMPLETION_THRESHOLD = 3;
const MAX_COMPLETED_HISTORY = 50;
const MINI_APP_CATEGORIES = ["all", "DeFi", "Growth", "Governance", "Tools", "Games"];
const MINI_APP_ICON_FALLBACK = "./assets/logo-celo-engage-hub.png";

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
  verifiedHuman: false,
  talentProfile: {
    status: "idle",
    data: null,
    error: null,
  },
  miniApps: [],
  filteredMiniApps: [],
  miniAppFilters: {
    search: "",
    category: "all",
  },
};

const elements = {
  app: document.getElementById("app"),
  navButtons: document.querySelectorAll(".nav-btn"),
  sections: document.querySelectorAll(".section"),
  breadcrumb: document.getElementById("breadcrumb"),
  navLanguageButton: document.getElementById("navLanguageButton"),
  connectTrigger: document.getElementById("connectTrigger"),
  connectModal: document.getElementById("connectModal"),
  connectOptions: document.querySelectorAll("[data-connect-option]"),
  disconnectWallet: document.getElementById("disconnectWallet"),
  walletPill: document.getElementById("walletPill"),
  walletPillButton: document.getElementById("walletPillButton"),
  walletDropdown: document.getElementById("walletDropdown"),
  walletStatusIcon: document.querySelector(".wallet-pill__status"),
  walletAddressLabel: document.getElementById("walletAddressLabel"),
  walletNetworkName: document.getElementById("walletNetworkName"),
  verifyHumanButton: document.getElementById("verifyHumanButton"),
  walletVerifiedBadge: document.getElementById("walletVerifiedBadge"),
  profileStats: document.getElementById("profileStats"),
  badgeStack: document.getElementById("badgeStack"),
  xpProgress: document.getElementById("xpProgress"),
  profileCopyButton: document.getElementById("profileCopyButton"),
  profileLevelLabel: document.getElementById("profileLevelLabel"),
  profileTierLabel: document.getElementById("profileTierLabel"),
  profileUsername: document.getElementById("profileUsername"),
  profileAddress: document.getElementById("profileAddress"),
  publicProfileLink: document.getElementById("publicProfileLink"),
  profileVerifiedBadge: document.getElementById("profileVerifiedBadge"),
  profileMetrics: document.getElementById("profileMetrics"),
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
  shareModal: document.getElementById("shareModal"),
  shareLinkForm: document.getElementById("shareLinkForm"),
  shareLinkInput: document.getElementById("shareLinkInput"),
  sharePromptLink: document.getElementById("sharePromptLink"),
  sharePromptForm: document.getElementById("sharePromptForm"),
  sharePromptInput: document.getElementById("sharePromptInput"),
  selfModal: document.getElementById("selfModal"),
  selfQrContainer: document.getElementById("selfQrContainer"),
  selfDeepLink: document.getElementById("selfDeepLink"),
  selfReferralLink: document.getElementById("selfReferralLink"),
  selfStatusMessage: document.getElementById("selfStatusMessage"),
  donateQuickButtons: document.querySelectorAll("[data-donate-amount]"),
  duneLink: document.getElementById("duneLink"),
  graphLink: document.getElementById("graphLink"),
  deployedContracts: document.getElementById("deployedContracts"),
  feedSkeleton: document.getElementById("feedSkeleton"),
  governanceSkeleton: document.getElementById("governanceSkeleton"),
  talentSection: document.getElementById("talent"),
  talentProfileCard: document.getElementById("talentProfileCard"),
  talentProfileContent: document.getElementById("talentProfileContent"),
  talentProfileLoading: document.getElementById("talentProfileLoading"),
  talentProfileError: document.getElementById("talentProfileError"),
  talentProfileRetry: document.getElementById("talentProfileRetry"),
  talentProfileName: document.getElementById("talentProfileName"),
  talentProfileUsername: document.getElementById("talentProfileUsername"),
  talentProfileBio: document.getElementById("talentProfileBio"),
  talentProfileSupporters: document.getElementById("talentProfileSupporters"),
  talentProfileBadges: document.getElementById("talentProfileBadges"),
  talentProfileLink: document.getElementById("talentProfileLink"),
  talentProfileImage: document.getElementById("talentProfileImage"),
  talentProfileErrorMessage: document.getElementById("talentProfileErrorMessage"),
  miniAppGrid: document.getElementById("miniAppGrid"),
  miniAppEmpty: document.getElementById("miniAppEmpty"),
  miniAppSearch: document.getElementById("miniAppSearch"),
  miniAppCategories: document.getElementById("miniAppCategories"),
};

let activeSectionId = null;
let wsProvider = null;
let linkEventContract = null;

let isVerifyingHuman = false;
let talentProfileAbortController = null;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';
const modalFocusState = new WeakMap();
const modalStack = [];
let walletDropdownFocusCleanup = null;

const TALENT_AVATAR_FALLBACK = "https://storage.googleapis.com/ceibalancer/celo-icon.png";

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
  setupIdentityVerification();
  initSelfVerificationUI();
  setupProfileModal();
  setupUsernameModal();
  setupEcosystemModal();
  setupTalentProfile();
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
  renderTalentProfileState();
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
  if (elements.profileCopyButton) {
    elements.profileCopyButton.addEventListener("click", handleProfileAddressCopy);
  }

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

function setupTalentProfile() {
  if (!elements.talentProfileCard) return;

  if (elements.talentProfileRetry) {
    elements.talentProfileRetry.addEventListener("click", () => {
      refreshTalentProfile({ keepPrevious: false });
    });
  }

  state.talentProfile = {
    status: "loading",
    data: null,
    error: null,
  };
  renderTalentProfileState();
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
  const normalized = MINI_APP_CATEGORIES.includes(category) ? category : "all";
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
  const category = MINI_APP_CATEGORIES.includes(entry.category) ? entry.category : "Tools";
  const iconUrl = typeof entry.iconUrl === "string" && entry.iconUrl.trim() ? entry.iconUrl.trim() : MINI_APP_ICON_FALLBACK;
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
  const selectedCategory = MINI_APP_CATEGORIES.includes(category) ? category : "all";
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
  const icon = escapeHtml(app.iconUrl || MINI_APP_ICON_FALLBACK);
  const farcasterUrl = escapeHtml(app.farcasterUrl || "#");
  const ctaLabel = t("home.openButton", "Open on Farcaster");

  return `
    <article class="miniapp-card">
      <div class="miniapp-card__header">
        <img class="miniapp-card__icon" src="${icon}" alt="${name} icon" loading="lazy" decoding="async" />
        <div>
          <p class="miniapp-card__title">${name}</p>
          <p class="miniapp-card__author">${author || ""}</p>
        </div>
      </div>
      <p class="miniapp-card__description">${description}</p>
      <div class="miniapp-card__meta">
        <span class="miniapp-category-badge"># ${category}</span>
        <a class="primary-btn" href="${farcasterUrl}" target="_blank" rel="noopener">${ctaLabel}</a>
      </div>
    </article>
  `;
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

function setupWalletButtons() {
  updateConnectOptionAvailability();
  if (typeof window !== "undefined") {
    window.addEventListener("ethereum#initialized", updateConnectOptionAvailability, { once: true });
    setTimeout(updateConnectOptionAvailability, 1000);
  }

  if (elements.connectTrigger) {
    elements.connectTrigger.addEventListener("click", async () => {
      if (state.address) {
        toggleWalletDropdown(true);
        return;
      }
      const injectedConnector = getInjectedWalletConnector();
      if (injectedConnector) {
        let connected = false;
        try {
          await withButtonLoading(
            elements.connectTrigger,
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
      openConnectModal(elements.connectTrigger);
    });
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

  if (elements.disconnectWallet) {
    elements.disconnectWallet.addEventListener("click", async () => {
      const button = elements.disconnectWallet;
      const previousAddress = state.address;
      try {
        await withButtonLoading(button, { loadingText: getLoadingText("pending", "Pending…") }, async () => {
          await disconnectWallet();
        });
        state.address = null;
        state.profile = null;
        state.isOwner = false;
        state.verifiedHuman = false;
        clearVerificationState(previousAddress);
        closeSelfVerificationModal();
        renderProfile(null);
        renderOwnerPanel();
        closeWalletDropdown();
        updateWalletUI();
        renderNetworkInfo(false);
        renderVerificationState();
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
    toggleWalletDropdown();
  });

  elements.walletPillButton.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar" || event.key === "Space") {
      event.preventDefault();
      toggleWalletDropdown();
    }
    if (event.key === "ArrowDown" && !elements.walletDropdown.classList.contains("open")) {
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

function setupIdentityVerification() {
  if (elements.verifyHumanButton) {
    elements.verifyHumanButton.addEventListener("click", handleVerifyHumanClick);
  }
  renderVerificationState();
}

function syncCurrentVerification() {
  isVerifyingHuman = false;
  if (!state.address) {
    state.verifiedHuman = false;
    renderVerificationState();
    return;
  }
  const verified = syncVerifiedFlag(state.address);
  state.verifiedHuman = verified;
  renderVerificationState();
}

function updateVerificationBadge(element, verified, hasWallet) {
  if (!element) return;
  if (verified) {
    element.textContent = "Verified with Self";
    element.classList.add("status-badge--verified");
    element.classList.remove("status-badge--unverified");
    element.removeAttribute("hidden");
  } else {
    element.textContent = "Not verified";
    element.classList.remove("status-badge--verified");
    element.classList.add("status-badge--unverified");
    if (hasWallet) {
      element.removeAttribute("hidden");
    } else {
      element.setAttribute("hidden", "true");
    }
  }
}

function renderVerificationState() {
  const hasWallet = Boolean(state.address);
  const verified = Boolean(hasWallet && state.verifiedHuman);
  if (elements.verifyHumanButton) {
    if (isVerifyingHuman && !verified) {
      elements.verifyHumanButton.textContent = "Verifying…";
      elements.verifyHumanButton.disabled = true;
      elements.verifyHumanButton.setAttribute("aria-busy", "true");
      elements.verifyHumanButton.classList.add("is-loading");
    } else {
      elements.verifyHumanButton.textContent = verified ? "Verified with Self" : "Verify with Self ID";
      elements.verifyHumanButton.disabled = verified;
      elements.verifyHumanButton.removeAttribute("aria-busy");
      elements.verifyHumanButton.classList.remove("is-loading");
    }
  }
  updateVerificationBadge(elements.walletVerifiedBadge, verified, hasWallet);
  updateVerificationBadge(elements.profileVerifiedBadge, verified, hasWallet);
}

function setSelfStatusPending() {
  const pill = document.getElementById("self-status-pill");
  const details = document.getElementById("self-status-details");
  if (!pill) return;

  pill.textContent = "Checking…";
  pill.classList.remove("status-verified", "status-unverified");
  pill.classList.add("status-pending");
  if (details) {
    details.textContent = "";
  }
}

function applySelfVerificationResult(result) {
  setSelfStatus(result);
  if (state.address) {
    state.verifiedHuman = Boolean(result.isVerified);
    setVerifiedHuman(state.address, result.isVerified);
    renderVerificationState();
  }
}

async function runSelfVerificationCheck(button = null) {
  const performCheck = async () => {
    setSelfStatusPending();
    const result = await loadSelfStatus();
    applySelfVerificationResult(result);
    return result;
  };

  if (!button) {
    return performCheck();
  }

  return withButtonLoading(
    button,
    { loadingText: getLoadingText("pending", "Checking…"), keepWidth: true },
    performCheck,
  );
}

function setSelfStatus(result) {
  const pill = document.getElementById("self-status-pill");
  const details = document.getElementById("self-status-details");
  if (!pill) return;

  if (result.isVerified) {
    pill.textContent = "Verified via Self";
    pill.classList.remove("status-pending", "status-unverified");
    pill.classList.add("status-verified");

    if (details) {
      const ts = result.lastVerifiedHuman || "";
      details.textContent = ts
        ? `Last verified at: ${ts} (chainId ${result.selfChainId})`
        : `Verification found on chainId ${result.selfChainId}`;
    }
  } else {
    pill.textContent = "Not verified";
    pill.classList.remove("status-pending", "status-verified");
    pill.classList.add("status-unverified");
    if (details) {
      details.textContent = "No Self verification proof was found for this config.";
    }
  }
}

function closeSelfVerificationModal() {
  if (!elements.selfModal) return;
  closeModalEl(elements.selfModal);
}

async function handleSelfCheckClick() {
  try {
    await runSelfVerificationCheck();
  } catch (error) {
    console.error("❌ [Self] UI check failed", error);
    const pill = document.getElementById("self-status-pill");
    if (pill) {
      pill.textContent = "Error checking Self status";
      pill.classList.remove("status-verified", "status-pending");
      pill.classList.add("status-unverified");
    }
    const details = document.getElementById("self-status-details");
    if (details) {
      details.textContent = "Please check console for details.";
    }
  }
}

function initSelfVerificationUI() {
  const btn = document.getElementById("self-check-btn");
  if (!btn) return;
  btn.addEventListener("click", handleSelfCheckClick);
}

async function handleVerifyHumanClick() {
  if (isVerifyingHuman) return;
  if (!state.address) {
    showToast("error", WALLET_REQUIRED_MESSAGE);
    return;
  }
  isVerifyingHuman = true;
  renderVerificationState();
  try {
    const result = await runSelfVerificationCheck(elements.verifyHumanButton);
    if (result.isVerified) {
      showToast("success", VERIFICATION_SUCCESS_MESSAGE);
    } else {
      showToast("error", VERIFICATION_FAILURE_MESSAGE);
    }
  } catch (error) {
    console.error("❌ [Self] Verification check failed", error);
    showToast("error", parseError(error) || VERIFICATION_FAILURE_MESSAGE);
  } finally {
    isVerifyingHuman = false;
    renderVerificationState();
  }
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
  elements.duneLink.href = analytics.dune;
  elements.graphLink.href = analytics.graph;
}

async function connectWallet(connector) {
  try {
    const details = await connector();
    state.address = details.address;
    state.isOwner = state.address?.toLowerCase() === OWNER_ADDRESS.toLowerCase();
    syncCurrentVerification();
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
        syncCurrentVerification();
        updateWalletUI();
        renderNetworkInfo(true);
        closeConnectModal();
        await afterWalletConnected();
        break;
      case "accountsChanged":
        state.address = address;
        state.isOwner = state.address?.toLowerCase() === OWNER_ADDRESS.toLowerCase();
        syncCurrentVerification();
        updateWalletUI();
        closeSelfVerificationModal();
        await afterWalletConnected();
        break;
      case "disconnected": {
        const previousAddress = state.address || address;
        state.address = null;
        state.profile = null;
        state.isOwner = false;
        state.verifiedHuman = false;
        clearVerificationState(previousAddress);
        closeSelfVerificationModal();
        renderProfile(null);
        renderOwnerPanel();
        closeWalletDropdown();
        updateWalletUI();
        renderNetworkInfo(false);
        renderVerificationState();
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
  if (elements.connectTrigger) {
    elements.connectTrigger.hidden = connected;
  }
  if (elements.walletPill) {
    elements.walletPill.hidden = !connected;
  }
  if (elements.walletAddressLabel) {
    elements.walletAddressLabel.textContent = connected ? shorten(state.address) : "—";
  }
  if (elements.walletPillButton) {
    const expanded = elements.walletDropdown?.classList.contains("open") ? "true" : "false";
    elements.walletPillButton.setAttribute("aria-expanded", expanded);
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

async function refreshTalentProfile({ keepPrevious = true } = {}) {
  if (!elements.talentProfileCard) return;

  if (talentProfileAbortController) {
    talentProfileAbortController.abort();
  }

  const controller = new AbortController();
  talentProfileAbortController = controller;
  const previousData = keepPrevious ? state.talentProfile?.data : null;

  state.talentProfile = {
    status: "loading",
    data: previousData,
    error: null,
  };
  renderTalentProfileState();

  try {
    const profile = await fetchTalentProfile({ signal: controller.signal });
    if (talentProfileAbortController !== controller) {
      return;
    }
    state.talentProfile = {
      status: "success",
      data: profile,
      error: null,
    };
  } catch (error) {
    if (controller.signal.aborted) {
      return;
    }
    console.error("❌ [Talent] Profile fetch failed", error);
    showToast("error", t("talent.errorToast", "Talent data unavailable. Check API key."));
    state.talentProfile = {
      status: "error",
      data: previousData,
      error,
    };
  } finally {
    if (talentProfileAbortController === controller) {
      talentProfileAbortController = null;
    }
    renderTalentProfileState();
  }
}

function refreshAfterTransaction() {
  return Promise.all([
    refreshProfile(),
    refreshGlobalStats(),
    refreshGovernance(),
    refreshLeaderboard(),
    refreshTalentProfile({ keepPrevious: true }),
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
    renderProfile(null);
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

async function handleProfileAddressCopy() {
  const address = state.profile?.address;
  if (!address) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(address);
    } else {
      const temp = document.createElement("textarea");
      temp.value = address;
      temp.setAttribute("readonly", "true");
      temp.style.position = "absolute";
      temp.style.left = "-9999px";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
    const successMessage = t("profile.copySuccess", "Address copied!");
    showToast("success", successMessage);
  } catch (error) {
    console.error("❌ [Profile] Copy address failed", error);
    showToast("error", UI_MESSAGES.error);
  }
}

function renderTalentProfileState() {
  if (!elements.talentProfileCard) return;

  const { status = "idle", data = null, error = null } = state.talentProfile || {};
  const isLoading = status === "loading";
  const hasError = status === "error";
  const hasData = Boolean(data);

  if (isLoading) {
    elements.talentProfileCard.setAttribute("aria-busy", "true");
  } else {
    elements.talentProfileCard.removeAttribute("aria-busy");
  }

  if (elements.talentProfileLoading) {
    elements.talentProfileLoading.hidden = !isLoading;
    elements.talentProfileLoading.setAttribute("aria-hidden", String(!isLoading));
  }

  if (elements.talentProfileError) {
    elements.talentProfileError.hidden = !hasError;
  }

  if (elements.talentProfileRetry) {
    elements.talentProfileRetry.disabled = isLoading;
  }

  if (elements.talentProfileContent) {
    elements.talentProfileContent.hidden = !hasData;
  }

  if (hasError && elements.talentProfileErrorMessage) {
    const base = t("talent.error", "We couldn't load the profile right now. Please try again soon.");
    const detail = error?.status ? ` (${error.status})` : "";
    elements.talentProfileErrorMessage.textContent = `${base}${detail}`;
  }

  if (!hasData) {
    return;
  }

  const { name, username, bio, profileImage, supporters, badges, profileUrl } = data;
  const safeProfileUrl = typeof profileUrl === "string" && profileUrl.trim().startsWith("http") ? profileUrl.trim() : null;

  if (elements.talentProfileName) {
    elements.talentProfileName.textContent = name || "—";
  }

  if (elements.talentProfileUsername) {
    if (username) {
      elements.talentProfileUsername.textContent = `@${username}`;
      elements.talentProfileUsername.removeAttribute("hidden");
    } else {
      elements.talentProfileUsername.textContent = "";
      elements.talentProfileUsername.setAttribute("hidden", "true");
    }
  }

  if (elements.talentProfileBio) {
    const trimmedBio = (bio || "").trim();
    const fallbackBio = t("talent.bioEmpty", "No bio added yet.");
    elements.talentProfileBio.textContent = trimmedBio || fallbackBio;
    elements.talentProfileBio.classList.toggle("is-empty", !trimmedBio);
  }

  if (elements.talentProfileSupporters) {
    elements.talentProfileSupporters.textContent = formatNumber(supporters || 0);
  }

  if (elements.talentProfileImage) {
    const source = profileImage || TALENT_AVATAR_FALLBACK;
    if (elements.talentProfileImage.src !== source) {
      elements.talentProfileImage.src = source;
    }
    const altTemplate = t("talent.avatarAlt", "{name}'s Talent Protocol profile photo");
    const altName = name || username || "Talent";
    elements.talentProfileImage.alt = altTemplate.replace("{name}", altName);
  }

  if (elements.talentProfileBadges) {
    renderTalentBadges(Array.isArray(badges) ? badges : []);
  }

  if (elements.talentProfileLink) {
    if (safeProfileUrl) {
      elements.talentProfileLink.href = safeProfileUrl;
      elements.talentProfileLink.classList.remove("is-disabled");
      elements.talentProfileLink.removeAttribute("aria-disabled");
    } else {
      elements.talentProfileLink.href = "#";
      elements.talentProfileLink.classList.add("is-disabled");
      elements.talentProfileLink.setAttribute("aria-disabled", "true");
    }
  }
}

function renderTalentBadges(badges) {
  if (!elements.talentProfileBadges) return;

  if (!Array.isArray(badges) || badges.length === 0) {
    elements.talentProfileBadges.innerHTML = `<span class="talent-badge-empty">${t("talent.badgesEmpty", "No badges yet.")}</span>`;
    return;
  }

  const visibleBadges = badges.slice(0, 6);
  elements.talentProfileBadges.innerHTML = visibleBadges
    .map((badge) => {
      if (!badge) return "";
      const name = escapeHtml(badge.name || "");
      const description = escapeHtml(badge.description || badge.name || "");
      const iconUrl = typeof badge.icon === "string" && badge.icon.trim().startsWith("http") ? badge.icon.trim() : "";
      const icon = iconUrl
        ? `<span class="talent-badge-icon"><img src="${escapeHtml(iconUrl)}" alt="" loading="lazy" decoding="async" /></span>`
        : "";
      return `<span class="badge-chip" title="${description}">${icon}${name}</span>`;
    })
    .join("");
}

function renderProfile(profile) {
  if (!profile) {
    elements.profileUsername.textContent = "—";
    elements.profileAddress.textContent = "—";
    elements.profileAddress.removeAttribute("title");
    elements.profileStats.innerHTML = "";
    if (elements.profileMetrics) {
      elements.profileMetrics.innerHTML = "";
    }
    elements.badgeStack.innerHTML = "";
    elements.xpProgress.innerHTML = "";
    if (elements.profileCopyButton) {
      elements.profileCopyButton.disabled = true;
      elements.profileCopyButton.removeAttribute("data-tooltip");
      elements.profileCopyButton.removeAttribute("title");
    }
    if (elements.profileLevelLabel) {
      elements.profileLevelLabel.textContent = `${t("profile.stats.level", "Level")} —`;
    }
    if (elements.profileTierLabel) {
      elements.profileTierLabel.textContent = `${t("profile.stats.tier", "Tier")} —`;
    }
    elements.publicProfileLink.removeAttribute("href");
    renderBadgeDetails(null);
    renderVerificationState();
    return;
  }

  elements.profileUsername.textContent = profile.username || t("profile.newUser", "Yeni Kullanıcı");
  elements.profileAddress.textContent = shorten(profile.address);
  elements.profileAddress.title = profile.address;
  if (elements.profileCopyButton) {
    elements.profileCopyButton.disabled = false;
    const copyTooltip = t("profile.copyAddress", "Copy wallet address");
    elements.profileCopyButton.setAttribute("data-tooltip", copyTooltip);
    elements.profileCopyButton.setAttribute("title", copyTooltip);
  }
  elements.publicProfileLink.href = `/profile?addr=${profile.address}`;

  const summaryStats = [
    { label: t("profile.metrics.gm", "GM"), value: profile.gmCount },
    { label: t("profile.metrics.deploy", "Deploy"), value: profile.deployCount },
    { label: t("profile.metrics.donate", "Donate"), value: profile.donateCount },
    { label: t("profile.metrics.link", "Link"), value: profile.linkCount },
    { label: t("profile.metrics.vote", "Vote"), value: profile.voteCount },
    { label: t("profile.stats.xp", "XP"), value: profile.totalXP },
  ];

  elements.profileStats.innerHTML = summaryStats
    .map(
      (stat) => `
        <div class="stat-card">
          <span>${stat.label}</span>
          <strong>${formatNumber(stat.value)}</strong>
        </div>
      `
    )
    .join("");

  if (elements.profileLevelLabel) {
    elements.profileLevelLabel.textContent = `${t("profile.stats.level", "Level")} ${formatNumber(profile.level)}`;
  }

  if (elements.profileTierLabel) {
    const tierLabel = t("profile.tierBadgeLabel", "Tier {value} Badge").replace("{value}", formatNumber(profile.tier));
    elements.profileTierLabel.textContent = tierLabel;
  }

  if (elements.profileMetrics) {
    const metrics = [
      { label: t("profile.metrics.link", "Link"), value: profile.linkCount },
      { label: t("profile.metrics.deploy", "Deploy"), value: profile.deployCount },
      { label: t("profile.metrics.gm", "GM"), value: profile.gmCount },
      { label: t("profile.metrics.vote", "Vote"), value: profile.voteCount },
      { label: t("profile.metrics.donate", "Donate"), value: profile.donateCount },
    ];
    elements.profileMetrics.innerHTML = metrics
      .map((metric) => `<li><span>${metric.label}</span><strong>${formatNumber(metric.value)}</strong></li>`)
      .join("");
  }

  elements.badgeStack.innerHTML = renderTierBadges(profile);
  elements.xpProgress.innerHTML = renderXpProgress(profile);
  renderBadgeDetails(profile);
  renderVerificationState();
}

function renderTierBadges(profile) {
  const tiers = [1, 2, 3, 4, 5];
  return tiers
    .map((tier) => {
      const active = profile.tier >= tier ? "active" : "";
      return `<span class="badge-chip ${active}">${t("profile.badge", "Tier")} ${tier}</span>`;
    })
    .join("");
}

function calculateLevelProgress(profile) {
  if (!profile) return { percent: 0, isMaxLevel: false };
  const maxLevel = Number(profile.maxLevel || 5);
  const isMaxLevel = Number.isFinite(maxLevel) && maxLevel > 0 ? profile.level >= maxLevel : false;
  const normalized =
    typeof profile.progressToNextLevel === "number"
      ? profile.progressToNextLevel
      : typeof profile.levelProgress === "number"
      ? profile.levelProgress
      : null;
  if (normalized !== null) {
    const normalizedValue = Number(normalized);
    if (Number.isFinite(normalizedValue)) {
      const clamped = Math.max(0, Math.min(1, normalizedValue));
      const percent = Math.round(clamped * 100);
      return { percent, isMaxLevel: isMaxLevel || percent >= 100 };
    }
  }

  const xpPerLevel = Number(
    profile.xpForNextLevel || profile.nextLevelXP || profile.nextLevelXp || profile.xpPerLevel || 20
  );
  if (!Number.isFinite(xpPerLevel) || xpPerLevel <= 0) {
    return { percent: isMaxLevel ? 100 : 0, isMaxLevel };
  }
  const totalXp = Number(profile.totalXP || 0);
  if (!Number.isFinite(totalXp)) {
    return { percent: isMaxLevel ? 100 : 0, isMaxLevel };
  }
  const remainder = totalXp % xpPerLevel;
  const percent = isMaxLevel ? 100 : Math.round((remainder / xpPerLevel) * 100);
  return { percent: Math.max(0, Math.min(100, percent)), isMaxLevel };
}

function renderXpProgress(profile) {
  const { percent, isMaxLevel } = calculateLevelProgress(profile);
  const tooltipRaw = isMaxLevel
    ? t("profile.xpTooltipMax", "Max level reached")
    : t("profile.xpTooltip", "XP {value}% to next level").replace("{value}", percent);
  const tooltip = escapeHtml(tooltipRaw);
  const width = isMaxLevel ? 100 : percent;
  const ariaValue = Math.max(0, Math.min(100, width));
  return `
    <div class="xp-progress-visual" data-tooltip="${tooltip}">
      <div class="xp-progress-container" role="progressbar" aria-valuenow="${ariaValue}" aria-valuemin="0" aria-valuemax="100" aria-valuetext="${tooltip}">
        <div class="xp-progress-fill" style="width:${width}%"></div>
      </div>
    </div>
    <div class="xp-label">${tooltip}</div>
  `;
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
    refreshTalentProfile({ keepPrevious: false }),
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
