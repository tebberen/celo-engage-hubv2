// =======================
// 🌐 CELO ENGAGE HUB vFull RealTime
// =======================

import { WalletService } from './services/walletService.js';
import { ContractService } from './services/contractService.js';
import { 
  CURRENT_NETWORK, 
  OWNER_ADDRESS,
  DEFAULT_GM_MESSAGE,
  MIN_DONATION,
  INITIAL_SUPPORT_LINKS
} from './utils/constants.js';

class CeloEngageHub {
  constructor() {
    this.walletService = null;
    this.contractService = null;
    this.account = null;
    this.userProfile = null;
    this.globalStats = null;
    this.leaderboard = {
      xp: [],
      donors: [],
      gm: []
    };

    // Auto refresh interval
    this.refreshInterval = null;

    this.initializeApp();
  }

  async initializeApp() {
    try {
      console.log("🚀 Celo Engage Hub başlatılıyor...");
      this.initializeDOMElements();
      this.initializeEventListeners();
      this.walletService = new WalletService();
      await this.checkWalletConnection();
      await this.loadInitialData();
      this.startAutoRefresh();
      console.log("✅ Uygulama başarıyla başlatıldı!");
    } catch (error) {
      console.error("❌ Başlatma hatası:", error);
      this.showError("Uygulama başlatılamadı: " + error.message);
    }
  }

  // ========== DOM Elements ==========
  initializeDOMElements() {
    this.connectWalletBtn = document.getElementById("connectWallet");
    this.walletAddressEl = document.getElementById("walletAddress");
    this.walletBalanceEl = document.getElementById("walletBalance");
    this.networkInfoEl = document.getElementById("networkInfo");

    // Navigation
    this.navHome = document.getElementById("navHome");
    this.navProfile = document.getElementById("navProfile");
    this.navGovernance = document.getElementById("navGovernance");
    this.navLeaderboard = document.getElementById("navLeaderboard");
    this.navBadges = document.getElementById("navBadges");

    // Sections
    this.homeSection = document.getElementById("homeSection");
    this.profileSection = document.getElementById("profileSection");
    this.governanceSection = document.getElementById("governanceSection");
    this.leaderboardSection = document.getElementById("leaderboardSection");
    this.badgesSection = document.getElementById("badgesSection");

    // GM, Deploy, Donate, Link, Governance elements
    this.gmButton = document.getElementById("gmButton");
    this.gmMessageInput = document.getElementById("gmMessageInput");
    this.gmCounter = document.getElementById("gmCounter");
    this.userGmCounter = document.getElementById("userGmCounter");

    this.deployButton = document.getElementById("deployButton");
    this.contractNameInput = document.getElementById("contractNameInput");
    this.deployCounter = document.getElementById("deployCounter");
    this.userDeployCounter = document.getElementById("userDeployCounter");

    this.donateCeloBtn = document.getElementById("donateCeloBtn");
    this.donateCusdBtn = document.getElementById("donateCusdBtn");
    this.donateAmountInput = document.getElementById("donateAmountInput");
    this.withdrawDonationsBtn = document.getElementById("withdrawDonationsBtn");

    this.shareLinkBtn = document.getElementById("shareLinkBtn");
    this.linkInput = document.getElementById("linkInput");
    this.linkCounter = document.getElementById("linkCounter");

    this.createProposalBtn = document.getElementById("createProposalBtn");
    this.proposalTitleInput = document.getElementById("proposalTitleInput");
    this.proposalDescInput = document.getElementById("proposalDescInput");
    this.proposalLinkInput = document.getElementById("proposalLinkInput");
    this.proposalsList = document.getElementById("proposalsList");

    this.globalVisitors = document.getElementById("globalVisitors");
    this.globalGM = document.getElementById("globalGM");
    this.globalDeploy = document.getElementById("globalDeploy");
    this.globalLinks = document.getElementById("globalLinks");
    this.globalVotes = document.getElementById("globalVotes");
    this.globalBadges = document.getElementById("globalBadges");

    this.leaderboardXP = document.getElementById("leaderboardXP");
    this.leaderboardDonors = document.getElementById("leaderboardDonors");
    this.leaderboardGM = document.getElementById("leaderboardGM");

    console.log("✅ DOM elementleri yüklendi!");
  }

