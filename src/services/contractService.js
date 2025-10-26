// src/services/contractService.js

import { 
  CONTRACT_ADDRESS, 
  CONTRACT_ABI,
  MODULES,
  CURRENT_TOKENS,
  OWNER_ADDRESS,
  MIN_DONATION
} from '../utils/constants.js';

export class ContractService {
  constructor(provider, account) {
    this.provider = provider;
    this.account = account;
    this.signer = provider.getSigner();
    this.contracts = {};
    this.moduleContracts = {};
    this.initializeContracts();
  }

  // Kontratları Ethers.js ile başlat
  initializeContracts() {
    try {
      // Ana kontrat
      this.contracts.main = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
      
      // Modül kontratları
      this.moduleContracts.badge = new ethers.Contract(MODULES.BADGE.address, MODULES.BADGE.abi, this.signer);
      this.moduleContracts.deploy = new ethers.Contract(MODULES.DEPLOY.address, MODULES.DEPLOY.abi, this.signer);
      this.moduleContracts.donate = new ethers.Contract(MODULES.DONATE.address, MODULES.DONATE.abi, this.signer);
      this.moduleContracts.gm = new ethers.Contract(MODULES.GM.address, MODULES.GM.abi, this.signer);
      this.moduleContracts.governance = new ethers.Contract(MODULES.GOVERNANCE.address, MODULES.GOVERNANCE.abi, this.signer);
      this.moduleContracts.link = new ethers.Contract(MODULES.LINK.address, MODULES.LINK.abi, this.signer);
      this.moduleContracts.profile = new ethers.Contract(MODULES.PROFILE.address, MODULES.PROFILE.abi, this.signer);

      console.log("✅ Tüm kontratlar başarıyla yüklendi!");
    } catch (error) {
      console.error("❌ Kontrat başlatma hatası:", error);
      throw error;
    }
  }

  // Kullanıcı kaydı
  async registerUser() {
    try {
      const result = await this.contracts.main.registerUser();
      return await result.wait();
    } catch (error) {
      console.error("Kullanıcı kaydı hatası:", error);
      throw error;
    }
  }

  // GM gönderme
  async sendGM(message = "Hello from Celo Engage Hub!") {
    try {
      const result = await this.moduleContracts.gm.sendGM(this.account, message);
      return await result.wait();
    } catch (error) {
      console.error("GM gönderme hatası:", error);
      throw error;
    }
  }

  // Kontrat deploy etme
  async deployContract(contractName = "SimpleContract") {
    try {
      const result = await this.moduleContracts.deploy.deployContract(this.account, contractName);
      return await result.wait();
    } catch (error) {
      console.error("Kontrat deploy hatası:", error);
      throw error;
    }
  }

  // CELO bağışı
  async donateCELO(amount) {
    try {
      const weiAmount = ethers.utils.parseEther(amount.toString());
      
      const result = await this.moduleContracts.donate.donateCELO(this.account, {
        value: weiAmount
      });
      return await result.wait();
    } catch (error) {
      console.error("CELO bağış hatası:", error);
      throw error;
    }
  }

  // cUSD bağışı
  async donateCUSD(amount) {
    try {
      const weiAmount = ethers.utils.parseEther(amount.toString());
      
      // cUSD token kontratı
      const cUSDToken = new ethers.Contract(
        CURRENT_TOKENS.cUSD.address, 
        [
          "function approve(address spender, uint256 amount) returns (bool)"
        ],
        this.signer
      );

      // cUSD onayı
      await (await cUSDToken.approve(MODULES.DONATE.address, weiAmount)).wait();

      // Bağış yap
      const result = await this.moduleContracts.donate.donateCUSD(this.account, weiAmount);
      return await result.wait();
    } catch (error) {
      console.error("cUSD bağış hatası:", error);
      throw error;
    }
  }

  // Link paylaşma
  async shareLink(link) {
    try {
      const result = await this.moduleContracts.link.shareLink(this.account, link);
      return await result.wait();
    } catch (error) {
      console.error("Link paylaşma hatası:", error);
      throw error;
    }
  }

