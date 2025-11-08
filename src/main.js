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
  loadUserLinks,
  loadUserDeployments,
  getAnalyticsConfig,
} from "./services/contractService.js";
import {
  openSelfVerification,
  syncVerifiedFlag,
  clearVerificationState,
  closeSelfVerification,
} from "./services/identityService.js";
import { fetchTalentProfile } from "./services/talentService.js";

let deviceId = localStorage.getItem("celo-engage-device-id");
if (!deviceId) {
  deviceId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `device-${Date.now()}`;
  localStorage.setItem("celo-engage-device-id", deviceId);
}

const storedClickerMap = safeParseStorage(localStorage.getItem("celo-engage-link-clickers"), {});

const DEFAULT_FEED = [
  { user: "0xCommunity", link: "https://celo.org", blockNumber: null, transactionHash: null },
  { user: "0xBuilders", link: "https://developers.celo.org", blockNumber: null, transactionHash: null },
  { user: "0xForum", link: "https://forum.celo.org", blockNumber: null, transactionHash: null },
];

const VERIFICATION_SUCCESS_MESSAGE = "✅ Verified with Self ID successfully.";
const VERIFICATION_FAILURE_MESSAGE = "⚠️ Verification failed. Try again.";
const WALLET_REQUIRED_MESSAGE = "Connect wallet to verify identity.";

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
  linkClickers: storedClickerMap,
  sharePromptLink: null,
  deviceId,
  feedEntries: [],
  verifiedHuman: false,
  talentProfile: {
    status: "idle",
    data: null,
    error: null,
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
  linkFeed: document.getElementById("linkFeed"),
  completedFeed: document.getElementById("completedFeed"),
  completedCounter: document.getElementById("completedCounter"),
  gmForm: document.getElementById("gmForm"),
  deployForm: document.getElementById("deployForm"),
  donateTabs: document.querySelectorAll("#donateSection .tab-btn"),
  donatePanels: document.querySelectorAll("#donateSection .tab-panel"),
  donateCeloForm: document.getElementById("donateCeloForm"),
  approveCusdForm: document.getElementById("approveCusdForm"),
  donateCusdForm: document.getElementById("donateCusdForm"),
  approveCeurForm: document.getElementById("approveCeurForm"),
  donateCeurForm: document.getElementById("donateCeurForm"),
  proposalForm: document.getElementById("proposalForm"),
  activeProposals: document.getElementById("activeProposals"),
  pastProposals: document.getElementById("pastProposals"),
  badgeDetails: document.getElementById("badgeDetails"),
  badgeShowcase: document.getElementById("badgeShowcase"),
  leaderboardTabs: document.querySelectorAll("#leaderboardSection .tab-btn"),
  leaderboardPanels: document.querySelectorAll("#leaderboardSection .tab-panel"),
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
  selfModal: document.getElementById("selfModal"),
  selfQrContainer: document.getElementById("selfQrContainer"),
  selfDeepLink: document.getElementById("selfDeepLink"),
  selfStatusMessage: document.getElementById("selfStatusMessage"),
  donateQuickButtons: document.querySelectorAll("[data-donate-amount]"),
  duneLink: document.getElementById("duneLink"),
  graphLink: document.getElementById("graphLink"),
  deployedContracts: document.getElementById("deployedContracts"),
  feedSkeleton: document.getElementById("feedSkeleton"),
  governanceSkeleton: document.getElementById("governanceSkeleton"),
  talentSection: document.getElementById("talentSection"),
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
};

let activeSectionId = null;
let isAutoScrolling = false;
let autoScrollTimeout = null;

let wsProvider = null;
let wsBackoff = 2000;

let isVerifyingHuman = false;
let activeSelfSession = null;
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
  const originalHtml = button.innerHTML;
  const originalMinWidth = button.style.minWidth;
  const keepWidth = opts.keepWidth !== false;
  const measuredWidth = keepWidth ? button.getBoundingClientRect().width : null;
  if (measuredWidth) {
    button.style.minWidth = `${Math.ceil(measuredWidth)}px`;
  }
  button.disabled = true;
  button.classList.add("is-loading");
  button.setAttribute("aria-busy", "true");
  if (opts.loadingText) {
    button.textContent = opts.loadingText;
  }
  try {
    return await action();
  } finally {
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
  const initialSection = document.querySelector(".section.active") || (elements.sections && elements.sections[0]);
  if (initialSection) {
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
  setupProfileModal();
  setupShareModal();
  setupUsernameModal();
  setupEcosystemModal();
  setupFeedInteractions();
  setupTalentProfile();
  setupToastBridge();
  updateAnalyticsLinks();
  renderNetworkInfo(false);
  updateWalletUI();
  loadInitialData();
  initWalletListeners();
  initWebsocket();
}

document.addEventListener("DOMContentLoaded", init);

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
    console.error("language load error", error);
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
  updateLinkFeedView();
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
  if (elements.shareLinkInput) {
    elements.shareLinkInput.value = "https://";
  }
  openModalEl(elements.shareModal, { focusTarget: elements.shareLinkInput, trigger });
}

