// src/main.js

import { WalletService } from './services/walletService.js';
import { ContractService } from './services/contractService.js';
import { 
  CURRENT_NETWORK, 
  OWNER_ADDRESS,
  DEFAULT_GM_MESSAGE,
  MIN_DONATION,
  INITIAL_SUPPORT_LINKS,
  CELO_ECOSYSTEM_LINKS
} from './utils/constants.js';

class CeloEngageHub {
  constructor() {
    this.walletService = null;
    this.contractService = null;
    this.account = null;
    this.userProfile = null;
    this.globalStats = null;
    
    this.initializeApp();
  }

  // Uygulamayı başlat
  async initializeApp() {
    try {
      console.log('🚀 Celo Engage Hub başlatılıyor...');
      
      // DOM elementlerini yükle
      this.initializeDOMElements();
      
      // Event listener'ları kur
      this.initializeEventListeners();
      
      // Wallet service'i başlat
      this.walletService = new WalletService();
      
      // Kullanıcıyı kontrol et
      await this.checkWalletConnection();
      
      // Başlangıç verilerini yükle
      await this.loadInitialData();
      
      console.log('✅ Uygulama başarıyla başlatıldı!');
      
    } catch (error) {
      console.error('❌ Uygulama başlatma hatası:', error);
      this.showError('Uygulama başlatılamadı: ' + error.message);
    }
  }

  // DOM elementlerini initialize et
  initializeDOMElements() {
    // Wallet bağlantı elementleri
    this.connectWalletBtn = document.getElementById('connectWallet');
    this.walletAddressEl = document.getElementById('walletAddress');
    this.walletBalanceEl = document.getElementById('walletBalance');
    this.networkInfoEl = document.getElementById('networkInfo');

    // Navigation elementleri
    this.navHome = document.getElementById('navHome');
    this.navProfile = document.getElementById('navProfile');
    this.navGovernance = document.getElementById('navGovernance');
    this.navLeaderboard = document.getElementById('navLeaderboard');
    this.navBadges = document.getElementById('navBadges');

    // Section elementleri
    this.homeSection = document.getElementById('homeSection');
    this.profileSection = document.getElementById('profileSection');
    this.governanceSection = document.getElementById('governanceSection');
    this.leaderboardSection = document.getElementById('leaderboardSection');
    this.badgesSection = document.getElementById('badgesSection');

    // GM Section
    this.gmButton = document.getElementById('gmButton');
    this.gmMessageInput = document.getElementById('gmMessageInput');
    this.gmCounter = document.getElementById('gmCounter');
    this.userGmCounter = document.getElementById('userGmCounter');

    // Deploy Section
    this.deployButton = document.getElementById('deployButton');
    this.contractNameInput = document.getElementById('contractNameInput');
    this.deployCounter = document.getElementById('deployCounter');
    this.userDeployCounter = document.getElementById('userDeployCounter');

    // Donate Section
    this.donateCeloBtn = document.getElementById('donateCeloBtn');
    this.donateCusdBtn = document.getElementById('donateCusdBtn');
    this.donateAmountInput = document.getElementById('donateAmountInput');
    this.donateCounter = document.getElementById('donateCounter');
    this.totalDonated = document.getElementById('totalDonated');
    this.userDonateCounter = document.getElementById('userDonateCounter');
    this.withdrawDonationsBtn = document.getElementById('withdrawDonationsBtn');

    // Link Share Section
    this.shareLinkBtn = document.getElementById('shareLinkBtn');
    this.linkInput = document.getElementById('linkInput');
    this.linkCounter = document.getElementById('linkCounter');
    this.userLinkCounter = document.getElementById('userLinkCounter');

    // Governance Section
    this.createProposalBtn = document.getElementById('createProposalBtn');
    this.proposalTitleInput = document.getElementById('proposalTitleInput');
    this.proposalDescInput = document.getElementById('proposalDescInput');
    this.proposalLinkInput = document.getElementById('proposalLinkInput');
    this.proposalsList = document.getElementById('proposalsList');
    this.voteCounter = document.getElementById('voteCounter');
    this.userVoteCounter = document.getElementById('userVoteCounter');

    // Profile Section
    this.profileAddress = document.getElementById('profileAddress');
    this.profileLevel = document.getElementById('profileLevel');
    this.profileTier = document.getElementById('profileTier');
    this.profileXP = document.getElementById('profileXP');
    this.profileGMCount = document.getElementById('profileGMCount');
    this.profileDeployCount = document.getElementById('profileDeployCount');
    this.profileDonateCount = document.getElementById('profileDonateCount');
    this.profileLinkCount = document.getElementById('profileLinkCount');
    this.profileVoteCount = document.getElementById('profileVoteCount');
    this.userLinksList = document.getElementById('userLinksList');
    this.userContractsList = document.getElementById('userContractsList');

    // Badges Section
    this.badgesList = document.getElementById('badgesList');
    this.userBadgeInfo = document.getElementById('userBadgeInfo');

    // Global Stats
    this.globalVisitors = document.getElementById('globalVisitors');
    this.globalGM = document.getElementById('globalGM');
    this.globalDeploy = document.getElementById('globalDeploy');
    this.globalLinks = document.getElementById('globalLinks');
    this.globalVotes = document.getElementById('globalVotes');
    this.globalBadges = document.getElementById('globalBadges');

    // Loading states
    this.loadingElements = document.querySelectorAll('.loading');
    this.errorElements = document.querySelectorAll('.error');
    this.successElements = document.querySelectorAll('.success');

    console.log('✅ DOM elementleri başarıyla yüklendi!');
  }

