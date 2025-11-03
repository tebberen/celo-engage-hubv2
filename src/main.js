// ========================= CELO ENGAGE HUB - UPDATED MAIN.JS ========================= //
// ✅ 3'LÜ GRID + OTOMATİK LINK FORM + KULLANICI LINK SİSTEMİ

// ✅ DOĞRU IMPORT YOLLARI
import { 
  initContract,
  sendGM,
  getGMStats,
  deployContract,
  getDeployStats,
  donateCELO,
  donateCUSD,
  getDonateStats,
  shareLink,
  getLinkStats,
  getAllSharedLinks,
  getLinksFromEvents,
  getUserSharedLinks,
  createProposal,
  vote,
  getActiveProposals,
  getProposalDetails,
  getVoteReceipt,
  getGovernanceStats,
  getUserBadge,
  getBadgeStats,
  loadUserProfile,
  withdrawDonations,
  registerUserProfile,
  saveUsername,
  getUsername
} from "./services/contractService.js";

import {
  OWNER_ADDRESS,
  DEFAULT_GM_MESSAGE,
  INITIAL_SUPPORT_LINKS,
  CELO_ECOSYSTEM_LINKS,
  CURRENT_NETWORK,
  MIN_DONATION,
  getUserSharedLinksFromStorage,
  saveUserLinkToStorage
} from "./utils/constants.js";

// ✅ WALLET SERVICE CLASS OLARAK IMPORT
import WalletService from "./services/walletService.js";

// ✅ ETHERERS IMPORT
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

// ========================= GLOBAL DEĞİŞKENLER ========================= //
let userAddress = "";
let appInitialized = false;
let isLoading = false;
const walletService = new WalletService();

// ✅ YENİ: Link tıklama takibi (localStorage ile)
let linkClicks = JSON.parse(localStorage.getItem('celoEngageHub_linkClicks')) || {};

// ✅ YENİ: Kullanıcı linkleri
let userSharedLinks = [];
let lastProfileSnapshot = null;
let lastAutoContractName = "";

const DEFAULT_CONTRACT_NAME = "MyContract";
const MAX_SUPPORT_CLICKS = 3;
const OWNER_ONLY_ELEMENT_IDS = ["donationOwnerPanel", "governanceOwnerPanel"];

// ========================= APP INIT ========================= //

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Celo Engage Hub - Starting with user links system...");
  setupNavigation();
  setupUI();
  
  // Kullanıcı linklerini yükle
  await loadUserSharedLinks();
  
  renderCommunityLinks();
  renderCeloLinks();
  
  // Sayfa yüklendiğinde bağlantı kontrolü yap
  await checkExistingConnection();
  
  console.log("✅ App ready with user links!");
});

function isOwnerAddress(address) {
  return Boolean(address) && address.toLowerCase() === OWNER_ADDRESS.toLowerCase();
}

function setOwnerOnlyVisibility(isOwner) {
  OWNER_ONLY_ELEMENT_IDS.forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;

    const shouldShow = Boolean(isOwner);
    element.style.display = shouldShow ? "block" : "none";
    element.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  });
}

// ========================= YENİ: KULLANICI LINK SİSTEMİ ========================= //

const MAX_USER_LINKS = 24;

async function loadUserSharedLinks() {
  try {
    console.log("📥 Loading user shared links...");

    // Önce blockchain'den linkleri almaya çalış
    const blockchainLinks = await getLinksFromEvents({ maxLinks: MAX_USER_LINKS });

    const localLinks = getUserSharedLinksFromStorage();

    const mergedLinks = blockchainLinks.success && blockchainLinks.links.length > 0
      ? [...blockchainLinks.links, ...localLinks]
      : localLinks;

    userSharedLinks = dedupeUserLinks(mergedLinks).slice(0, MAX_USER_LINKS);

    const sourceLabel = blockchainLinks.success && blockchainLinks.links.length > 0
      ? "blockchain"
      : "localStorage";

    console.log(`✅ Loaded ${userSharedLinks.length} links from ${sourceLabel}`);

  } catch (error) {
    console.error("❌ Load user shared links failed:", error);
    userSharedLinks = dedupeUserLinks(getUserSharedLinksFromStorage()).slice(0, MAX_USER_LINKS);
  }
}

function renderCommunityLinks() {
  renderFeaturedLinks();
  renderUserLinkCards();
}