function closeShareModal() {
  if (!elements.shareModal) return;
  closeModalEl(elements.shareModal);
  if (elements.shareLinkInput) {
    elements.shareLinkInput.value = "https://";
  }
  if (elements.sharePromptLink) {
    elements.sharePromptLink.textContent = "—";
  }
  state.sharePromptLink = null;
}

function setupFeedInteractions() {
  if (elements.linkFeed) {
    elements.linkFeed.addEventListener("click", handleFeedClick);
  }
  if (elements.completedFeed) {
    elements.completedFeed.addEventListener("click", handleFeedClick);
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

function handleFeedClick(event) {
  const trigger = event.target.closest("[data-feed-link]");
  if (!trigger) return;
  event.preventDefault();
  const encodedLink = trigger.getAttribute("data-feed-link");
  const url = encodedLink ? decodeURIComponent(encodedLink) : trigger.getAttribute("href");
  if (!url) return;
  window.open(url, "_blank", "noopener");
  registerLinkInteraction(url);
  openShareModal(url, trigger);
}

function registerLinkInteraction(url) {
  const key = getLinkKey(url);
  if (!key) return;
  const userId = getCurrentUserId();
  const existing = new Set(state.linkClickers[key] || []);
  if (existing.size >= 3 && !existing.has(userId)) {
    return;
  }
  const previous = existing.size;
  if (!existing.has(userId)) {
    existing.add(userId);
    state.linkClickers[key] = Array.from(existing);
    persistLinkClickers();
  }
  const newCount = existing.size;
  if (newCount >= 3 && previous < 3) {
    const card = document.querySelector(`[data-feed-key="${key}"]`);
    if (card) {
      card.classList.add("feed-card--completing");
      card.addEventListener(
        "animationend",
        () => {
          card.classList.remove("feed-card--completing");
          updateLinkFeedView();
        },
        { once: true }
      );
      return;
    }
  }
  updateLinkFeedView();
}

function persistLinkClickers() {
  localStorage.setItem("celo-engage-link-clickers", JSON.stringify(state.linkClickers));
}

function updateLinkFeedView() {
  if (!elements.linkFeed) return;
  const sourceEntries = Array.isArray(state.feedEntries) && state.feedEntries.length ? state.feedEntries : DEFAULT_FEED;
  const activeEntries = filterFeedEntries(sourceEntries);
  const completedEntries = getCompletedEntries(sourceEntries);

  if (!activeEntries.length) {
    elements.linkFeed.innerHTML = `<p class="feed-empty">${t("feed.empty", "Henüz bağlantı paylaşılmadı.")}</p>`;
  } else {
    elements.linkFeed.innerHTML = activeEntries.map(renderFeedCard).join("");
  }

  if (elements.completedFeed) {
    elements.completedFeed.innerHTML = completedEntries.length
      ? completedEntries.map(renderCompletedCard).join("")
      : `<p class="feed-empty">${t("feed.completedEmpty", "Tamamlanan bağlantı yok.")}</p>`;
  }

  if (elements.completedCounter) {
    elements.completedCounter.textContent = `✅ ${completedEntries.length} ${t("feed.counter", "Bağlantı tamamlandı")}`;
  }
}

function filterFeedEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.filter((item) => getLinkClickCount(item.link) < 3);
}

function getCompletedEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.filter((item) => getLinkClickCount(item.link) >= 3);
}