  // Öneri oluşturma (sadece owner)
  async createProposal(title, description, link) {
    try {
      const result = await this.moduleContracts.governance.createProposal(
        this.account, title, description, link
      );
      return await result.wait();
    } catch (error) {
      console.error("Öneri oluşturma hatası:", error);
      throw error;
    }
  }

  // Oy verme
  async vote(proposalId, support) {
    try {
      const result = await this.moduleContracts.governance.vote(
        this.account, proposalId, support
      );
      return await result.wait();
    } catch (error) {
      console.error("Oy verme hatası:", error);
      throw error;
    }
  }

  // Bağışları çekme (sadece owner)
  async withdrawDonations() {
    try {
      const result = await this.moduleContracts.donate.withdraw(this.account);
      return await result.wait();
    } catch (error) {
      console.error("Bağış çekme hatası:", error);
      throw error;
    }
  }

  // Öneriyi execute et (sadece owner)
  async executeProposal(proposalId) {
    try {
      const result = await this.moduleContracts.governance.executeProposal(proposalId);
      return await result.wait();
    } catch (error) {
      console.error("Öneri execute hatası:", error);
      throw error;
    }
  }

  // XP ekleme (sadece belirli kontratlar için)
  async addXP(user, xpAmount) {
    try {
      const result = await this.moduleContracts.badge.addXP(user, xpAmount);
      return await result.wait();
    } catch (error) {
      console.error("XP ekleme hatası:", error);
      throw error;
    }
  }

  // Tier güncelleme
  async updateTier(gmCount, deployCount, donateCount, linkCount, voteCount) {
    try {
      const result = await this.moduleContracts.badge.updateTier(
        this.account, gmCount, deployCount, donateCount, linkCount, voteCount
      );
      return await result.wait();
    } catch (error) {
      console.error("Tier güncelleme hatası:", error);
      throw error;
    }
  }

  // Seviye güncelleme
  async updateLevel() {
    try {
      const result = await this.moduleContracts.profile.updateLevel(this.account);
      return await result.wait();
    } catch (error) {
      console.error("Seviye güncelleme hatası:", error);
      throw error;
    }
  }

  // Profil tier güncelleme
  async updateProfileTier() {
    try {
      const result = await this.moduleContracts.profile.updateTier(this.account);
      return await result.wait();
    } catch (error) {
      console.error("Profil tier güncelleme hatası:", error);
      throw error;
    }
  }

  // Kullanıcı kontratı ekleme
  async addUserContract(contractAddress) {
    try {
      const result = await this.moduleContracts.profile.addUserContract(this.account, contractAddress);
      return await result.wait();
    } catch (error) {
      console.error("Kontrat ekleme hatası:", error);
      throw error;
    }
  }

  // Kullanıcı linki ekleme
  async addUserLink(link) {
    try {
      const result = await this.moduleContracts.profile.addUserLink(this.account, link);
      return await result.wait();
    } catch (error) {
      console.error("Link ekleme hatası:", error);
      throw error;
    }
  }

  // GM sayısını artırma
  async incrementGMCount() {
    try {
      const result = await this.moduleContracts.profile.incrementGMCount(this.account);
      return await result.wait();
    } catch (error) {
      console.error("GM sayısı artırma hatası:", error);
      throw error;
    }
  }

  // Deploy sayısını artırma
  async incrementDeployCount() {
    try {
      const result = await this.moduleContracts.profile.incrementDeployCount(this.account);
      return await result.wait();
    } catch (error) {
      console.error("Deploy sayısı artırma hatası:", error);
      throw error;
    }
  }

  // Bağış sayısını artırma
  async incrementDonateCount(amount) {
    try {
      const result = await this.moduleContracts.profile.incrementDonateCount(this.account, amount);
      return await result.wait();
    } catch (error) {
      console.error("Bağış sayısı artırma hatası:", error);
      throw error;
    }
  }

  // Link sayısını artırma
  async incrementLinkCount() {
    try {
      const result = await this.moduleContracts.profile.incrementLinkCount(this.account);
      return await result.wait();
    } catch (error) {
      console.error("Link sayısı artırma hatası:", error);
      throw error;
    }
  }

