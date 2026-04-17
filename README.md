# BADi: Claude Code Is Akisi Yonetim Sistemi

<p align="center">
  <img src="https://img.shields.io/npm/v/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm downloads per month" />
  <img src="https://img.shields.io/npm/dt/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm total downloads" />
  <img src="https://img.shields.io/npm/l/@fatihkan/badi?color=00d4ff&style=flat-square" alt="license" />
  <img src="https://github.com/fatihkan/badi/actions/workflows/test.yml/badge.svg" alt="tests" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-00d4ff?style=flat-square" alt="node" />
</p>

Claude Code kullanicilari icin gelistirilmis acik kaynakli bir is akisi yonetim sistemi. Tekrarlayan komutlari **otomatize ederek**, guvenlik taramalari yaparak ve token kullanimini **%96 oraninda optimize ederek** gelistirici uretkenligini artirir. **v1.4** ile dijital ajans calisma akisi: WordPress yonetimi + SEO denetim.

## Tek Komutla Kurulum

```bash
npx @fatihkan/badi init
```

## Ne Sunar?

| Ozellik | Detay |
|---------|-------|
| **21 Uzman Ajan ve 50 Komut** | Guvenlik tarayicidan performans profiler'a kadar genis arac seti |
| **12 Otomatik Hook ve 48 Guvenlik Skill'i** | Branch koruma, yedekleme ve OWASP Top 10 guvenlik taramasi |
| **115 Onaylanmis Test** | Yazilimin guvenilirligi ve kalitesini vurgular |
| **TR/EN Coklu Dil ve Icerik Motoru** | Sablon mirasi sistemi ile otomatik post ve video senaryo uretimi |
| **WordPress + SEO Modulleri** | WP-CLI/REST API ile site yonetimi, 20+ kontrollu SEO denetim |
| **17 Modullu Yapi** | Temiz kod ve 520KB paket boyutu (security skills dahil) |
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

48 guvenlik skill'i ile kapsamli tarama ([ersinkoc/security-check](https://github.com/ersinkoc/security-check) entegrasyonu):

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
badi init [--target DIR] [--force] [--dry-run]     # Proje yapilandir
badi update [--target DIR]                          # Guncelle
badi doctor [--target DIR]                          # Kurulum dogrula
badi list [--agents|--commands|--hooks|--skills]     # Bilesen listele
badi plugin [install|remove|list]                    # Plugin yonet
badi stats [--week|--month|--habits|--export csv]    # Kullanim analitikleri
badi completion [bash|zsh|fish]                      # Kabuk tamamlama
badi schedule [add|list|remove|check]                # Hatirlaticilar
badi icerik [post|karousel|video|gorsel|takvim|marka|ara|sablon|perf]
badi wp [add|list|remove|status|plugins|themes|update|security]   # v1.4+
badi seo [audit|meta|sitemap|speed]                               # v1.4+
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

## Gelistirme

```bash
npm install
npm test           # 115 test
npm run lint       # Biome ile kod kalitesi
npm run format     # Biome ile formatlama
```

## Surum Gecmisi

| Surum | Icerik |
|-------|--------|
| **v1.4.2** | Lazy loading: startup %97 hizlandi (813ms → 26ms) |
| **v1.4.1** | SSRF korumasi, appPassword obfuscate, sitemap precedence fix |
| **v1.4.0** | Dijital ajans: `badi wp` (WordPress) + `badi seo` (20+ kontrol) |
| **v1.3.2** | 16 bug/guvenlik fix, CI infra, community dosyalari |
| **v1.3.1** | 48 guvenlik skill entegrasyonu (security-check) |
| **v1.3.0** | Modularizasyon, token optimizasyonu, log rotasyonu |
| **v1.2.0** | Icerik arama, coklu dil (TR/EN), sablon mirasi, schedule |
| **v1.1.0** | Stats, completion, icerik perf, update notifier |
| **v1.0.0** | Ilk surum: 21 ajan, 50 komut, 12 hook, plugin sistemi |

## Lisans

MIT - [Fatih Kan](https://github.com/fatihkan)

## Katkida Bulunma

PR'lar, issue'lar ve yildizlar memnuniyetle karsilanir. `CONTRIBUTING.md` dosyasina bakiniz.
