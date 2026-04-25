# BADi: Claude Code Is Akisi Yonetim Sistemi

> **Dil / Language:** [English](README.md) · **Turkce**

<p align="center">
  <img src="https://img.shields.io/npm/v/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm downloads per month" />
  <img src="https://img.shields.io/npm/dt/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm total downloads" />
  <img src="https://img.shields.io/npm/l/@fatihkan/badi?color=00d4ff&style=flat-square" alt="license" />
  <img src="https://github.com/fatihkan/badi/actions/workflows/test.yml/badge.svg" alt="tests" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-00d4ff?style=flat-square" alt="node" />
</p>

Claude Code kullanicilari icin gelistirilmis acik kaynakli bir is akisi yonetim sistemi. Tekrarlayan komutlari **otomatize ederek**, guvenlik taramalari yaparak ve token kullanimini **%96 oraninda optimize ederek** gelistirici uretkenligini artirir. **v1.4** ile dijital ajans calisma akisi: WordPress yonetimi + SEO denetim. **v1.12+** ile multi-harness destegi — ayni Badi is akisi artik Cursor veya Gemini CLI icin de derlenebiliyor.

## Tek Komutla Kurulum

```bash
npx @fatihkan/badi init                    # interaktif harness secim menusu
npx @fatihkan/badi init --harness cursor   # non-interactive: sadece Cursor
npx @fatihkan/badi init --harness all      # tum desteklenen harness'lar
```

### Desteklenen harness'lar (v1.12+)

| Harness | Kurallar | Komutlar | MCP | Subagents | Hooks | Skills |
|---------|:--------:|:--------:|:---:|:---------:|:-----:|:------:|
| Claude Code | `CLAUDE.md` | 77 | `.mcp.json` | 21 | 12 | 23 |
| Cursor | `.cursor/rules/badi-main.mdc` | 77 | `.cursor/mcp.json` | — | — | — |
| Gemini CLI | `GEMINI.md` (birlesik) | inline | `.gemini/settings.json` | — | — | — |

Claude kaynak (canonical). Cursor ve Gemini adapter'lari ayni `.claude/` dizininden derler. Hedef harness'in desteklemedigi bilesenler (Cursor: hooks/skills/subagents; Gemini: komutlar + digerleri) `badi init` ciktisinda `skippedComponents` raporunda gorunur.

## Ne Sunar?

| Ozellik | Detay |
|---------|-------|
| **21 Uzman Ajan ve 77 Komut** | Guvenlik tarayicidan performans profiler'a kadar genis arac seti |
| **12 Otomatik Hook ve 25 Skill Kategorisi** | Branch koruma, yedekleme, OWASP Top 10 taramasi, 9 Frontend Taste varyanti |
| **Multi-harness destegi (v1.12+)** | Claude Code, Cursor, Gemini CLI — ayni `.claude/` kaynagi, farkli hedefler |
| **379 Onaylanmis Test** | 20 market + 41 watcher/scheduler + 49 schema/bundler/publish + 44 harness adapter + 222 CLI/entegrasyon |
| **TR/EN Icerik Motoru** | Sablon mirasi ile post, thread, bulten, podcast, case-study uretimi |
| **WordPress + SEO + ASO + Mobile Modulleri** | WP-CLI/REST, 20+ SEO kontrolu, App Store + Play Store, crash/deeplink/OTA iskelesi |
| **Modular Mimari** | 22 komut modulu, `lib/harnesses/` adapter katmani, ~6MB `.claude/` agaci |
| **Acik Kaynak (MIT)** | Topluluk odakli ve seffaf lisanslama modeli |

## Hizli Baslangic

```bash
# Kurulum
npx @fatihkan/badi init

# Dogrulama
badi doctor

# Gunluk is akisi
badi list --agents     # 21 ajan gor
badi stats             # Kullanim analitikleri
badi schedule list     # Hatirlaticilar
```

### Yazilim Gelistirme
```bash
/start                 # Gune basla
/audit                 # Kalite denetimi
/security-scan         # Guvenlik taramasi (48 skill)
/review                # Kod incelemesi
/wrap-up               # Gun sonu ozet
```