function renderFeaturedLinks() {
  const container = document.getElementById("linksContainer");
  if (!container) return;

  const activeLinks = INITIAL_SUPPORT_LINKS.filter(link => {
    const clickCount = linkClicks[link] || 0;
    return clickCount < MAX_SUPPORT_CLICKS;
  });

  if (activeLinks.length === 0) {
    container.innerHTML = `
      <div class="feature-card">
        <h3>🎉 All Links Supported!</h3>
        <p>All community links have received enough support. New links coming soon!</p>
        <button class="action-button" onclick="showAutoLinkForm()">Share Your Link Anyway 🔗</button>
      </div>
    `;
    return;
  }

  container.innerHTML = activeLinks.slice(0, 9).map(link => {
    const clickCount = linkClicks[link] || 0;
    const clicksLeft = Math.max(0, MAX_SUPPORT_CLICKS - clickCount);

    return `
      <div class="link-card">
        <div class="link-platform">🌍 Community Link</div>
        <a href="${link}" target="_blank" class="support-link" data-link="${link}">
          ${link.length > 50 ? link.substring(0, 50) + '...' : link}
        </a>
        <button class="supportBtn" data-link="${link}">
          👆 Visit & Support (${clicksLeft} left)
        </button>
        <div class="link-stats">
          <div class="stat-item">
            <div class="stat-value">${clickCount}</div>
            <div>Clicks</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${clicksLeft}</div>
            <div>Remaining</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.supportBtn[data-link]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const clickedLink = this.getAttribute('data-link');
      handleLinkClick(clickedLink);
    });
  });

  container.querySelectorAll('.support-link[data-link]').forEach(linkElement => {
    linkElement.addEventListener('click', function(e) {
      e.preventDefault();
      const clickedLink = this.getAttribute('data-link');
      handleLinkClick(clickedLink);
    });
  });
}

function renderUserLinkCards() {
  const userContainer = document.getElementById('userLinksContainer');
  if (!userContainer) return;

  if (!userSharedLinks || userSharedLinks.length === 0) {
    userContainer.innerHTML = `
      <div class="links-empty">
        <p>No community links shared yet. Be the first to contribute!</p>
      </div>
    `;
    return;
  }

  const sortedLinks = dedupeUserLinks([...userSharedLinks]).sort((a, b) => {
    const aTime = a.timestamp || 0;
    const bTime = b.timestamp || 0;
    return bTime - aTime;
  });

  userContainer.innerHTML = sortedLinks.slice(0, MAX_USER_LINKS).map(item => {
    const clickCount = linkClicks[item.link] || 0;
    const owner = item.user ? shortenAddress(item.user) : 'Unknown';
    const timeAgo = formatTimeAgo(item.timestamp);
    const timeAgoLabel = timeAgo === "just now" ? "just now" : `${timeAgo}`;

    return `
      <div class="link-card user-link">
        <div class="link-platform">👤 Community Submission</div>
        <a href="${item.link}" target="_blank" class="support-link" data-link="${item.link}">
          ${item.link.length > 50 ? item.link.substring(0, 50) + '...' : item.link}
        </a>
        <div class="user-address">Owner: ${owner}</div>
        <div class="link-meta">Shared ${timeAgoLabel}</div>
        <button class="supportBtn" data-link="${item.link}">
          🔗 Visit Link
        </button>
        <div class="link-stats">
          <div class="stat-item">
            <div class="stat-value">${clickCount}</div>
            <div>Visits</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${timeAgoLabel}</div>
            <div>Shared</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  userContainer.querySelectorAll('.supportBtn[data-link]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const clickedLink = this.getAttribute('data-link');
      handleLinkClick(clickedLink);
    });
  });

  userContainer.querySelectorAll('.support-link[data-link]').forEach(linkElement => {
    linkElement.addEventListener('click', function(e) {
      e.preventDefault();
      const clickedLink = this.getAttribute('data-link');
      handleLinkClick(clickedLink);
    });
  });
}

function handleLinkClick(link) {
  console.log("🔗 Link clicked:", link);
  
  // 1. Linki yeni sekmede aç
  window.open(link, '_blank');
  
  // 2. Tıklama sayısını güncelle
  linkClicks[link] = (linkClicks[link] || 0) + 1;
  localStorage.setItem('celoEngageHub_linkClicks', JSON.stringify(linkClicks));
  
  // 3. UI'ı güncelle
  renderCommunityLinks();
  
  // 4. OTOMATİK LINK PAYLAŞIM FORMUNU GÖSTER (sadece community linklerine tıklandığında)
  const isCommunityLink = INITIAL_SUPPORT_LINKS.includes(link);
  if (isCommunityLink) {
    showAutoLinkForm();
  }
  
  console.log(`📊 Link ${link} click count: ${linkClicks[link]}/${MAX_SUPPORT_CLICKS}`);
}

function showAutoLinkForm() {
  const autoForm = document.getElementById('autoLinkForm');
  if (autoForm) {
    autoForm.classList.add('active');
    
    // Formu sayfanın görünen kısmına kaydır
    setTimeout(() => {
      autoForm.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 300);
  }
}

function hideAutoLinkForm() {
  const autoForm = document.getElementById('autoLinkForm');
  if (autoForm) {
    autoForm.classList.remove('active');
  }
}

async function handleAutoShareLink() {
  try {
    if (!ensureConnected()) {
      alert("⚠️ Please connect your wallet first to share a link!");
      return;
    }
    
    const linkInput = document.getElementById("autoLinkInput");
    const link = linkInput?.value?.trim();
    
    if (!link) {
      alert("Please enter a link");
      return;
    }
    
    // URL validasyonu
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }
    
    // Link uzunluğu kontrolü
    if (link.length > 500) {
      alert("Link is too long. Please use a shorter URL.");
      return;
    }
    
    toggleLoading(true, "Sharing your link on blockchain...");
    
    // ✅ Link paylaşma işlemi
    const result = await shareLink(link);
    
    if (result.success) {
      alert("🎉 Link shared successfully! Thank you for contributing to the community!");
      
      // Linki localStorage'a kaydet
      saveUserLinkToStorage(link, userAddress);
      
      // Link listesini yenile
      await loadUserSharedLinks();
      
      // Input'u temizle ve formu gizle
      if (linkInput) linkInput.value = "";
      hideAutoLinkForm();
      
      // Dashboard'u ve linkleri güncelle
      await loadDashboard();
      await loadGovernance();
      renderCommunityLinks();
    }
    
  } catch (err) {
    console.error("❌ Auto Link Share Error:", err);
    
    // Kullanıcı dostu hata mesajları
    if (err.message.includes('user rejected')) {
      alert("❌ Transaction was rejected. Please try again.");
    } else if (err.message.includes('insufficient funds')) {
      alert("❌ Insufficient funds for transaction. Please add CELO to your wallet.");
    } else {
      alert("❌ Failed to share link: " + err.message);
    }
  } finally {
    toggleLoading(false);
  }
}

