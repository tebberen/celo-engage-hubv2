// src/services/contractService.js

import { CONTRACT_ADDRESS, CONTRACT_ABI, OWNER_ADDRESS } from "../utils/constants.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

export class ContractService {
  constructor(provider, account) {
    this.provider = provider;
    this.account = account;
    this.signer = provider.getSigner();
    this.contracts = {};
    this.moduleContracts = {};
  }

  // ✅ Ana kontratı başlat
  async init() {
    try {
      this.contracts.main = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);

      // ✅ Modül adreslerini dinamik çek
      const [
        gmModule,
        deployModule,
        donateModule,
        linkModule,
        governanceModule,
        profileModule,
        badgeModule
      ] = await Promise.all([
        this.contracts.main.gmModule(),
        this.contracts.main.deployModule(),
        this.contracts.main.donateModule(),
        this.contracts.main.linkModule(),
        this.contracts.main.governanceModule(),
        this.contracts.main.profileModule(),
        this.contracts.main.badgeModule()
      ]);

      // ✅ Modül kontratlarını dinamik olarak bağla
      this.moduleContracts = {
        gm: new ethers.Contract(gmModule, [], this.signer),
        deploy: new ethers.Contract(deployModule, [], this.signer),
        donate: new ethers.Contract(donateModule, [], this.signer),
        link: new ethers.Contract(linkModule, [], this.signer),
        governance: new ethers.Contract(governanceModule, [], this.signer),
        profile: new ethers.Contract(profileModule, [], this.signer),
        badge: new ethers.Contract(badgeModule, [], this.signer)
      };

      console.log("✅ Modüller dinamik olarak bağlandı!");
    } catch (error) {
      console.error("❌ init() hatası:", error);
      throw error;
    }
  }

  // ✅ GM gönder
  async sendGM(message = "Hello from Celo Engage Hub!") {
    try {
      const tx = await this.contracts.main.sendGM(message);
      await tx.wait();
      console.log("✅ GM gönderildi:", message);
    } catch (error) {
      console.error("GM gönderme hatası:", error);
    }
  }

  // ✅ Kullanıcı kaydı
  async registerUser() {
    try {
      const tx = await this.contracts.main.registerUser();
      await tx.wait();
      console.log("✅ Kullanıcı başarıyla kaydedildi");
    } catch (error) {
      console.error("Kullanıcı kaydı hatası:", error);
    }
  }

  // ✅ Owner kontrolü (Proposal ve Withdraw paneli için)
  async isOwner() {
    try {
      const contract = this.contracts.main;
      const owner = await contract.PROJECT_OWNER();
      return owner.toLowerCase() === this.account.toLowerCase();
    } catch (err) {
      console.error("Owner check failed:", err);
      return false;
    }
  }

  // ✅ Owner panelini göster/gizle
  async toggleOwnerPanels() {
    const isUserOwner = await this.isOwner();
    const withdrawPanel = document.getElementById("withdrawPanel");
    const ownerPanel = document.getElementById("ownerPanel");

    if (withdrawPanel) withdrawPanel.style.display = isUserOwner ? "block" : "none";
    if (ownerPanel) ownerPanel.style.display = isUserOwner ? "block" : "none";
  }
}

export default ContractService;