### Icerik Uretimi
```bash
badi icerik basla                         # Sabah seansi
badi icerik post "konu" --lang tr,en      # TR/EN paralel uretim
badi icerik karousel "5 ipucu"            # Karousel sablonu
badi icerik video "tutorial"              # Video senaryo
badi icerik ara "uretkenlik"              # Arsiv arama
badi icerik perf --trend                  # Performans takibi
badi icerik kapat                         # Gun sonu ozet
```

### WordPress Yonetimi (v1.4+)
```bash
badi wp add blog https://blog.com --method rest       # REST API
badi wp add staging --method wp-cli --ssh user@host   # SSH + WP-CLI
badi wp add local --method wp-cli --path /var/www     # Lokal WP-CLI
badi wp list                                          # Kayitli siteler
badi wp status blog                                   # WP surumu + tema + eklenti
badi wp plugins staging                               # Eklenti listesi
badi wp update staging all                            # Core + plugin + theme
badi wp security staging                              # 6 nokta guvenlik taramasi
```

### Mobil Gelistirme (v1.5+)
```bash
badi mobile init MyApp --framework react-native      # Proje iskelesi
badi mobile version bump minor                       # iOS + Android + Flutter sync
badi mobile build ios                                # Release build
badi mobile release testflight                       # TestFlight rehberi
badi mobile assets icon ./logo-1024.png              # 40+ boyut rehberi
```

### Frontend Taste - Premium UI Skill'leri (v1.10+)
```bash
badi taste                          # 9 tasarim varyantini listele
badi taste show default             # Bir varyantin tam SKILL.md'sini yazdir
badi taste prompt brutalist         # Ornek tetikleme prompt'u
badi taste status                   # Kurulum durumu (9/9 varyant)
```

Claude Code'un jenerik "AI gibi goruken" UI uretmesini engelleyen 9 adet varyant:

| Varyant | Ne zaman kullan |
|---------|-----------------|
| **default** | Genel amacli. Premium frontend + DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY kadranlari. |
| **gpt-taste** | Sert editoryal. Genis tipografi, AIDA yapisi, zorunlu GSAP ScrollTriggers. |
| **minimalist** | Temiz editoryal (Notion / Linear hissi). Ilik monokrom, duz bento grid. |
| **brutalist** | Isvicre tipografik + askeri terminal. Sert grid, ham yapi. |
| **soft** | Ustun ajans hissi. Sakin, pahali goruntu, premium fontlar, spring motion. |
| **redesign** | Mevcut UI'i denetleyip jenerik AI kaliplarini fonksiyonu bozmadan duzeltir. |
| **output** | Anti-truncation. Ajan placeholder biraktiginda istiflenir. |
| **stitch** | Google Stitch icin ajan dostu `DESIGN.md` uretir. |
| **images-first** | Once referans gorsel uret, analiz et, sonra uygula. |

Claude Code'ta prompt icinde varyant adini soyle tetikleyin:

```
Premium bir landing page hero yap. frontend-taste/default skill'i kullan.
Bu dashboard'u yeniden tasarla. frontend-taste/redesign skill'i kullan.
```

### App Store Optimization (v1.5+, v1.11'de genisledi)
```bash
badi aso audit 284882215                 # App listing denetimi (iOS)
badi aso playstore com.facebook.katana   # Google Play listing denetimi (v1.11+)
badi aso reviews 284882215 --country us  # Gercek yorumlar + sentiment (v1.11+)
badi aso screenshots 284882215           # Uygulamaya ozel varlik analizi (v1.11+)
badi aso keywords 284882215              # Keyword analizi
badi aso compete 284882215 310633997     # Rakip karsilastirma
badi aso metadata appstore               # Karakter limit rehberi
badi icerik release-notes --platform ios --version 2.0.0 --lang tr,en
```

### SEO (v1.11'de genisledi)
```bash
badi seo audit https://example.com       # Kapsamli SEO denetimi (20+ kontrol)
badi seo meta https://example.com        # Meta tag analizi
badi seo sitemap https://example.com     # sitemap.xml + robots.txt kontrolu
badi seo speed https://example.com       # Sayfa hizi + kaynak analizi
badi seo backlinks example.com           # DuckDuckGo mention + Wayback snapshot (v1.11+)
badi seo rank example.com "anahtar"      # DuckDuckGo organik rank kontrolu (v1.11+)
badi seo compare https://a.com https://b.com  # Yan yana SEO karsilastirma (v1.11+)
```

