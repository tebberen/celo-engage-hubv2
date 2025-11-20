# Contracts Folder

Celo Engage Hub’un zincir üstü bileşenlerini içerir.

## Dosya Özeti
- **CeloEngageHubSelf.sol**: `SelfVerificationRoot` sözleşmesini genişleterek cüzdan self-doğrulamalarını kaydeder. `verifiedUsers` haritasını yönetir, `SelfVerified` etkinliğini yayar ve `verifySelfProof`, `isVerified` ile `onlyVerified` modifiyer’i tarafından korunan örnek `gatedAction` fonksiyonunu sunar.

## İlişkiler
- ZK-proof doğrulaması için `@selfxyz/contracts` paketine dayanır.
- Off-chain doğrulama servisi (`server/index.js`) ve kimlik UI akışı (`src/services/identityService.js`) ile birlikte çalışacak şekilde tasarlanmıştır.

## Katkıda Bulunma
- Yeni modülleri ayrı `.sol` dosyaları olarak ekleyin ve front-end’in kullanması gerekiyorsa `src/utils/constants.js` içinde ABI/adres referanslarını güncelleyin.
- Erişim kontrollerinde tutarlılık için gerekli işlemlerde `onlyVerified` veya benzer guard’ları kullanın.