// ========================= NAVIGATION ========================= //

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-button');
  const sections = document.querySelectorAll('.section');

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSection = button.getAttribute('data-section');
      
      // Tüm butonlardan active classını kaldır
      navButtons.forEach(btn => btn.classList.remove('active'));
      // Tüm sectionları gizle
      sections.forEach(section => section.classList.remove('active'));
      
      // Aktif buton ve sectionı ayarla
      button.classList.add('active');
      document.getElementById(`${targetSection}Section`).classList.add('active');
      
      // Özel section yüklemeleri
      if (targetSection === 'badges' && userAddress) {
        loadBadgeInfo();
      }
      
      // Eğer home section'a geçiliyorsa, otomatik formu gizle
      if (targetSection === 'home') {
        hideAutoLinkForm();
      }
    });
  });
}

// ========================= CÜZDAN SİSTEMİ ========================= //

// Modal elementlerini seç
const walletModal = document.getElementById('walletModal');
const connectWalletBtn = document.getElementById('connectWallet');
const closeModal = document.querySelector('.close');
const connectMetaMaskBtn = document.getElementById('connectMetaMask');
const connectWalletConnectBtn = document.getElementById('connectWalletConnect');
const disconnectWalletBtn = document.getElementById('disconnectWallet');

// Mevcut bağlantıyı kontrol et
async function checkExistingConnection() {
  try {
    const isConnected = await walletService.checkWalletConnection();
    if (isConnected) {
      console.log("🔗 Existing wallet connection found");
      userAddress = walletService.getAccount();
      await initializeApp();
    }
  } catch (error) {
    console.log("No existing wallet connection");
  }
}

// Connect Wallet butonuna tıklandığında modal'ı aç
if (connectWalletBtn) {
  connectWalletBtn.addEventListener('click', () => {
    walletModal.style.display = 'block';
  });
}

// Modal'ı kapatma işlevi
if (closeModal) {
  closeModal.addEventListener('click', () => {
    walletModal.style.display = 'none';
  });
}

// Modal dışına tıklandığında kapat
window.addEventListener('click', (event) => {
  if (event.target === walletModal) {
    walletModal.style.display = 'none';
  }
});

// MetaMask bağlantısı için tıklama olayı
if (connectMetaMaskBtn) {
  connectMetaMaskBtn.addEventListener('click', async () => {
    walletModal.style.display = 'none';
    await connectWallet();
  });
}

// WalletConnect için tıklama olayı
if (connectWalletConnectBtn) {
  connectWalletConnectBtn.addEventListener('click', () => {
    alert('🚧 WalletConnect support is coming soon!');
  });
}

async function connectWallet() {
  try {
    toggleLoading(true, "Connecting to wallet...");
    
    const result = await walletService.connectWallet();
    userAddress = result.account;
    
    if (!userAddress) throw new Error("Wallet not connected");
    
    await walletService.ensureCeloNetwork();
    
    await initializeApp();
    
    console.log("✅ Wallet connected successfully:", userAddress);
    
  } catch (err) {
    console.error("❌ Connection failed:", err);
    
    let errorMessage = "Connection failed: " + err.message;
    if (err.message.includes('rejected')) {
      errorMessage = "Connection was rejected. Please try again.";
    } else if (err.message.includes('MetaMask')) {
      errorMessage = "MetaMask not found. Please install MetaMask.";
    }
    
    alert(errorMessage);
    toggleLoading(false);
  }
}

async function initializeApp() {
  try {
    // UI Güncelleme
    document.getElementById("walletAddress").innerText = shortenAddress(userAddress);
    document.getElementById("walletStatus").innerHTML = `<p>🟢 Connected</p><span>${CURRENT_NETWORK.name}</span>`;
    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("connectWallet").style.display = "none";
    
    // Balance göster
    try {
      const balance = await walletService.getBalance();
      document.getElementById("walletBalance").innerText = `${parseFloat(balance).toFixed(4)} CELO`;
    } catch (balanceError) {
      console.warn("⚠️ Balance unavailable");
      document.getElementById("walletBalance").innerText = "Balance unavailable";
    }
    
    await initContract();

    const userIsOwner = isOwnerAddress(userAddress);
    setOwnerOnlyVisibility(userIsOwner);

    // Profil kontrolü
    const userProfile = await loadUserProfile(userAddress);
    
    if (!userProfile.exists) {
      console.log("🆕 New user - showing profile creation");
      showProfileCreationModal();
    } else {
      console.log("✅ Existing user - loading dashboard");
      await loadDashboard();
      await loadGovernance();
    }
    
    appInitialized = true;
    toggleLoading(false);
    
  } catch (err) {
    console.error("❌ Initialize app failed:", err);
    setOwnerOnlyVisibility(false);
    toggleLoading(false);
  }
}

async function disconnectWallet() {
  try {
    walletService.disconnect();

    userAddress = "";
    appInitialized = false;
    lastProfileSnapshot = null;
    lastAutoContractName = "";

    // UI'ı sıfırla
    document.getElementById("walletStatus").innerHTML = `<p>🔴 Not connected</p><span>—</span>`;
    document.getElementById("walletInfo").style.display = "none";
    document.getElementById("connectWallet").style.display = "block";
    
    // İstatistikleri sıfırla
    resetUserStats();
    
    // Owner panellerini gizle
    setOwnerOnlyVisibility(false);

    // Profil modal'ını gizle
    hideProfileCreationModal();

    const proposalsContainer = document.getElementById("proposalsList");
    if (proposalsContainer) {
      proposalsContainer.innerHTML = `
        <div class="proposal-empty">⚠️ Connect your wallet to view governance proposals.</div>
      `;
    }

    console.log("🔌 Wallet disconnected");

  } catch (err) {
    console.error("Disconnect error:", err);
    alert("Disconnect failed: " + err.message);
  }
}

