# Server Folder

Self ID imza doğrulamasına odaklanan Express tabanlı backend.

## Dosya Özeti
- **index.js**: CORS ve JSON middleware’leriyle Express’i başlatır; `/api/self/check` ile doğrulama durumunu sorgular, `/api/self/verify` ile `ethers.utils.verifyMessage` kullanarak imzaları doğrular ve başarılı adresleri bellekte saklar. `/api/self/health` basit bir heartbeat döner.

## İlişkiler
- `src/services/identityService.js` içindeki istemci akışı bu uç noktaları çağırır; Self QR süreci sonrası imza doğrulamasını tamamlar.
- Zincir tarafında `contracts/CeloEngageHubSelf.sol` sözleşmesi, on-chain kısıtlamalar için benzer doğrulama mantığını paylaşır.

## Çalıştırma
- Varsayılan port: `8787` ( `PORT` ile değiştirilebilir). Kök dizinden `npm run start:server` komutu ile başlatılır.

## Katkıda Bulunma
- Ön uçtaki polling ihtiyacı nedeniyle yanıtları hafif tutun.
- Kalıcılık gerekiyorsa `verifiedWallets` listesini bir veri deposuna taşıyın; mevcut hali bellek tabanlıdır.