  // Oy sayısını artırma
  async incrementVoteCount() {
    try {
      const result = await this.moduleContracts.profile.incrementVoteCount(this.account);
      return await result.wait();
    } catch (error) {
      console.error("Oy sayısı artırma hatası:", error);
      throw error;
    }
  }

  // Modül bağlama (sadece owner)
  async connectModule(moduleName, moduleAddress) {
    try {
      const result = await this.contracts.main.connectModule(moduleName, moduleAddress);
      return await result.wait();
    } catch (error) {
      console.error("Modül bağlama hatası:", error);
      throw error;
    }
  }

  // === OKUMA FONKSİYONLARI ===

  // Kullanıcı profilini getir
  async getUserProfile() {
    try {
      const profile = await this.moduleContracts.profile.getUserProfile(this.account);
      return {
        gmCount: Number(profile.gmCount),
        deployCount: Number(profile.deployCount),
        donateCount: Number(profile.donateCount),
        linkCount: Number(profile.linkCount),
        voteCount: Number(profile.voteCount),
        totalXP: Number(profile.totalXP),
        level: Number(profile.level),
        tier: Number(profile.tier),
        totalDonated: Number(profile.totalDonated),
        exists: profile.exists
      };
    } catch (error) {
      console.error("Profil getirme hatası:", error);
      throw error;
    }
  }

  // Kullanıcı istatistiklerini getir
  async getUserStats() {
    try {
      const stats = await this.moduleContracts.profile.getUserStats(this.account);
      return {
        gmCount: Number(stats[0]),
        deployCount: Number(stats[1]),
        donateCount: Number(stats[2]),
        linkCount: Number(stats[3]),
        voteCount: Number(stats[4]),
        totalXP: Number(stats[5]),
        level: Number(stats[6]),
        tier: Number(stats[7]),
        totalDonated: Number(stats[8])
      };
    } catch (error) {
      console.error("İstatistik getirme hatası:", error);
      throw error;
    }
  }

  // Global istatistikleri getir
  async getGlobalStats() {
    try {
      const stats = await this.moduleContracts.profile.getGlobalStats();
      return {
        visitors: Number(stats[0]),
        gm: Number(stats[1]),
        deploy: Number(stats[2]),
        links: Number(stats[3]),
        votes: Number(stats[4]),
        badges: Number(stats[5])
      };
    } catch (error) {
      console.error("Global istatistik hatası:", error);
      throw error;
    }
  }

  // Kullanıcı badge bilgilerini getir
  async getUserBadge() {
    try {
      const badge = await this.moduleContracts.badge.getUserBadge(this.account);
      return {
        totalXP: Number(badge[0]),
        level: Number(badge[1]),
        tier: Number(badge[2]),
        lastUpdate: Number(badge[3])
      };
    } catch (error) {
      console.error("Badge getirme hatası:", error);
      throw error;
    }
  }

  // GM istatistikleri
  async getGMStats() {
    try {
      const stats = await this.moduleContracts.gm.getGMStats();
      return {
        total: Number(stats[0]),
        userCount: Number(stats[1])
      };
    } catch (error) {
      console.error("GM istatistik hatası:", error);
      throw error;
    }
  }

  // Bağış istatistikleri
  async getDonateStats() {
    try {
      const stats = await this.moduleContracts.donate.getDonateStats();
      return {
        totalDonatedValue: Number(stats[0]),
        totalDonatorsCount: Number(stats[1]),
        dailyWithdrawn: Number(stats[2]),
        dailyLimit: Number(stats[3])
      };
    } catch (error) {
      console.error("Bağış istatistik hatası:", error);
      throw error;
    }
  }

  // Deploy istatistikleri
  async getDeployStats() {
    try {
      const stats = await this.moduleContracts.deploy.getDeployStats();
      return {
        total: Number(stats[0]),
        userDeploys: Number(stats[1])
      };
    } catch (error) {
      console.error("Deploy istatistik hatası:", error);
      throw error;
    }
  }