function renderFeedCard(item) {
  const rawLink = item.link || "";
  const safeLink = escapeHtml(rawLink);
  const encodedLink = encodeURIComponent(rawLink);
  const key = getLinkKey(rawLink);
  const clicks = getLinkClickCount(item.link);
  const remaining = Math.max(0, 3 - clicks);
  const userLabel = escapeHtml(shorten(item.user || "0x0"));
  const blockLabel = item.blockNumber ? `#${item.blockNumber}` : t("feed.new", "Yeni");
  const progressPercent = Math.min(100, Math.round((Math.min(clicks, 3) / 3) * 100));
  return `
    <article class="feed-card" data-feed-key="${key}">
      <div class="feed-card__meta">
        <span>${userLabel}</span>
        <time>${blockLabel}</time>
      </div>
      <a class="feed-card__link" data-feed-link="${encodedLink}" href="${safeLink}" target="_blank" rel="noopener">${safeLink}</a>
      <div class="feed-card__footer">
        <div class="feed-card__progress">
          <span>${t("feed.progress", "Destek")}: ${Math.min(clicks, 3)}/3</span>
          <div class="progress-bar"><span style="width:${progressPercent}%"></span></div>
        </div>
        <span>${t("feed.remaining", "Kalan tıklama")}: ${remaining}</span>
      </div>
    </article>
  `;
}

function renderCompletedCard(item) {
  const rawLink = item.link || "";
  const safeLink = escapeHtml(rawLink);
  const encodedLink = encodeURIComponent(rawLink);
  const key = getLinkKey(rawLink);
  const userLabel = escapeHtml(shorten(item.user || "0x0"));
  const blockLabel = item.blockNumber ? `#${item.blockNumber}` : t("feed.new", "Yeni");
  const clicks = Math.min(3, Math.max(0, getLinkClickCount(item.link)));
  return `
    <article class="feed-card feed-card--completed" data-feed-key="${key}">
      <div class="feed-card__meta">
        <span>${userLabel}</span>
        <time>${blockLabel}</time>
      </div>
      <a class="feed-card__link" data-feed-link="${encodedLink}" href="${safeLink}" target="_blank" rel="noopener">${safeLink}</a>
      <div class="feed-card__footer">
        <span class="feed-card__badge">✅ ${t("feed.completedBadge", "Tamamlandı")}</span>
        <span>${t("feed.progress", "Destek")}: ${clicks}/3</span>
      </div>
    </article>
  `;
}

function getLinkClickCount(url) {
  const key = getLinkKey(url);
  const entries = state.linkClickers[key];
  return Array.isArray(entries) ? entries.length : 0;
}

function getLinkKey(url) {
  const normalized = normalizeLink(url);
  return normalized ? encodeURIComponent(normalized) : "";
}

function normalizeLink(url) {
  return typeof url === "string" ? url.trim().toLowerCase() : "";
}

function getCurrentUserId() {
  return (state.address ? state.address.toLowerCase() : state.deviceId) || state.deviceId;
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
  const homeButton = navButtons.find((btn) => btn.dataset?.target === "homeSection");
  const homeLabel = homeButton?.textContent?.trim() || homeButton?.dataset?.sectionLabel || "Home";
  const currentLabel = sectionName?.trim() || homeLabel;
  elements.breadcrumb.innerHTML = `<span>🏠 ${homeLabel}</span><span class="separator">/</span><span>${currentLabel}</span>`;
}

function refreshBreadcrumb() {
  const activeSection = document.getElementById(activeSectionId) || (elements.sections && elements.sections[0]);
  updateBreadcrumb(getSectionLabel(activeSection));
}

function setActiveSection(sectionId, options = {}) {
  if (!sectionId) return;
  const { labelOverride, suppressBreadcrumb, updateUrl = true } = options;
  const sections = Array.from(elements.sections || []);
  sections.forEach((section) => {
    const isTarget = section.id === sectionId;
    section.classList.toggle("active", isTarget);
    if (isTarget) {
      section.classList.remove("fade-in");
      void section.offsetWidth;
      section.classList.add("fade-in");
    }
  });

  Array.from(elements.navButtons || []).forEach((btn) => {
    const isTarget = btn.dataset?.target === sectionId;
    btn.classList.toggle("active", isTarget);
  });

  activeSectionId = sectionId;

  if (updateUrl && window.location.hash !== `#${sectionId}`) {
    history.replaceState(null, "", `#${sectionId}`);
  }

  if (!suppressBreadcrumb) {
    const section = document.getElementById(sectionId);
    const label = labelOverride || getSectionLabel(section);
    updateBreadcrumb(label);
  }
}

