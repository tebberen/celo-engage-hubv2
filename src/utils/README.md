# Utils Folder

Paylaşılan sabitler, biçimlendirme yardımcıları ve CDN’den sağlanan kütüphane köprüleri.

## Dosya Özeti
- **constants.js**: Ağ metadatası, kontrat adresleri/ABI’leri, modül sürümleri, bağış eşikleri, UI mesajları ve üçüncü parti anahtarları (WalletConnect, Divvi) için merkezî yapılandırma. Servisler ve `main.js` tarafından kullanılır.
- **cdn-modules.js**: Tarayıcıyla uyumlu ESM `ethers` ve WalletConnect sağlayıcısını CDN’den yeniden dışa aktarır.
- **formatters.js**: CELO token değerleri ve genel sayılar için fallback’li, kompakt gösterim destekli formatlayıcılar sağlar.

## Entegrasyon Notları
Bu yardımcılar `src/services` ve `src/main.js` boyunca import edilir. Kontrat adresi veya ağ varsayılanlarını değiştirdiğinizde `constants.js` dosyasını güncelleyerek tüm katmanların senkron kalmasını sağlayın.

## Katkıda Bulunma
- Import ifadelerini deterministik bırakın; try/catch ile sarmalamayın.
- ABI/adres güncellemelerini atomik tutun ve kök README’de belgelenen referanslarla uyumlu hale getirin.