  // Link istatistikleri
  async getLinkStats() {
    try {
      const stats = await this.moduleContracts.link.getLinkStats();
      return {
        total: Number(stats[0]),
        hourlyLimit: Number(stats[1])
      };
    } catch (error) {
      console.error("Link istatistik hatası:", error);
      throw error;
    }
  }

  // Governance istatistikleri
  async getGovernanceStats() {
    try {
      const stats = await this.moduleContracts.governance.getGovernanceStats();
      return {
        totalProposals: Number(stats[0]),
        totalVotesCount: Number(stats[1])
      };
    } catch (error) {
      console.error("Governance istatistik hatası:", error);
      throw error;
    }
  }

  // Aktif önerileri getir
  async getActiveProposals() {
    try {
      const proposalIds = await this.moduleContracts.governance.getActiveProposals();
      const proposals = [];
      
      for (const id of proposalIds) {
        const proposal = await this.moduleContracts.governance.getProposal(id);
        proposals.push({
          id: Number(proposal[0]),
          creator: proposal[1],
          title: proposal[2],
          description: proposal[3],
          link: proposal[4],
          startTime: Number(proposal[5]),
          endTime: Number(proposal[6]),
          forVotes: Number(proposal[7]),
          againstVotes: Number(proposal[8]),
          executed: proposal[9]
        });
      }
      
      return proposals;
    } catch (error) {
      console.error("Aktif öneriler hatası:", error);
      throw error;
    }
  }

  // Tamamlanmış önerileri getir
  async getCompletedProposals() {
    try {
      const proposalIds = await this.moduleContracts.governance.getCompletedProposals();
      const proposals = [];
      
      for (const id of proposalIds) {
        const proposal = await this.moduleContracts.governance.getProposal(id);
        proposals.push({
          id: Number(proposal[0]),
          creator: proposal[1],
          title: proposal[2],
          description: proposal[3],
          link: proposal[4],
          startTime: Number(proposal[5]),
          endTime: Number(proposal[6]),
          forVotes: Number(proposal[7]),
          againstVotes: Number(proposal[8]),
          executed: proposal[9]
        });
      }
      
      return proposals;
    } catch (error) {
      console.error("Tamamlanmış öneriler hatası:", error);
      throw error;
    }
  }

  // Kullanıcının öneriye oy verip vermediğini kontrol et
  async hasUserVoted(proposalId) {
    try {
      const hasVoted = await this.moduleContracts.governance.hasUserVoted(proposalId, this.account);
      return hasVoted;
    } catch (error) {
      console.error("Oy kontrol hatası:", error);
      throw error;
    }
  }

  // Kullanıcı linklerini getir
  async getUserLinks() {
    try {
      const links = await this.moduleContracts.profile.getUserLinks(this.account);
      return links;
    } catch (error) {
      console.error("Link getirme hatası:", error);
      throw error;
    }
  }

  // Kullanıcı kontratlarını getir
  async getUserContracts() {
    try {
      const contracts = await this.moduleContracts.profile.getUserContracts(this.account);
      return contracts;
    } catch (error) {
      console.error("Kontrat getirme hatası:", error);
      throw error;
    }
  }

  // Kullanıcı GM mesajlarını getir
  async getUserGMMessages() {
    try {
      const messages = await this.moduleContracts.gm.getUserGMMessages(this.account);
      return messages;
    } catch (error) {
      console.error("GM mesajları hatası:", error);
      throw error;
    }
  }

  // Kullanıcı deploy edilen kontratları getir
  async getUserDeployedContracts() {
    try {
      const contracts = await this.moduleContracts.deploy.getUserDeployedContracts(this.account);
      return contracts;
    } catch (error) {
      console.error("Kullanıcı kontratları hatası:", error);
      throw error;
    }
  }

  // Tüm deploy edilen kontratları getir
  async getAllDeployedContracts() {
    try {
      const contracts = await this.moduleContracts.deploy.getAllDeployedContracts();
      return contracts;
    } catch (error) {
      console.error("Tüm kontratlar hatası:", error);
      throw error;
    }
  }

