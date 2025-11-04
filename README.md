# Celo Engage Hub

Modüler Social-Fi deneyimi için tasarlanmış **Celo Engage Hub**, Celo Mainnet üzerinde canlı çalışan kontratlarla bütünleşik, oyunlaştırılmış bir etkileşim platformudur. Kullanıcılar GM gönderebilir, düşük maliyetli kontratlar dağıtabilir, CELO/cUSD bağışlayabilir, bağlantılarını paylaşabilir, yönetişim oylamalarına katılabilir ve tüm bu aksiyonlardan XP kazanarak seviye/tier yükseltebilir.

## Ağlar ve Adresler

| Ağ | Zincir ID | RPC | WS | Explorer |
| --- | --- | --- | --- | --- |
| Celo Mainnet | 42220 (`0xa4ec`) | https://forno.celo.org | wss://forno.celo.org/ws | https://celoscan.io |
| Celo Sepolia | 11144744 (`0xAA044C`) | https://forno.celo-sepolia.org | wss://forno.celo-sepolia.org/ws | https://celo-sepolia.blockscout.com |
| Celo Alfajores | 44787 (`0xaef3`) | https://alfajores-forno.celo-testnet.org | wss://alfajores-forno.celo-testnet.org/ws | https://alfajores.celoscan.io |

### Çekirdek Modüller (Mainnet)

| Modül | Adres |
| --- | --- |
| CeloEngageHub | `0x18351438b1bD20ee433Ea7D25589e913f14ca1A5` |
| GMModule | `0x06E065AE4dDa7b669D6381D1F7ec523bfD83e2D7` |
| DeployModule | `0xD567149Cf3a2bd97d905408c87Cc8194eb246785` |
| DonateModule | `0x76CA7FCBCdB46881c2715EBf351BCc1aAC7d70FA` |
| ProfileModule | `0xb7574975e18b64d18886D03CCC710d62cdD7E743` |
| LinkModule | `0x5ae32ab13f0458f4fb7a434120747e7e5944ce97` |
| GovernanceModule | `0xe71c701d66f8c27fba15f3b4a607c741ffedeed1` |
| BadgeModule | `0xd11896d5ba8aa3ed906b37b941a27849e74fd300` |

Sistem sahibinin adresi: **`0x09dFa0d77125978997dD9f94A0F870D3f2900DA5`**.

## Temel Özellikler

- **Profil & Gamifikasyon:** Cüzdan bağlandığında profil sorgulanır, yoksa kullanıcı adı modalı otomatik açılır. Kullanıcı bazlı sayaçlar (GM, Deploy, Donate, Link, Vote) ve global sayaçlar anında güncellenir. XP -> Level -> Tier hiyerarşisi arayüzde görselleştirilir.
- **GM Akışı:** Opsiyonel mesajla GM gönderme, XP +1, toast bildirimleri ve WebSocket üzerinden canlı güncelleme.
- **Kontrat Deploy:** Düşük gas maliyetli basit kontrat dağıtımı; isim verilmezse otomatik `AutoName-<timestamp>` üretilir. Profil kartında son dağıtımlar listelenir.
- **Bağış Sistemi:** CELO (doğrudan) ve cUSD (approve + donate akışı). Minimum bağış 0.1, toast durumları ve Explorer bağlantılarıyla takip edilir. Owner panelinden günlük limitli çekim yapılabilir.
- **Link Paylaşımı:** Sadece `https://` ile başlayan linkler kabul edilir. Paylaşımlar akışta en yeni en üstte listelenir, XP +2.
- **Yönetişim:** Owner yeni öneri oluşturabilir, tüm kullanıcılar 7 gün süren oylamalara katılabilir. Aktif/Tamamlanan listeleri, geri sayım ve oy istatistikleri arayüzde sunulur.
- **Liderlik Tablosu:** Link, GM, Deploy, CELO Donor, cUSD Donor, Vote ve Level metrikleri için filtrelenebilir listeler. Şimdilik on-chain okuma + feed verileriyle oluşturulur, The Graph entegrasyonu hazır.
- **Çoklu Cüzdan Desteği:** MetaMask ve WalletConnect v2 (Project ID: `8b020ffbb31e5aba14160c27ca26540b`). Yanlış ağda uyarı gösterilir.
- **Tema & UX:** Koyu/açık mod, localStorage kalıcılığı, Türkçe lokalizasyonlu UI mesajları. Tüm toastlarda işlem hash’i kısa explorer linki olarak sunulur.
- **Gerçek Zamanlı Güncellemeler:** WebSocketProvider ile profil, GM, bağış, link, yönetişim ve rozet olayları dinlenir. Kesinti halinde üstel backoff ile otomatik yeniden bağlanır.

