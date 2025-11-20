# Services Folder

UI’yi zincir, cüzdan ve üçüncü parti veri kaynaklarına bağlayan yardımcı modüller.

## Dosya Özeti
- **contractService.js**: RPC/WebSocket sağlayıcılarını kurar, hub modül ABİ’lerini sarar, toast callback’lerini kaydeder, GM/deploy/donate/link/governance işlemlerini koordine eder, profil/global istatistikleri izler ve analytics/link yardımcılarını sunar. Adresler ve ağ metadatası için `utils/constants.js` değerlerini kullanır.
- **walletService.js**: MetaMask ve WalletConnect bağlantılarını yönetir, hesap/ağ değişikliklerini dinler ve uygulama genelinde kullanılan signer/provider verisini döner.
- **identityService.js**: Self ID doğrulama akışını yönetir; Self SDK modüllerini yükler, QR kodları üretir, backend doğrulama uç noktasını çağırır ve doğrulanmış adresleri localStorage’da cache’ler.
- **talentService.js**: Talent Protocol profil verisini belirlenen API anahtarı/kullanıcı adıyla çeker; yükleme/hata durumlarını `main.js` ile paylaşır.
- **divviReferral.js**: Mümkün olduğunda kontrat işlemlerine Divvi referral etiketleri ekler ve gönderim sonrası referral metadatasını iletir; başarısızlıkta zarifçe geri döner.

## Entegrasyon Notları
- `main.js` bu yardımcıları içe aktararak UI kodunu sade tutar. Fonksiyonlar sıklıkla `MODULE_ADDRESS_BOOK`, `MIN_DONATION` ve `OWNER_ADDRESS` gibi `utils/constants.js` sabitlerini bekler.
- Sağlayıcılar, tarayıcı ortamıyla uyum için `utils/cdn-modules.js` içindeki `ethers` sürümünü kullanır.

## Katkıda Bulunma
- Yeni zincir aksiyonları için `contractService.js` dosyasını genişletin ve tutarlı UX için `registerToastHandler` kancasını kullanın.
- Cüzdan dinleyicilerini `walletService.js` içinde merkezî tutarak olay tekrarlarını önleyin.
