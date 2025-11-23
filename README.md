# Celo Engage Hub

Celo Engage Hub, Modüler Social-Fi deneyimini CELO ekosistemine taşıyan oyunlaştırılmış bir etkileşim merkezidir. Uygulama, Celo Mainnet üzerindeki canlı kontratlarla bütünleşik çalışır, kullanıcıların sosyal aksiyonlarını zincir üstü ödüllerle teşvik eder ve topluluk yönetişimine katılımı kolaylaştırır. Bu doküman, kuruluma, çalıştırmaya ve katkıda bulunmaya dair güncel bir başvuru niteliğindedir.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Ağlar ve Kontrat Adresleri](#ağlar-ve-kontrat-adresleri)
3. [Kurulum](#kurulum)
4. [Çalıştırma](#çalıştırma)
5. [Çevresel Değişkenler](#çevresel-değişkenler)
6. [Özellikler](#özellikler)
7. [Mimari ve Teknik Notlar](#mimari-ve-teknik-notlar)
8. [UI Haritası](#ui-haritası)
9. [Güvenlik ve Guardrailler](#güvenlik-ve-guardrailler)
10. [Analytics Hazırlığı](#analytics-hazırlığı)
11. [Manual QA Planı](#manual-qa-planı)
12. [Katkıda Bulunma](#katkıda-bulunma)

## Genel Bakış

- **Amaç:** CELO topluluğunun etkileşimini artırmak, zincir üstü aksiyonları oyunlaştırmak ve topluluk içi ödüllendirme mekanizmalarını tek bir merkezde toplamak.
- **Teknolojiler:** Vanilla JS tabanlı front-end, `ethers.js` ile kontrat etkileşimi, opsiyonel (varsayılan akışta devre dışı) Self ID doğrulaması için Express tabanlı hafif bir backend.
- **Durum:** Celo Mainnet üzerinde canlı kontratlar ile çalışır; Sepolia/Alfajores test ağları geliştirme ve demo süreçlerini destekler.

## Ağlar ve Kontrat Adresleri

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

Sistem sahibinin adresi: **`0x09dFa0d77125978997dD9f94A0F870D3f2900DA5`**

## Kurulum

1. Depoyu klonlayın ve proje klasörüne geçin:
   ```bash
   git clone <repo-url>
   cd celo-engage-hubv2
   ```
2. Node.js 18+ sürümünün kurulu olduğundan emin olun.
3. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

## Çalıştırma

### Geliştirme

Ön uç statik varlıklar olarak servis edildiği için `index.html` dosyasını yerel bir sunucuda çalıştırmanız yeterlidir. Örnek olarak VS Code Live Server veya `http-server` kullanılabilir. RPC/WS adresleri ve diğer yapılandırmalar `.env` dosyasında yönetilir. Celo Mainnet için varsayılan ayarlar sağlanır; test ağlarına geçiş için `.env` değişkenlerini güncellemeniz yeterlidir.

## Çevresel Değişkenler

`.env` dosyası oluşturarak aşağıdaki değişkenleri tanımlayabilirsiniz. Değerler tanımlanmazsa varsayılan fallback’ler kullanılır.

| Değişken | Açıklama | Varsayılan |
| --- | --- | --- |
| `CELO_ENGAGE_RPC_URL` | Öncelikli RPC uç noktası | Celo Forno RPC’leri |
| `CELO_ENGAGE_WS_URL` | WebSocket sağlayıcısı | Celo Forno WS’leri |
| `TALENT_PROTOCOL_USERNAME` | Talent Protocol entegrasyonu için kullanıcı adı | `null` (özellik devre dışı) |

Ayrıca `PUBLIC_`, `VITE_` veya `NEXT_PUBLIC_` prefix’lerine sahip alternatif değişkenler de otomatik olarak desteklenir.

## Özellikler

- **Profil & Gamifikasyon:** Cüzdan bağlanınca profil verileri yüklenir; kullanıcı adı yoksa modal otomatik açılır. Kullanıcı ve global sayaçlar (GM, Deploy, Donate, Link, Vote) anlık güncellenir. XP → Level → Tier hiyerarşisi görsel olarak izlenebilir.
- **GM Akışı:** Opsiyonel mesajla GM gönderilebilir; +1 XP kazanılır, toast bildirimleri ve WebSocket üzerinden canlı güncellemeler gelir.
- **Kontrat Deploy:** Düşük gas maliyetli basit kontratlar dağıtılır. İsim girilmezse otomatik `AutoName-<timestamp>` üretilir, profil kartında son dağıtımlar listelenir.
- **Bağış Sistemi:** CELO için direkt transfer, cUSD/cEUR için approve + donate akışı bulunur. Minimum bağış 0.1, toast’larda explorer linkleri gösterilir. Owner panelinden günlük limitli çekim yapılabilir.
- **Link Paylaşımı:** `https://` ile başlayan linkler kabul edilir. Feed en yeni kayıtları üstte gösterir, paylaşım başına +2 XP verilir.
- **Yönetişim:** Owner yeni öneriler oluşturabilir, tüm kullanıcılar 7 gün süren oylamalara katılabilir. Aktif/Tamamlanan listeleri, geri sayım ve oy istatistikleri UI’da yer alır.
- **Liderlik Tablosu:** Link, GM, Deploy, CELO Donor, cUSD Donor, Vote ve Level metrikleri için filtrelenebilir listeler. On-chain okuma + feed verisi ile hazırlanır, The Graph entegrasyonu hazırdır.
- **Çoklu Cüzdan Desteği:** MetaMask ve WalletConnect v2 (Project ID: `8b020ffbb31e5aba14160c27ca26540b`). Yanlış ağlarda kullanıcı bilgilendirilir.
- **Tema & UX:** Koyu/açık mod, yerel dil yönetimi (Türkçe varsayılan), localStorage kalıcılığı. Tüm toast mesajlarında kısaltılmış explorer linkleri gösterilir.
- **Gerçek Zamanlı Güncellemeler:** WebSocketProvider ile profil, GM, bağış, link, yönetişim ve rozet olayları dinlenir; kesinti durumunda üstel backoff ile yeniden bağlanır.
- **Talent Protocol Entegrasyonu:** İlgili kullanıcı adı sağlandığında Talent Protocol profili çekilir ve UI’da “Talent” bölümünde gösterilir.

## Mimari ve Teknik Notlar

- **Tek Kaynaklı Sabitler:** Adresler, ABI referansları ve yapılandırmalar `src/utils/constants.js` dosyasında tutulur.
- **Servis Katmanı:** Zincir etkileşimleri `src/services/contractService.js`, cüzdan bağlantısı `src/services/walletService.js` üzerinden yönetilir; `identityService.js` doğrulama durumu için yalnızca yerel yardımcılar içerir.
- **Dil Dosyası:** Tüm UI metinleri `src/lang.json` içerisinde yer alır. Yeni dil desteği eklemek için bu dosyada ilgili çevirileri tanımlamak yeterlidir.
- **CDN Modülleri:** `ethers.js` 5.7.2 ESM sürümü CDN’den import edilir (`src/utils/cdn-modules.js`).
- **Kimlik Doğrulama Sunucusu:** Önceden Self ID doğrulaması için kullanılan `server/index.js` artık varsayılan akışta devre dışıdır.

## UI Haritası

- **Header:** Logo, ana sekmeler, ağ durumu göstergesi, tema düğmesi, cüzdan bağlama seçenekleri.
- **Sol Panel:** Kullanıcı kartı (adres, kullanıcı adı, istatistikler, XP barı) ve profil linki.
- **Ana Bölümler:**
  - *Akış:* Link paylaşımları, canlı feed güncellemeleri.
  - *GM / Deploy / Donate / Link:* Her biri ilgili form ve yardımcı içerikleriyle gelir.
  - *Governance:* Aktif ve tamamlanan öneriler ile oy butonları.
  - *Badge:* XP kuralları, tier listesi, gelecekteki NFT basımı için placeholder.
  - *Leaderboard:* Sekmeli liderlik listeleri.
  - *Talent:* Talent Protocol profil kartı (opsiyonel).
- **Owner Panel:** Sadece owner adresine görünür; bağış çekimi ve yeni öneri formlarını içerir.
- **Footer:** Global sayaçlar ve analitik bağlantılar (The Graph, Dune placeholder).

## Güvenlik ve Guardrailler

- Tüm kritik aksiyonlar için cüzdan bağlantısı ve ağ doğrulaması zorunludur.
- Owner’a özel işlemler hem UI hem kontrat seviyesinde kısıtlanır.
- Bağış formlarında 0.1 altı tutarlar engellenir.
- Link paylaşımlarında HTTPS zorunludur, potansiyel phishing durumları toast mesajlarıyla vurgulanır.
- Özel anahtar saklanmaz; yalnızca kullanıcı imzaları kullanılır.

## Analytics Hazırlığı

- `THE_GRAPH_ENDPOINT` ve `DUNE_DASHBOARD_URL` sabitleri `getAnalyticsConfig` ile merkezi olarak yönetilir.
- Varsayılan değerler placeholder’dır. Gerçek ID/URL sağlandığında `fetchGraph` helper’ı otomatik devreye girer.

## Manual QA Planı

1. MetaMask ile Celo Mainnet’e bağlanın; yanlış ağda uyarının çıktığını doğrulayın.
2. Profili olmayan bir cüzdanla bağlanıp kullanıcı adı modalını doldurun.
3. Mesajlı/mesajsız GM gönderin; profil ve global sayaçların güncellendiğini kontrol edin.
4. Kontrat dağıtın; profil kartında son dağıtımı ve XP artışını gözlemleyin.
5. 0.1 CELO bağışı yapın; global toplam ve liderlik tablosunu doğrulayın.
6. cUSD/cEUR için approve + donate akışını tamamlayın; toast çıktıları ve sayaçları izleyin.
7. HTTPS olmayan bir link paylaşmayı deneyin (bloklanmalı), ardından geçerli link paylaşıp feed’i kontrol edin.
8. Owner olmayan cüzdanda owner panelinin görünmediğini doğrulayın.
9. Owner cüzdanıyla yeni öneri oluşturup farklı bir cüzdanla oy verin; oy sayılarının canlı güncellendiğini teyit edin.
10. WebSocket bağlantısını kesip yeniden bağlanma davranışını gözlemleyin; olay sonrası UI’nin tazelendiğini doğrulayın.
11. Talent Protocol kullanıcı adı tanımlıysa profil kartının yüklendiğini, hata durumlarında retry mekanizmasının çalıştığını kontrol edin.
12. Self doğrulama modülünü açarak QR kodu tarayın, imzayı tamamlayıp doğrulama rozetinin belirdiğini gözlemleyin.

## Katkıda Bulunma

1. Yeni bir branch oluşturun.
2. Değişikliklerinizi yapın ve `npm run start:server` komutu ile servisleri kontrol edin.
3. Pull Request açmadan önce README’deki yönergelerle uyumlu olduğundan emin olun.
4. Manuel QA planındaki adımları mümkün olduğunca uygulayın.

Sorularınız veya geliştirme önerileriniz için lütfen proje yöneticileriyle iletişime geçin. Katkılarınız için teşekkürler!
