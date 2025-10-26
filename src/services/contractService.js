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
  constructor(web3, account) {
    this.web3 = web3;
    this.account = account;
    this.contracts = {};
    this.moduleContracts = {};
    this.initializeContracts();
  }

  // Kontratları başlat
  initializeContracts() {
    try {
      // Ana kontrat
      this.contracts.main = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      
      // Modül kontratları
      this.moduleContracts.badge = new this.web3.eth.Contract(MODULES.BADGE.abi, MODULES.BADGE.address);
      this.moduleContracts.deploy = new this.web3.eth.Contract(MODULES.DEPLOY.abi, MODULES.DEPLOY.address);
      this.moduleContracts.donate = new this.web3.eth.Contract(MODULES.DONATE.abi, MODULES.DONATE.address);
      this.moduleContracts.gm = new this.web3.eth.Contract(MODULES.GM.abi, MODULES.GM.address);
      this.moduleContracts.governance = new this.web3.eth.Contract(MODULES.GOVERNANCE.abi, MODULES.GOVERNANCE.address);
      this.moduleContracts.link = new this.web3.eth.Contract(MODULES.LINK.abi, MODULES.LINK.address);
      this.moduleContracts.profile = new this.web3.eth.Contract(MODULES.PROFILE.abi, MODULES.PROFILE.address);

      console.log("✅ Tüm kontratlar başarıyla yüklendi!");
    } catch (error) {
      console.error("❌ Kontrat başlatma hatası:", error);
      throw error;
    }
  }

  // Kullanıcı kaydı
  async registerUser() {
    try {
      const result = await this.contracts.main.methods.registerUser().send({
        from: this.account,
        gas: 300000
      });
      return result;
    } catch (error) {
      console.error("Kullanıcı kaydı hatası:", error);
      throw error;
    }
  }

  // GM gönderme
  async sendGM(message = "Hello from Celo Engage Hub!") {
    try {
      const result = await this.moduleContracts.gm.methods.sendGM(this.account, message).send({
        from: this.account,
        gas: 300000
      });
      return result;
    } catch (error) {
      console.error("GM gönderme hatası:", error);
      throw error;
    }
  }

  // Kontrat deploy etme
  async deployContract(contractName = "SimpleContract") {
    try {
      const result = await this.moduleContracts.deploy.methods.deployContract(this.account, contractName).send({
        from: this.account,
        gas: 500000
      });
      return result;
    } catch (error) {
      console.error("Kontrat deploy hatası:", error);
      throw error;
    }
  }

  // CELO bağışı
  async donateCELO(amount) {
    try {
      const weiAmount = this.web3.utils.toWei(amount.toString(), 'ether');
      
      const result = await this.moduleContracts.donate.methods.donateCELO(this.account).send({
        from: this.account,
        value: weiAmount,
        gas: 300000
      });
      return result;
    } catch (error) {
      console.error("CELO bağış hatası:", error);
      throw error;
    }
  }

  // cUSD bağışı
  async donateCUSD(amount) {
    try {
      const weiAmount = this.web3.utils.toWei(amount.toString(), 'ether');
      
      // Önce cUSD token kontratı
      const cUSDToken = new this.web3.eth.Contract([
        {
          "constant": false,
          "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"}
          ],
          "name": "approve",
          "outputs": [{"name": "", "type": "bool"}],
          "type": "function"
        }
      ], CURRENT_TOKENS.cUSD.address);

      // cUSD onayı
      await cUSDToken.methods.approve(MODULES.DONATE.address, weiAmount).send({
        from: this.account,
        gas: 300000
      });

      // Bağış yap
      const result = await this.moduleContracts.donate.methods.donateCUSD(this.account, weiAmount).send({
        from: this.account,
        gas: 300000
      });
      return result;
    } catch (error) {
      console.error("cUSD bağış hatası:", error);
      throw error;
    }
  }

  // Link paylaşma
  async shareLink(link) {
    try {
      const result = await this.moduleContracts.link.methods.shareLink(this.account, link).send({
        from: this.account,
        gas: 300000
      });
      return result;
    } catch (error) {
      console.error("Link paylaşma hatası:", error);
      throw error;
    }
  }

  // Öneri oluşturma (sadece owner)
  async createProposal(title, description, link) {
    try {
      const result = await this.moduleContracts.governance.methods.createProposal(
        this.account, title, description, link
      ).send({
        from: this.account,
        gas: 500000
      });
      return result;
    } catch (error) {
      console.error("Öneri oluşturma hatası:", error);
      throw error;
    }
  }

  // Oy verme
  async vote(proposalId, support) {
    try {
      const result = await this.moduleContracts.governance.methods.vote(
        this.account, proposalId, support
      ).send({
        from: this.account,
        gas: 300000
      });
      return result;
    } catch (error) {
      console.error("Oy verme hatası:", error);
      throw error;
    }
  }

  // Bağışları çekme (sadece owner)
  async withdrawDonations() {
    try {
      const result = await this.moduleContracts.donate.methods.withdraw(this.account).send({
        from: this.account,
        gas: 300000
      });
      return result;
    } catch (error) {
      console.error("Bağış çekme hatası:", error);
      throw error;
    }
  }

  // === OKUMA FONKSİYONLARI ===

  // Kullanıcı profilini getir
  async getUserProfile() {
    try {
      const profile = await this.moduleContracts.profile.methods.getUserProfile(this.account).call();
      return profile;
    } catch (error) {
      console.error("Profil getirme hatası:", error);
      throw error;
    }
  }

  // Kullanıcı istatistiklerini getir
  async getUserStats() {
    try {
      const stats = await this.moduleContracts.profile.methods.getUserStats(this.account).call();
      return stats;
    } catch (error) {
      console.error("İstatistik getirme hatası:", error);
      throw error;
    }
  }

  // Global istatistikleri getir
  async getGlobalStats() {
    try {
      const stats = await this.moduleContracts.profile.methods.getGlobalStats().call();
      return stats;
    } catch (error) {
      console.error("Global istatistik hatası:", error);
      throw error;
    }
  }

  // Kullanıcı badge bilgilerini getir
  async getUserBadge() {
    try {
      const badge = await this.moduleContracts.badge.methods.getUserBadge(this.account).call();
      return badge;
    } catch (error) {
      console.error("Badge getirme hatası:", error);
      throw error;
    }
  }

  // GM istatistikleri
  async getGMStats() {
    try {
      const stats = await this.moduleContracts.gm.methods.getGMStats().call();
      return stats;
    } catch (error) {
      console.error("GM istatistik hatası:", error);
      throw error;
    }
  }

  // Bağış istatistikleri
  async getDonateStats() {
    try {
      const stats = await this.moduleContracts.donate.methods.getDonateStats().call();
      return stats;
    } catch (error) {
      console.error("Bağış istatistik hatası:", error);
      throw error;
    }
  }

  // Deploy istatistikleri
  async getDeployStats() {
    try {
      const stats = await this.moduleContracts.deploy.methods.getDeployStats().call();
      return stats;
    } catch (error) {
      console.error("Deploy istatistik hatası:", error);
      throw error;
    }
  }

  // Link istatistikleri
  async getLinkStats() {
    try {
      const stats = await this.moduleContracts.link.methods.getLinkStats().call();
      return stats;
    } catch (error) {
      console.error("Link istatistik hatası:", error);
      throw error;
    }
  }

  // Governance istatistikleri
  async getGovernanceStats() {
    try {
      const stats = await this.moduleContracts.governance.methods.getGovernanceStats().call();
      return stats;
    } catch (error) {
      console.error("Governance istatistik hatası:", error);
      throw error;
    }
  }

  // Aktif önerileri getir
  async getActiveProposals() {
    try {
      const proposalIds = await this.moduleContracts.governance.methods.getActiveProposals().call();
      const proposals = [];
      
      for (const id of proposalIds) {
        const proposal = await this.moduleContracts.governance.methods.getProposal(id).call();
        proposals.push(proposal);
      }
      
      return proposals;
    } catch (error) {
      console.error("Aktif öneriler hatası:", error);
      throw error;
    }
  }

  // Kullanıcının öneriye oy verip vermediğini kontrol et
  async hasUserVoted(proposalId) {
    try {
      const hasVoted = await this.moduleContracts.governance.methods.hasUserVoted(proposalId, this.account).call();
      return hasVoted;
    } catch (error) {
      console.error("Oy kontrol hatası:", error);
      throw error;
    }
  }

  // Kullanıcı linklerini getir
  async getUserLinks() {
    try {
      const links = await this.moduleContracts.profile.methods.getUserLinks(this.account).call();
      return links;
    } catch (error) {
      console.error("Link getirme hatası:", error);
      throw error;
    }
  }

  // Kullanıcı kontratlarını getir
  async getUserContracts() {
    try {
      const contracts = await this.moduleContracts.profile.methods.getUserContracts(this.account).call();
      return contracts;
    } catch (error) {
      console.error("Kontrat getirme hatası:", error);
      throw error;
    }
  }

  // Kullanıcı GM mesajlarını getir
  async getUserGMMessages() {
    try {
      const messages = await this.moduleContracts.gm.methods.getUserGMMessages(this.account).call();
      return messages;
    } catch (error) {
      console.error("GM mesajları hatası:", error);
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
      const isValid = await this.moduleContracts.link.methods.validateLink(link).call();
      return isValid;
    } catch (error) {
      console.error("Link doğrulama hatası:", error);
      return false;
    }
  }

  // Link paylaşım limiti kontrolü
  async canUserShareLink() {
    try {
      const canShare = await this.moduleContracts.link.methods.canUserShareLink(this.account).call();
      return canShare;
    } catch (error) {
      console.error("Link limit kontrol hatası:", error);
      throw error;
    }
  }
}

export default ContractService;