### Icerik Sablonlari (v1.11'de genisledi)
```bash
badi icerik post "lansman"               # Sosyal post (3 varyasyon)
badi icerik karousel "5 ipucu"           # Instagram/LinkedIn karousel
badi icerik video "30s demo"             # Video senaryo (hook → akis → CTA)
badi icerik newsletter "haftalik"        # E-posta bulteni (v1.11+)
badi icerik podcast "bolum 1"            # Podcast episode + show notes (v1.11+)
badi icerik thread "10 ipucu"            # X/LinkedIn 10-post thread (v1.11+)
badi icerik case-study "acme"            # Musteri basari hikayesi (v1.11+)
```

### Mobile (v1.11'de genisledi)
```bash
badi mobile crash-setup react-native sentry       # Sentry/Crashlytics scaffold (v1.11+)
badi mobile deeplink example.com                  # Universal link + AASA/assetlinks (v1.11+)
badi mobile ota expo                              # OTA update setup (v1.11+)
```

### Publish Orkestratoru (v1.11+)
Tek komut, tum surum ritueli.
```bash
badi publish check                       # On-kontrol (git temiz mi? gh/npm login var mi?)
badi publish --dry-run                   # Her adimi goster, uygulama
badi publish --version minor             # Bump + commit + tag + push + gh release + npm publish
badi publish --skip-npm                  # Sadece git + GitHub
```

### Domain Saglik (v1.6+)
```bash
badi ssl example.com              # SSL cert + TLS + cipher
badi dns example.com              # A/MX/SPF/DMARC/CAA + email guvenlik
badi whois example.com            # Tescil + expire + transfer lock
```

### Performance & Accessibility (v1.6+)
```bash
badi lighthouse https://site.com          # Core Web Vitals + Perf/A11y/SEO/BP
badi a11y https://site.com                # WCAG 2.1 (axe-core)
badi secret-scan                          # 17 pattern (working tree)
badi secret-scan --git                    # + son 100 commit
```

### AI/LLM Araclari (v1.8+)
```bash
badi ai token                              # .claude/ token kullanim analizi
badi ai prompt-test                        # Slash/ajan regression
badi ai memory-diff                        # memory.md limit kontrol
badi ai review                             # Claude API kod review (Haiku 4.5)
badi ai translate file.md --to en          # Markdown ceviri

# Claude API kurulum:
export ANTHROPIC_API_KEY=sk-ant-...
```

### DevOps + Kod Kalitesi (v1.8+)
```bash
badi dev deps                              # Bagimlilik guncelleme analizi
badi dev deps --apply-patch                # Patch seviye auto-update
badi dev bundle                            # Bundle size + framework tespit
badi dev docker-lint                       # Dockerfile best practice
badi dev env-check                         # .env dogrulama
badi dev api-test https://api.com/health   # HTTP endpoint tester
```

### Git Workflow (v1.6+)
```bash
badi commit                       # Conventional tip onerileri + staged diff
badi commit --check               # Son commit format kontrol
badi commit --message "feat: X"   # Format dogrulama + git commit
badi changelog                    # Onizleme
badi changelog --write --version 1.6.0   # CHANGELOG.md'ye yaz
```

### SEO Denetim (v1.4+)
```bash
badi seo audit https://example.com       # 20+ kontrol, SEO skoru
badi seo meta https://example.com        # Meta tag analizi
badi seo sitemap https://example.com     # robots.txt + sitemap.xml
badi seo speed https://example.com       # TTFB + kaynak analizi
```

SEO audit kontrolleri: Title, Description, Open Graph, Twitter Card, H1 yapisi, gorsel alt taglari, canonical URL, viewport, lang, charset, HTTPS, Schema.org, robots meta, kelime sayisi, link analizi.

### Proje Mimarisi
```bash
/architect             # Fikri 5 dokumana donustur
/scaffold              # Kod iskelesi olustur
/adr                   # Mimari karar kaydi
/spec-check            # Spec uyum kontrolu
```

## Guvenlik Katmani

48 guvenlik skill'i ile kapsamli tarama:

| Kategori | Kapsam |
|----------|--------|
| **Injection** | SQLi, NoSQLi, XSS, CSRF, SSRF, SSTI, XXE, Command, LDAP |
| **Auth & Access** | Authentication, Authorization, JWT, Privilege Escalation |
| **Data** | Secret scanning, Crypto, Data exposure |
| **API** | API security, CORS, GraphQL, Rate limiting, WebSocket |
| **Infrastructure** | Docker, IaC, CI/CD security |
| **Language Scanners** | Go, TypeScript, Python, PHP, Rust, Java, C# |

4-fazli pipeline: **Kesfet** → **Tara** → **Dogrula** → **Raporla**

## Performans

| Metrik | Onceki | Sonrasi |
|--------|--------|---------|
| CLI dosyasi | 3812 satir | 157 satir (17 modul) |
| Startup (v1.4.2) | 813ms | 26ms (**%97 azalma**) |
| Token tuketimi | ~30K/oturum | ~2K/oturum |
| CLAUDE.md | 6.8KB | 1.2KB |
| Hook tetikleme | 200+/oturum | ~30/oturum |
| Template yukleme | Eager (~800 satir) | Lazy (gerektiginde) |

## CLI Komutlari

```bash
badi init [--target DIR] [--force] [--dry-run] [--harness ID]  # Proje yapilandir (v1.12+: harness menusu)
badi update [--target DIR] [--force] [--harness ID]            # Guncelle
badi doctor [--target DIR] [--harness ID]                      # Kurulum dogrula (kurulu harness'lari otomatik bulur)
badi list [--agents|--commands|--hooks|--skills]     # Bilesen listele
badi plugin [install|remove|list]                    # Plugin yonet
badi stats [--week|--month|--habits|--export csv]    # Kullanim analitikleri
badi completion [bash|zsh|fish]                      # Kabuk tamamlama
badi schedule [add|list|remove|check]                # Hatirlaticilar
badi icerik [post|karousel|video|gorsel|takvim|marka|ara|sablon|perf|newsletter|podcast|thread|case-study]
badi wp [add|list|remove|status|plugins|themes|update|security]   # v1.4+
badi seo [audit|meta|sitemap|speed|backlinks|rank|compare]        # v1.4+ (backlinks/rank/compare v1.11+)
badi aso [audit|playstore|keywords|metadata|review|reviews|compete|screenshots|search]  # v1.5+ (playstore/reviews v1.11+)
badi mobile [init|version|build|release|assets|crash-setup|deeplink|ota]  # v1.5+ (crash-setup/deeplink/ota v1.11+)
badi taste [list|show|prompt|status]                              # v1.10+
badi publish [check|--version|--dry-run]                          # v1.11+
badi ssl|dns|whois [domain]                                       # v1.6+
badi lighthouse|a11y [url]                                        # v1.6+
badi secret-scan [--git]                                          # v1.6+
badi commit|changelog [secenekler]                                # v1.6+
badi ai [token|prompt-test|memory-diff|review|translate]          # v1.8+
badi dev [deps|bundle|docker-lint|env-check|api-test]             # v1.8+
```

## Ajanlar (21)

| Kategori | Ajanlar |
|----------|---------|
| **Yazilim** | auditor, security-scanner, performance-profiler, test-strategist, api-designer, migration-pilot, code-generator, refactoring-advisor, architecture-advisor, project-architect |
| **Teshis** | archaeologist, error-whisperer, unsticker, yak-shave-detector, debt-collector |
| **Icerik** | content-creator, visual-director |
| **Destek** | coach, onboarding-sherpa, pr-ghostwriter, rubber-duck |

## Dizin Yapisi

```
bin/badi.js            Giris noktasi (157 satir)
lib/                   17 ESM modul
  cli.js               Paylasilan araclar (chalk, figlet, VERSION)
  commands/            11 komut modulu (init, update, doctor, list,
                       plugin, icerik, stats, completion, schedule,
                       wp, seo)
  templates/           TR/EN sablon uretecleri
  icerik-helpers.js    Arama, benzerlik, frontmatter
.claude/
  agents/              21 uzman ajan
  commands/            50 is akisi komutu
  hooks/               12 otomasyon hook'u
  skills/              22 kategori + 48 guvenlik skill
  references/          8 proje rehberi
  workspace/           Icerik dosyalari, gorev panosu
  settings.json        Hook konfigurasyonu
```

## Kurulum Secenekleri

