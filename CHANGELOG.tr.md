# Degisiklik Gunlugu

> **Dil / Language:** [English](CHANGELOG.md) · **Turkce**

Bu proje [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) formatini ve [Semantik Versiyonlama](https://semver.org/lang/tr/) standardini takip eder.

## [1.13.0] - 2026-04-24

### Eklenen — Arka Plan Agent'lar (issue #55)

Badi artik **arka plan watcher** (takipci) sistemine sahip. Kullanici `.claude/watchers/` dizininde YAML frontmatter'li watcher'lar tanimlayip, OS-native bir scheduler'da calistirabilir. Ureten raporlar bir sonraki `/start` oturumunda brifing'e otomatik dusuyor.

Yeni komutlar:
- `badi agent create <isim> [--template project-health|deploy-watchdog]` — watcher iskelesi.
- `badi agent list` — kurulu watcher'lar + scheduler durumu.
- `badi agent run <isim>` — manual calistirma (gelistirme icin).
- `badi agent install <isim> [--scheduler launchd|systemd|cron] [--dry-run]` — en uygun OS scheduler'ina kayit.
- `badi agent uninstall <isim>` — scheduler kaydini kaldir (watcher `.md` kalir).
- `badi agent tail <isim> [-n N]` — raporun son N satiri.
- `badi agent status [--since 24h|7d] [--format text|json]` — tum watcher'lardan son N saatlik ozet.
- `badi agent remove <isim>` — tam temizlik (scheduler + watcher dosya).

### 5 yerlesik watch tipi

| Tip | Ne kontrol eder |
|-----|-----------------|
| `git` | `git log` (`last-N-commits` / `since:<ref>` / `all`), regex pattern eslesmesi |
| `shell` | Rastgele komut + `alert_on: exit-nonzero / stdout-match:<re> / stderr-match:<re>` + timeout |
| `file` | Dosya degisimi (mtime+size) ve `package.json` dependency-added/removed |
| `log` | Offset takibi ile tail, `new-entry` veya `pattern-match:<re>` |
| `http` | HEAD/GET + SSRF guard, `status-nonok`, `latency>Ns`, `body-match:<re>` (`|` ile kompozit) |

### 3 OS scheduler adapter'i

- **launchd** (macOS) — `~/Library/LaunchAgents/com.badi.watcher.<isim>.plist` + `launchctl bootstrap/bootout`.
- **systemd** (Linux) — `~/.config/systemd/user/badi-watcher-<isim>.{service,timer}` + `systemctl --user enable --now`.
- **cron** (universal fallback) — marked satirlar kullanicinin crontab'inda.

`pickScheduler()` platforma gore secer; `--scheduler` bayragi override eder; `--dry-run` plani + tam unit icerigi diske yazmadan gosterir.

### /start entegrasyonu

`/start` artik gunluk brifingten once `badi agent status --since 24h` cagiriyor. Son 24 saatte uyari varsa Brifing blogunda "Watcher" satirina ekleniyor, Claude uyari ozetini soruyor.

### Yerlesik template'lar

- `.claude/watchers/project-health.md` — git + npm test + package.json + failures log (15 dk).
- `.claude/watchers/deploy-watchdog.md` — http health + deploy error log (5 dk, varsayilan `active: false` — URL'i doldurup true yap).

### Teknik
- Yeni `lib/watchers/{index,parse}.js` + `lib/watchers/types/{git,shell,file,log,http}.js`.
- Yeni `lib/schedulers/{index,launchd,systemd,cron}.js`.
- Yeni `lib/commands/agent.js` + `bin/badi.js` entegrasyonu.
- `tests/watcher.test.js` icinde 38 yeni test (parse 13, types 10, schedulers 5, runWatcher e2e 2, agent CLI 6 + vb.).
- Toplam suite: **304/304 yesil** (266 → 304).

### Guvenlik notlari
- `type: shell` watcher'lar rastgele komut calistirir. Install akisi TTY modunda uyari yazar. `.claude/watchers/*.md` dosyalari guvenilir kabul edilmeli — 3. parti watcher'i korukoru kurma.
- `http` tipi `validateUrl()` (helpers.js) ile SSRF guard'dan geciyor — localhost / private IP bloklu.
- Scheduler unit dosyalari kullanici scope'unda kurulur (sudo gerekmez). `cron` sadece kullanici crontab'ini duzenler.

## [1.12.1] - 2026-04-24

Release sonrasi code review hotfix'i. v1.12.0 incelemesindeki 10 bulgunun hepsi tek PR'da kapandi.

### Duzeltildi — Yuksek

- **Test izolasyonu** — `preferences.js` artik `BADI_PREFS_HOME` (base dizin) ve `BADI_PREFS_PATH` (tam override) env var'larini okuyor. Onceden test harness'i tarafindan gecen env var no-op idi; `--no-save`'i unutan bir test gercek `~/.config/badi/preferences.json`'a yazardi.
- **Non-TTY sessiz kayit** — `badi init`, `--harness` bayragi yoksa ve headless calistirilmissa artik `defaultHarness` preferences'a yazmiyor. CI pipeline'lari yanlislikla bir harness secimi sabitleyemez.

### Duzeltildi — Orta

- **Cursor icerik donusumu** — Her Cursor hedefli dosya (`.cursor/commands/*.md` ve `.cursor/rules/badi-main.mdc`) artik Claude-specific path referanslari (`.claude/hooks/`, subagent, skill) hakkinda uyari iceren bir preface ile baslar. Govde 1:1 korunur; preface idempotent (install'u tekrar calistirinca cift eklenmez).
- **Interaktif menu test kapsami** — `parseMenuAnswer()` `selectHarnessInteractive()`'den saf fonksiyon olarak ayrildi ve export edildi. 9 offline test: sayi / id / Enter / gecersiz / sinir disi / negatif / bilinmeyen-id.

### Duzeltildi — Dusuk

- **Cursor rule header** — gereksiz `globs: **/*` satiri kaldirildi (`alwaysApply: true` varken anlamsiz).
- **`setPreference` dogrulamasi** — `defaultHarness` degerleri diske yazilmadan once harness registry'sine karsi dogrulaniyor.
- **Case-insensitive `--harness`** — `badi init --harness CURSOR` / `Gemini` / `ALL` artik dogru cozuluyor.
- **Kirilgan test assertion'lari** — `>10` / `>30` gibi sabit esikler gercek kaynak sayilariyla degistirildi (`readdirSync(SRC/commands).length`, `pass + warn + fail === checks.length`).
- **Cursor dizin sayimi** — `.cursor/` icin cift `result.created++` kaldirildi; install ozeti gercek dosya/dizin olusum sayilarini yansitiyor.

### Teknik
- `lib/preferences.js` — env-var destegi + `VALIDATORS` registry'si.
- `lib/commands/init.js` — `parseMenuAnswer` export edildi; `selectHarnessInteractive` artik parsing'i delege ediyor; non-TTY dali `saveDefault`'u kapatiyor.
- `lib/harnesses/cursor.js` — `transformCommand()` export; rule header kisaldi; `.cursor/` olusum sayimi duzeltildi.
- `lib/harnesses/index.js` — `resolveHarnesses` lookup'tan once inputu lowercase yapiyor.
- `tests/harness.test.js` — 15 yeni test (case-insensitive resolve, preface idempotency, rule header sekli, `parseMenuAnswer` 9 durum, env-var izolasyonu 2 durum). Toplam: 266/266 yesil.

## [1.12.0] - 2026-04-24

### Eklenen — Multi-harness destegi (issue #54)

Badi artik birden fazla LLM CLI'si ile calisabilir. `badi init` ile Claude Code, Cursor veya Gemini CLI icin dosyalar uretilebilir.

- **Interaktif secim menusu** — `badi init` argumansiz calistirinca harness secim menusu gosterir.
- **`--harness <id>`** — non-interactive kurulum: `claude`, `cursor`, `gemini`, `all`, veya virgul-ayrimli (`claude,cursor`).
- **Harness-aware update/doctor** — `badi update` ve `badi doctor` kurulu harness'i otomatik tespit edip hedef alir.
- **Preferences** — `~/.config/badi/preferences.json` icinde `defaultHarness` (bir sonraki `badi init` varsayilan olarak onu onerir). `--no-save` ile opt-out.

### Harness matrisi

| Harness | Kurallar | Komutlar | MCP | Subagents | Hooks | Skills |
|---------|:--------:|:--------:|:---:|:---------:|:-----:|:------:|
| Claude Code | `CLAUDE.md` | 77 | `.mcp.json` | 21 | 12 | 23 |
| Cursor | `.cursor/rules/badi-main.mdc` | 77 | `.cursor/mcp.json` | — | — | — |
| Gemini CLI | `GEMINI.md` (birlesik) | inline | `.gemini/settings.json` | — | — | — |

Cursor'da 12 hook + 23 skill, Gemini'de ek olarak 21 subagent + 77 slash komut desteklenmiyor — `badi init` ciktisinda `skippedComponents` raporunda gorunur.

### Teknik
- Yeni `lib/harnesses/` dizini: `claude.js`, `cursor.js`, `gemini.js`, `index.js` (registry + `resolveHarnesses` + `detectHarness`).
- Yeni `lib/preferences.js` — `~/.config/badi/preferences.json` read/write.
- `lib/commands/init.js`, `update.js`, `doctor.js` — adapter registry uzerinden dispatch edecek sekilde refactor. Baska harness yoksa Claude-only davranis korunuyor.
- `tests/harness.test.js` icinde 44 yeni test (7 suite: registry, 3 adapter, init/update/doctor CLI akislari). Toplam suite: 251/251 yesil.

## [1.11.0] - 2026-04-22

### Eklenen — Icerik Turleri
- **`badi icerik newsletter [konu]`** — haftalik e-posta bulteni sablonu (A/B konu satiri, on izleme, hook, CTA, footer, HTML config).
- **`badi icerik podcast [konu]`** — episode notu + show notes iskelesi (hook, dakika bazli akis, transkript iskelesi, platform metadata, sosyal klip onerileri).
- **`badi icerik thread [konu]`** — 10-postluk X/LinkedIn thread (hook → problem → hikaye → 3 anahtar nokta → karsi arguman → ders → uygulama → CTA + engagement stratejisi).
- **`badi icerik case-study [konu]`** — musteri basari hikayesi: one-liner, manset metrik, problem/cozum/sonuc tablosu, testimonial, dagitim plani.
- Dort tur de `--lang tr,en` ile TR+EN destekliyor.

### Eklenen — ASO Genislemeleri
- **`badi aso playstore <app-id>`** — mevcut `lookupPlayStore` scraper'i ile Google Play audit.
- **`badi aso reviews <app-id>`** — iTunes RSS'den gercek yorumlari ceker, anahtar kelime tabanli sentiment siniflandirma (pozitif / negatif / bug / feature_request / notr) yapar, en kritik 5 + en cok istenen 5 ozelligi listeler.
- **`badi aso screenshots <app-id>`** — uygulamaya ozel varlik dokumunu: yonelim dagilimi, cozunurluk dagilimi, ornek URL'ler, oneriler. Eski `badi aso screenshots` (id'siz) genel boyut rehberi olarak kaliyor.

### Eklenen — SEO Genislemeleri
- **`badi seo backlinks <domain>`** — en iyi cabali ucretsiz yaklasim. DuckDuckGo mention araması (site-disla filtresi) + Wayback Machine CDX snapshot varligi birlesimi. Tam backlink profili degil, yonsel veri oldugu net belirtilir.
- **`badi seo rank <domain> <anahtar-kelime>`** — DuckDuckGo organik rank kontrolu (ilk ~30 sonuc), domain bulununca pozisyonu isaretler.
- **`badi seo compare <url1> <url2>`** — yan yana SEO audit karsilastirmasi: HTTPS, title/meta uzunluklari, OG taglar, canonical, baslik yapisi, gorsel alt kapsami, kelime sayisi, schema, HTML boyutu, script sayisi, compression.

### Eklenen — Mobile Genislemeleri
- **`badi mobile crash-setup <fw> <provider>`** — React Native, Flutter, iOS ve Android icin Sentry veya Crashlytics kurulum iskelesi, yapistir-calistir config snippet'leriyle.
- **`badi mobile deeplink [domain|scheme://]`** — URL scheme'leri (RFC 3986) dogrular, `apple-app-site-association` + `assetlinks.json` dosyalarini ceker, appID, package name, SHA256 fingerprint on-eki ve test URL komutlarini raporlar.
- **`badi mobile ota [codepush|expo]`** — App Center CodePush (emeklilik uyarisi ile) ve Expo EAS Update icin adim adim OTA kurulum (configure → release → rollback).

### Eklenen — Publish Orkestratoru
- **`badi publish`** — tek komutla tum surum akisini calistirir: temiz git kontrolu → branch dogrulama → CHANGELOG kapisi → `package.json` version bump (varsa `package-lock.json` dahil) → commit → tag → main + tag push → `gh release create --generate-notes` → `npm publish --access public`.
- Bayraklar: `--version patch|minor|major`, `--dry-run`, `--skip-npm`, `--skip-github`, `--skip-changelog`, `-m/--message`.
- **`badi publish check`** — on-kontrol: git temizligi, branch, paket metadata, CHANGELOG, `gh` CLI, `npm whoami`.

### Teknik
- `lib/templates/tr.js` + `lib/templates/en.js` — her iki dilde 4 yeni template fonksiyonu (newsletter, podcast, thread, caseStudy).
- `lib/aso-helpers.js` — yeni export'lar: `fetchAppStoreReviews`, `analyzeSentiment`, `parseScreenshotUrl`.
- `lib/commands/seo.js` — DuckDuckGo artik POST + browser UA ile cagriliyor (GET shell sayfasi donduruyordu).
- `lib/commands/publish.js` — yeni ~330 satirlik orkestratör modul.
- icerik, aso, seo, mobile, publish test dosyalarina 27 yeni test eklendi (toplam 202/202 yesil).
- Yeni calisma-zamani bagimliligi yok.

## [1.10.0] - 2026-04-22

### Eklenen — Frontend Taste (Premium UI Skill'leri)
- **9 yerlesik tasarim varyanti** `.claude/skills/frontend-taste/` altinda — Claude Code'un jenerik "AI gibi goruken" UI uretmesini engeller:
  - `default` (design-taste-frontend) — genel amacli; DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY kadranlari
  - `gpt-taste` — sert editoryal, AIDA yapisi, zorunlu GSAP ScrollTriggers
  - `minimalist` (minimalist-ui) — Notion / Linear editoryal hissi
  - `brutalist` (industrial-brutalist-ui) — Isvicre tipografisi + ham grid
  - `soft` (high-end-visual-design) — ustun ajans hissi, spring motion
  - `redesign` (redesign-existing-projects) — mevcut UI'i denetle + duzelt
  - `output` (full-output-enforcement) — anti-truncation, diger varyantlarla istiflenir
  - `stitch` (stitch-design-taste) — Google Stitch icin `DESIGN.md` ureticisi
  - `images-first` (image-taste-frontend) — referans gorselli workflow
- **`badi taste` CLI** — varyantlari listele, incele, prompt al, durum kontrolu
  - `badi taste` — 9 varyanti acikamalariyla listele
  - `badi taste show <id>` — bir varyantin tam SKILL.md'sini yazdir
  - `badi taste prompt <id>` — Claude Code icin tetikleme ornegi goster
  - `badi taste status` — 9/9 varyantin kurulu oldugunu dogrula
- Claude Code'ta prompt icinde varyant adini gecirerek tetiklenir (ornek: "frontend-taste/brutalist skill'i kullan.")

### Teknik
- `lib/commands/taste.js` — yeni komut modulu (~170 satir)
- `bin/badi.js` — yardim ve komut haritasi guncellendi
- Yeni bagimlilik yok; skill'ler mevcut `badi init` / `badi update` akisiyla kopyalanir
- `package.json` version: 1.10.0

## [1.9.0] - 2026-04-21

### Eklenen — Global Dokumantasyon + Yerlesik Skill
- **Ingilizce dokumantasyon birincil olarak**: `README.md` ve `CHANGELOG.md` artik Ingilizce (npm global kesfi icin)
- **Turkce dokumantasyon korundu**: `README.tr.md` ve `CHANGELOG.tr.md` — dil secici linkli
- **Mobile App Store Screenshots Skill**: `.claude/skills/mobile/app-store-screenshots/` yerlesik skill
  - Claude Code'a "App Store screenshot olustur" dediginde otomatik tetiklenir
  - Next.js iskelesi + html-to-image ile tum Apple/Google cozunurluklerinde export
  - `badi init` ile otomatik kurulur (ek komut gerekmez)
- `badi mobile assets screenshots` cikisi skill'i referansliyor

### Teknik
- Yeni dosyalar: `README.tr.md`, `CHANGELOG.tr.md` `files` listesinde
- `package.json` version: 1.9.0
- CLI hala TR (backward compatible) — full i18n v1.10.0 roadmap'inde

## [1.8.2] - 2026-04-19

### Eklenen
- **`badi update --force`** — Slash/ajan/hook dosyalarini ZORLA guncelle (eski surumden kalan iceriklerin uzerine yazar)
- User dosyalari korunur: memory.md, knowledge-base.md, workspace/, plugins/, logs/, backups/
- Guncelleme ozet mesaji netlesti — ustune yazilan vs korunan dosyalar ayri gosteriliyor
- Yeni dosya eklenmediyse kullanici `--force` onerisi goruyor

### Onceki davranis
`badi update` sadece YENI dosyalari ekliyordu, mevcut slash/ajan icerigini guncellemiyordu.
Artik `--force` ile tam guncelleme mumkun (kullanici ozellestirmeleri sadece memory/workspace gibi alanlarda korunur).

### Kullanim
```bash
badi update              # Guvenli — sadece eksikler
badi update --force      # Tam — tum icerik guncellenir (memory/workspace haric)
badi update --dry-run    # On izleme
```

## [1.8.1] - 2026-04-19

### Iyilestirilen
- `badi doctor` sorun tespitinde daha rehberli cozum onerileri gosteriyor
- README'ye "Sorun Giderme" bolumu eklendi — yaygin hata mesajlari + cozumleri
- Hook eksik hatasi (`guard-bash.sh: No such file or directory`) icin acik rehberlik

## [1.8.0] - 2026-04-19

### Eklenen — AI/LLM + DevOps

**badi ai (5 alt komut):**
- `ai token` — .claude/ token kullanim analizi (kategori bazli + en buyuk dosyalar)
- `ai prompt-test` — Slash/ajan dosyalari regression test
- `ai memory-diff` — memory.md + knowledge-base limit kontrol
- `ai review` — Staged diff Claude API ile kod review (Haiku 4.5)
- `ai translate [file] --to [lang]` — Markdown cevirisi

**badi dev (5 alt komut):**
- `dev deps` — Bagimlilik guncelleme analizi (patch/minor/major)
- `dev deps --apply-patch` — Otomatik patch guncelleme
- `dev bundle` — Bundle size + framework tespit + en buyuk assetler
- `dev docker-lint` — Dockerfile best practice (FROM/USER/HEALTHCHECK vs)
- `dev env-check` — .env dosyasi dogrulama (eksik/fazla/placeholder)
- `dev api-test [url]` — HTTP endpoint tester (method/body/header/expect)

**Slash komutlari (10 yeni):**
- `/ai-token`, `/ai-review`, `/ai-translate`, `/prompt-test`, `/memory-diff`
- `/deps-update`, `/bundle-analyze`, `/docker-lint`, `/env-check`, `/api-test`

### Teknik
- `lib/commands/ai.js` — Claude API entegrasyonu (ANTHROPIC_API_KEY)
- `lib/commands/dev.js` — npm/yarn/pnpm detect + native tooling
- 11 yeni test (toplam 169)
- Toplam **76 slash komut** (66 + 10)

## [1.7.0] - 2026-04-19

### Eklenen — Eksik Slash Komutlari
CLI komutu var ama slash yoktu — 9 yeni `.claude/commands/`:
- `/wp` — WordPress site yonetimi (v1.4+)
- `/seo` — SEO denetim (v1.4+)
- `/aso` — App Store Optimization (v1.5+)
- `/mobile` — Mobil proje yonetim (v1.5+)
- `/stats` — Kullanim analitikleri (v1.1+)
- `/schedule` — Zamanlanmis hatirlaticilar (v1.2+)
- `/icerik-ara` — Arsiv arama (v1.2+)
- `/icerik-sablon` — Sablon mirasi (v1.2+)
- `/icerik-perf` — Icerik performans (v1.1+)

### Degisen — Mevcut Slash Komut Entegrasyonlari
Mevcut komutlara v1.6 CLI arac entegrasyonu eklendi:
- `/health` — `badi secret-scan`, `ssl`, `dns`, `lighthouse`, `a11y`
- `/security-scan` — `badi secret-scan` on calistirma
- `/audit` — T4 seviyesinde Badi CLI suite
- `/deploy` — Pre-deploy `secret-scan --git` (kritik ise engelle)
- `/perf-check` — `badi lighthouse` production metric
- `/changelog` — `badi changelog --write` hizli uretim
- `/release` — 4 komutluk workflow (scan/changelog/check/release)

### Sonuc
- **66 slash komutu** (57 + 9)
- **21 CLI komutu** (hepsinin slash karsiligi var)
- **12 hook** (tumu aktif)
- Katmanli mimari: CLI -> Slash -> Ajan

## [1.6.0] - 2026-04-19

### Eklenen — Domain Saglik + Guvenlik + Git Workflow

- **badi ssl [domain]** — SSL sertifika analizi (expire, TLS surumu, cipher gucu)
- **badi dns [domain]** — DNS kayit denetimi (A/AAAA/MX/TXT/SPF/DMARC/CAA) + email guvenlik skoru
- **badi whois [domain]** — Domain tescil + expire + transfer lock
- **badi lighthouse [url]** — PageSpeed Insights uzerinden Core Web Vitals + Perf/A11y/SEO/BP
- **badi secret-scan** — 17 pattern (AWS/GCP/GitHub/OpenAI/Stripe/npm/DB URI/private keys), `--git` ile history tarama
- **badi a11y [url]** — WCAG 2.1 accessibility audit (axe-core)
- **badi commit** — Conventional commit yardimi + format dogrulama (`--check`, `--message`)
- **badi changelog** — Git log'dan gruplu CHANGELOG.md uretimi (`--from`, `--to`, `--version`, `--write`)

### Eklenen — Slash Komutlar (.claude/commands/)
- `/ssl-check` — Badi CLI + yorumlama rehberi
- `/dns-audit` — DNS + email guvenlik analizi
- `/whois` — Domain saglik
- `/lighthouse` — Performance/A11y/SEO audit
- `/secret-scan` — Sir tarama + aksiyon plani
- `/a11y-audit` — WCAG uyum + manuel test hatirlatmasi
- `/conv-commit` — Staged change analiz + commit
- `/changelog-gen` — Release workflow

### Teknik
- `lib/commands/domain.js` — SSL (TLS socket), DNS (node:dns), WHOIS (TCP socket)
- `lib/commands/lighthouse.js` — PSI API entegrasyonu
- `lib/commands/secret-scan.js` — 17 regex pattern, false-positive filter
- `lib/commands/a11y.js` — PSI accessibility kategorisi
- `lib/commands/commit.js` — Conventional format regex, git log parse
- 15 yeni test (toplam 158)

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
