# Styles Folder

Celo Engage Hub arayüzünün tema, tipografi ve layout kurallarını barındırır.

## Dosya Özeti
- **main.css**: Marka renkleri, tipografi ölçekleri, butonlar, modallar, feed kartları, navigasyon, rozetler ve responsive düzenleri tanımlar; `index.html` ve `main.js` ile render edilen bileşenler tarafından paylaşılır.

## Entegrasyon Notları
- `index.html` tarafından yüklenir; CSS değişkenleri asetler ve tasarım diliyle uyumlu tutulmalıdır.
- Sınıflar doğrudan `main.js` içindeki DOM manipülasyonlarında kullanıldığı için seçici adlarını değiştirirken JS güncellemelerini eşleştirin.

## Katkıda Bulunma
- Yeni stil ihtiyaçlarında mevcut değişken ve yardımcı sınıfları genişletmeye öncelik verin; JS içinde inline stil kullanımından kaçının.
- Erişilebilirlik için kontrast, odak durumları ve klavye navigasyonunu koruyun.
