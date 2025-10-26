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
  withdrawDonations
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
  await initializeApp();
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
    });
  });
}

// ========================= INITIALIZATION ========================= //

async function initializeApp() {
  try {
    toggleLoading(true, "Connecting to wallet...");
    
    // ✅ WalletService ile bağlan
    const result = await walletService.connectWallet();
    userAddress = result.account;
    
    if (!userAddress) throw new Error("Wallet not connected");
    
    // ✅ Ağ kontrolü
    await walletService.ensureCeloNetwork();
    
    // ✅ UI Güncelleme - DOĞRU HTML ID'ler
    document.getElementById("walletAddress").innerText = shortenAddress(userAddress);
    document.getElementById("walletStatus").innerHTML = `<p>🟢 Connected</p><span>${CURRENT_NETWORK.name}</span>`;
    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("connectWallet").style.display = "none";
    
    // Balance göster
    const balance = await walletService.getBalance();
    document.getElementById("walletBalance").innerText = `${parseFloat(balance).toFixed(4)} CELO`;
    
    await initContract();
    await loadDashboard();
    renderCommunityLinks();
    renderCeloLinks();
    
    // Owner panel kontrolü
    if (userAddress.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
      document.getElementById("withdrawPanel").style.display = "block";
      document.getElementById("ownerPanel").style.display = "block";
    }
    
    appInitialized = true;
    toggleLoading(false);
    
  } catch (err) {
    console.error("❌ Initialization failed:", err);
    alert("Connection failed: " + err.message);
    toggleLoading(false);
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
    document.getElementById("globalGM").innerText = gmStats.total;
    document.getElementById("globalDeploy").innerText = deployStats.total;
    document.getElementById("globalLinks").innerText = linkStats.total;
    document.getElementById("globalVotes").innerText = govStats.totalVotes;
    document.getElementById("globalBadges").innerText = badgeStats;

    // GM Section
    document.getElementById("gmCounter").innerText = gmStats.total;
    document.getElementById("userGmCounter").innerText = gmStats.userCount;

    // Deploy Section
    document.getElementById("deployCounter").innerText = deployStats.total;
    document.getElementById("userDeployCounter").innerText = deployStats.userDeploys;

    // Donate Section
    document.getElementById("donateCounter").innerText = donateStats.totalDonatorsCount;
    document.getElementById("userDonateCounter").innerText = profile.donateCount;
    document.getElementById("userTotalDonated").innerText = `${ethers.utils.formatEther(profile.totalDonated || "0")} CELO`;
    document.getElementById("totalDonatedValue").innerText = `${ethers.utils.formatEther(donateStats.totalDonatedValue || "0")} CELO`;
    document.getElementById("totalDonatorsCount").innerText = donateStats.totalDonatorsCount;

    // Links Section
    document.getElementById("linkCounter").innerText = linkStats.total;
    document.getElementById("userLinkCounter").innerText = profile.linkCount;

    // Governance Section
    document.getElementById("voteCounter").innerText = govStats.totalVotes;
    document.getElementById("userVoteCounter").innerText = profile.voteCount;

    // Profile Section
    document.getElementById("profileAddress").innerText = shortenAddress(userAddress);
    document.getElementById("profileLevel").innerText = profile.level;
    document.getElementById("profileTier").innerText = profile.tier;
    document.getElementById("profileXP").innerText = profile.totalXP;
    document.getElementById("profileGMCount").innerText = profile.gmCount;
    document.getElementById("profileDeployCount").innerText = profile.deployCount;
    document.getElementById("profileDonateCount").innerText = profile.donateCount;
    document.getElementById("profileLinkCount").innerText = profile.linkCount;
    document.getElementById("profileVoteCount").innerText = profile.voteCount;

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
    const message = messageInput.value || DEFAULT_GM_MESSAGE;
    
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
    const contractName = nameInput.value || "MyContract";
    
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
    const amount = amountInput.value || "0.1";
    
    // Minimum kontrolü
    if (parseFloat(amount) < parseFloat(ethers.utils.formatEther(MIN_DONATION))) {
      alert(`Minimum donation is ${ethers.utils.formatEther(MIN_DONATION)} CELO`);
      return;
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
    const amount = amountInput.value || "0.1";
    
    // Minimum kontrolü
    if (parseFloat(amount) < parseFloat(ethers.utils.formatEther(MIN_DONATION))) {
      alert(`Minimum donation is ${ethers.utils.formatEther(MIN_DONATION)} cUSD`);
      return;
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

// ========================= LINK MODULE ========================= //

async function handleShareLink() {
  try {
    if (!ensureConnected()) return;
    
    const linkInput = document.getElementById("linkInput");
    const link = linkInput.value;
    
    if (!link) {
      alert("Please enter a link");
      return;
    }
    
    toggleLoading(true, "Sharing link...");
    await shareLink(link);
    
    alert("🔗 Link shared successfully!");
    linkInput.value = ""; // Input'u temizle
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
    
    const title = document.getElementById("proposalTitleInput").value;
    const description = document.getElementById("proposalDescInput").value;
    const link = document.getElementById("proposalLinkInput").value;
    
    if (!title || !description) {
      alert("Title and description are required");
      return;
    }
    
    toggleLoading(true, "Creating proposal...");
    await createProposal(title, description, link);
    
    alert("🗳️ Proposal created successfully!");
    
    // Inputları temizle
    document.getElementById("proposalTitleInput").value = "";
    document.getElementById("proposalDescInput").value = "";
    document.getElementById("proposalLinkInput").value = "";
    
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
    
    document.getElementById("userBadgeInfo").innerHTML = `
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
      </div>
    `;
    
  } catch (err) {
    console.error("❌ Badge Error:", err);
    document.getElementById("userBadgeInfo").innerHTML = "<p>Failed to load badge info</p>";
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
  // ✅ DOĞRU HTML ID'ler ile event listener'lar
  document.getElementById("connectWallet").addEventListener("click", initializeApp);
  document.getElementById("gmButton").addEventListener("click", handleGM);
  document.getElementById("deployButton").addEventListener("click", handleDeploy);
  document.getElementById("donateCeloBtn").addEventListener("click", handleDonateCELO);
  document.getElementById("donateCusdBtn").addEventListener("click", handleDonateCUSD);
  document.getElementById("shareLinkBtn").addEventListener("click", handleShareLink);
  document.getElementById("createProposalBtn").addEventListener("click", handleCreateProposal);
  document.getElementById("withdrawDonationsBtn").addEventListener("click", handleWithdraw);
  
  // Quick donate butonları
  document.querySelectorAll('.supportBtn[data-amount]').forEach(btn => {
    btn.addEventListener('click', function() {
      const amount = this.getAttribute('data-amount');
      const token = this.getAttribute('data-token');
      document.getElementById('donateAmountInput').value = amount;
      
      // Token seçimini güncelle
      document.querySelectorAll('.token-btn').forEach(tb => tb.classList.remove('active'));
      document.querySelector(`.token-btn[data-token="${token}"]`).classList.add('active');
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

// ✅ Badges section aktif olduğunda badge bilgilerini yükle
document.addEventListener('click', function(e) {
  if (e.target.getAttribute('data-section') === 'badges') {
    loadBadgeInfo();
  }
});

console.log("✅ main.js successfully loaded and initialized!");