function resetUserStats() {
  const statsToReset = [
    "userGmCounter", "userDeployCounter", "userDonateCounter", 
    "userLinkCounter", "userVoteCounter", "userTotalDonated",
    "profileAddress", "profileLevel", "profileTier", "profileXP",
    "profileGMCount", "profileDeployCount", "profileDonateCount",
    "profileLinkCount", "profileVoteCount"
  ];
  
  statsToReset.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      if (id === "profileAddress") {
        element.innerText = "-";
      } else if (id === "userTotalDonated") {
        element.innerText = "0 CELO";
      } else {
        element.innerText = "0";
      }
    }
  });
  
  // Badge bilgilerini temizle
  const badgeInfo = document.getElementById("userBadgeInfo");
  if (badgeInfo) badgeInfo.innerHTML = "";
}

// ========================= PROFİL OLUŞTURMA SİSTEMİ ========================= //

function showProfileCreationModal() {
  const modal = document.getElementById('profileCreationModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function hideProfileCreationModal() {
  const modal = document.getElementById('profileCreationModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function handleCreateProfile() {
  try {
    const usernameInput = document.getElementById('usernameInput');
    const username = usernameInput?.value.trim();
    
    if (!username) {
      alert("Please enter a username!");
      return;
    }
    
    if (username.length < 3) {
      alert("Username must be at least 3 characters long!");
      return;
    }
    
    if (username.length > 32) {
      alert("Username must be less than 32 characters!");
      return;
    }
    
    toggleLoading(true, "Creating your profile on blockchain...");
    
    const result = await registerUserProfile();
    
    if (result.success && !result.alreadyRegistered) {
      await saveUsername(username);
      alert("🎉 Profile created successfully!");
      hideProfileCreationModal();
      await loadDashboard();
      await loadGovernance();
      setOwnerOnlyVisibility(isOwnerAddress(userAddress));
    } else if (result.alreadyRegistered) {
      alert("✅ Profile already exists!");
      hideProfileCreationModal();
      await loadDashboard();
      await loadGovernance();
      setOwnerOnlyVisibility(isOwnerAddress(userAddress));
    }
    
  } catch (err) {
    console.error("❌ Profile creation error:", err);
    
    if (err.message.includes('user rejected')) {
      alert("❌ Transaction was rejected. Please try again.");
    } else {
      alert("Profile creation failed: " + err.message);
    }
  } finally {
    toggleLoading(false);
  }
}

// ========================= DASHBOARD SİSTEMİ ========================= //

async function loadDashboard() {
  try {
    if (!userAddress) return;

    toggleLoading(true, "Loading your profile...");

    // Tüm istatistikleri paralel olarak yükle
    const [
      gmStats,
      deployStats,
      donateStats,
      linkStats,
      govStats,
      badgeStats,
      profile
    ] = await Promise.all([
      getGMStats().catch(err => ({ total: "0", userCount: "0" })),
      getDeployStats().catch(err => ({ total: "0", userDeploys: "0" })),
      getDonateStats().catch(err => ({ 
        totalDonatedValue: "0", 
        totalDonatorsCount: "0",
        userDonationCount: "0",
        userTotalDonated: "0"
      })),
      getLinkStats().catch(err => ({ total: "0", userCount: "0" })),
      getGovernanceStats().catch(err => ({ totalVotes: "0", userVotes: "0" })),
      getBadgeStats().catch(err => "0"),
      loadUserProfile(userAddress).catch(err => ({
        gmCount: "0", deployCount: "0", donateCount: "0", 
        linkCount: "0", voteCount: "0", totalXP: "0", 
        level: "1", tier: "1", totalDonated: "0", exists: false
      }))
    ]);

    // Global Stats
    updateElementText("globalGM", gmStats.total);
    updateElementText("globalDeploy", deployStats.total);
    updateElementText("globalLinks", linkStats.total);
    updateElementText("globalVotes", govStats.totalVotes);
    updateElementText("globalBadges", badgeStats);

    // GM Section
    updateElementText("gmCounter", gmStats.total);
    updateElementText("userGmCounter", profile.gmCount);

    // Deploy Section
    updateElementText("deployCounter", deployStats.total);
    updateElementText("userDeployCounter", profile.deployCount);

    // Donate Section
    updateElementText("donateCounter", donateStats.totalDonatorsCount);
    updateElementText("userDonateCounter", profile.donateCount);
    
    try {
      updateElementText("userTotalDonated", `${ethers.utils.formatEther(profile.totalDonated || "0")} CELO`);
      updateElementText("totalDonatedValue", `${ethers.utils.formatEther(donateStats.totalDonatedValue || "0")} CELO`);
    } catch (etherError) {
      updateElementText("userTotalDonated", "0 CELO");
      updateElementText("totalDonatedValue", "0 CELO");
    }
    
    updateElementText("totalDonatorsCount", donateStats.totalDonatorsCount);

    // Links Section
    updateElementText("linkCounter", linkStats.total);
    updateElementText("userLinkCounter", profile.linkCount);

    // Governance Section
    updateElementText("voteCounter", govStats.totalVotes);
    updateElementText("userVoteCounter", profile.voteCount);

    // Profile Section
    updateElementText("profileAddress", shortenAddress(userAddress));
    updateElementText("profileLevel", profile.level);
    updateElementText("profileTier", profile.tier);
    updateElementText("profileXP", profile.totalXP);
    updateElementText("profileGMCount", profile.gmCount);
    updateElementText("profileDeployCount", profile.deployCount);
    updateElementText("profileDonateCount", profile.donateCount);
    updateElementText("profileLinkCount", profile.linkCount);
    updateElementText("profileVoteCount", profile.voteCount);

    lastProfileSnapshot = profile;

    console.log("📊 Dashboard loaded successfully");

  } catch (err) {
    console.error("⚠️ Dashboard Error:", err);
  } finally {
    toggleLoading(false);
  }
}

async function loadGovernance() {
  const proposalsContainer = document.getElementById("proposalsList");
  if (!proposalsContainer) return;

  if (!userAddress) {
    proposalsContainer.innerHTML = `
      <div class="proposal-empty">⚠️ Connect your wallet to view governance proposals.</div>
    `;
    return;
  }

  proposalsContainer.innerHTML = `
    <div class="proposal-empty">⏳ Loading proposals...</div>
  `;

  try {
    const proposalIds = await getActiveProposals();

    if (!proposalIds || proposalIds.length === 0) {
      proposalsContainer.innerHTML = `
        <div class="proposal-empty">🎉 No active proposals right now. Check back soon!</div>
      `;
      return;
    }

    const proposalEntries = await Promise.all(
      proposalIds.map(async id => {
        const [details, receipt] = await Promise.all([
          getProposalDetails(id),
          getVoteReceipt(id, userAddress)
        ]);

        if (!details) return null;

        return {
          ...details,
          receipt: receipt || { hasVoted: false, support: null }
        };
      })
    );

    const proposals = proposalEntries.filter(Boolean);

    if (proposals.length === 0) {
      proposalsContainer.innerHTML = `
        <div class="proposal-empty">⚠️ Unable to load proposal details.</div>
      `;
      return;
    }

    proposals.sort((a, b) => {
      const aTime = parseInt(a.startTime || "0", 10);
      const bTime = parseInt(b.startTime || "0", 10);
      return bTime - aTime;
    });

    proposalsContainer.innerHTML = proposals.map(proposal => {
      const forVotes = ethers.BigNumber.from(proposal.results?.forVotes || proposal.forVotes || "0");
      const againstVotes = ethers.BigNumber.from(proposal.results?.againstVotes || proposal.againstVotes || "0");
      const totalVotes = forVotes.add(againstVotes);

      const forPercentage = formatVotePercentage(forVotes, totalVotes);
      const againstPercentage = formatVotePercentage(againstVotes, totalVotes);

      const startLabel = formatProposalStart(proposal.startTime);
      const statusLabel = getProposalStatusLabel(proposal);
      const outcomeLabel = getProposalOutcomeLabel(proposal);

      const hasVoted = Boolean(proposal.receipt?.hasVoted);
      const supportChoice = proposal.receipt?.support;

      const votedLabel = hasVoted
        ? supportChoice === null
          ? "You already voted"
          : supportChoice
            ? "✅ You supported this proposal"
            : "❌ You opposed this proposal"
        : "";

      const proposalLink = proposal.link
        ? `<a href="${proposal.link}" target="_blank" rel="noopener" class="proposal-link">${proposal.link}</a>`
        : "";

      return `
        <div class="proposal-card" data-proposal-id="${proposal.id}">
          <div class="proposal-header">
            <h3>${proposal.title || "Untitled Proposal"}</h3>
            <span class="proposal-meta">${startLabel}</span>
          </div>
          <p class="proposal-description">${proposal.description || "No description provided."}</p>
          ${proposalLink}
          <div class="proposal-stats">
            <div><strong>Total Votes:</strong> ${totalVotes.toString()}</div>
            <div><strong>Support:</strong> ${forVotes.toString()} (${forPercentage}%)</div>
            <div><strong>Against:</strong> ${againstVotes.toString()} (${againstPercentage}%)</div>
            <div><strong>Status:</strong> ${statusLabel}</div>
            <div><strong>Outcome:</strong> ${outcomeLabel}</div>
          </div>
          <div class="proposal-actions">
            <button class="vote-btn support" data-proposal-id="${proposal.id}" data-support="true" ${hasVoted ? "disabled" : ""}>Support ✅</button>
            <button class="vote-btn against" data-proposal-id="${proposal.id}" data-support="false" ${hasVoted ? "disabled" : ""}>Against ❌</button>
          </div>
          <div class="proposal-status" id="proposal-status-${proposal.id}">${votedLabel}</div>
        </div>
      `;
    }).join("");

    proposals.forEach(proposal => {
      const card = proposalsContainer.querySelector(`.proposal-card[data-proposal-id="${proposal.id}"]`);
      if (!card) return;

      const supportBtn = card.querySelector('button[data-support="true"]');
      const againstBtn = card.querySelector('button[data-support="false"]');

      if (proposal.receipt?.hasVoted && proposal.receipt.support !== null) {
        const targetBtn = proposal.receipt.support ? supportBtn : againstBtn;
        if (targetBtn) targetBtn.classList.add("selected");
      }

      [supportBtn, againstBtn].forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', handleVoteButtonClick);
      });
    });
  } catch (error) {
    console.error("❌ Governance load failed:", error);
    proposalsContainer.innerHTML = `
      <div class="proposal-empty">❌ Failed to load governance data. Please try again.</div>
    `;
  }
}