  // Owner kontrolü
  isOwner() {
    return this.account?.toLowerCase() === OWNER_ADDRESS.toLowerCase();
  }

  // Link doğrulama
  async validateLink(link) {
    try {
      const isValid = await this.moduleContracts.link.validateLink(link);
      return isValid;
    } catch (error) {
      console.error("Link doğrulama hatası:", error);
      return false;
    }
  }

  // Link paylaşım limiti kontrolü
  async canUserShareLink() {
    try {
      const canShare = await this.moduleContracts.link.canUserShareLink(this.account);
      return {
        canShare: canShare[0],
        recentCount: Number(canShare[1]),
        limit: Number(canShare[2])
      };
    } catch (error) {
      console.error("Link limit kontrol hatası:", error);
      throw error;
    }
  }

  // Kullanıcı bağış geçmişini getir
  async getUserDonationHistory() {
    try {
      const history = await this.moduleContracts.donate.getUserDonationHistory(this.account);
      return {
        count: Number(history[0]),
        totalAmount: Number(history[1]),
        hasDonatedBefore: history[2]
      };
    } catch (error) {
      console.error("Bağış geçmişi hatası:", error);
      throw error;
    }
  }

  // Toplam bağışçıları getir
  async getTopDonors() {
    try {
      const donors = await this.moduleContracts.donate.getTopDonors();
      return {
        addresses: donors[0],
        amounts: donors[1].map(amount => Number(amount))
      };
    } catch (error) {
      console.error("Top bağışçılar hatası:", error);
      throw error;
    }
  }

  // Sonraki tier gereksinimlerini getir
  async getNextTierRequirements() {
    try {
      const requirements = await this.moduleContracts.badge.getNextTierRequirements(this.account);
      return {
        currentTier: Number(requirements[0]),
        nextTier: Number(requirements[1]),
        levelRequired: Number(requirements[2]),
        gmRequired: Number(requirements[3]),
        deployRequired: Number(requirements[4]),
        donateRequired: Number(requirements[5]),
        linkRequired: Number(requirements[6]),
        voteRequired: Number(requirements[7])
      };
    } catch (error) {
      console.error("Tier gereksinimleri hatası:", error);
      throw error;
    }
  }

  // Öneri sonuçlarını getir
  async getProposalResults(proposalId) {
    try {
      const results = await this.moduleContracts.governance.getProposalResults(proposalId);
      return {
        approved: results[0],
        forVotes: Number(results[1]),
        againstVotes: Number(results[2])
      };
    } catch (error) {
      console.error("Öneri sonuçları hatası:", error);
      throw error;
    }
  }

  // Kullanıcının toplam bağış miktarını getir
  async getUserTotalDonated() {
    try {
      const total = await this.moduleContracts.donate.getUserTotalDonated(this.account);
      return Number(total);
    } catch (error) {
      console.error("Toplam bağış hatası:", error);
      throw error;
    }
  }

  // Kullanıcının deploy sayısını getir
  async getUserDeployCount() {
    try {
      const count = await this.moduleContracts.deploy.getUserDeployCount(this.account);
      return Number(count);
    } catch (error) {
      console.error("Deploy sayısı hatası:", error);
      throw error;
    }
  }

  // Kullanıcının GM sayısını getir
  async getUserGMCount() {
    try {
      const count = await this.moduleContracts.gm.getUserGMCount(this.account);
      return Number(count);
    } catch (error) {
      console.error("GM sayısı hatası:", error);
      throw error;
    }
  }

  // Kullanıcının link sayısını getir
  async getUserLinkCount() {
    try {
      const count = await this.moduleContracts.link.getUserLinkCount(this.account);
      return Number(count);
    } catch (error) {
      console.error("Link sayısı hatası:", error);
      throw error;
    }
  }

  // Kullanıcının oy sayısını getir
  async getUserVoteCount() {
    try {
      const count = await this.moduleContracts.governance.getUserVoteCount(this.account);
      return Number(count);
    } catch (error) {
      console.error("Oy sayısı hatası:", error);
      throw error;
    }
  }

