// src/services/walletService.js

// ✅ ETHERERS IMPORT - HATA ÇÖZÜMÜ
import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';
import { CELO_PARAMS, CURRENT_NETWORK } from '../utils/constants.js';

export class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.web3 = null;
  }

  // ✅ Multi-provider MetaMask fix
  initializeMetaMaskFix() {
    if (typeof window !== "undefined" && window.ethereum) {
      window.addEventListener("DOMContentLoaded", () => {
        if (window.ethereum.providers) {
          const metamaskProvider = window.ethereum.providers.find(p => p.isMetaMask);
          if (metamaskProvider && !Object.isFrozen(window.ethereum)) {
            window.ethereum = Object.assign({}, metamaskProvider);
          }
        }
      });
    }
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
      // Multi-provider fix'i başlat
      this.initializeMetaMaskFix();
      
      // Provider'ı başlat
      this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      this.web3 = this.provider;

      // Celo ağına geç
      const networkSwitched = await this.switchToCeloNetwork();
      if (!networkSwitched) {
        throw new Error("Celo ağına geçiş yapılamadı!");
      }

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
      console.log('Hesap değişti:', accounts);
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
      console.log('Ağ değişti:', chainId);
      window.location.reload();
    });

    // Bağlantı değişikliği
    window.ethereum.on('connect', (connectInfo) => {
      console.log('Cüzdan bağlandı:', connectInfo);
    });

    // Bağlantı kesildi
    window.ethereum.on('disconnect', (error) => {
      console.log('Cüzdan bağlantısı kesildi:', error);
      this.disconnect();
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
      window.ethereum.removeAllListeners('connect');
      window.ethereum.removeAllListeners('disconnect');
    }

    console.log("🔌 Cüzdan bağlantısı kesildi");
  }

  // ✅ GÜNCELLENDİ: Balance'ı getir - HATA YÖNETİMLİ
  async getBalance() {
    if (!this.provider || !this.account) {
      return "0"; // Hata fırlatmak yerine 0 döndür
    }

    try {
      const balance = await this.provider.getBalance(this.account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.warn('⚠️ Balance getirme uyarısı:', error.message);
      return "0"; // Hata durumunda 0 döndür
    }
  }

  // Token balance'ını getir
  async getTokenBalance(tokenAddress) {
    if (!this.provider || !this.account) {
      throw new Error("Cüzdan bağlı değil!");
    }

    try {
      // ERC20 token kontratı
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ],
        this.provider
      );

      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(this.account),
        tokenContract.decimals()
      ]);

      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Token balance getirme hatası:', error);
      throw error;
    }
  }

  // Ağ bilgisini getir
  async getNetworkInfo() {
    if (!this.provider) {
      throw new Error("Provider bağlı değil!");
    }

    try {
      const network = await this.provider.getNetwork();
      return {
        name: network.name,
        chainId: network.chainId,
        ensAddress: network.ensAddress
      };
    } catch (error) {
      console.error('Ağ bilgisi getirme hatası:', error);
      throw error;
    }
  }

  // Gas ücretlerini getir
  async getGasPrices() {
    if (!this.provider) {
      throw new Error("Provider bağlı değil!");
    }

    try {
      const feeData = await this.provider.getFeeData();
      return {
        maxFeePerGas: feeData.maxFeePerGas ? ethers.utils.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.utils.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
        gasPrice: feeData.gasPrice ? ethers.utils.formatUnits(feeData.gasPrice, 'gwei') : null
      };
    } catch (error) {
      console.error('Gas ücretleri getirme hatası:', error);
      throw error;
    }
  }

  // İşlem gönder
  async sendTransaction(transaction) {
    if (!this.signer) {
      throw new Error("Signer bağlı değil!");
    }

    try {
      const tx = await this.signer.sendTransaction(transaction);
      return await tx.wait();
    } catch (error) {
      console.error('İşlem gönderme hatası:', error);
      throw error;
    }
  }

  // Mesaj imzala
  async signMessage(message) {
    if (!this.signer) {
      throw new Error("Signer bağlı değil!");
    }

    try {
      const signature = await this.signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Mesaj imzalama hatası:', error);
      throw error;
    }
  }

  // WalletConnect ile bağlan (opsiyonel - gelecek için)
  async connectWalletConnect() {
    try {
      // WalletConnect entegrasyonu buraya eklenecek
      console.log("WalletConnect desteği yakında eklenecek");
      throw new Error("WalletConnect henüz desteklenmiyor");
    } catch (error) {
      console.error('WalletConnect bağlantı hatası:', error);
      throw error;
    }
  }

  // Çoklu cüzdan desteği kontrolü
  hasMultipleWallets() {
    if (!window.ethereum) return false;
    return window.ethereum.providers && window.ethereum.providers.length > 1;
  }

  // Mevcut ağın Celo olup olmadığını kontrol et
  async isCeloNetwork() {
    if (!this.provider) return false;

    try {
      const network = await this.provider.getNetwork();
      return network.chainId === 42220 || network.chainId === 44787; // Mainnet ve Alfajores
    } catch (error) {
      console.error('Ağ kontrol hatası:', error);
      return false;
    }
  }

  // Kullanıcıyı doğru ağa yönlendir
  async ensureCeloNetwork() {
    const isCelo = await this.isCeloNetwork();
    if (!isCelo) {
      return await this.switchToCeloNetwork();
    }
    return true;
  }

  // Cüzdan bilgilerini getir
  getWalletInfo() {
    return {
      isConnected: !!this.account,
      account: this.account,
      provider: this.provider,
      signer: this.signer,
      network: CURRENT_NETWORK.name
    };
  }

  // Cüzdan bağlantı durumunu kontrol et
  getConnectionStatus() {
    return {
      hasMetaMask: this.hasMetaMask(),
      isConnected: !!this.account,
      account: this.account,
      network: CURRENT_NETWORK.name
    };
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

  // Cüzdan tipini algıla
  detectWalletType() {
    if (!window.ethereum) return 'none';
    
    if (window.ethereum.isMetaMask) return 'metamask';
    if (window.ethereum.isCoinbaseWallet) return 'coinbase';
    if (window.ethereum.isBraveWallet) return 'brave';
    if (window.ethereum.isTrust) return 'trust';
    if (window.ethereum.isOpera) return 'opera';
    
    return 'unknown';
  }

  // Cüzdan yeteneklerini kontrol et
  async getWalletCapabilities() {
    const walletType = this.detectWalletType();
    const capabilities = {
      type: walletType,
      features: {
        eth_sign: true,
        personal_sign: true,
        eth_signTypedData: true,
        eth_signTypedData_v4: true,
        eth_sendTransaction: true,
        wallet_switchEthereumChain: true,
        wallet_addEthereumChain: true
      }
    };

    // MetaMask özellikleri
    if (walletType === 'metamask') {
      capabilities.features.eth_decrypt = true;
      capabilities.features.eth_getEncryptionPublicKey = true;
    }

    return capabilities;
  }

  // ✅ GÜNCELLENDİ: Cüzdan bağlantısını doğrula - Balance hatasını handle et
  async verifyConnection() {
    if (!this.account) return false;

    try {
      // Basit bir doğrulama - balance kontrolü (hata yönetimli)
      const balance = await this.getBalance();
      return true;
    } catch (error) {
      console.warn('Bağlantı doğrulama uyarısı:', error.message);
      return true; // Balance hatası bağlantının kesildiği anlamına gelmez
    }
  }

  // Cüzdan değişikliklerini dinle
  onAccountsChanged(callback) {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', (accounts) => {
      callback(accounts);
    });
  }

  onChainChanged(callback) {
    if (!window.ethereum) return;

    window.ethereum.on('chainChanged', (chainId) => {
      callback(chainId);
    });
  }

  // Event listener'ları temizle
  cleanupEventListeners() {
    if (window.ethereum && window.ethereum.removeAllListeners) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
      window.ethereum.removeAllListeners('connect');
      window.ethereum.removeAllListeners('disconnect');
    }
  }
}

export default WalletService;
