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

// ========================= YENİ: KULLANICI LINK SİSTEMİ ========================= //

async function loadUserSharedLinks() {
  try {
    console.log("📥 Loading user shared links...");
    
    // Önce blockchain'den linkleri almaya çalış
    const blockchainLinks = await getLinksFromEvents();
    
    if (blockchainLinks.success && blockchainLinks.links.length > 0) {
      userSharedLinks = blockchainLinks.links;
      console.log(`✅ Loaded ${userSharedLinks.length} links from blockchain`);
    } else {
      // Blockchain'den alınamazsa localStorage'dan al
      userSharedLinks = getUserSharedLinksFromStorage();
      console.log(`✅ Loaded ${userSharedLinks.length} links from localStorage`);
    }
    
  } catch (error) {
    console.error("❌ Load user shared links failed:", error);
    userSharedLinks = getUserSharedLinksFromStorage();
  }
}

function renderCommunityLinks() {
  const container = document.getElementById("linksContainer");
  if (!container) return;
  
  // Tüm linkleri birleştir: Community linkler + Kullanıcı linkleri
  const allCommunityLinks = [...INITIAL_SUPPORT_LINKS];
  const allUserLinks = userSharedLinks.map(item => item.link);
  const allLinks = [...allCommunityLinks, ...allUserLinks];
  
  // Tıklanma sayısı 3'ten az olan linkleri filtrele
  const activeLinks = allLinks.filter(link => {
    const clickCount = linkClicks[link] || 0;
    return clickCount < 3;
  });
  
  // Eğer hiç aktif link yoksa mesaj göster
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
  
  // Link kartlarını oluştur (maksimum 9 link)
  container.innerHTML = activeLinks.slice(0, 9).map(link => {
    const clickCount = linkClicks[link] || 0;
    const clicksLeft = 3 - clickCount;
    
    // Kullanıcı linki mi yoksa community linki mi kontrol et
    const userLinkData = userSharedLinks.find(item => item.link === link);
    const isUserLink = userLinkData !== undefined;
    const isCommunityLink = INITIAL_SUPPORT_LINKS.includes(link);
    
    let platformText = "🌍 Community Link";
    if (isUserLink) {
      platformText = "👤 User Link";
    }
    
    return `
      <div class="link-card ${isUserLink ? 'user-link' : ''}">
        <div class="link-platform">${platformText}</div>
        <a href="${link}" target="_blank" class="support-link" data-link="${link}">
          ${link.length > 50 ? link.substring(0, 50) + '...' : link}
        </a>
        ${isUserLink ? `<div class="user-address">${shortenAddress(userLinkData.user)}</div>` : ''}
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

  // Link butonlarına tıklama event'i ekle
  container.querySelectorAll('.supportBtn[data-link]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const clickedLink = this.getAttribute('data-link');
      handleLinkClick(clickedLink);
    });
  });

  // Linklere tıklama event'i ekle (doğrudan linke tıklanırsa)
  container.querySelectorAll('.support-link[data-link]').forEach(link => {
    link.addEventListener('click', function(e) {
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
  
  console.log(`📊 Link ${link} click count: ${linkClicks[link]}/3`);
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
    
    // Profil kontrolü
    const userProfile = await loadUserProfile(userAddress);
    
    if (!userProfile.exists) {
      console.log("🆕 New user - showing profile creation");
      showProfileCreationModal();
    } else {
      console.log("✅ Existing user - loading dashboard");
      await loadDashboard();
      
      // Owner panel kontrolü
      if (userAddress.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
        document.getElementById("withdrawPanel").style.display = "block";
        document.getElementById("ownerPanel").style.display = "block";
      }
    }
    
    appInitialized = true;
    toggleLoading(false);
    
  } catch (err) {
    console.error("❌ Initialize app failed:", err);
    toggleLoading(false);
  }
}

async function disconnectWallet() {
  try {
    walletService.disconnect();
    
    userAddress = "";
    appInitialized = false;
    
    // UI'ı sıfırla
    document.getElementById("walletStatus").innerHTML = `<p>🔴 Not connected</p><span>—</span>`;
    document.getElementById("walletInfo").style.display = "none";
    document.getElementById("connectWallet").style.display = "block";
    
    // İstatistikleri sıfırla
    resetUserStats();
    
    // Owner panellerini gizle
    document.getElementById("withdrawPanel").style.display = "none";
    document.getElementById("ownerPanel").style.display = "none";
    
    // Profil modal'ını gizle
    hideProfileCreationModal();
    
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
      
      // Owner panel kontrolü
      if (userAddress.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
        document.getElementById("withdrawPanel").style.display = "block";
        document.getElementById("ownerPanel").style.display = "block";
      }
    } else if (result.alreadyRegistered) {
      alert("✅ Profile already exists!");
      hideProfileCreationModal();
      await loadDashboard();
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

    console.log("📊 Dashboard loaded successfully");
    
  } catch (err) {
    console.error("⚠️ Dashboard Error:", err);
  } finally {
    toggleLoading(false);
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
    const contractName = nameInput?.value || "MyContract";
    
    if (!contractName.trim()) {
      alert("Contract name cannot be empty!");
      return;
    }
    
    toggleLoading(true, "Deploying contract...");
    await deployContract(contractName);
    
    alert("✅ Contract deployed successfully!");
    await loadDashboard();
    
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
