// src/services/walletService.js

import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import { CELO_PARAMS, CURRENT_NETWORK } from '../utils/constants.js';

export class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.web3 = null;
  }

  // MetaMask kontrolü
  hasMetaMask() {
    return typeof window.ethereum !== "undefined";
  }

  // Celo ağına geçiş
  async switchToCeloNetwork() {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CELO_PARAMS.chainId }]
      });
      return true;
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CELO_PARAMS]
        });
        return true;
      }
      console.error("Ağ değiştirme hatası:", err);
      return false;
    }
  }

  // Cüzdan bağlantısını kontrol et
  async checkWalletConnection() {
    if (!this.hasMetaMask()) {
      return false;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts.length > 0) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        this.account = accounts[0];
        this.web3 = this.provider;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Cüzdan bağlantı kontrol hatası:', error);
      return false;
    }
  }

  // Cüzdana bağlan
  async connectWallet() {
    if (!this.hasMetaMask()) {
      throw new Error("Lütfen önce MetaMask yükleyin!");
    }

    try {
      // Provider'ı başlat
      this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      this.web3 = this.provider;

      // Celo ağına geç
      await this.switchToCeloNetwork();

      // Hesapları iste
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error("Hesap bulunamadı!");
      }

      this.signer = this.provider.getSigner();
      this.account = accounts[0];

      // Event listener'ları kur
      this.setupEventListeners();

      console.log("✅ Cüzdan bağlantısı başarılı:", this.account);
      return { 
        provider: this.provider, 
        signer: this.signer, 
        account: this.account,
        web3: this.web3
      };
    } catch (error) {
      console.error("❌ Cüzdan bağlantı hatası:", error);
      
      if (error.code === 4001) {
        throw new Error("Bağlantı kullanıcı tarafından reddedildi!");
      } else {
        throw new Error("Bağlantı hatası: " + error.message);
      }
    }
  }

  // Event listener'ları kur
  setupEventListeners() {
    if (!window.ethereum) return;

    // Hesap değişikliği
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        // Kullanıcı cüzdanı bağlantısını kesti
        this.disconnect();
        window.location.reload();
      } else {
        // Hesap değişti
        this.account = accounts[0];
        window.location.reload();
      }
    });

    // Ağ değişikliği
    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    });
  }

  // Bağlantıyı kes
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.web3 = null;

    if (window.ethereum && window.ethereum.removeAllListeners) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }

    console.log("🔌 Cüzdan bağlantısı kesildi");
  }

  // Balance'ı getir
  async getBalance() {
    if (!this.provider || !this.account) {
      throw new Error("Cüzdan bağlı değil!");
    }

    try {
      const balance = await this.provider.getBalance(this.account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Balance getirme hatası:', error);
      throw error;
    }
  }

  // Getter metodları
  getWeb3() {
    return this.web3;
  }

  getAccount() {
    return this.account;
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }
}
