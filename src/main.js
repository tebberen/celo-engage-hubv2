// ========================= CELO ENGAGE HUB - FULL MAIN ========================= //
// src/main.js

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
  createProposal,
  vote,
  getGovernanceStats,
  getUserBadge,
  getBadgeStats,
  loadUserProfile,
  withdrawDonations,
  registerUserProfile,
  saveUsername,
  getModule
} from "./services/contractService.js";

import {
  OWNER_ADDRESS,
  DEFAULT_GM_MESSAGE,
  INITIAL_SUPPORT_LINKS,
  CELO_ECOSYSTEM_LINKS,
  CURRENT_NETWORK,
  MIN_DONATION
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

// ========================= APP INIT ========================= //

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Celo Engage Hub - Starting...");
  setupNavigation();
  setupUI();
  renderCommunityLinks();
  renderCeloLinks();
  
  // Otomatik bağlanma YOK - sadece UI hazırlığı
  console.log("✅ App ready - waiting for user to connect wallet");
});

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
      
      // Badges section'a tıklandığında badge bilgilerini yükle
      if (targetSection === 'badges' && userAddress) {
        loadBadgeInfo();
      }
    });
  });
}

// ========================= YENİ CÜZDAN MODAL SİSTEMİ ========================= //

// Modal elementlerini seç
const walletModal = document.getElementById('walletModal');
const connectWalletBtn = document.getElementById('connectWallet');
const closeModal = document.querySelector('.close');
const connectMetaMaskBtn = document.getElementById('connectMetaMask');
const connectWalletConnectBtn = document.getElementById('connectWalletConnect');
const disconnectWalletBtn = document.getElementById('disconnectWallet');

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
    walletModal.style.display = 'none'; // Modal'ı kapat
    await connectWallet(); // MetaMask bağlantı fonksiyonunu çağır
  });
}

// WalletConnect için tıklama olayı (Coming Soon)
if (connectWalletConnectBtn) {
  connectWalletConnectBtn.addEventListener('click', () => {
    alert('🚧 WalletConnect support is coming soon!');
    // Burayı daha sonra WalletConnect entegrasyonu ile dolduracağız
  });
}

// ========================= CÜZDAN BAĞLANTI FONKSİYONU ========================= //