function scrollToSection(sectionId, sectionName) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  if (autoScrollTimeout) {
    clearTimeout(autoScrollTimeout);
  }

  isAutoScrolling = true;
  setActiveSection(sectionId, { labelOverride: sectionName });

  const targetTop = section.getBoundingClientRect().top + window.scrollY - 120;
  window.scrollTo({
    top: targetTop > 0 ? targetTop : 0,
    behavior: "smooth",
  });

  autoScrollTimeout = setTimeout(() => {
    isAutoScrolling = false;
  }, 700);

  setTimeout(() => {
    section.focus({ preventScroll: true });
  }, 320);
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
      scrollToSection(target, label);
    });
  });

  const initialHash = window.location.hash ? window.location.hash.replace("#", "") : "";
  if (initialHash) {
    const hashSection = document.getElementById(initialHash);
    if (hashSection) {
      activeSectionId = initialHash;
      const label = getSectionLabel(hashSection);
      setActiveSection(initialHash, { labelOverride: label });
      const targetTop = hashSection.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: targetTop > 0 ? targetTop : 0, behavior: "auto" });
      requestAnimationFrame(() => hashSection.focus({ preventScroll: true }));
    }
  }

  if (!activeSectionId) {
    activeSectionId = sections[0].id;
  }

  setActiveSection(activeSectionId, {
    labelOverride: getSectionLabel(document.getElementById(activeSectionId)),
  });

  const observer = new IntersectionObserver(
    (entries) => {
      if (isAutoScrolling) return;
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          if (b.intersectionRatio !== a.intersectionRatio) {
            return b.intersectionRatio - a.intersectionRatio;
          }
          return a.target.offsetTop - b.target.offsetTop;
        });
      if (!visibleEntries.length) return;
      const nextSection = visibleEntries[0].target;
      if (nextSection.id !== activeSectionId) {
        setActiveSection(nextSection.id);
      }
    },
    {
      threshold: 0.45,
      rootMargin: "-160px 0px -45%",
    }
  );

  sections.forEach((section) => observer.observe(section));
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
        console.error("quick donate error", error);
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

function setupWalletButtons() {
  if (elements.connectTrigger) {
    elements.connectTrigger.addEventListener("click", () => {
      if (state.address) {
        toggleWalletDropdown(true);
      } else {
        openConnectModal(elements.connectTrigger);
      }
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
        console.error("connect option error", error);
      }
    });
  });

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
        state.verifiedHuman = false;
        clearVerificationState();
        closeSelfVerificationModal();
        renderProfile(null);
        renderOwnerPanel();
        closeWalletDropdown();
        updateWalletUI();
        renderNetworkInfo(false);
        renderVerificationState();
        showToast("success", "Cüzdan bağlantısı kesildi.");
      } catch (error) {
        console.error("disconnect error", error);
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

function resetSelfVerificationModal() {
  if (elements.selfQrContainer) {
    elements.selfQrContainer.innerHTML = "";
  }
  if (elements.selfStatusMessage) {
    elements.selfStatusMessage.textContent = "Waiting for verification…";
  }
  if (elements.selfDeepLink) {
    elements.selfDeepLink.setAttribute("hidden", "true");
    elements.selfDeepLink.removeAttribute("href");
  }
}

function updateSelfStatusMessage(status) {
  if (!elements.selfStatusMessage) return;
  let text = "Waiting for verification…";
  const normalized = typeof status === "string" ? status : status?.type || status?.status;
  switch (normalized) {
    case "verified":
      text = "Verification complete. You can close this window.";
      break;
    case "failed":
    case "error":
      text = "Verification failed. Try again.";
      break;
    case "scanned":
      text = "Scan detected. Approve in the Self app.";
      break;
    case "pending":
    case "started":
    case "initiated":
      text = "Waiting for verification…";
      break;
    default:
      if (normalized) {
        text = normalized;
      } else if (status?.message) {
        text = status.message;
      }
  }
  elements.selfStatusMessage.textContent = text;
}

function updateSelfDeepLink(link) {
  if (!elements.selfDeepLink) return;
  if (link) {
    elements.selfDeepLink.href = link;
    elements.selfDeepLink.removeAttribute("hidden");
  } else {
    elements.selfDeepLink.setAttribute("hidden", "true");
    elements.selfDeepLink.removeAttribute("href");
  }
}

function openSelfVerificationModal(trigger) {
  if (!elements.selfModal) return;
  resetSelfVerificationModal();
  openModalEl(elements.selfModal, { trigger });
}

function closeSelfVerificationModal() {
  if (!elements.selfModal) return;
  closeModalEl(elements.selfModal);
  resetSelfVerificationModal();
  closeSelfVerification();
  activeSelfSession = null;
  if (isVerifyingHuman && !state.verifiedHuman) {
    isVerifyingHuman = false;
    renderVerificationState();
  }
}

function setupSelfVerificationModal() {
  if (!elements.selfModal) return;
  const dismissButtons = elements.selfModal.querySelectorAll('[data-dismiss="selfModal"]');
  dismissButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeSelfVerificationModal();
    });
  });
}