function formatVotePercentage(value, total) {
  if (!total || total.isZero()) return "0.0";
  const scaled = value.mul(1000).div(total);
  return (scaled.toNumber() / 10).toFixed(1);
}

function formatProposalStart(startTime) {
  const startMs = secondsToMs(startTime);
  if (!startMs) return "Created just now";
  return `Started ${formatTimeAgo(startMs)}`;
}

function getProposalStatusLabel(proposal) {
  const now = Date.now();
  const endMs = secondsToMs(proposal.endTime);

  if (proposal.executed) {
    return "✅ Executed";
  }

  if (endMs && now > endMs) {
    return proposal.results?.approved ? "🟢 Voting closed (approved)" : "🔴 Voting closed";
  }

  if (endMs) {
    return `⏳ Ends in ${formatDuration(endMs - now)}`;
  }

  return "⏳ Voting open";
}

function getProposalOutcomeLabel(proposal) {
  if (proposal.executed) {
    return "Executed";
  }

  if (proposal.results?.approved) {
    return "Approved";
  }

  const totalVotes = ethers.BigNumber.from(proposal.results?.forVotes || proposal.forVotes || "0")
    .add(ethers.BigNumber.from(proposal.results?.againstVotes || proposal.againstVotes || "0"));

  if (totalVotes.isZero()) {
    return "Pending votes";
  }

  if (proposal.results && proposal.results.againstVotes) {
    const forVotes = ethers.BigNumber.from(proposal.results.forVotes || "0");
    const againstVotes = ethers.BigNumber.from(proposal.results.againstVotes || "0");
    return forVotes.gte(againstVotes) ? "Leading: Support" : "Leading: Against";
  }

  const forVotes = ethers.BigNumber.from(proposal.forVotes || "0");
  const againstVotes = ethers.BigNumber.from(proposal.againstVotes || "0");
  return forVotes.gte(againstVotes) ? "Leading: Support" : "Leading: Against";
}