## UI Haritası

- **Header:** Logo, ana sekmeler, ağ durumu, tema tuşu, cüzdan bağlama butonları.
- **Sol Panel:** Kullanıcı kartı (adres, kullanıcı adı, istatistikler, XP barı) ve profil linki.
- **Ana Bölümler:**
  - *Akış:* Link paylaşımları, canlı güncellenen feed.
  - *GM / Deploy / Donate / Link:* Her biri ilgili form ve helper içerikleriyle.
  - *Governance:* Aktif ve tamamlanan öneriler + oy butonları.
  - *Badge:* XP kuralları, tier listesi, gelecekteki NFT basımı için yer tutucu.
  - *Leaderboard:* Sekmeli liderlik listeleri.
- **Owner Panel:** Sadece owner adresine görünür; bağış çekimi ve yeni öneri formu.
- **Footer:** Global sayaç widget’ı ve analytics bağlantıları (The Graph, Dune placeholder).

## Güvenlik ve Guardrail’ler

- Tüm kritik aksiyonlar için cüzdan bağlantısı ve ağ doğrulaması yapılır.
- Owner’a özel işlemler UI tarafında ve kontratta doğrulanır.
- Bağış formlarında 0.1 altı tutarlar engellenir.
- Link paylaşımlarında HTTPS zorunludur, phishing uyarıları toast mesajlarında vurgulanır.
- Özel anahtar saklanmaz, sadece kullanıcı imzaları kullanılır.

## Analytics Hazırlığı

- `THE_GRAPH_ENDPOINT` ve `DUNE_DASHBOARD_URL` sabitleri merkezi olarak tanımlandı. Varsayılan değerler placeholder; gerçek ID/URL girildiğinde `fetchGraph` helper’ı otomatik devreye girer.

## Test Planı (Manuel QA)

1. MetaMask ile mainnet ağına bağlanın. Farklı ağdaysanız UI uyarısını doğrulayın.
2. Profili olmayan bir cüzdanla bağlanın, kullanıcı adı modalı görünün ve kayıt işlemini tamamlayın.
3. GM gönderin (mesajlı ve mesajsız), profil ve global sayaçların arttığını gözlemleyin.
4. Kontrat dağıtın; profil kartındaki dağıtım listesine eklendiğini ve XP kazandığınızı doğrulayın.
5. 0.1 CELO bağış yapın; global CELO toplamını ve liderlik tablosunu kontrol edin.
6. cUSD için sırasıyla approve + donate akışını tamamlayın; toast çıktıları ve sayaçları izleyin.
7. HTTPS olmayan bir link paylaşmayı deneyin (bloklanmalı), ardından geçerli bir link paylaşın ve feed’i kontrol edin.
8. Owner olmayan cüzdanda owner panelinin gizlendiğini doğrulayın.
9. Owner cüzdanına geçerek yeni öneri oluşturun, başka bir hesapla oy kullanın ve oy sayılarının güncellendiğini görün.
10. WebSocket bağlantısını kesip (ör. ağı geçici kapatarak) yeniden bağlanma davranışını kontrol edin; olaylar sonrası UI’nin tazelendiğini doğrulayın.

## Geliştirici Notları

- Ethers.js 5.7.2 ESM versiyonu CDN’den import edilir.
- Tüm adres/ABI bilgileri `src/utils/constants.js` dosyasında tek kaynak olarak tutulur.
- UI mesajları Türkçe olarak `UI_MESSAGES` altında yönetilir.
- Yeni ağlar veya adresler ekleneceğinde `MODULE_ADDRESS_BOOK` üzerinden merkezi olarak güncelleme yapılmalıdır.

