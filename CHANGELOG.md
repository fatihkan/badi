# Degisiklik Gunlugu

Bu proje [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) formatini ve [Semantik Versiyonlama](https://semver.org/lang/tr/) standardini takip eder.

## [1.5.0] - 2026-04-18

### Eklenen — Mobil ve ASO

- **badi aso** — App Store Optimization komut seti (closes #47)
  - `audit` — iOS app listing denetimi, skor hesaplama
  - `keywords` — Title/subtitle/description keyword analizi
  - `metadata` — iOS/Android karakter limit rehberi
  - `review` — Review response sablonlari
  - `compete` — Iki app karsilastirma + ortak/farkli keywordler
  - `screenshots` — iOS/Android boyut rehberi
  - `search` — iTunes API ile app arama
- **badi mobile** — Mobil proje yasam dongusu (closes #49, #50, #51)
  - `init` — React Native, Flutter, Expo, Swift, Kotlin template
  - `version bump` — iOS/Android/Flutter version sync (package.json + Info.plist + build.gradle + pubspec.yaml)
  - `build` — iOS/Android release build (RN + Flutter)
  - `release` — TestFlight, Play Internal, App Store, Play rehberleri
  - `assets icon/splash/screenshots` — Boyut ve tasarim rehberleri
- **badi icerik release-notes** — App Store/Play Store release notes (closes #48)
  - `--platform ios|android` — 4000/500 karakter limit
  - `--lang tr,en` — Paralel uretim
- **badi icerik post --platform** — Mobil platform variantlari (closes #53)
  - `appstore`, `playstore`, `mobile` CTA bloklari

### Teknik
- `lib/aso-helpers.js` — iTunes Lookup/Search + Play Store scrape
- `lib/commands/aso.js` — 7 alt komut
- `lib/commands/mobile.js` — 5 alt komut grubu
- 28 yeni test (toplam 143)

## [1.4.3] - 2026-04-18

### Degisen
- Harici repo referanslari temizlendi (52 dosya)
- README, SECURITY, CHANGELOG'da harici linkler kaldirildi
- `.claude/skills/security-check/` altindaki 49 SKILL.md dosyasinda metadata sadelestirildi
- Badi odakli metadata (author, homepage, organization alanlari kaldirildi)

## [1.4.2] - 2026-04-17

### Performans
- **Startup suresi %96 azaldi** (813ms → 26ms) — lazy command loading
- `bin/badi.js` artik komutlari dinamik import ediyor — sadece calisan komut yukleniyor
- Template lazy loading: TR/EN sablonlar (~800 satir) sadece sablon uretiminde yukleniyor
- `levenshteinDistance` O(m\*n) bellek → O(n) bellek (tek satir DP)
- Erken cikis optimizasyonu (boy farki kontrolu)

### Olcumler
| Komut | Once | Sonra | Iyilesme |
|-------|------|-------|----------|
| `badi --version` | 813ms | 26ms | %97 |
| `badi list --agents` | ~800ms | 29ms | %96 |

## [1.4.1] - 2026-04-17

### Duzeltilen
- **Guvenlik**: SEO komutlarinda SSRF korumasi eklendi (localhost, private IP, non-http engellendi)
- **Guvenlik**: WordPress `appPassword` base64 obfuscate + `wp-sites.json` dosyasina 0600 mode
- **Bug**: `seo sitemap` operator precedence hatasi (404'te bile sitemap bulundu sanirdi)
- `wp update` komutlarinda timeout 120s'ye uzatildi (buyuk sitelerde yetersiz kaliyordu)
- WP test cleanup iyilestirmesi

## [1.4.0] - 2026-04-17

### Eklenen
- **badi wp** — WordPress site yonetimi (dijital ajans ozelligi)
  - `wp add/list/remove` — site konfigurasyonu (WP-CLI veya REST API)
  - `wp status` — WP surumu, aktif tema, eklenti durumu
  - `wp plugins/themes` — detayli eklenti ve tema listesi
  - `wp update` — core/plugins/themes toplu guncelleme
  - `wp security` — 6 nokta guvenlik taramasi
- **badi seo** — SEO denetim ve analiz
  - `seo audit` — 20+ kontrol noktasi, skor hesaplama
  - `seo meta` — meta tag analizi ve eksik tag tespiti
  - `seo sitemap` — robots.txt + sitemap.xml dogrulama
  - `seo speed` — TTFB, HTML boyutu, kaynak analizi, compression
- 10 yeni test (toplam 115)

### Duzeltilen
- CI test script uyumluluk (tests/ → tests/*.test.js)

## [1.3.2] - 2026-04-16

### Duzeltilen
- **KRITIK**: Command injection — execSync yerine execFileSync (plugin.js)
- **KRITIK**: guard-bash.sh pipe zincirleme hatasi (proje disi yazma tespiti calismiyordu)
- VERSION artik package.json'dan okunuyor (tek kaynak, senkron hatasi onlendi)
- Habit streak hesaplama mantik hatasi (stats.js)
- CSV export formula injection korunmasi (stats.js)
- Schedule wrap-around gun araligi (sat-sun, fri-mon artik calisiyor)
- Chalk fallback Proxy tabanli (tum zincir kombinasyonlari destekleniyor)
- perf add atomik append (race condition onlendi)
- session-reset.sh macOS uyumsuz -printf kaldirildi
- dependency-audit.sh cross-platform date + pnpm destegi eklendi
- `badi list` artik kullanicinin projesini listeliyor (PKG_ROOT degil)
- `badi update` CLAUDE.md eksikse ekliyor
- `badi icerik ac --open` ile editor'de dosya aciyor
- checkDuplicates uyari kodu exit(2) (hata degil uyari)
- Unused imports temizlendi (helpers.js)
- Schedule parseTimeSpec gecersiz saat validasyonu (0-23:0-59)

### Eklenen
- GitHub Actions CI workflow (Node 18/20/22 x ubuntu/macos)
- GitHub Actions publish workflow (npm provenance)
- Dependabot haftalik npm + actions guncelleme
- FUNDING.yml (GitHub Sponsors + Buy Me a Coffee)
- npm downloads + CI status badge README'de
- v1.0.0, v1.1.0, v1.2.0, v1.3.0 GitHub Releases

## [1.3.1] - 2026-04-13

### Eklenen
- 48 guvenlik skill entegrasyonu
- OWASP Top 10 tam kapsam: SQLi, XSS, CSRF, SSRF, RCE, XXE ve daha fazlasi
- 7 dil bazli guvenlik tarayicisi: Go, TypeScript, Python, PHP, Rust, Java, C#
- 3000+ guvenlik kontrol maddesi
- 4-fazli guvenlik pipeline: Kesfet → Tara → Dogrula → Raporla
- Confidence scoring ile false positive azaltma

## [1.3.0] - 2026-04-12

### Degisen
- bin/badi.js 3812 satirdan 135 satira dusuruldu (15 ESM modul)
- CLAUDE.md 6.8KB'dan 1.2KB'a sadelelestirildi (%82 azalma)
- Skills 676KB'dan 256KB'a optimize edildi (%62 azalma)
- Commands 264KB'dan 236KB'a optimize edildi
- track-usage.sh matcher daraltildi (tum araclar → Bash|Write|Edit)
- dependency-audit.sh'e 24 saat cache eklendi
- Hook'lara akilli filtreleme eklendi (test/tmp dosyalari atlanir)
- Log dosyalarina rotasyon eklendi (usage 1000, incident/failure 500 satir)

## [1.2.0] - 2026-04-12

### Eklenen
- `badi icerik ara` — arsiv arama + benzerlik tespiti + --force
- `--lang tr,en` — coklu dil icerik uretimi (TR/EN paralel)
- `badi icerik sablon` — sablon mirasi sistemi (olustur/list/sil + --sablon)
- `badi schedule` — zamanlanmis hatirlaticilar (add/list/remove/check)
- EN sablonlar: 6 icerik turu icin Ingilizce versiyonlar
- Levenshtein + Jaccard benzerlik algoritmalari
- Frontmatter parse destegi
- preferences.json ile varsayilan dil ayari
- 33 yeni test (toplam 105)

## [1.1.0] - 2026-04-12

### Eklenen
- `badi stats` — kullanim istatistikleri (bar chart, trend, habit streak, CSV export)
- `badi completion bash|zsh|fish` — kabuk tamamlama scripti uretimi
- `badi icerik perf` — icerik performans takibi (add/list/trend/roi/platform)
- Update notifier — npm registry kontrolu, 24 saat cache
- track-usage.sh hook — PostToolUse ile kullanim loglama
- 24 yeni test (toplam 72)

## [1.0.0] - 2026-04-09

### Eklenen
- 21 uzman ajan (guvenlik, performans, test, API, mimari, icerik, proje planlama)
- 50 is akisi komutu (oturum, kalite, dagitim, strateji, icerik)
- 12 guvenlik hook'u (guard-bash, branch-guard, backup, completeness-gate)
- 21 beceri kategorisi (1000+ prosedur)
- CLI: init, update, doctor, list, plugin alt komutlari
- Icerik uretim motoru: post, karousel, video, gorsel, takvim, marka
- Plugin sistemi
- 6 katmanli bellek mimarisi
- 48 test