function setupIdentityVerification() {
  if (elements.verifyHumanButton) {
    elements.verifyHumanButton.addEventListener("click", handleVerifyHumanClick);
  }
  setupSelfVerificationModal();
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

async function handleVerifyHumanClick() {
  if (isVerifyingHuman) return;
  if (state.verifiedHuman) return;
  if (!state.address) {
    showToast("error", WALLET_REQUIRED_MESSAGE);
    return;
  }
  isVerifyingHuman = true;
  renderVerificationState();
  openSelfVerificationModal(elements.verifyHumanButton);
  updateSelfStatusMessage("pending");
  let errorHandled = false;
  try {
    const session = await openSelfVerification({
      address: state.address,
      container: elements.selfQrContainer,
      onVerified: () => {
        isVerifyingHuman = false;
        activeSelfSession = null;
        syncCurrentVerification();
        showToast("success", VERIFICATION_SUCCESS_MESSAGE);
        closeSelfVerificationModal();
      },
      onError: (error) => {
        if (error) {
          errorHandled = true;
          console.error("Self verification error", error);
        }
        isVerifyingHuman = false;
        activeSelfSession = null;
        updateSelfStatusMessage("failed");
        showToast("error", VERIFICATION_FAILURE_MESSAGE);
        closeSelfVerificationModal();
        renderVerificationState();
      },
      onStatus: (status) => {
        updateSelfStatusMessage(status);
      },
      onDeepLink: (link) => {
        updateSelfDeepLink(link);
      },
    });
    activeSelfSession = session;
    if (!session?.deepLink) {
      updateSelfDeepLink(null);
    }
  } catch (error) {
    if (!errorHandled) {
      console.error("Self verification failed to initialize", error);
      showToast("error", VERIFICATION_FAILURE_MESSAGE);
    }
    isVerifyingHuman = false;
    activeSelfSession = null;
    closeSelfVerificationModal();
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
    console.error("connectWallet error", error);
    showToast("error", error?.message || UI_MESSAGES.error);
  }
}

async function afterWalletConnected() {
  await refreshProfile();
  await refreshGlobalStats();
  await refreshGovernance();
  await refreshLeaderboard();
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
      case "disconnected":
        state.address = null;
        state.profile = null;
        state.isOwner = false;
        state.verifiedHuman = false;
        clearVerificationState();
        closeSelfVerificationModal();
        renderProfile(null);
        renderOwnerPanel();
        closeWalletDropdown();
        updateWalletUI();
        renderNetworkInfo(false);
        renderVerificationState();
        break;
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
    console.error("GM error", error);
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
    console.error("Deploy error", error);
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
    console.error("Donate CELO error", error);
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
    console.error("Approve cUSD error", error);
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
    console.error("Donate cUSD error", error);
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
    console.error("Approve cEUR error", error);
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
    console.error("Donate cEUR error", error);
    showToast("error", parseError(error));
  }
}

async function handleShareLinkSubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const url = elements.shareLinkInput?.value.trim() || "";
  if (!url.startsWith("https://")) {
    return showToast("error", UI_MESSAGES.invalidLink);
  }
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("sharingLink", "Submitting Link…") },
      async () => {
        await doShareLink(url);
        if (elements.shareLinkInput) {
          elements.shareLinkInput.value = "https://";
        }
        closeShareModal();
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("share link error", error);
    showToast("error", parseError(error));
  }
}

async function handleProposalSubmit(event) {
  event.preventDefault();
  if (!state.isOwner) return showToast("error", UI_MESSAGES.ownerOnly);
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
    console.error("Proposal error", error);
    showToast("error", parseError(error));
  }
}