  // ========== Event Listeners ==========
  initializeEventListeners() {
    this.connectWalletBtn?.addEventListener("click", () => this.connectWallet());
    this.navHome?.addEventListener("click", () => this.showSection("home"));
    this.navProfile?.addEventListener("click", () => this.showSection("profile"));
    this.navGovernance?.addEventListener("click", () => this.showSection("governance"));
    this.navLeaderboard?.addEventListener("click", () => this.showSection("leaderboard"));
    this.navBadges?.addEventListener("click", () => this.showSection("badges"));

    this.gmButton?.addEventListener("click", () => this.sendGM());
    this.deployButton?.addEventListener("click", () => this.deployContract());
    this.donateCeloBtn?.addEventListener("click", () => this.donate("CELO"));
    this.donateCusdBtn?.addEventListener("click", () => this.donate("cUSD"));
    this.withdrawDonationsBtn?.addEventListener("click", () => this.withdrawDonations());
    this.shareLinkBtn?.addEventListener("click", () => this.shareLink());
    this.createProposalBtn?.addEventListener("click", () => this.createProposal());

    console.log("✅ Event listenerlar aktif!");
  }

  // ========== Wallet Bağlantısı ==========
  async checkWalletConnection() {
    try {
      const connected = await this.walletService.checkWalletConnection();
      if (connected) {
        this.account = this.walletService.getAccount();
        await this.initializeContractService();
        await this.updateWalletInfo();
        await this.loadUserData();
      }
    } catch (err) {
      console.log("Cüzdan bağlı değil.");
    }
  }

  async connectWallet() {
    try {
      this.showLoading("Cüzdana bağlanıyor...");
      await this.walletService.connectWallet();
      this.account = this.walletService.getAccount();
      await this.initializeContractService();
      await this.updateWalletInfo();
      await this.loadUserData();
      this.showSuccess("Cüzdan başarıyla bağlandı!");
    } catch (error) {
      this.showError("Bağlantı hatası: " + error.message);
    } finally {
      this.hideLoading();
    }
  }

  async initializeContractService() {
    const provider = this.walletService.getWeb3();
    this.contractService = new ContractService(provider, this.account);
    console.log("✅ Contract Service başlatıldı");
  }

