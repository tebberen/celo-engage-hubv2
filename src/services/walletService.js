// src/services/walletService.js

// ✅ ETHERERS IMPORT - HATA ÇÖZÜMÜ
import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';
import { CELO_PARAMS, CURRENT_NETWORK } from '../utils/constants.js';

let walletConnectCtorPromise = null;

async function loadWalletConnectProviderCtor() {
  if (!walletConnectCtorPromise) {
    walletConnectCtorPromise = import('https://esm.sh/@walletconnect/web3-provider@1.8.0?bundle')
      .then((module) => module?.default ?? module)
      .catch((error) => {
        walletConnectCtorPromise = null;
        throw error;
      });
  }

  return walletConnectCtorPromise;
}

export class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.web3 = null;
    this.connectionType = null;
    this.walletConnectProvider = null;
    this.walletConnectQrEnabled = true;
  }

  // ✅ Multi-provider MetaMask fix
  initializeMetaMaskFix() {
    if (typeof window === "undefined") {
      return;
    }

    const applyFix = () => {
      if (!window.ethereum?.providers?.length) {
        return;
      }

      const metamaskProvider = window.ethereum.providers.find((provider) => provider?.isMetaMask);

      if (!metamaskProvider || window.ethereum === metamaskProvider) {
        return;
      }

      if (Object.isFrozen(window.ethereum)) {
        console.warn("MetaMask provider düzeltmesi uygulanamadı: window.ethereum dondurulmuş.");
        return;
      }

      window.ethereum = metamaskProvider;
    };

    if (window.ethereum?.providers?.length) {
      applyFix();
      return;
    }

    const handleEthereumInitialized = () => {
      applyFix();
    };

    window.removeEventListener("ethereum#initialized", handleEthereumInitialized);
    window.addEventListener("ethereum#initialized", handleEthereumInitialized, { once: true });

    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyFix, { once: true });
      } else {
        applyFix();
      }
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
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [CELO_PARAMS]
          });
          return true;
        } catch (addError) {
          console.error("Celo ağı ekleme hatası:", addError);
          throw addError;
        }
      }
      if (err.code === 4001) {
        console.warn("Kullanıcı Celo ağına geçişi reddetti.");
        return false;
      }
      console.error("Ağ değiştirme hatası:", err);
      throw err;
    }
  }

  // Cüzdan bağlantısını kontrol et
  async checkWalletConnection() {
    try {
      this.initializeMetaMaskFix();

      if (this.hasMetaMask()) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length > 0) {
          this.provider = new ethers.providers.Web3Provider(window.ethereum);
          this.signer = this.provider.getSigner();
          this.account = accounts[0];
          this.web3 = this.provider;
          this.connectionType = 'metamask';
          this.setupMetaMaskEventListeners();
          return true;
        }
      }

      // WalletConnect aktif oturumunu kontrol et
      const walletConnectSession = typeof window !== 'undefined'
        ? window.localStorage.getItem('walletconnect')
        : null;

      if (walletConnectSession) {
        let parsedSession = null;
        try {
          parsedSession = JSON.parse(walletConnectSession);
        } catch (parseError) {
          console.warn('WalletConnect oturumu okunamadı:', parseError);
        }

        if (parsedSession && parsedSession.connected && parsedSession.accounts?.length) {
          const provider = await this.initializeWalletConnectProvider({ showQrCode: false });
          try {
            await provider.enable();
            const web3Provider = new ethers.providers.Web3Provider(provider, 'any');
            const accounts = await web3Provider.listAccounts();

            if (accounts.length > 0) {
              this.provider = web3Provider;
              this.signer = this.provider.getSigner();
              this.account = accounts[0];
              this.web3 = this.provider;
              this.connectionType = 'walletconnect';
              return true;
            }
          } catch (sessionError) {
            console.warn('WalletConnect yeniden bağlanma başarısız:', sessionError);
            await this.disconnect({ skipWalletConnectProvider: true });
          }
        }
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

      const ethereum = window.ethereum;

      // Provider'ı başlat
      this.provider = new ethers.providers.Web3Provider(ethereum, "any");
      this.web3 = this.provider;

      // Hesapları iste (önce izin alınmalı)
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("Hesap bulunamadı!");
      }

      this.signer = this.provider.getSigner();
      this.account = ethers.utils.getAddress(accounts[0]);
      this.connectionType = 'metamask';

      // Event listener'ları kur
      this.setupMetaMaskEventListeners();

      // Ağ geçişini hesap izninden sonra dene
      const switched = await this.ensureCeloNetwork();
      if (!switched) {
        const switchError = new Error("Celo ağına geçiş isteğini onaylamanız gerekiyor.");
        switchError.code = "CELO_SWITCH_REJECTED";
        throw switchError;
      }

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
      } else if (error.code === "CELO_SWITCH_REJECTED") {
        throw new Error("Lütfen MetaMask üzerinden Celo ağına geçiş isteğini onaylayın ve tekrar deneyin.");
      } else if (error.code === 4902 || error?.message?.includes("Unrecognized chain")) {
        throw new Error("Lütfen MetaMask üzerinden Celo ağını ekleyin ve tekrar deneyin.");
      } else {
        throw new Error("Bağlantı hatası: " + error.message);
      }
    }
  }

  // Event listener'ları kur (MetaMask)
  setupMetaMaskEventListeners() {
    if (!window.ethereum) return;

    this.cleanupEventListeners();

    // Hesap değişikliği
    window.ethereum.on('accountsChanged', async (accounts) => {
      console.log('Hesap değişti:', accounts);
      if (accounts.length === 0) {
        // Kullanıcı cüzdanı bağlantısını kesti
        await this.disconnect();
        window.location.reload();
      } else {
        // Hesap değişti
        this.account = accounts[0];
        window.location.reload();
      }
    });

    // Ağ değişikliği
    window.ethereum.on('chainChanged', async (chainId) => {
      console.log('Ağ değişti:', chainId);
      await this.disconnect();
      window.location.reload();
    });

    // Bağlantı değişikliği
    window.ethereum.on('connect', (connectInfo) => {
      console.log('Cüzdan bağlandı:', connectInfo);
    });

    // Bağlantı kesildi
    window.ethereum.on('disconnect', async (error) => {
      console.log('Cüzdan bağlantısı kesildi:', error);
      await this.disconnect();
    });
  }

  async initializeWalletConnectProvider({ showQrCode = true } = {}) {
    if (this.walletConnectProvider && this.walletConnectQrEnabled === showQrCode) {
      return this.walletConnectProvider;
    }

    if (this.walletConnectProvider && this.walletConnectQrEnabled !== showQrCode) {
      await this.disconnectWalletConnect({ skipProviderDisconnect: true });
    }

    const chainIdDecimal = parseInt(CURRENT_NETWORK.chainId, 16);

    let WalletConnectProviderCtor;

    try {
      WalletConnectProviderCtor = await loadWalletConnectProviderCtor();
    } catch (error) {
      console.error('WalletConnect sağlayıcısı yüklenemedi:', error);
      throw new Error('WalletConnect modülü yüklenemedi. Lütfen sayfayı yenileyin ve tekrar deneyin.');
    }

    this.walletConnectProvider = new WalletConnectProviderCtor({
      rpc: {
        [chainIdDecimal]: CURRENT_NETWORK.rpcUrl
      },
      chainId: chainIdDecimal,
      qrcode: showQrCode,
      qrcodeModalOptions: {
        mobileLinks: ['metamask', 'rainbow', 'trust', 'argent']
      }
    });

    this.walletConnectQrEnabled = showQrCode;
    this.setupWalletConnectEventListeners();
    return this.walletConnectProvider;
  }

  setupWalletConnectEventListeners() {
    if (!this.walletConnectProvider) return;

    this.walletConnectProvider.on('connect', (info) => {
      console.log('WalletConnect bağlandı:', info);
    });

    this.walletConnectProvider.on('accountsChanged', async (accounts) => {
      console.log('WalletConnect hesabı değişti:', accounts);
      if (!accounts || accounts.length === 0) {
        await this.disconnect({ skipWalletConnectProvider: true });
        window.location.reload();
      } else {
        this.account = accounts[0];
        window.location.reload();
      }
    });

    this.walletConnectProvider.on('chainChanged', (chainId) => {
      console.log('WalletConnect ağı değişti:', chainId);
      window.location.reload();
    });

    this.walletConnectProvider.on('disconnect', async (code, reason) => {
      console.log('WalletConnect bağlantısı kesildi:', code, reason);
      await this.disconnect({ skipWalletConnectProvider: true });
      window.location.reload();
    });
  }

  async connectWalletConnect() {
    try {
      const provider = await this.initializeWalletConnectProvider({ showQrCode: true });
      const accounts = await provider.enable();

      if (!accounts || accounts.length === 0) {
        throw new Error('WalletConnect hesabı bulunamadı');
      }

      this.provider = new ethers.providers.Web3Provider(provider, 'any');
      this.web3 = this.provider;
      this.signer = this.provider.getSigner();
      this.account = accounts[0];
      this.connectionType = 'walletconnect';

      console.log('✅ WalletConnect bağlantısı başarılı:', this.account);

      return {
        provider: this.provider,
        signer: this.signer,
        account: this.account,
        web3: this.web3
      };
    } catch (error) {
      console.error('WalletConnect bağlantı hatası:', error);

      if (error?.message?.toLowerCase().includes('user closed modal')) {
        throw new Error('Bağlantı isteği iptal edildi. QR kodu kapatıldı.');
      }

      throw new Error(error?.message || 'WalletConnect bağlantısı başarısız oldu');
    }
  }

  async disconnectWalletConnect({ skipProviderDisconnect = false } = {}) {
    if (!this.walletConnectProvider) {
      return;
    }

    try {
      if (!skipProviderDisconnect) {
        await this.walletConnectProvider.disconnect();
      }
    } catch (error) {
      console.warn('WalletConnect disconnect hatası:', error);
    }

    try {
      this.walletConnectProvider.removeAllListeners();
    } catch (removeError) {
      console.warn('WalletConnect event temizleme hatası:', removeError);
    }

    this.walletConnectProvider = null;
    this.walletConnectQrEnabled = true;

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('walletconnect');
    }
  }

  // Bağlantıyı kes
  async disconnect({ skipWalletConnectProvider = false } = {}) {
    if (this.connectionType === 'walletconnect') {
      await this.disconnectWalletConnect({ skipProviderDisconnect: skipWalletConnectProvider });
    }

    this.provider = null;
    this.signer = null;
    this.account = null;
    this.web3 = null;
    this.connectionType = null;

    this.cleanupEventListeners();

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
      network: CURRENT_NETWORK.name,
      connectionType: this.connectionType
    };
  }

  // Cüzdan bağlantı durumunu kontrol et
  getConnectionStatus() {
    return {
      hasMetaMask: this.hasMetaMask(),
      isConnected: !!this.account,
      account: this.account,
      network: CURRENT_NETWORK.name,
      connectionType: this.connectionType
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

  getConnectionType() {
    return this.connectionType;
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