```bash
# npm (onerilen)
npx @fatihkan/badi init

# Global
npm install -g @fatihkan/badi

# GitHub'dan
npm install -g github:fatihkan/badi

# Gelistirme
git clone https://github.com/fatihkan/badi.git
cd badi && npm install && npm link
```

### Gereksinimler

- **Node.js 18+** ([indir](https://nodejs.org))
- **Claude Code** CLI ([kurulum](https://docs.anthropic.com/en/docs/claude-code))
- **jq** (hook'lar icin: `brew install jq`)

### Kabuk Tamamlama

```bash
badi completion bash >> ~/.bashrc
badi completion zsh >> ~/.zshrc
badi completion fish > ~/.config/fish/completions/badi.fish
```

## Sorun Giderme

### `bash: .claude/hooks/guard-bash.sh: No such file or directory`

`.claude/settings.json`'da hook tanimli ama dosya eksik. Cozum:

```bash
badi update          # Eksik dosyalari ekler, ozel dosyalari korur (onerilen)
badi doctor          # 12 hook mevcut mu dogrulayin
```

Hala sorun varsa:
```bash
badi init --force    # Zorla yeniden kurar (ozel degisiklikler kaybolur)
chmod +x .claude/hooks/*.sh  # Executable izin yoksa
```

### `badi: command not found`

```bash
npm install -g @fatihkan/badi    # Global kurulum
# veya
npx @fatihkan/badi doctor         # Kurulumsuz kullanim
```

### Hook izin hatasi
```bash
chmod +x .claude/hooks/*.sh
```

### Node surumu hatasi
Badi >= Node 20.11 gerektirir:
```bash
node --version   # v20.11.0+ olmali
```

### Tum hook'lari devre disi birakma (gecici)
```bash
mv .claude/settings.json .claude/settings.json.bak
```

## Gelistirme

```bash
npm install
npm test           # 251 test (207 CLI + 44 harness adapter)
npm run lint       # Biome ile kod kalitesi
npm run format     # Biome ile formatlama
```

## Surum Gecmisi

| Surum | Icerik |
|-------|--------|
| **v1.15.2** | Tum ucuncu-taraf proje atiflari (harici skill pazaryeri adlari, ekosistem URL'leri, harici repo referanslari) dokumantasyon, kaynak yorumlari ve bundle metadata'sindan kaldirildi. `compatibility` varsayilan metni notrlestirildi. `badi-discipline` SKILL.md prensip cercevesi icin harici yazara atif yapmiyor. Kod veya test degisikligi yok. |
| **v1.15.1** | `badi market` dokumantasyonundan ve kaynak yorumlarindan harici atif kaldirildi. Sadece dokumantasyon/yorum temizligi — kod veya test degisikligi yok. |
| **v1.15.0** | `badi market` — App Store pazar arastirmasi komutu. MVP: rakip kesfi + coklu bolge yorum + 11-kod sikayet kategorize + zorluk skoru (BLUE_OCEAN / COMPETITIVE / HARD / SATURATED). Alt komutlar: `discover`, `reviews`, `difficulty`, tam rapor. API anahtari gerekmez. 379 test (+20). Faz 2 (issue'lar): SensorTower revenue, wishlist demand×supply matrix, opportunity gaps. |
| **v1.14.1** | CI matrisinden Node 18 cikarildi. Test dosyalari `import.meta.dirname` (Node 20.11+) kullaniyor; Node 18 satiri sessizce kiriliyordu. `engines.node` `>=20.11.0`'e bumped. Runtime kod degisimi yok; production CLI zaten Node 20+ ile calisiyor. |
| **v1.14.0** | Skill ekosistemi MVP — portable skill bundle pipeline. Yeni `lib/skills/schema.js` validator + `lib/harnesses/skills-bundler.js` compiler + `badi publish --skill-bundle` orkestrator. 23 `.claude/skills/*/SKILL.md` tam frontmatter ile zenginlesti. Yeni `badi-discipline` davranissal skill (8 ilke) ayri `badi-skills` repo'sunda ship'e hazir. Bootstrap kit `_bootstrap/badi-skills/` altinda. 307 → 359 test (+52). #56 ve #57 close. |
| **v1.13.2** | 7-bulgu code-review hotfix: `icerik durum/kapat` "bugun" sayim'inda UTC-bias duzeltildi (yerel `startOfToday`); `runTemplate` switch'i `default: throw` ile saglamlastirildi; "bilinmeyen subcommand" hatasi 21 gecerli komutu listeliyor; `icerik.js` shim'i kaldirildi (direkt import); doc/yorum cilasi. 307 test yesil. |
| **v1.13.1** | v1.13.0 review hotfix: `agent install` onay prompt'u artik gercekten y/N bekliyor (eskiden mesaji yazip yine de install ediyordu) + `--yes`/`-y` bayragi script kullanim icin. Bilinmeyen watcher icin temiz hata mesajlari. icerik split refactor'u (issue #41) — `lib/commands/icerik.js` (1667 satir) `lib/commands/icerik/` altinda alt-komut modullerine bolundu. 304 → 307 test. |
| **v1.13.0** | Arka plan agent'lari — `.claude/watchers/*.md` YAML frontmatter ile git/shell/file/log/http kontrolleri tanimla, launchd/systemd/cron'a kayit et, bir sonraki `/start` brifing'inde uyarilar otomatik gorunur. 8 yeni `badi agent` alt komutu + 2 template + 38 yeni test (toplam 304). |
| **v1.12.1** | Hotfix — 10 review bulgusu kapandi (`BADI_PREFS_HOME` env izolasyonu, non-TTY guvenli init, Cursor icerik preface, case-insensitive `--harness`, validation, kirilgan test temizligi). 266 test. |
| **v1.12.0** | Multi-harness destegi — `badi init` artik Claude Code, Cursor veya Gemini CLI hedefliyor. Interaktif menu + `--harness` bayragi. Yeni `lib/harnesses/` adapter katmani. Update + doctor kurulu harness'lari otomatik tespit ediyor. 44 yeni test (toplam 251). |
| **v1.11.0** | Icerik turleri (newsletter, podcast, thread, case-study). ASO Play Store + gercek yorum sentiment + uygulamaya ozel screenshot. SEO backlinks/rank/compare. Mobile crash-setup/deeplink/ota. `badi publish` release orkestratoru. |
| **v1.10.0** | Frontend Taste — 9 premium UI skill + `badi taste` komutu. Claude Code icin anti-slop tasarim kurallari. |
| **v1.9.0** | EN-first dokumentasyon (README/CHANGELOG); `.claude/skills/mobile/` altinda `app-store-screenshots` skill |
| **v1.8.2** | `badi update --force` — mevcut slash/ajan/hook dosyalarini zorla guncelle |
| **v1.8.1** | Sorun giderme rehberi — doctor cikti iyilestirmesi + README troubleshooting |
| **v1.8.0** | AI/LLM (`badi ai`) + DevOps (`badi dev`) — 10 yeni CLI, 10 yeni slash |
| **v1.7.0** | 9 yeni slash komutu + mevcut slash/CLI entegrasyonu (66 slash toplam) |
| **v1.6.0** | Domain saglik (ssl/dns/whois), Lighthouse, secret-scan, a11y, commit/changelog |
| **v1.5.0** | Mobil + ASO: `badi aso` (iTunes API), `badi mobile` (init/build/release/assets), release-notes |
| **v1.4.3** | Harici referanslar temizlendi, metadata sadelestirildi |
| **v1.4.2** | Lazy loading: startup %97 hizlandi (813ms → 26ms) |
| **v1.4.1** | SSRF korumasi, appPassword obfuscate, sitemap precedence fix |
| **v1.4.0** | Dijital ajans: `badi wp` (WordPress) + `badi seo` (20+ kontrol) |
| **v1.3.2** | 16 bug/guvenlik fix, CI infra, community dosyalari |
| **v1.3.1** | 48 guvenlik skill entegrasyonu |
| **v1.3.0** | Modularizasyon, token optimizasyonu, log rotasyonu |
| **v1.2.0** | Icerik arama, coklu dil (TR/EN), sablon mirasi, schedule |
| **v1.1.0** | Stats, completion, icerik perf, update notifier |
| **v1.0.0** | Ilk surum: 21 ajan, 50 komut, 12 hook, plugin sistemi |

## Lisans

MIT - [Fatih Kan](https://github.com/fatihkan)

## Katkida Bulunma

PR'lar, issue'lar ve yildizlar memnuniyetle karsilanir. `CONTRIBUTING.md` dosyasina bakiniz.