function secondsToMs(value) {
  if (value === null || value === undefined) return null;

  try {
    const asString = value.toString ? value.toString() : String(value);
    const seconds = parseInt(asString, 10);
    if (!Number.isFinite(seconds) || seconds <= 0) return null;
    return seconds * 1000;
  } catch (err) {
    return null;
  }
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "0s";

  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    return `${totalHours}h`;
  }

  const totalDays = Math.floor(totalHours / 24);
  if (totalDays < 7) {
    return `${totalDays}d`;
  }

  const totalWeeks = Math.floor(totalDays / 7);
  if (totalWeeks < 4) {
    return `${totalWeeks}w`;
  }

  const totalMonths = Math.floor(totalDays / 30);
  if (totalMonths < 12) {
    return `${totalMonths}mo`;
  }

  const totalYears = Math.floor(totalDays / 365);
  return `${totalYears}y`;
}

async function handleVoteButtonClick(event) {
  event.preventDefault();

  if (!ensureConnected()) return;

  const button = event.currentTarget;
  const proposalId = button?.getAttribute("data-proposal-id");
  const support = button?.getAttribute("data-support") === "true";

  if (!proposalId) {
    console.warn("⚠️ Vote button missing proposal id");
    return;
  }

  const card = button.closest('.proposal-card');
  const statusElement = document.getElementById(`proposal-status-${proposalId}`);
  const voteButtons = card ? Array.from(card.querySelectorAll('.vote-btn')) : [];

  voteButtons.forEach(btn => {
    if (btn) btn.disabled = true;
  });

  if (statusElement) {
    statusElement.innerText = support
      ? "⏳ Submitting your support vote..."
      : "⏳ Submitting your against vote...";
  }

  try {
    const result = await vote(proposalId, support);
    const txSummary = result?.txHash ? ` (tx: ${shortenHash(result.txHash)})` : "";

    if (statusElement) {
      statusElement.innerText = support
        ? `✅ Support vote submitted${txSummary}`
        : `✅ Against vote submitted${txSummary}`;
    }

    await loadDashboard();
    await loadGovernance();
  } catch (error) {
    console.error("❌ Vote transaction failed:", error);

    if (statusElement) {
      const friendlyMessage = error?.message ? error.message.split('\n')[0] : "Transaction error";
      statusElement.innerText = `❌ Vote failed: ${friendlyMessage}`;
    }

    handleTransactionError(error, "vote");

    voteButtons.forEach(btn => {
      if (btn) btn.disabled = false;
    });
  }
}

// ========================= MODÜL FONKSİYONLARI ========================= //

async function handleGM() {
  try {
    if (!ensureConnected()) return;
    
    const messageInput = document.getElementById("gmMessageInput");
    const message = messageInput?.value || DEFAULT_GM_MESSAGE;
    
    if (!message.trim()) {
      alert("GM message cannot be empty!");
      return;
    }
    
    toggleLoading(true, "Sending GM...");
    await sendGM(message);
    
    alert("✅ GM sent successfully!");
    await loadDashboard();
    await loadGovernance();
  } catch (err) {
    console.error("❌ GM Error:", err);
    handleTransactionError(err, "GM");
  } finally {
    toggleLoading(false);
  }
}

async function handleDeploy() {
  try {
    if (!ensureConnected()) return;

    const nameInput = document.getElementById("contractNameInput");
    let contractName = nameInput?.value?.trim() || "";
    const shouldAutoGenerate =
      !contractName ||
      contractName === DEFAULT_CONTRACT_NAME ||
      contractName === lastAutoContractName;

    if (shouldAutoGenerate) {
      contractName = generateAutoContractName();
      lastAutoContractName = contractName;

      if (nameInput) {
        nameInput.value = contractName;
        nameInput.dataset.autoName = contractName;
      }
    } else {
      lastAutoContractName = "";
    }

    toggleLoading(true, "Deploying contract...");
    await deployContract(contractName);

    alert("✅ Contract deployed successfully!");
    await loadDashboard();
    await loadGovernance();
  } catch (err) {
    console.error("❌ Deploy Error:", err);
    handleTransactionError(err, "deploy");
  } finally {
    toggleLoading(false);
  }
}