  async updateWalletInfo() {
    const shortAddress = `${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
    const balance = await this.walletService.getBalance();
    this.walletAddressEl.textContent = shortAddress;
    this.walletBalanceEl.textContent = `${parseFloat(balance).toFixed(3)} CELO`;
    this.networkInfoEl.textContent = CURRENT_NETWORK.name;
    this.connectWalletBtn.style.display = "none";
  }

  // ========== Global & User Data ==========
  async loadInitialData() {
    try {
      await this.loadGlobalStats();
      if (this.account) await this.loadUserData();
      this.initializeEventWatchers();
    } catch (e) {
      console.error("Başlangıç veri yükleme hatası:", e);
    }
  }

  async loadGlobalStats() {
    try {
      const stats = await this.contractService.getGlobalStats();
      this.globalStats = stats;
      this.globalVisitors.textContent = stats.visitors ?? "0";
      this.globalGM.textContent = stats.gm ?? "0";
      this.globalDeploy.textContent = stats.deploy ?? "0";
      this.globalLinks.textContent = stats.links ?? "0";
      this.globalVotes.textContent = stats.votes ?? "0";
      this.globalBadges.textContent = stats.badges ?? "0";
    } catch (err) {
      console.error("Global stats hatası:", err);
    }
  }

  async loadUserData() {
    if (!this.contractService || !this.account) return;
    try {
      this.userProfile = await this.contractService.getUserProfile();
      this.updateProfileUI(this.userProfile);
      await this.loadBadgeInfo();
      await this.loadLeaderboard();
      await this.loadProposals();
    } catch (err) {
      console.error("Kullanıcı verisi yükleme hatası:", err);
    }
  }

  updateProfileUI(profile) {
    document.getElementById("profileAddress").textContent = this.account;
    document.getElementById("profileLevel").textContent = profile.level ?? "1";
    document.getElementById("profileTier").textContent = profile.tier ?? "1";
    document.getElementById("profileXP").textContent = profile.totalXP ?? "0";
    document.getElementById("profileGMCount").textContent = profile.gmCount ?? "0";
    document.getElementById("profileDeployCount").textContent = profile.deployCount ?? "0";
    document.getElementById("profileDonateCount").textContent = profile.donateCount ?? "0";
    document.getElementById("profileLinkCount").textContent = profile.linkCount ?? "0";
    document.getElementById("profileVoteCount").textContent = profile.voteCount ?? "0";
  }

  async loadBadgeInfo() {
    const badge = await this.contractService.getUserBadge();
    if (this.userBadgeInfo) {
      this.userBadgeInfo.innerHTML = `
        <div class="badge-card">
          <h4>Level: ${badge.level}</h4>
          <p>Tier: ${badge.tier}</p>
          <p>XP: ${badge.totalXP}</p>
          <small>Last Update: ${new Date(badge.lastUpdate * 1000).toLocaleString()}</small>
        </div>`;
    }
  }

  // ========== Event Watchers ==========
  initializeEventWatchers() {
    const gm = this.contractService.moduleContracts.gm;
    const donate = this.contractService.moduleContracts.donate;
    const deploy = this.contractService.moduleContracts.deploy;
    const link = this.contractService.moduleContracts.link;
    const badge = this.contractService.moduleContracts.badge;

    gm.on("GMEvent", async (user) => {
      console.log("📩 GM Event", user);
      await this.loadGlobalStats();
      await this.loadUserData();
    });

    donate.on("DonationEvent", async (user, amount) => {
      console.log("💰 Donation Event", user, amount.toString());
      await this.loadGlobalStats();
      await this.loadUserData();
    });

    deploy.on("ContractDeployed", async (user, addr) => {
      console.log("⚙️ Deploy Event", addr);
      await this.loadGlobalStats();
      await this.loadUserData();
    });

    link.on("LinkShared", async (user, link) => {
      console.log("🔗 Link Event", link);
      await this.loadGlobalStats();
      await this.loadUserData();
    });

    badge.on("BadgeUpdated", async (user, tier) => {
      console.log("🏅 Badge Updated", user, tier.toString());
      await this.loadUserData();
    });

    console.log("🟢 Event watchers aktif!");
  }

  // ========== Leaderboard ==========
  async loadLeaderboard() {
    try {
      const donors = await this.contractService.getTopDonors();
      const xpUsers = await this.contractService.getGlobalStats(); // örnek: total xp
      this.leaderboard.donors = donors.addresses.map((addr, i) => ({
        address: addr,
        amount: donors.amounts[i]
      }));

      if (this.leaderboardDonors) {
        this.leaderboardDonors.innerHTML = this.leaderboard.donors
          .map(
            (d, i) =>
              `<div class="leaderboard-item">#${i + 1} ${d.address.slice(0, 6)}...${d.address.slice(-4)} — ${d.amount} CELO</div>`
          )
          .join("");
      }
    } catch (err) {
      console.error("Leaderboard yükleme hatası:", err);
    }
  }

  // ========== Governance ==========
  async loadProposals() {
    const proposals = await this.contractService.getActiveProposals();
    if (this.proposalsList) {
      this.proposalsList.innerHTML =
        proposals.length === 0
          ? "<p>Henüz öneri yok.</p>"
          : proposals
              .map(
                (p) => `
        <div class="proposal-card">
          <h4>${p.title}</h4>
          <p>${p.description}</p>
          <div class="proposal-votes">👍 ${p.forVotes} 👎 ${p.againstVotes}</div>
          <button onclick="app.voteOnProposal(${p.id}, true)">Kabul</button>
          <button onclick="app.voteOnProposal(${p.id}, false)">Red</button>
        </div>`
              )
              .join("");
    }
  }

  async voteOnProposal(id, support) {
    this.showLoading("Oy veriliyor...");
    await this.contractService.vote(id, support);
    await this.loadProposals();
    this.showSuccess(`Oyunuz ${support ? "kabul" : "ret"} olarak kaydedildi.`);
    this.hideLoading();
  }

  async createProposal() {
    if (!this.contractService.isOwner()) {
      return this.showError("Sadece owner öneri oluşturabilir.");
    }
    const title = this.proposalTitleInput.value.trim();
    const desc = this.proposalDescInput.value.trim();
    const link = this.proposalLinkInput.value.trim();
    this.showLoading("Öneri oluşturuluyor...");
    await this.contractService.createProposal(title, desc, link);
    await this.loadProposals();
    this.hideLoading();
    this.showSuccess("Öneri oluşturuldu!");
  }

  // ========== Auto Refresh ==========
  startAutoRefresh() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(async () => {
      console.log("🔄 Otomatik yenileme...");
      await this.loadGlobalStats();
      if (this.account) await this.loadUserData();
    }, 60000); // 60 saniyede bir yeniler
  }

  // ========== Owner Fonksiyonları ==========
  async withdrawDonations() {
    if (!this.contractService.isOwner()) {
      return this.showError("Sadece owner çekebilir!");
    }
    try {
      this.showLoading("Bağışlar çekiliyor...");
      await this.contractService.withdrawDonations();
      this.showSuccess("Bağışlar başarıyla çekildi!");
      await this.loadUserData();
    } catch (e) {
      this.showError("Bağış çekme hatası: " + e.message);
    } finally {
      this.hideLoading();
    }
  }

  // ========== Section Navigation ==========
  showSection(name) {
    const sections = {
      home: this.homeSection,
      profile: this.profileSection,
      governance: this.governanceSection,
      leaderboard: this.leaderboardSection,
      badges: this.badgesSection
    };
    Object.values(sections).forEach((sec) => (sec.style.display = "none"));
    if (sections[name]) sections[name].style.display = "block";

    // Navigation active state
    [this.navHome, this.navProfile, this.navGovernance, this.navLeaderboard, this.navBadges].forEach((n) =>
      n?.classList.remove("active")
    );
    const activeMap = {
      home: this.navHome,
      profile: this.navProfile,
      governance: this.navGovernance,
      leaderboard: this.navLeaderboard,
      badges: this.navBadges
    };
    activeMap[name]?.classList.add("active");
  }

  // ========== UI Yardımcı Fonksiyonlar ==========
  showLoading(msg = "İşlem yapılıyor...") {
    console.log("⏳", msg);
    const el = document.getElementById("statusMessage");
    if (el) {
      el.textContent = msg;
      el.style.color = "#FBCC5C";
      el.style.display = "block";
    }
  }

  hideLoading() {
    const el = document.getElementById("statusMessage");
    if (el) el.style.display = "none";
  }

  showSuccess(msg) {
    console.log("✅", msg);
    const el = document.getElementById("statusMessage");
    if (el) {
      el.textContent = msg;
      el.style.color = "#00C851";
      el.style.display = "block";
    }
  }

  showError(msg) {
    console.error("❌", msg);
    const el = document.getElementById("statusMessage");
    if (el) {
      el.textContent = msg;
      el.style.color = "#ff4444";
      el.style.display = "block";
    }
  }
}

// =======================
// 🔥 Uygulama Başlatma
// =======================
const app = new CeloEngageHub();
window.app = app;
console.log("🎉 Celo Engage Hub vFull RealTime aktif!");