  // Event listener'ları kur
  initializeEventListeners() {
    // Wallet bağlantısı
    this.connectWalletBtn?.addEventListener('click', () => this.connectWallet());

    // Navigation
    this.navHome?.addEventListener('click', () => this.showSection('home'));
    this.navProfile?.addEventListener('click', () => this.showSection('profile'));
    this.navGovernance?.addEventListener('click', () => this.showSection('governance'));
    this.navLeaderboard?.addEventListener('click', () => this.showSection('leaderboard'));
    this.navBadges?.addEventListener('click', () => this.showSection('badges'));

    // GM İşlemleri
    this.gmButton?.addEventListener('click', () => this.sendGM());
    this.gmMessageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendGM();
    });

    // Deploy İşlemleri
    this.deployButton?.addEventListener('click', () => this.deployContract());
    this.contractNameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.deployContract();
    });

    // Donate İşlemleri
    this.donateCeloBtn?.addEventListener('click', () => this.donate('CELO'));
    this.donateCusdBtn?.addEventListener('click', () => this.donate('cUSD'));
    this.withdrawDonationsBtn?.addEventListener('click', () => this.withdrawDonations());

    // Link Paylaşımı
    this.shareLinkBtn?.addEventListener('click', () => this.shareLink());
    this.linkInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.shareLink();
    });

    // Governance
    this.createProposalBtn?.addEventListener('click', () => this.createProposal());

    console.log('✅ Event listenerlar başarıyla kuruldu!');
  }

  // Wallet bağlantısını kontrol et
  async checkWalletConnection() {
    try {
      const connected = await this.walletService.checkWalletConnection();
      if (connected) {
        this.account = this.walletService.getAccount();
        await this.initializeContractService();
        await this.updateWalletInfo();
        this.showSuccess('Cüzdan bağlantısı başarılı!');
      }
    } catch (error) {
      console.log('Cüzdan bağlı değil:', error.message);
    }
  }

  // Wallet'a bağlan
  async connectWallet() {
    try {
      this.showLoading('Cüzdana bağlanıyor...');
      
      await this.walletService.connectWallet();
      this.account = this.walletService.getAccount();
      
      await this.initializeContractService();
      await this.updateWalletInfo();
      await this.loadUserData();
      
      this.showSuccess('Cüzdan başarıyla bağlandı!');
      
    } catch (error) {
      console.error('Cüzdan bağlantı hatası:', error);
      this.showError('Cüzdan bağlanamadı: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  // Contract service'i başlat
  async initializeContractService() {
    try {
      const web3 = this.walletService.getWeb3();
      this.contractService = new ContractService(web3, this.account);
      console.log('✅ Contract Service başlatıldı!');
    } catch (error) {
      console.error('Contract Service başlatma hatası:', error);
      throw error;
    }
  }

  // Wallet bilgilerini güncelle
  async updateWalletInfo() {
    if (!this.account) return;

    try {
      // Adresi göster
      const shortAddress = `${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
      this.walletAddressEl.textContent = shortAddress;
      
      // Balance'ı getir
      const balance = await this.walletService.getBalance();
      this.walletBalanceEl.textContent = `${parseFloat(balance).toFixed(4)} CELO`;
      
      // Network bilgisi
      this.networkInfoEl.textContent = CURRENT_NETWORK.name;
      
      // Connect butonunu gizle
      this.connectWalletBtn.style.display = 'none';
      this.walletAddressEl.parentElement.style.display = 'block';
      
    } catch (error) {
      console.error('Wallet info güncelleme hatası:', error);
    }
  }

  // Başlangıç verilerini yükle
  async loadInitialData() {
    try {
      await this.loadGlobalStats();
      await this.loadSupportLinks();
      
      if (this.account) {
        await this.loadUserData();
      }
    } catch (error) {
      console.error('Başlangıç veri yükleme hatası:', error);
    }
  }

  // Global istatistikleri yükle
  async loadGlobalStats() {
    if (!this.contractService) return;

    try {
      this.globalStats = await this.contractService.getGlobalStats();
      
      // Global sayacları güncelle
      this.globalVisitors.textContent = this.globalStats.visitors || '0';
      this.globalGM.textContent = this.globalStats.gm || '0';
      this.globalDeploy.textContent = this.globalStats.deploy || '0';
      this.globalLinks.textContent = this.globalStats.links || '0';
      this.globalVotes.textContent = this.globalStats.votes || '0';
      this.globalBadges.textContent = this.globalStats.badges || '0';
      
    } catch (error) {
      console.error('Global stats yükleme hatası:', error);
    }
  }

  // Kullanıcı verilerini yükle
  async loadUserData() {
    if (!this.contractService || !this.account) return;

    try {
      // Kullanıcı profilini getir
      this.userProfile = await this.contractService.getUserProfile();
      
      // Kullanıcı istatistiklerini getir
      const userStats = await this.contractService.getUserStats();
      
      // Profil sayaclarını güncelle
      this.userGmCounter.textContent = userStats.gmCount || '0';
      this.userDeployCounter.textContent = userStats.deployCount || '0';
      this.userDonateCounter.textContent = userStats.donateCount || '0';
      this.userLinkCounter.textContent = userStats.linkCount || '0';
      this.userVoteCounter.textContent = userStats.voteCount || '0';
      
      // Global sayacları güncelle
      this.gmCounter.textContent = this.globalStats?.gm || '0';
      this.deployCounter.textContent = this.globalStats?.deploy || '0';
      this.donateCounter.textContent = this.globalStats?.visitors || '0'; // Bağış sayısı için uygun alan
      this.linkCounter.textContent = this.globalStats?.links || '0';
      this.voteCounter.textContent = this.globalStats?.votes || '0';
      
      // Profil section'ını güncelle
      await this.updateProfileSection();
      
      // Badge bilgilerini getir
      await this.loadBadgeInfo();
      
      // Kullanıcı linklerini getir
      await this.loadUserLinks();
      
      // Kullanıcı kontratlarını getir
      await this.loadUserContracts();
      
      // Governance verilerini getir
      await this.loadProposals();
      
      // Owner kontrolü - özel elementleri göster/gizle
      this.toggleOwnerElements();
      
    } catch (error) {
      console.error('Kullanıcı veri yükleme hatası:', error);
    }
  }

  // Profil section'ını güncelle
  async updateProfileSection() {
    if (!this.userProfile) return;

    try {
      this.profileAddress.textContent = this.account;
      this.profileLevel.textContent = this.userProfile.level || '1';
      this.profileTier.textContent = this.userProfile.tier || '1';
      this.profileXP.textContent = this.userProfile.totalXP || '0';
      this.profileGMCount.textContent = this.userProfile.gmCount || '0';
      this.profileDeployCount.textContent = this.userProfile.deployCount || '0';
      this.profileDonateCount.textContent = this.userProfile.donateCount || '0';
      this.profileLinkCount.textContent = this.userProfile.linkCount || '0';
      this.profileVoteCount.textContent = this.userProfile.voteCount || '0';
      
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
    }
  }

  // Badge bilgilerini yükle
  async loadBadgeInfo() {
    if (!this.contractService) return;

    try {
      const badgeInfo = await this.contractService.getUserBadge();
      
      // Badge bilgilerini göster
      if (this.userBadgeInfo) {
        this.userBadgeInfo.innerHTML = `
          <div class="badge-card">
            <h4>Seviye: ${badgeInfo.level || '1'}</h4>
            <p>Tier: ${badgeInfo.tier || '1'}</p>
            <p>Toplam XP: ${badgeInfo.totalXP || '0'}</p>
            <p>Son Güncelleme: ${new Date(badgeInfo.lastUpdate * 1000).toLocaleDateString()}</p>
          </div>
        `;
      }
      
    } catch (error) {
      console.error('Badge bilgisi yükleme hatası:', error);
    }
  }

  // Kullanıcı linklerini yükle
  async loadUserLinks() {
    if (!this.contractService) return;

    try {
      const userLinks = await this.contractService.getUserLinks();
      
      if (this.userLinksList && userLinks.length > 0) {
        this.userLinksList.innerHTML = userLinks.map(link => `
          <div class="link-item">
            <a href="${link}" target="_blank" rel="noopener">${link}</a>
          </div>
        `).join('');
      }
      
    } catch (error) {
      console.error('Kullanıcı linkleri yükleme hatası:', error);
    }
  }

  // Kullanıcı kontratlarını yükle
  async loadUserContracts() {
    if (!this.contractService) return;

    try {
      const userContracts = await this.contractService.getUserContracts();
      
      if (this.userContractsList && userContracts.length > 0) {
        this.userContractsList.innerHTML = userContracts.map(contract => `
          <div class="contract-item">
            <span class="contract-address">${contract}</span>
            <button onclick="app.viewContract('${contract}')" class="btn-small">Görüntüle</button>
          </div>
        `).join('');
      }
      
    } catch (error) {
      console.error('Kullanıcı kontratları yükleme hatası:', error);
    }
  }

  // Önerileri yükle
  async loadProposals() {
    if (!this.contractService) return;

    try {
      const proposals = await this.contractService.getActiveProposals();
      
      if (this.proposalsList) {
        if (proposals.length === 0) {
          this.proposalsList.innerHTML = '<p>Henüz aktif öneri bulunmuyor.</p>';
          return;
        }

        this.proposalsList.innerHTML = proposals.map(proposal => `
          <div class="proposal-card">
            <h4>${proposal.title}</h4>
            <p>${proposal.description}</p>
            ${proposal.link ? `<a href="${proposal.link}" target="_blank">Detaylı Bilgi</a>` : ''}
            <div class="proposal-meta">
              <span>Başlangıç: ${new Date(proposal.startTime * 1000).toLocaleDateString()}</span>
              <span>Bitiş: ${new Date(proposal.endTime * 1000).toLocaleDateString()}</span>
            </div>
            <div class="proposal-votes">
              <span>👍 ${proposal.forVotes}</span>
              <span>👎 ${proposal.againstVotes}</span>
            </div>
            <div class="proposal-actions">
              <button onclick="app.voteOnProposal(${proposal.id}, true)" class="btn-success">Kabul Et</button>
              <button onclick="app.voteOnProposal(${proposal.id}, false)" class="btn-danger">Reddet</button>
            </div>
          </div>
        `).join('');
      }
      
    } catch (error) {
      console.error('Önerileri yükleme hatası:', error);
    }
  }

  // Support linklerini yükle
  async loadSupportLinks() {
    // Implementation for support links
  }

  // GM gönder
  async sendGM() {
    if (!this.contractService) {
      this.showError('Lütfen önce cüzdanınıza bağlanın!');
      return;
    }

    try {
      this.showLoading('GM gönderiliyor...');
      
      const message = this.gmMessageInput?.value || DEFAULT_GM_MESSAGE;
      await this.contractService.sendGM(message);
      
      await this.loadUserData();
      await this.loadGlobalStats();
      
      this.showSuccess('GM başarıyla gönderildi!');
      if (this.gmMessageInput) this.gmMessageInput.value = '';
      
    } catch (error) {
      console.error('GM gönderme hatası:', error);
      this.showError('GM gönderilemedi: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  // Kontrat deploy et
  async deployContract() {
    if (!this.contractService) {
      this.showError('Lütfen önce cüzdanınıza bağlanın!');
      return;
    }

    try {
      this.showLoading('Kontrat deploy ediliyor...');
      
      const contractName = this.contractNameInput?.value || `Contract-${Date.now()}`;
      await this.contractService.deployContract(contractName);
      
      await this.loadUserData();
      await this.loadGlobalStats();
      
      this.showSuccess('Kontrat başarıyla deploy edildi!');
      if (this.contractNameInput) this.contractNameInput.value = '';
      
    } catch (error) {
      console.error('Kontrat deploy hatası:', error);
      this.showError('Kontrat deploy edilemedi: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  // Bağış yap
  async donate(tokenType) {
    if (!this.contractService) {
      this.showError('Lütfen önce cüzdanınıza bağlanın!');
      return;
    }

    try {
      const amount = parseFloat(this.donateAmountInput?.value);
      if (!amount || amount < 0.1) {
        this.showError('Minimum bağış miktarı 0.1 CELO/cUSD');
        return;
      }

      this.showLoading(`${tokenType} bağışı yapılıyor...`);

      if (tokenType === 'CELO') {
        await this.contractService.donateCELO(amount);
      } else {
        await this.contractService.donateCUSD(amount);
      }

      await this.loadUserData();
      await this.loadGlobalStats();
      
      this.showSuccess(`${amount} ${tokenType} başarıyla bağışlandı!`);
      if (this.donateAmountInput) this.donateAmountInput.value = '';
      
    } catch (error) {
      console.error('Bağış hatası:', error);
      this.showError('Bağış yapılamadı: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  // Link paylaş
  async shareLink() {
    if (!this.contractService) {
      this.showError('Lütfen önce cüzdanınıza bağlanın!');
      return;
    }

    try {
      const link = this.linkInput?.value?.trim();
      if (!link) {
        this.showError('Lütfen geçerli bir link girin!');
        return;
      }

      // Link doğrulama
      const isValid = await this.contractService.validateLink(link);
      if (!isValid) {
        this.showError('Geçersiz link formatı! HTTPS ile başlamalı.');
        return;
      }

      this.showLoading('Link paylaşılıyor...');
      await this.contractService.shareLink(link);
      
      await this.loadUserData();
      await this.loadGlobalStats();
      
      this.showSuccess('Link başarıyla paylaşıldı!');
      if (this.linkInput) this.linkInput.value = '';
      
    } catch (error) {
      console.error('Link paylaşma hatası:', error);
      this.showError('Link paylaşılamadı: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  // Öneri oluştur (sadece owner)
  async createProposal() {
    if (!this.contractService || !this.contractService.isOwner()) {
      this.showError('Sadece proje sahibi öneri oluşturabilir!');
      return;
    }

    try {
      const title = this.proposalTitleInput?.value?.trim();
      const description = this.proposalDescInput?.value?.trim();
      const link = this.proposalLinkInput?.value?.trim();

      if (!title || !description) {
        this.showError('Lütfen başlık ve açıklama girin!');
        return;
      }

      this.showLoading('Öneri oluşturuluyor...');
      await this.contractService.createProposal(title, description, link);
      
      await this.loadProposals();
      await this.loadGlobalStats();
      
      this.showSuccess('Öneri başarıyla oluşturuldu!');
      
      // Inputları temizle
      if (this.proposalTitleInput) this.proposalTitleInput.value = '';
      if (this.proposalDescInput) this.proposalDescInput.value = '';
      if (this.proposalLinkInput) this.proposalLinkInput.value = '';
      
    } catch (error) {
      console.error('Öneri oluşturma hatası:', error);
      this.showError('Öneri oluşturulamadı: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  // Oy verme
  async voteOnProposal(proposalId, support) {
    if (!this.contractService) {
      this.showError('Lütfen önce cüzdanınıza bağlanın!');
      return;
    }

    try {
      this.showLoading('Oy veriliyor...');
      await this.contractService.vote(proposalId, support);
      
      await this.loadProposals();
      await this.loadUserData();
      
      this.showSuccess(`Oyunuz ${support ? 'kabul' : 'ret'} olarak kaydedildi!`);
      
    } catch (error) {
      console.error('Oy verme hatası:', error);
      this.showError('Oy verilemedi: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  // Bağışları çek (sadece owner)
  async withdrawDonations() {
    if (!this.contractService || !this.contractService.isOwner()) {
      this.showError('Sadece proje sahibi bağışları çekebilir!');
      return;
    }

    try {
      this.showLoading('Bağışlar çekiliyor...');
      await this.contractService.withdrawDonations();
      
      this.showSuccess('Bağışlar başarıyla çekildi!');
      
    } catch (error) {
      console.error('Bağış çekme hatası:', error);
      this.showError('Bağışlar çekilemedi: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  // Section gösterme
  showSection(sectionName) {
    // Tüm section'ları gizle
    const sections = [this.homeSection, this.profileSection, this.governanceSection, this.leaderboardSection, this.badgesSection];
    sections.forEach(section => {
      if (section) section.style.display = 'none';
    });

    // Aktif section'ı göster
    switch (sectionName) {
      case 'home':
        if (this.homeSection) this.homeSection.style.display = 'block';
        break;
      case 'profile':
        if (this.profileSection) this.profileSection.style.display = 'block';
        break;
      case 'governance':
        if (this.governanceSection) this.governanceSection.style.display = 'block';
        break;
      case 'leaderboard':
        if (this.leaderboardSection) this.leaderboardSection.style.display = 'block';
        break;
      case 'badges':
        if (this.badgesSection) this.badgesSection.style.display = 'block';
        break;
    }

    // Navigation aktifliğini güncelle
    this.updateNavigation(sectionName);
  }

  // Navigation aktifliğini güncelle
  updateNavigation(activeSection) {
    const navItems = [this.navHome, this.navProfile, this.navGovernance, this.navLeaderboard, this.navBadges];
    navItems.forEach(nav => {
      if (nav) nav.classList.remove('active');
    });

    switch (activeSection) {
      case 'home':
        if (this.navHome) this.navHome.classList.add('active');
        break;
      case 'profile':
        if (this.navProfile) this.navProfile.classList.add('active');
        break;
      case 'governance':
        if (this.navGovernance) this.navGovernance.classList.add('active');
        break;
      case 'leaderboard':
        if (this.navLeaderboard) this.navLeaderboard.classList.add('active');
        break;
      case 'badges':
        if (this.navBadges) this.navBadges.classList.add('active');
        break;
    }
  }

  // Owner elementlerini göster/gizle
  toggleOwnerElements() {
    const isOwner = this.contractService?.isOwner();
    
    // Governance create proposal butonu
    if (this.createProposalBtn) {
      this.createProposalBtn.style.display = isOwner ? 'block' : 'none';
    }
    
    // Donate withdraw butonu
    if (this.withdrawDonationsBtn) {
      this.withdrawDonationsBtn.style.display = isOwner ? 'block' : 'none';
    }
  }

  // Kontratı görüntüle
  async viewContract(address) {
    const blockExplorer = CURRENT_NETWORK.blockExplorer;
    window.open(`${blockExplorer}/address/${address}`, '_blank');
  }

  // UI Yardımcı Fonksiyonları
  showLoading(message = 'İşlem yapılıyor...') {
    console.log('⏳', message);
    // Burada loading state'ini gösterebilirsiniz
  }

  hideLoading() {
    // Loading state'ini gizle
  }

  showSuccess(message) {
    console.log('✅', message);
    // Başarı mesajını göster
  }

  showError(message) {
    console.error('❌', message);
    // Hata mesajını göster
  }
}

// Uygulamayı başlat
const app = new CeloEngageHub();

// Global erişim için
window.app = app;

console.log('🎉 Celo Engage Hub başlatıldı!');