async function connectWallet() {
  try {
    toggleLoading(true, "Connecting to wallet...");
    
    // ✅ WalletService ile bağlan
    const result = await walletService.connectWallet();
    userAddress = result.account;
    
    if (!userAddress) throw new Error("Wallet not connected");
    
    // ✅ Ağ kontrolü
    await walletService.ensureCeloNetwork();
    
    // ✅ UI Güncelleme
    document.getElementById("walletAddress").innerText = shortenAddress(userAddress);
    document.getElementById("walletStatus").innerHTML = `<p>🟢 Connected</p><span>${CURRENT_NETWORK.name}</span>`;
    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("connectWallet").style.display = "none";
    
    // ✅ Balance göster (HATA YÖNETİMLİ)
    try {
      const balance = await walletService.getBalance();
      document.getElementById("walletBalance").innerText = `${parseFloat(balance).toFixed(4)} CELO`;
    } catch (balanceError) {
      console.warn("⚠️ Balance unavailable, but connection successful");
      document.getElementById("walletBalance").innerText = "Balance unavailable";
    }
    
    await initContract();
    
    // ✅ PROFİL KONTROLÜ - Kullanıcının profili var mı?
    const userProfile = await loadUserProfile(userAddress);
    
    if (!userProfile.exists) {
      // Profil yoksa, profil oluşturma modal'ını göster
      console.log("🆕 New user - showing profile creation");
      showProfileCreationModal();
    } else {
      // Profil varsa, normal dashboard'u yükle
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
    
    console.log("✅ Wallet connected successfully:", userAddress);
    
  } catch (err) {
    console.error("❌ Connection failed:", err);
    alert("Connection failed: " + err.message);
    toggleLoading(false);
  }
}

// ========================= PROFİL OLUŞTURMA FONKSİYONLARI ========================= //

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
    
    // ✅ PROFİL OLUŞTURMA TX GÖNDER
    const result = await registerUserProfile();
    
    // ✅ USERNAME'I KAYDET
    await saveUsername(username);
    
    alert("🎉 Profile created successfully!");
    hideProfileCreationModal();
    await loadDashboard();
    
    // Owner panel kontrolü (profil oluşturduktan sonra)
    if (userAddress.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
      document.getElementById("withdrawPanel").style.display = "block";
      document.getElementById("ownerPanel").style.display = "block";
    }
    
  } catch (err) {
    console.error("❌ Profile creation error:", err);
    alert("Profile creation failed: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// ========================= DISCONNECT FONKSİYONU ========================= //

async function disconnectWallet() {
  try {
    // WalletService üzerinden bağlantıyı kes
    walletService.disconnect();
    
    // Global değişkenleri sıfırla
    userAddress = "";
    appInitialized = false;
    
    // UI'ı sıfırla
    document.getElementById("walletStatus").innerHTML = `<p>🔴 Not connected</p><span>—</span>`;
    document.getElementById("walletInfo").style.display = "none";
    document.getElementById("connectWallet").style.display = "block";
    
    // Kullanıcıya özel istatistikleri sıfırla
    document.getElementById("userGmCounter").innerText = "0";
    document.getElementById("userDeployCounter").innerText = "0";
    document.getElementById("userDonateCounter").innerText = "0";
    document.getElementById("userLinkCounter").innerText = "0";
    document.getElementById("userVoteCounter").innerText = "0";
    
    // Profile section'daki verileri sıfırla
    document.getElementById("profileAddress").innerText = "-";
    document.getElementById("profileLevel").innerText = "1";
    document.getElementById("profileTier").innerText = "1";
    document.getElementById("profileXP").innerText = "0";
    document.getElementById("profileGMCount").innerText = "0";
    document.getElementById("profileDeployCount").innerText = "0";
    document.getElementById("profileDonateCount").innerText = "0";
    document.getElementById("profileLinkCount").innerText = "0";
    document.getElementById("profileVoteCount").innerText = "0";
    
    // Owner panellerini gizle
    document.getElementById("withdrawPanel").style.display = "none";
    document.getElementById("ownerPanel").style.display = "none";
    
    // Badge bilgilerini temizle
    document.getElementById("userBadgeInfo").innerHTML = "";
    
    // Profil oluşturma modal'ını gizle (eğer açıksa)
    hideProfileCreationModal();
    
    console.log("🔌 Wallet disconnected");
    alert("Wallet disconnected successfully!");
    
  } catch (err) {
    console.error("Disconnect error:", err);
    alert("Disconnect failed: " + err.message);
  }
}

// ========================= DASHBOARD LOADER ========================= //

async function loadDashboard() {
  try {
    if (!userAddress) return;
    
    toggleLoading(true, "Loading your profile...");

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
      getDonateStats().catch(err => ({ totalDonatedValue: "0", totalDonatorsCount: "0" })),
      getLinkStats().catch(err => ({ total: "0", hourlyLimit: "0" })),
      getGovernanceStats().catch(err => ({ totalProposals: "0", totalVotes: "0" })),
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
    updateElementText("userGmCounter", gmStats.userCount);

    // Deploy Section
    updateElementText("deployCounter", deployStats.total);
    updateElementText("userDeployCounter", deployStats.userDeploys);

    // Donate Section
    updateElementText("donateCounter", donateStats.totalDonatorsCount);
    updateElementText("userDonateCounter", profile.donateCount);
    
    // ✅ ETHERERS HATA YÖNETİMLİ
    try {
      updateElementText("userTotalDonated", `${ethers.utils.formatEther(profile.totalDonated || "0")} CELO`);
      updateElementText("totalDonatedValue", `${ethers.utils.formatEther(donateStats.totalDonatedValue || "0")} CELO`);
    } catch (etherError) {
      console.warn("⚠️ Ethers format error, using default values");
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
    toggleLoading(false);
  } catch (err) {
    console.error("⚠️ Dashboard Error:", err);
    toggleLoading(false);
  }
}

// ========================= GM MODULE ========================= //

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
    alert("GM failed: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// ========================= DEPLOY MODULE ========================= //

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
    alert("Failed to deploy contract: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// ========================= DONATE MODULE ========================= //

async function handleDonateCELO() {
  try {
    if (!ensureConnected()) return;
    
    const amountInput = document.getElementById("donateAmountInput");
    const amount = amountInput?.value || "0.1";
    
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid donation amount!");
      return;
    }
    
    // Minimum kontrolü
    try {
      if (parseFloat(amount) < parseFloat(ethers.utils.formatEther(MIN_DONATION))) {
        alert(`Minimum donation is ${ethers.utils.formatEther(MIN_DONATION)} CELO`);
        return;
      }
    } catch (error) {
      console.warn("⚠️ Minimum donation check failed, proceeding anyway");
    }
    
    const weiAmount = ethers.utils.parseEther(amount);
    
    toggleLoading(true, "Sending CELO donation...");
    await donateCELO(weiAmount);
    
    alert("💛 CELO donation sent successfully!");
    await loadDashboard();
    
  } catch (err) {
    console.error("❌ CELO Donation Error:", err);
    alert("CELO donation failed: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

async function handleDonateCUSD() {
  try {
    if (!ensureConnected()) return;
    
    const amountInput = document.getElementById("donateAmountInput");
    const amount = amountInput?.value || "0.1";
    
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid donation amount!");
      return;
    }
    
    // Minimum kontrolü
    try {
      if (parseFloat(amount) < parseFloat(ethers.utils.formatEther(MIN_DONATION))) {
        alert(`Minimum donation is ${ethers.utils.formatEther(MIN_DONATION)} cUSD`);
        return;
      }
    } catch (error) {
      console.warn("⚠️ Minimum donation check failed, proceeding anyway");
    }
    
    const weiAmount = ethers.utils.parseEther(amount);
    
    toggleLoading(true, "Sending cUSD donation...");
    await donateCUSD(weiAmount);
    
    alert("💵 cUSD donation sent successfully!");
    await loadDashboard();
    
  } catch (err) {
    console.error("❌ cUSD Donation Error:", err);
    alert("cUSD donation failed: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// ========================= QUICK DONATE FONKSİYONU ========================= //

async function handleQuickDonate(amount, token) {
  try {
    if (!ensureConnected()) return;
    
    console.log(`🚀 Quick Donate: ${amount} ${token}`);
    
    if (!amount || parseFloat(amount) <= 0) {
      alert("Invalid donation amount!");
      return;
    }
    
    toggleLoading(true, `Sending ${amount} ${token}...`);
    
    const weiAmount = ethers.utils.parseEther(amount);
    
    if (token === 'CELO') {
      await donateCELO(weiAmount);
      alert(`💛 ${amount} CELO donated successfully!`);
    } else if (token === 'cUSD') {
      await donateCUSD(weiAmount);
      alert(`💵 ${amount} cUSD donated successfully!`);
    } else {
      throw new Error(`Unsupported token: ${token}`);
    }
    
    await loadDashboard();
    
  } catch (err) {
    console.error(`❌ Quick Donate Error:`, err);
    alert(`Donation failed: ` + err.message);
  } finally {
    toggleLoading(false);
  }
}

// ========================= LINK MODULE ========================= //

async function handleShareLink() {
  try {
    if (!ensureConnected()) return;
    
    const linkInput = document.getElementById("linkInput");
    const link = linkInput?.value;
    
    if (!link) {
      alert("Please enter a link");
      return;
    }
    
    // Basit URL validasyonu
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }
    
    toggleLoading(true, "Sharing link...");
    await shareLink(link);
    
    alert("🔗 Link shared successfully!");
    if (linkInput) linkInput.value = ""; // Input'u temizle
    await loadDashboard();
    
  } catch (err) {
    console.error("❌ Link Error:", err);
    alert("Failed to share link: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// ========================= GOVERNANCE MODULE ========================= //

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
    alert("Failed to create proposal: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// ========================= BADGE & PROFILE MODULE ========================= //

async function loadBadgeInfo() {
  try {
    if (!ensureConnected()) return;
    
    toggleLoading(true, "Loading badge info...");
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
  } finally {
    toggleLoading(false);
  }
}

// ========================= OWNER WITHDRAW ========================= //

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
    alert("Withdraw failed: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// ========================= UI HELPERS ========================= //

function setupUI() {
  // Connect Wallet butonu event listener'ı artık modal'ı açacak
  // (Zaten yukarıda tanımlandı)

  // Diğer buton event listener'ları (null check ile)
  safeAddEventListener("gmButton", "click", handleGM);
  safeAddEventListener("deployButton", "click", handleDeploy);
  safeAddEventListener("donateCeloBtn", "click", handleDonateCELO);
  safeAddEventListener("donateCusdBtn", "click", handleDonateCUSD);
  safeAddEventListener("shareLinkBtn", "click", handleShareLink);
  safeAddEventListener("createProposalBtn", "click", handleCreateProposal);
  safeAddEventListener("withdrawDonationsBtn", "click", handleWithdraw);
  
  // Disconnect butonu için event listener
  if (disconnectWalletBtn) {
    disconnectWalletBtn.addEventListener("click", disconnectWallet);
  }
  
  // ✅ PROFİL OLUŞTURMA MODAL EVENT LISTENER'LARI
  safeAddEventListener("createProfileBtn", "click", handleCreateProfile);
  safeAddEventListener("closeProfileModal", "click", hideProfileCreationModal);
  
  // Modal dışına tıklayınca kapatma
  window.addEventListener('click', (event) => {
    const profileModal = document.getElementById('profileCreationModal');
    if (event.target === profileModal) {
      hideProfileCreationModal();
    }
  });

  // ✅ DÜZELTİLDİ: Quick Donate butonları - SADECE INPUT DOLDURSUN
  document.querySelectorAll('.supportBtn[data-amount]').forEach(btn => {
    btn.addEventListener('click', function() {
      const amount = this.getAttribute('data-amount');
      const token = this.getAttribute('data-token');
      const amountInput = document.getElementById('donateAmountInput');
      
      // SADECE input alanını doldur
      if (amountInput) amountInput.value = amount;
      
      // Token seçimini güncelle
      document.querySelectorAll('.token-btn').forEach(tb => tb.classList.remove('active'));
      const targetTokenBtn = document.querySelector(`.token-btn[data-token="${token}"]`);
      if (targetTokenBtn) targetTokenBtn.classList.add('active');
      
      // ❌ İŞLEM BAŞLATMA YOK - sadece input doldur
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
  // Basit loading state - geliştirilebilir
  if (state) {
    console.log("⏳ " + message);
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

function renderCommunityLinks() {
  const container = document.getElementById("linksContainer");
  if (!container) return;
  
  container.innerHTML = INITIAL_SUPPORT_LINKS.map(link => `
    <div class="link-card">
      <div class="link-platform">Community Link</div>
      <a href="${link}" target="_blank" class="support-link">${link}</a>
      <button class="supportBtn" onclick="window.open('${link}', '_blank')">
        Visit & Support
      </button>
      <div class="link-stats">
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div>Supports</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div>Visits</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderCeloLinks() {
  const container = document.querySelector('.ecosystem-box ul');
  if (!container) return;
  
  container.innerHTML = CELO_ECOSYSTEM_LINKS.map(item => `
    <li><a href="${item.url}" target="_blank">${item.name}</a></li>
  `).join('');
}

console.log("✅ main.js successfully loaded and initialized!");