async function handleDonateCELO() {
  try {
    if (!ensureConnected()) return;
    
    const amountInput = document.getElementById("donateAmountInput");
    let amount = amountInput?.value || "0.1";
    
    // Virgülü noktaya çevir (Türkçe locale için)
    amount = amount.replace(',', '.');
    
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid donation amount!");
      return;
    }
    
    // Minimum kontrolü
    try {
      const minDonation = parseFloat(ethers.utils.formatEther(MIN_DONATION));
      if (parseFloat(amount) < minDonation) {
        alert(`Minimum donation is ${minDonation} CELO`);
        return;
      }
    } catch (error) {
      console.warn("⚠️ Minimum donation check failed");
    }
    
    const weiAmount = ethers.utils.parseEther(amount);
    
    toggleLoading(true, "Sending CELO donation...");
    await donateCELO(weiAmount);
    
    alert("💛 CELO donation sent successfully!");
    await loadDashboard();
    await loadGovernance();
  } catch (err) {
    console.error("❌ CELO Donation Error:", err);
    handleTransactionError(err, "CELO donation");
  } finally {
    toggleLoading(false);
  }
}

async function handleDonateCUSD() {
  try {
    if (!ensureConnected()) return;
    
    const amountInput = document.getElementById("donateAmountInput");
    let amount = amountInput?.value || "0.1";
    
    // Virgülü noktaya çevir
    amount = amount.replace(',', '.');
    
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid donation amount!");
      return;
    }
    
    // Minimum kontrolü
    try {
      const minDonation = parseFloat(ethers.utils.formatEther(MIN_DONATION));
      if (parseFloat(amount) < minDonation) {
        alert(`Minimum donation is ${minDonation} cUSD`);
        return;
      }
    } catch (error) {
      console.warn("⚠️ Minimum donation check failed");
    }
    
    const weiAmount = ethers.utils.parseEther(amount);
    
    toggleLoading(true, "Sending cUSD donation...");
    await donateCUSD(weiAmount);
    
    alert("💵 cUSD donation sent successfully!");
    await loadDashboard();
    await loadGovernance();
  } catch (err) {
    console.error("❌ cUSD Donation Error:", err);
    handleTransactionError(err, "cUSD donation");
  } finally {
    toggleLoading(false);
  }
}

async function handleShareLink() {
  try {
    if (!ensureConnected()) return;
    
    const linkInput = document.getElementById("linkInput");
    const link = linkInput?.value;
    
    if (!link) {
      alert("Please enter a link");
      return;
    }
    
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }
    
    toggleLoading(true, "Sharing link...");
    await shareLink(link);
    
    alert("🔗 Link shared successfully!");
    if (linkInput) linkInput.value = "";
    await loadDashboard();
    await loadGovernance();
  } catch (err) {
    console.error("❌ Link Error:", err);
    handleTransactionError(err, "link sharing");
  } finally {
    toggleLoading(false);
  }
}

async function handleCreateProposal() {
  try {
    if (!ensureConnected()) return;
    
    const title = document.getElementById("proposalTitleInput")?.value;
    const description = document.getElementById("proposalDescInput")?.value;
    const link = document.getElementById("proposalLinkInput")?.value || "";
    
    if (!title || !description) {
      alert("Title and description are required");
      return;
    }
    
    toggleLoading(true, "Creating proposal...");
    await createProposal(title, description, link);
    
    alert("🗳️ Proposal created successfully!");
    
    // Inputları temizle
    const titleInput = document.getElementById("proposalTitleInput");
    const descInput = document.getElementById("proposalDescInput");
    const linkInput = document.getElementById("proposalLinkInput");
    
    if (titleInput) titleInput.value = "";
    if (descInput) descInput.value = "";
    if (linkInput) linkInput.value = "";
    
    await loadDashboard();
    
    await loadGovernance();
  } catch (err) {
    console.error("❌ Proposal Error:", err);
    handleTransactionError(err, "proposal creation");
  } finally {
    toggleLoading(false);
  }
}

