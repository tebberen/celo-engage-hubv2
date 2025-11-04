import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
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

const state = {
  address: null,
  profile: null,
  global: null,
  governance: { active: [], completed: [] },
  leaderboard: null,
  isOwner: false,
  theme: localStorage.getItem("celo-engage-theme") || "dark",
  language: localStorage.getItem("celo-engage-lang") || "tr",
  translations: {},
};

const elements = {
  app: document.getElementById("app"),
  navButtons: document.querySelectorAll(".nav-btn"),
  sections: document.querySelectorAll(".section"),
  connectMetaMask: document.getElementById("connectMetaMask"),
  connectWalletConnect: document.getElementById("connectWalletConnect"),
  disconnectWallet: document.getElementById("disconnectWallet"),
  walletControls: document.querySelector(".wallet-controls"),
  profileStats: document.getElementById("profileStats"),
  badgeStack: document.getElementById("badgeStack"),
  xpProgress: document.getElementById("xpProgress"),
  profileUsername: document.getElementById("profileUsername"),
  profileAddress: document.getElementById("profileAddress"),
  publicProfileLink: document.getElementById("publicProfileLink"),
  profileMetrics: document.getElementById("profileMetrics"),
  linkFeed: document.getElementById("linkFeed"),
  gmForm: document.getElementById("gmForm"),
  deployForm: document.getElementById("deployForm"),
  donateTabs: document.querySelectorAll("#donateSection .tab-btn"),
  donatePanels: document.querySelectorAll("#donateSection .tab-panel"),
  donateCeloForm: document.getElementById("donateCeloForm"),
  approveCusdForm: document.getElementById("approveCusdForm"),
  donateCusdForm: document.getElementById("donateCusdForm"),
  linkForm: document.getElementById("linkForm"),
  proposalForm: document.getElementById("proposalForm"),
  activeProposals: document.getElementById("activeProposals"),
  pastProposals: document.getElementById("pastProposals"),
  badgeDetails: document.getElementById("badgeDetails"),
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
  globalCounters: document.getElementById("globalCounters"),
  toastContainer: document.getElementById("toastContainer"),
  usernameModal: document.getElementById("usernameModal"),
  usernameForm: document.getElementById("usernameForm"),
  usernameInput: document.getElementById("usernameInput"),
  themeToggle: document.getElementById("themeToggle"),
  languageToggle: document.getElementById("languageToggle"),
  profileButton: document.getElementById("profileButton"),
  profileModal: document.getElementById("profileModal"),
  networkName: document.getElementById("networkName"),
  networkStatus: document.getElementById("networkStatus"),
  duneLink: document.getElementById("duneLink"),
  graphLink: document.getElementById("graphLink"),
  deployedContracts: document.getElementById("deployedContracts"),
};

let wsProvider = null;
let wsBackoff = 2000;

function init() {
  applyTheme(state.theme);
  setupLanguage();
  setupNavigation();
  const initialSection = document.querySelector(".section.active");
  if (initialSection) {
    requestAnimationFrame(() => initialSection.classList.add("fade-in"));
  }
  setupTabs();
  setupLeaderboardTabs();
  setupForms();
  setupWalletButtons();
  setupThemeToggle();
  setupProfileModal();
  setupToastBridge();
  updateAnalyticsLinks();
  renderNetworkInfo(false);
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

  if (elements.languageToggle) {
    elements.languageToggle.addEventListener("click", () => {
      const nextLang = state.language === "tr" ? "en" : "tr";
      applyLanguage(nextLang);
    });
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

  translateDocument();
  renderProfile(state.profile);
  renderBadgeDetails(state.profile);
  renderGlobalCounters(state.global);
  renderNavigationAria();
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
  if (!elements.profileModal) return;

  const dismissElements = elements.profileModal.querySelectorAll('[data-dismiss="profileModal"]');
  dismissElements.forEach((closeBtn) => {
    closeBtn.addEventListener("click", closeProfileModal);
  });

  if (elements.profileButton) {
    elements.profileButton.addEventListener("click", () => {
      if (!state.profile) {
        refreshProfile();
      }
      openProfileModal();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.profileModal.classList.contains("is-open")) {
      closeProfileModal();
    }
  });
}

function openProfileModal() {
  if (!elements.profileModal) return;
  elements.profileModal.classList.add("is-open");
  elements.profileModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeProfileModal() {
  if (!elements.profileModal) return;
  elements.profileModal.classList.remove("is-open");
  elements.profileModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function applyTheme(theme) {
  state.theme = theme;
  elements.app.dataset.theme = theme;
  localStorage.setItem("celo-engage-theme", theme);
}

function setupThemeToggle() {
  elements.themeToggle.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  });
}

function setupNavigation() {
  elements.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      elements.navButtons.forEach((b) => b.classList.toggle("active", b === btn));
      elements.sections.forEach((section) => {
        const isTarget = section.id === target;
        section.classList.toggle("active", isTarget);
        if (isTarget) {
          section.classList.remove("fade-in");
          // force reflow for animation restart
          void section.offsetWidth;
          section.classList.add("fade-in");
        }
      });
    });
  });
  if (elements.navButtons.length) {
    elements.navButtons[0].classList.add("active");
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
  elements.linkForm.addEventListener("submit", handleShareLinkSubmit);
  elements.proposalForm.addEventListener("submit", handleProposalSubmit);
  elements.withdrawCeloForm.addEventListener("submit", (e) => handleWithdrawSubmit(e, "CELO"));
  elements.withdrawCusdForm.addEventListener("submit", (e) => handleWithdrawSubmit(e, "cUSD"));
  elements.usernameForm.addEventListener("submit", handleRegisterSubmit);
}