async function handleWithdrawSubmit(event, token) {
  event.preventDefault();
  if (!state.isOwner) return showToast("error", UI_MESSAGES.ownerOnly);
  const amountInput = event.target.querySelector("input");
  const amount = amountInput?.value || "";
  const submitter = event.submitter || event.target.querySelector('[type="submit"]');
  try {
    await withButtonLoading(
      submitter,
      { loadingText: getLoadingText("withdrawing", "Processing Withdrawal…") },
      async () => {
        await withdrawDonations(token, amount);
        if (amountInput) amountInput.value = "";
        refreshAfterTransaction();
      }
    );
  } catch (error) {
    console.error("Withdraw error", error);
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
    console.error("Register error", error);
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
    console.error("Talent profile fetch error", error);
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
    refreshFeed(),
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
    console.error("loadProfile error", error);
    renderProfile(null);
  }
}

async function refreshGlobalStats() {
  try {
    const stats = await loadGlobalStats();
    state.global = stats;
    renderGlobalCounters(stats);
  } catch (error) {
    console.error("global stats error", error);
  }
}

async function refreshFeed() {
  toggleSkeleton(elements.feedSkeleton, true);
  try {
    const [links, personalLinks] = await Promise.all([
      loadRecentLinks(20),
      state.address ? loadUserLinks(state.address).catch(() => []) : Promise.resolve([]),
    ]);
    const combined = [...links];
    personalLinks.forEach((item) => {
      if (!combined.find((entry) => entry.link === item.link)) {
        combined.unshift({
          user: item.address,
          link: item.link,
          blockNumber: null,
          transactionHash: null,
        });
      }
    });
    state.feedEntries = combined.length ? combined : [...DEFAULT_FEED];
    updateLinkFeedView();
  } catch (error) {
    console.error("feed error", error);
  } finally {
    toggleSkeleton(elements.feedSkeleton, false);
  }
}

async function refreshGovernance() {
  toggleSkeleton(elements.governanceSkeleton, true);
  try {
    const data = await loadGovernance();
    state.governance = data;
    renderGovernance(data);
  } catch (error) {
    console.error("governance error", error);
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
    console.error("leaderboard error", error);
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
    console.error("copy error", error);
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

function renderLinkFeed(entries) {
  if (Array.isArray(entries) && entries.length) {
    state.feedEntries = entries;
  } else {
    state.feedEntries = [...DEFAULT_FEED];
  }
  updateLinkFeedView();
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
    console.error("vote error", error);
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

function renderOwnerPanel() {
  if (!elements.ownerPanel) return;
  elements.ownerPanel.hidden = !state.isOwner;
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
  if (error.data?.message) return error.data.message;
  if (error.error?.message) return error.error.message;
  if (typeof error.message === "string") return error.message;
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
    refreshFeed(),
    refreshGovernance(),
    refreshLeaderboard(),
    refreshTalentProfile({ keepPrevious: false }),
  ]);
}

function initWebsocket() {
  if (!CURRENT_NETWORK.wsUrl) return;
  try {
    if (wsProvider) {
      wsProvider.destroy?.();
    }
    wsProvider = new ethers.providers.WebSocketProvider(CURRENT_NETWORK.wsUrl);
    wsProvider._websocket.on("open", () => {
      console.info("WS bağlandı");
      wsBackoff = 2000;
    });
    wsProvider._websocket.on("close", () => {
      console.warn("WS bağlantısı kapandı, yeniden deneniyor...");
      scheduleReconnect();
    });
    wsProvider._websocket.on("error", (err) => {
      console.warn("WS hatası", err);
      scheduleReconnect();
    });
    subscribeToEvents();
  } catch (error) {
    console.error("WebSocket init error", error);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (wsProvider) {
    wsProvider.removeAllListeners?.();
    wsProvider = null;
  }
  setTimeout(() => {
    wsBackoff = Math.min(wsBackoff * 1.5, 60000);
    initWebsocket();
  }, wsBackoff);
}

function subscribeToEvents() {
  if (!wsProvider) return;
  const modules = [
    { contract: "PROFILE", events: ["UserRegistered", "ProfileUpdated", "UsernameUpdated"] },
    { contract: "GM", events: ["GMSent"] },
    { contract: "DONATE", events: ["DonationMade", "Withdrawn"] },
    { contract: "LINK", events: ["LinkShared"] },
    { contract: "GOVERNANCE", events: ["ProposalCreated", "Voted", "Executed"] },
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
      console.error(`WS event subscribe error for ${contract}`, error);
    }
  });
}

export { state };