  // Kullanıcının bağış sayısını getir
  async getUserDonateCount() {
    try {
      const count = await this.moduleContracts.donate.getUserDonateCount(this.account);
      return Number(count);
    } catch (error) {
      console.error("Bağış sayısı hatası:", error);
      throw error;
    }
  }

  // Kullanıcının seviyesini getir
  async getUserLevel() {
    try {
      const level = await this.moduleContracts.badge.getUserLevel(this.account);
      return Number(level);
    } catch (error) {
      console.error("Seviye getirme hatası:", error);
      throw error;
    }
  }

  // Kullanıcının tier'ını getir
  async getUserTier() {
    try {
      const tier = await this.moduleContracts.badge.getUserTier(this.account);
      return Number(tier);
    } catch (error) {
      console.error("Tier getirme hatası:", error);
      throw error;
    }
  }

  // Kullanıcının XP'sini getir
  async getUserXP() {
    try {
      const xp = await this.moduleContracts.badge.getUserXP(this.account);
      return Number(xp);
    } catch (error) {
      console.error("XP getirme hatası:", error);
      throw error;
    }
  }

  // Kullanıcının son link zamanını getir
  async getUserRecentLinkCount() {
    try {
      const count = await this.moduleContracts.link.getUserRecentLinkCount(this.account);
      return Number(count);
    } catch (error) {
      console.error("Son link sayısı hatası:", error);
      throw error;
    }
  }

  // Badge istatistiklerini getir
  async getBadgeStats() {
    try {
      const stats = await this.moduleContracts.badge.getBadgeStats();
      return {
        totalBadgesCount: Number(stats[0])
      };
    } catch (error) {
      console.error("Badge istatistikleri hatası:", error);
      throw error;
    }
  }

  // Seviye için gereken XP'yi getir
  async getXPForLevel(level) {
    try {
      const xp = await this.moduleContracts.badge.getXPForLevel(level);
      return Number(xp);
    } catch (error) {
      console.error("XP getirme hatası:", error);
      throw error;
    }
  }

  // Tier için gereksinimleri getir
  async getRequirementsForTier(tier) {
    try {
      const requirements = await this.moduleContracts.badge.getRequirementsForTier(tier);
      return {
        levelRequired: Number(requirements[0]),
        gmRequired: Number(requirements[1]),
        deployRequired: Number(requirements[2]),
        donateRequired: Number(requirements[3]),
        linkRequired: Number(requirements[4]),
        voteRequired: Number(requirements[5])
      };
    } catch (error) {
      console.error("Tier gereksinimleri hatası:", error);
      throw error;
    }
  }

  // Seviye hesaplama
  async calculateLevel(xp) {
    try {
      const level = await this.moduleContracts.badge.calculateLevel(xp);
      return Number(level);
    } catch (error) {
      console.error("Seviye hesaplama hatası:", error);
      throw error;
    }
  }

  // Tier hesaplama
  async calculateTier(level, gmCount, deployCount, donateCount, linkCount, voteCount) {
    try {
      const tier = await this.moduleContracts.badge.calculateTier(level, gmCount, deployCount, donateCount, linkCount, voteCount);
      return Number(tier);
    } catch (error) {
      console.error("Tier hesaplama hatası:", error);
      throw error;
    }
  }

  // Kullanıcı var mı kontrol et
  async userExists() {
    try {
      const exists = await this.moduleContracts.profile.userExists(this.account);
      return exists;
    } catch (error) {
      console.error("Kullanıcı kontrol hatası:", error);
      throw error;
    }
  }

  // Bağış yapmış mı kontrol et
  async hasDonated() {
    try {
      const hasDonated = await this.moduleContracts.donate.hasDonated(this.account);
      return hasDonated;
    } catch (error) {
      console.error("Bağış kontrol hatası:", error);
      throw error;
    }
  }

  // Bağışçı mı kontrol et
  async isDonor() {
    try {
      const isDonor = await this.moduleContracts.donate.isDonor(this.account);
      return isDonor;
    } catch (error) {
      console.error("Bağışçı kontrol hatası:", error);
      throw error;
    }
  }
}

export default ContractService;