function setupWalletButtons() {
  elements.connectMetaMask.addEventListener("click", () => connectWallet(connectWalletMetaMask));
  elements.connectWalletConnect.addEventListener("click", () => connectWallet(connectWalletConnect));
  elements.disconnectWallet.addEventListener("click", async () => {
    await disconnectWallet();
    state.address = null;
    state.profile = null;
    state.isOwner = false;
    renderProfile(null);
    renderOwnerPanel();
    elements.disconnectWallet.hidden = true;
    renderNetworkInfo(false);
    showToast("success", "Cüzdan bağlantısı kesildi.");
  });
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
    elements.disconnectWallet.hidden = false;
    renderNetworkInfo(true);
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
        elements.disconnectWallet.hidden = false;
        renderNetworkInfo(true);
        await afterWalletConnected();
        break;
      case "accountsChanged":
        state.address = address;
        state.isOwner = state.address?.toLowerCase() === OWNER_ADDRESS.toLowerCase();
        await afterWalletConnected();
        break;
      case "disconnected":
        state.address = null;
        state.profile = null;
        state.isOwner = false;
        renderProfile(null);
        renderOwnerPanel();
        elements.disconnectWallet.hidden = true;
        renderNetworkInfo(false);
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
  elements.networkName.textContent = CURRENT_NETWORK.name;
  const online = Boolean(valid && state.address);
  elements.networkStatus.classList.toggle("online", online);
  elements.networkStatus.setAttribute(
    "aria-label",
    online ? t("network.online", "Online") : t("network.offline", "Offline")
  );
}

