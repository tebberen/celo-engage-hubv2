# Server Folder

Self ID imza doğrulamasına odaklanan, şu anda varsayılan akışta kullanılmayan Express tabanlı backend.

## Dosya Özeti
- **index.js**: CORS ve JSON middleware’leriyle Express’i başlatır; `/api/self/check` ile doğrulama durumunu sorgular, `/api/self/verify` ile `ethers.utils.verifyMessage` kullanarak imzaları doğrular ve başarılı adresleri bellekte saklar. `/api/self/health` basit bir heartbeat döner.

## İlişkiler
- Önceden `src/services/identityService.js` ile Self QR süreci sonrası imza doğrulaması için kullanılırdı; UI’deki Self entegrasyonu kaldırıldığı için istemci tarafında çağrı yapılmamaktadır.
- Zincir tarafında `contracts/CeloEngageHubSelf.sol` sözleşmesi, Self doğrulama mantığını paylaşmaya devam eder ancak istemci tarafından tetiklenmez.

## Çalıştırma
- Varsayılan port: `8787` ( `PORT` ile değiştirilebilir). Kök dizinden `npm run start:server` komutu ile başlatılır.

## Katkıda Bulunma
- Ön uçtaki polling ihtiyacı nedeniyle yanıtları hafif tutun.
- Kalıcılık gerekiyorsa `verifiedWallets` listesini bir veri deposuna taşıyın; mevcut hali bellek tabanlıdır.
