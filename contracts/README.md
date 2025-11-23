# Contracts Folder

Celo Engage Hub’un zincir üstü bileşenlerini içerir.

## Dosya Özeti
- **CeloEngageHubSelf.sol**: `SelfVerificationRoot` sözleşmesini genişleterek cüzdan self-doğrulamalarını kaydeder. Ön uçta Self entegrasyonu kaldırıldığından bu sözleşme şu anda isteğe bağlı/deneysel durumdadır.

## İlişkiler
- ZK-proof doğrulaması için `@selfxyz/contracts` paketine dayanır.
- Off-chain doğrulama servisi (`server/index.js`) ve eski kimlik akışlarıyla çalışacak şekilde tasarlanmış olsa da mevcut UI tarafından çağrılmamaktadır.

## Katkıda Bulunma
- Yeni modülleri ayrı `.sol` dosyaları olarak ekleyin ve front-end’in kullanması gerekiyorsa `src/utils/constants.js` içinde ABI/adres referanslarını güncelleyin.
- Erişim kontrollerinde tutarlılık için gerekli işlemlerde `onlyVerified` veya benzer guard’ları kullanın.