function showToast(type, message, hash, explorer) {
  if (!message) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type || "info"}`;
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
  try {
    await doGM(message);
    document.getElementById("gmMessage").value = "";
  } catch (error) {
    console.error("GM error", error);
    showToast("error", parseError(error));
  }
}

async function handleDeploySubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const name = document.getElementById("deployName").value.trim();
  try {
    await doDeploy(name);
    document.getElementById("deployName").value = "";
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
  try {
    await doDonateCELO(amount);
    document.getElementById("celoAmount").value = "";
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
  try {
    await doApproveCUSD(amount);
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
  try {
    await doDonateCUSD(amount);
    document.getElementById("cusdAmount").value = "";
  } catch (error) {
    console.error("Donate cUSD error", error);
    showToast("error", parseError(error));
  }
}

async function handleShareLinkSubmit(event) {
  event.preventDefault();
  if (!state.address) return showToast("error", UI_MESSAGES.walletNotConnected);
  const url = document.getElementById("linkUrl").value.trim();
  if (!url.startsWith("https://")) {
    return showToast("error", UI_MESSAGES.invalidLink);
  }
  try {
    await doShareLink(url);
    document.getElementById("linkUrl").value = "";
  } catch (error) {
    console.error("Share link error", error);
    showToast("error", parseError(error));
  }
}

async function handleProposalSubmit(event) {
  event.preventDefault();
  if (!state.isOwner) return showToast("error", UI_MESSAGES.ownerOnly);
  const title = document.getElementById("proposalTitle").value.trim();
  const description = document.getElementById("proposalDescription").value.trim();
  const link = document.getElementById("proposalLink").value.trim();
  try {
    await govCreateProposal(title, description, link);
    event.target.reset();
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
  try {
    await withdrawDonations(token, amount);
    if (amountInput) amountInput.value = "";
  } catch (error) {
    console.error("Withdraw error", error);
    showToast("error", parseError(error));
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const username = elements.usernameInput.value.trim();
  if (!username) return;
  try {
    await registerProfile(username);
    closeUsernameModal();
    await refreshProfile();
  } catch (error) {
    console.error("Register error", error);
    showToast("error", parseError(error));
  }
}

function refreshAfterTransaction() {
  refreshProfile();
  refreshGlobalStats();
  refreshGovernance();
  refreshLeaderboard();
  refreshFeed();
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
    renderLinkFeed(combined);
  } catch (error) {
    console.error("feed error", error);
  }
}

async function refreshGovernance() {
  try {
    const data = await loadGovernance();
    state.governance = data;
    renderGovernance(data);
  } catch (error) {
    console.error("governance error", error);
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

function renderProfile(profile) {
  if (!profile) {
    elements.profileUsername.textContent = "—";
    elements.profileAddress.textContent = "—";
    elements.profileStats.innerHTML = `<p>${t("profile.empty", "Profil bilgisi bulunamadı.")}</p>`;
    if (elements.profileMetrics) {
      elements.profileMetrics.innerHTML = "";
    }
    elements.badgeStack.innerHTML = "";
    elements.xpProgress.innerHTML = "";
    elements.publicProfileLink.removeAttribute("href");
    renderBadgeDetails(null);
    return;
  }

  elements.profileUsername.textContent = profile.username || t("profile.newUser", "Yeni Kullanıcı");
  elements.profileAddress.textContent = shorten(profile.address);
  elements.publicProfileLink.href = `/profile?addr=${profile.address}`;

  const summaryStats = [
    { label: t("profile.stats.xp", "XP"), value: profile.totalXP },
    { label: t("profile.stats.level", "Level"), value: profile.level },
    { label: t("profile.stats.tier", "Tier"), value: profile.tier },
  ];

  elements.profileStats.innerHTML = summaryStats
    .map((stat) => `<dt>${stat.label}</dt><dd>${formatNumber(stat.value)}</dd>`)
    .join("");

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

function renderXpProgress(profile) {
  const nextLevel = profile.level >= 5 ? t("profile.nextLevelMax", "Maks") : profile.level + 1;
  const progressPercent = Math.min(100, Math.floor((profile.totalXP % 20) * 5));
  return `
    <div class="progress-head">
      <div><span>${t("profile.stats.level", "Level")}</span><strong>${profile.level}</strong></div>
      <div><span>${t("profile.stats.tier", "Tier")}</span><strong>${profile.tier}</strong></div>
    </div>
    <div class="bar"><span style="width:${progressPercent}%"></span></div>
    <small>${t("profile.nextLevel", "Sonraki seviye")}: ${nextLevel}</small>
  `;
}

function renderBadgeDetails(profile = state.profile) {
  if (!elements.badgeDetails) return;
  const xp = profile?.totalXP || 0;
  const level = profile?.level || 0;
  const tier = profile?.tier || 0;
  elements.badgeDetails.innerHTML = `
    <h3>${t("badge.detailTitle", "Rozet Durumu")}</h3>
    <p>${t("badge.detailTotalXp", "Toplam XP")}: <strong>${formatNumber(xp)}</strong></p>
    <p>${t("badge.detailLevel", "Seviye")}: <strong>${level}</strong> · ${t("badge.detailTier", "Tier")}: <strong>${tier}</strong></p>
    <ul>
      <li>${t("badge.detailGm", "GM: +1 XP")}</li>
      <li>${t("badge.detailDeploy", "Deploy: +1 XP")}</li>
      <li>${t("badge.detailDonate", "Donate: +3 XP")}</li>
      <li>${t("badge.detailLink", "Link: +2 XP")}</li>
      <li>${t("badge.detailVote", "Vote: +1 XP")}</li>
    </ul>
  `;
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
  if (!entries?.length) {
    elements.linkFeed.innerHTML = `<p>${t("feed.empty", "Henüz link paylaşılmadı.")}</p>`;
    return;
  }
  elements.linkFeed.innerHTML = entries
    .map((item) => `
      <article class="feed-item">
        <div class="meta">
          <span>${shorten(item.user || "0x0")}</span>
          <time>${item.blockNumber ? `#${item.blockNumber}` : t("feed.new", "Yeni")}</time>
        </div>
        <a class="link" href="${item.link}" target="_blank" rel="noopener">${item.link}</a>
      </article>
    `)
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
    await govVote(proposalId, support);
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

function openUsernameModal() {
  elements.usernameModal.setAttribute("aria-hidden", "false");
}

function closeUsernameModal() {
  elements.usernameModal.setAttribute("aria-hidden", "true");
}

async function loadInitialData() {
  await refreshGlobalStats();
  await refreshFeed();
  await refreshGovernance();
  await refreshLeaderboard();
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