async function loadBadgeInfo() {
  try {
    if (!ensureConnected()) return;
    
    const badge = await getUserBadge(userAddress);
    
    const badgeInfoElement = document.getElementById("userBadgeInfo");
    if (badgeInfoElement) {
      badgeInfoElement.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card">
            <h4>Level</h4>
            <div>${badge.level}</div>
          </div>
          <div class="stat-card">
            <h4>Tier</h4>
            <div>${badge.tier}</div>
          </div>
          <div class="stat-card">
            <h4>Total XP</h4>
            <div>${badge.totalXP}</div>
          </div>
          <div class="stat-card">
            <h4>Last Update</h4>
            <div>${new Date(badge.lastUpdate * 1000).toLocaleDateString()}</div>
          </div>
        </div>
      `;
    }
    
  } catch (err) {
    console.error("❌ Badge Error:", err);
    const badgeInfoElement = document.getElementById("userBadgeInfo");
    if (badgeInfoElement) {
      badgeInfoElement.innerHTML = "<p>Failed to load badge info</p>";
    }
  }
}

async function handleWithdraw() {
  try {
    if (!ensureConnected()) return;
    
    if (userAddress.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
      alert("🚫 Only owner can withdraw donations!");
      return;
    }
    
    const confirmed = confirm("Are you sure you want to withdraw all donations?");
    if (!confirmed) return;
    
    toggleLoading(true, "Withdrawing donations...");
    await withdrawDonations();
    
    alert("💸 Withdraw successful!");
    await loadDashboard();
    await loadGovernance();
  } catch (err) {
    console.error("❌ Withdraw Error:", err);
    handleTransactionError(err, "withdrawal");
  } finally {
    toggleLoading(false);
  }
}

// ========================= UI SETUP ========================= //

function setupUI() {
  console.log("🔄 Setting up UI with user links system...");

  setOwnerOnlyVisibility(false);

  // Mevcut buton event listener'ları
  safeAddEventListener("gmButton", "click", handleGM);
  safeAddEventListener("deployButton", "click", handleDeploy);
  safeAddEventListener("donateCeloBtn", "click", handleDonateCELO);
  safeAddEventListener("donateCusdBtn", "click", handleDonateCUSD);
  safeAddEventListener("shareLinkBtn", "click", handleShareLink);
  safeAddEventListener("createProposalBtn", "click", handleCreateProposal);
  safeAddEventListener("withdrawDonationsBtn", "click", handleWithdraw);
  
  // ✅ YENİ: Otomatik link form butonu
  safeAddEventListener("autoShareLinkBtn", "click", handleAutoShareLink);

  safeAddEventListener("refreshUserLinksBtn", "click", async () => {
    try {
      toggleLoading(true, "Refreshing community links...");
      await loadUserSharedLinks();
      renderCommunityLinks();
    } catch (error) {
      console.error("❌ Refresh user links failed:", error);
    } finally {
      toggleLoading(false);
    }
  });
  
  // Disconnect butonu
  if (disconnectWalletBtn) {
    disconnectWalletBtn.addEventListener("click", disconnectWallet);
  }
  
  // Profil oluşturma
  safeAddEventListener("createProfileBtn", "click", handleCreateProfile);
  safeAddEventListener("closeProfileModal", "click", hideProfileCreationModal);
  
  // Modal dışına tıklayınca kapatma
  window.addEventListener('click', (event) => {
    const profileModal = document.getElementById('profileCreationModal');
    if (event.target === profileModal) {
      hideProfileCreationModal();
    }
  });

  // Quick Donate butonları
  document.querySelectorAll('.supportBtn[data-amount]').forEach(btn => {
    btn.addEventListener('click', function() {
      const amount = this.getAttribute('data-amount');
      const token = this.getAttribute('data-token');
      const amountInput = document.getElementById('donateAmountInput');
      
      if (amountInput) amountInput.value = amount;
      
      document.querySelectorAll('.token-btn').forEach(tb => tb.classList.remove('active'));
      const targetTokenBtn = document.querySelector(`.token-btn[data-token="${token}"]`);
      if (targetTokenBtn) targetTokenBtn.classList.add('active');
    });
  });

  // Token seçimi
  document.querySelectorAll('.token-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.token-btn').forEach(tb => tb.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// ========================= UTILITY FUNCTIONS ========================= //

function safeAddEventListener(elementId, event, handler) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener(event, handler);
  } else {
    console.warn(`⚠️ Element with id '${elementId}' not found`);
  }
}

function updateElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = text;
  }
}

function shortenAddress(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}

function shortenHash(hash) {
  if (!hash || hash.length < 12) return hash || "";
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "just now";

  const now = Date.now();
  const rawTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  const safeTimestamp = Number.isFinite(rawTimestamp) ? rawTimestamp : Date.now();
  const diffMs = Math.max(0, now - safeTimestamp);
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}

function dedupeUserLinks(links) {
  if (!Array.isArray(links)) return [];

  const map = new Map();

  links.forEach(item => {
    if (!item || !item.link) return;
    const user = (item.user || "").toLowerCase();
    const key = `${user}::${item.link}`;
    const timestamp = item.timestamp || Date.now();
    const existing = map.get(key);

    if (!existing || (timestamp && timestamp > (existing.timestamp || 0))) {
      map.set(key, {
        ...item,
        timestamp
      });
    }
  });

  return Array.from(map.values());
}

function generateAutoContractName() {
  const deployCount = parseInt(lastProfileSnapshot?.deployCount || "0", 10);
  const nextCount = Number.isFinite(deployCount) ? deployCount + 1 : 1;
  const paddedCount = nextCount.toString().padStart(2, "0");
  const addressFragment = userAddress ? userAddress.slice(2, 6).toUpperCase() : "CEH";
  const timeFragment = Date.now().toString(36).slice(-4).toUpperCase();

  return `CEH-${addressFragment}-D${paddedCount}-${timeFragment}`;
}

function toggleLoading(state, message = "Loading...") {
  isLoading = state;
  const loadingIndicator = document.getElementById('loadingIndicator');
  
  if (state) {
    console.log("⏳ " + message);
    // Burada bir loading indicator gösterilebilir
  } else {
    console.log("✅ Loading complete");
  }
}

function ensureConnected() {
  if (!userAddress) {
    alert("⚠️ Please connect your wallet first!");
    return false;
  }
  return true;
}

function handleTransactionError(error, action) {
  let userMessage = `${action} failed: `;
  
  if (error.message.includes('user rejected')) {
    userMessage += "Transaction was rejected.";
  } else if (error.message.includes('insufficient funds')) {
    userMessage += "Insufficient funds for gas.";
  } else if (error.message.includes('network')) {
    userMessage += "Network error. Please check your connection.";
  } else {
    userMessage += error.message;
  }
  
  alert("❌ " + userMessage);
}

function renderCeloLinks() {
  const container = document.querySelector('.ecosystem-box ul');
  if (!container) return;
  
  container.innerHTML = CELO_ECOSYSTEM_LINKS.map(item => `
    <li><a href="${item.url}" target="_blank">${item.name}</a></li>
  `).join('');
}

// Global function for manual form triggering
window.showAutoLinkForm = showAutoLinkForm;

console.log("✅ main.js FULLY UPDATED with user links system! 🚀");
