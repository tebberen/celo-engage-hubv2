# Src Folder

Celo Engage Hub'un front-end kaynak kodu. Vanilla JS, CSS ve CDN’den yüklenen bağımlılıklarla çalışır ve doğrudan `index.html` üzerinden servis edilir.

## Kilit Dosyalar
- **main.js**: Cüzdan bağlantıları, modül aksiyonları (GM, deploy, donate, link, governance), toast akışı, gerçek zamanlı güncellemeler, kimlik doğrulama ve Talent Protocol entegrasyonunu yöneten ana UI denetleyicisi.
- **lang.json**: Tüm UI metinleri için merkezî çeviri kaynağı; dil değişimleri buradan okunur.

## Alt Klasörler
- **services/**: Blockchain, cüzdan bağlantıları, kimlik doğrulama ve üçüncü parti veri akışları için servis katmanı.
- **styles/**: Uygulamanın tema ve layout kurallarını tutan CSS.
- **utils/**: Sabitler, CDN modül köprüleri ve formatlama yardımcıları.

## Entegrasyon Notları
`index.html` dosyası `src/main.js` ve `src/styles/main.css` dosyalarını içe aktarır. Adres/ABI sabitleri `utils/constants.js` içinde toplanır ve hem servisler hem de UI tarafından tüketilir.

## Katkıda Bulunma
- Yeni UI metinleri eklerken `lang.json` dosyasını güncelleyin.
- Yeni modülleri servis fonksiyonlarıyla bütünleştirip `main.js` içinde kompozisyonu koruyun.
