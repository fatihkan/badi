# BADi: Claude Code Is Akisi Yonetim Sistemi

> **Dil / Language:** [English](README.md) · **Turkce**

<p align="center">
  <img src="https://img.shields.io/npm/v/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm downloads per month" />
  <img src="https://img.shields.io/npm/dt/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm total downloads" />
  <img src="https://img.shields.io/npm/l/@fatihkan/badi?color=00d4ff&style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/tests-868%20passing-00d4ff?style=flat-square" alt="tests" />
  <img src="https://img.shields.io/badge/node-%3E%3D20.11-00d4ff?style=flat-square" alt="node" />
</p>

**Anthropic Claude Code, Cursor ve Gemini CLI icin is akisi yonetim CLI'i** — **Claude Opus 4.7** ve **Sonnet 4.6** uyumlu. **22 AI subagent**, **77 slash komut** (profil bazli core/dev/content/pentest yonetimi, v1.26+), **13 otomatik hook** ve **62 opt-in skill kategorisi** (25 genel + 25 pentest-* advisory/defensive, v1.25+ + 12 expo-* mobile dev lifecycle, v1.27+) ile **prompt-bilinen otomatik router** (v1.20+) icerir. OWASP Top 10 tarama, code review, icerik uretimi, mobile/web SEO, App Store pazar arastirmasi (`wishlist` + `gaps` analizi). Tekrarlayan is akislarinda token tuketimini **~%96** azaltir. **v1.12+** ile multi-harness destegi — ayni `.claude/` agaci Cursor ve Gemini CLI hedeflerine derlenir. **v1.16+** CodeQL sertlesmesi (TLS strict-first, DOM bazli HTML parse, URL hostname dogrulamasi).

## Demo

<!-- assets/demo.gif `vhs` ile assets/demo.tape'ten render edilir. Asagidaki "Render" bolumune bakin. -->
<p align="center">
  <img src="assets/demo.gif" alt="Badi 30 saniye demo: install, init, doctor, list, skills, stats" />
</p>

> **Render:** `brew install vhs && vhs assets/demo.tape` ile `assets/demo.gif` deterministik uretilir. Tape dosyasi repo'da kayitli — GIF her zaman ayni cikar.

## Tek Komutla Kurulum

**Claude Code plugin olarak (Node.js gerekmiyor)**:

```bash
# Claude Code icinde
/plugin marketplace add fatihkan/badi
/plugin install badi@badi-marketplace
```

**npm CLI olarak (tam ozellik seti: 22 ajan · 77 komut (profil yonetimi v1.26+) · 13 hook · 50 opt-in skill kategorisi + auto-router)**:

```bash
npx @fatihkan/badi init                    # interaktif harness secim menusu
npx @fatihkan/badi init --harness cursor   # non-interactive: sadece Cursor
npx @fatihkan/badi init --harness all      # tum desteklenen harness'lar
```

> Plugin yolu ajanlari, slash komutlari ve skill'leri `/plugin install` ile dagitir. npm yolu hook'lar, multi-harness derleyici (Cursor / Gemini CLI) ve tam `badi` CLI takim aletini ekler.

### Windows kurulumu (v1.23+)

Badi Windows'ta kutudan cikar cikmaz calisir: hook'lar saf Node.js (bash gerekmiyor), scheduler Windows Task Scheduler kullanir, `badi doctor` OS-bilinen durum raporlar.

```powershell
# PowerShell veya cmd
npm install -g @fatihkan/badi
badi init --harness claude
badi doctor                    # OS / Bash / Sched / UTF-8 durumu
```

cmd'de Turkce/UTF-8 cikti icin bir defa `chcp 65001` calistir veya Windows Terminal / PowerShell 7+ kullan. WSL kullanicilari normal sekilde kurabilir — Linux yolu otomatik tespit edilir.

### Desteklenen harness'lar (v1.12+)

| Harness | Kurallar | Komutlar | MCP | Subagents | Hooks | Skills |
|---------|:--------:|:--------:|:---:|:---------:|:-----:|:------:|
| Claude Code | `CLAUDE.md` | 77 | `.mcp.json` | 22 | 13 | 25 |
| Cursor | `.cursor/rules/badi-main.mdc` | 77 | `.cursor/mcp.json` | — | — | — |
| Gemini CLI | `GEMINI.md` (birlesik) | inline | `.gemini/settings.json` | — | — | — |

Claude kaynak (canonical). Cursor ve Gemini adapter'lari ayni `.claude/` dizininden derler. Hedef harness'in desteklemedigi bilesenler (Cursor: hooks/skills/subagents; Gemini: komutlar + digerleri) `badi init` ciktisinda `skippedComponents` raporunda gorunur.

## Ne Sunar?

| Ozellik | Detay |
|---------|-------|
| **22 Uzman Ajan ve 77 Komut** | Guvenlik tarayicidan performans profiler'a kadar; profil bazli filtreleme (core/dev/content/pentest) v1.26+ |
| **13 Otomatik Hook ve 50 Skill Kategorisi** | Branch koruma, yedekleme, OWASP Top 10 taramasi, 9 Frontend Taste varyanti, prompt-bilinen auto-router (v1.20+), pentest-* aile (v1.25+ advisory/defensive) |
| **Multi-harness destegi (v1.12+)** | Claude Code, Cursor, Gemini CLI — ayni `.claude/` kaynagi, farkli hedefler |
| **805 Onaylanmis Test** | CLI entegrasyon, harness adapter, schema/bundler/publish, watcher/scheduler, market, tasarim, profil yonetimi |
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
badi list --agents     # 22 ajan gor
badi stats             # Kullanim analitikleri
badi schedule list     # Hatirlaticilar
```

### Otomatik Skill Router (v1.20+)

Manuel `skills add` zahmetinden kurtulun. Router her prompt'u okur, vault'taki `SKILL.md` aciklamalarina karsi puanlar ve **sadece eslesme oldugunda** skill govdesini context'e inject eder.

```bash
badi skills route "SEO icin schema markup ekle"   # ranked match'leri goster
badi skills route --inject "..." | jq             # SKILL.md govdesi + JSON
badi skills auto on                                # UserPromptSubmit hook'u kur
badi skills auto off                               # hook'u kaldir
badi skills auto status                            # mevcut durum
```

#### Claude Code icinde nasil gozukur — ornek akis

```
You ▸ Instagram'a 5 karelik karousel hazirla, marka sesi tutsun.

[Badi auto-router]
  Prompt'unuza gore otomatik olarak su skill'ler aktiflestirildi:
  - social-media (skor 6) — triggers: instagram, post
  - content (skor 4) — triggers: karousel, brief

Claude ▸ {social-media + content skill'lerinin SKILL.md govdesi context'e
         inject edildi — kucuk paylasim akisi, hashtag stratejisi,
         brand voice tutarliligi rehberi yuklenmis durumda.}
         5 karelik karousel hazirliyorum...
```

Per-turn injection: hook **filesystem'e yazmaz**, sadece o turun context'ine ekler. Token vergisi yalnizca eslesme aninda — kisa prompt veya match yoksa hook sessizce passes.

#### Ornek 2 — `seo-crawl-budget` skill otomatik tetiklenmesi

```
You ▸ Yeni domain'imdeki blog yazilarim 24 saatte indexlenmiyor,
       crawl budget'i nasil yonetebilirim? long-tail keyword listesi var.

[Badi auto-router]
  Prompt'unuza gore otomatik olarak su skill'ler aktiflestirildi:
  - seo-crawl-budget (skor 12) — triggers: crawl budget, indexleme,
    long-tail, search console
  - seo (skor 4) — triggers: SEO, keyword

Claude ▸ {seo-crawl-budget SKILL.md inject edildi: 6 fazli kampanya
         metodolojisi, 20 makalelik plan, dongusel ic-link matrisi,
         Search Console aksiyonlari yuklendi.}
         20 makalelik kampanya planliyorum: 10 makale Group A
         (esit yayin), 10 makale Group B (5 gune yayilmis)...
```

**Manuel kullanim** (auto-router'siz):

```bash
badi skills available | grep seo-crawl-budget   # listede mevcut
badi skills add seo-crawl-budget                  # kalici opt-in
badi skills list                                  # aktif skill'leri gor
```

Skill aktifken `/start` veya yeni oturumda Claude Code SKILL.md govdesini yukler. Auto-router'la fark: kalici aktivasyon yok, sadece SEO konulu prompt'larda devreye girer (token tasarrufu).

### Output Styles + Status Line (v1.22+)

Claude Code cevap stilini ve alt status satirini ozellestir:

```bash
# Output styles — kisa/detayli/eli5 cevap modlari
badi outputstyle available
badi outputstyle add terse
# Sonra Claude Code icinde: /output-style terse

# Status line — branch + skill chip
badi statusline set git           # [branch*]
badi statusline set skill-chip    # [branch] [skills:N]
```

Iki komut da `.claude/` altina yazar (output-styles/, status-line/, settings.json) — opt-in, proje bazli.

### MCP Server (v1.23+)

Badi'yi [Model Context Protocol](https://modelcontextprotocol.io/) server olarak expose et. MCP uyumlu istemciler (Claude Code, Cursor, Continue.dev, Claude Desktop) Badi tool ve resource'larini her projeden cagirabilir:

```bash
# Tek seferlik kurulum (Claude Code)
claude mcp add badi -- npx -y @fatihkan/badi mcp serve

# Ya da .mcp.json snippet'i manuel yaz
badi mcp config > .mcp.json

# Acik tool/resource listesi
badi mcp tools         # 4 read-only tool
badi mcp resources     # memory, knowledge-base, taskboard
```

Sifir disa bagimlilik (JSON-RPC over stdio, ~100 LOC). Tool seti auto-router'i kapsar (`badi.skills.route`, `.list`, `.available`, `.inject`) — prompt-bilinen skill injection'i baska agent'lara pipe etmek icin ideal.

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
  agents/              22 uzman ajan
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
| **v1.27.0** | **`expo-*` skill ailesi (12 kategori, advisory).** Expo + React Native mobil gelistirme yasam dongusu: `expo-orchestrator` + `expo-router` + EAS uclu (build/submit/update) + `expo-config-plugin` + `expo-prebuild` + `expo-modules` + `expo-dev-client` + `expo-notifications` + `expo-app-config` + `expo-troubleshooting`. Her skill advisory only — Badi yapilandirma, komut sirasi ve trade-off rehberlik eder; gercek build/submit/update kullanici tarafindan calistirilir. Stack-map: 6 yeni detection entry (`eas.json`, `expo-router`, `expo-modules`, `expo-notifications`, `expo-dev-client`, `expo-config-plugin`); mevcut `expo` entry genisledi. 805 → 815 test. |
| **v1.26.0** | **Profil bazli komut yonetimi + prompt-aware komut routing.** Yeni `.claude/commands-vault/` canonical store (77 komut); `badi commands migrate / profile <core\|dev\|content\|all> / restore` aktif komutlari profile gore filtreler (core 21 / dev 39 / content 17 / pentest 0). Top 10 sisman komut slim'lendi (~%24 token / %45 satir azalisi, bilgi kaybi yok). Yeni `badi commands route "<prompt>"` + `--inject` flag; `skill-router.mjs` hook hem skills hem commands router'i cagiriyor. 774 → 805 test. |
| **v1.25.0** | **pentest-* skill ailesi (25 kategori, advisory/defensive).** Yetkili penetration-testing engagement disiplini vault'a eklendi: orchestrator + engagement + recon + web + api + bizlogic + bugbounty + ad + cloud + mobile + wireless + cicd + social + llm + privesc + credentials + threat-model + detection + forensics + malware + stig + report + ctf + exploit-chain + opsec-evidence. Live exploit / payload / C2 acikca disarida — metodoloji, output analiz, detection rule, raporlama. 0xSteph/pentest-ai-agents (MIT) engagement disiplini esin kaynagi (scope-guard, OPSEC QUIET/MODERATE/LOUD, hard refusal). 768 → 774 test. |
| **v1.24.0** | **Stack-aware skill curation (#152).** Yeni `badi skills detect` (read-only proje tarama) + `badi skills auto-install` (interaktif onay) — 35+ teknoloji → Badi skill manifesti. Bes sinyal turu: packages, configFiles/Dirs, fileExtensions, manifestKeys, scripts. midudev/autoskills install-time modelinden esin. 727 → 768 test. |
| **v1.23.0** | **`badi gh sync` + `badi kb` bilgi grafigi.** GitHub entegrasyon (issue → TaskBoard) ve bilgi tabani graph/backlinks/orphans/stats vanilla SVG ile (sifir CDN). XSS-safe rendering, O(1) graph build, spawnSync 50MB buffer. 624 → 727 test. |
| **v1.22.x** | **Windows compat + MCP server.** 13 bash hook → Node.js (.mjs); platform-aware launchd/Task Scheduler; MCP stdio JSON-RPC server (`badi mcp serve`); outputstyle + statusline profilleri. 577 → 624 test. |
| **v1.21.0** | **Plugin marketplace iyilestirme + auto-router gelistirmeler.** |
| **v1.20.0** | **Otomatik skill router + market Phase 2.** Yeni `badi skills route` ve `badi skills auto on/off` — UserPromptSubmit hook her prompt'u okur, vault'taki `SKILL.md` trigger (3x) + description (1x) token'larina karsi puanlar, eslesen skill govdesini her turun context'ine inject eder (filesystem'e yazma yok). Manuel `skills add` zahmetini bitirir. Yeni `badi market wishlist <kategori>` — Reddit talep × App Store arz matrix (4 kadran: BLUE_OCEAN/COMPETITIVE/NICHE/SATURATED). Yeni `badi market gaps <appId>` — difficulty + cross-rakip sikayetler + (opsiyonel) Reddit demand cross-pozisyonlama (`gapScore = coverage% × volume × (1 - difficulty/100)`). 538 → 577 test. #84 phase 2 kapanir. |
| **v1.18.0** | **Agent frontmatter audit + `badi tasarim` Phase 2.** 22 ajanin tumu artik acik `permissionMode: default` deklare ediyor; 15 read-only/danisman ajan ek olarak `disallowedTools: [Write, Edit, NotebookEdit]` tasiyor — Claude Code 2.1.119+ headless/`--print` calistirmalarinda defense-in-depth. Yeni `tasarim-kurator` ajani: marka kimligi, renk psikolojisi, tipografi karakteri ve bilesen kararlarini sorgulayan 4 asamali interaktif DESIGN.md ureticisi. Yeni opt-in `design-tokens` skill'i: aktif oldugunda UI/bilesen/gorsel ureten ajanlar projedeki DESIGN.md frontmatter'ina danisarak canonical token'lari kullanir. `visual-director` artik token okumalarini `design-tokens`'a delege ediyor ve yeni renk/tipografi kararlarini `tasarim-kurator`'a devrediyor. Ayrica VitePress dokuman iskeleti (GitHub Pages workflow), reproducible vhs demo tape, social preview SVG. 411 → 538 test. |
| **v1.17.0** | **Opt-in skill modeli (BREAKING).** Skill'ler artik otomatik yuklenmiyor. 23 kategorinin tumu `.claude/skills-vault/` dizininde; `.claude/skills/` bos baslar. Yeni `badi skills` komutu (durum tablosu + interaktif picker, `add`/`remove`/`list`/`available`/`clear`/`reset`) ile kullanici tam olarak istedigi skill'i secer. Plugin yolu da `skills` alanini kaldirdi — plugin kullanicilari icin de auto-load vergisi yok. Her tur ~10-15k token tasarrufu. Mevcut kurulumlar korunur: `.claude/skills/` update sirasinda kullanici verisi olarak isaretlenir. Token analizi vault boyutunu "Vault (yuklenmez)" olarak ayrica raporlar. |
| **v1.16.5** | **Plugin seviyesi guvenlik hook'lari.** Claude Code plugin yolu artik `plugin.json` icinde inline olarak iki evrensel Bash guvenlik hook'u tasiyor: `guard-bash.sh` (`rm -rf /`, main'e force-push, `chmod 777`, `curl \| bash`, secret exfiltration vb. bloke eder) ve `branch-guard.sh` (main/master/production'a dogrudan commit ve release/*'a force-push'u reddeder). Hook'lar script'leri `${CLAUDE_PLUGIN_ROOT}/.claude/hooks/` uzerinden cagirir, plugin cache'inden cozulur. Proje-state hook'lari (memory handoff, log'lar, yedekler) npm-only kaliyor — yazilabilir `.claude/` agacina ihtiyaclari var, plugin cache sunamaz. |
| **v1.16.4** | **Claude Code plugin dagitimi.** Badi artik `/plugin marketplace add fatihkan/badi` + `/plugin install badi@badi-marketplace` ile kuruluyor — mevcut npm yoluna ek olarak. Yeni `.claude-plugin/plugin.json` + `marketplace.json` 21 ajan, 77 komut, 23 skill kategorisini kanonik `.claude/` agacina custom path'lerle bildiriyor (kopya yok). Iki manifest da `claude plugin validate`'den yesil gectti; end-to-end smoke-test edildi. Hook'lar ve multi-harness compiler npm-only kaliyor — plugin cache writable `.claude/` agacini saglayamiyor. |
| **v1.16.3** | SEO + kesfedilebilirlik. Ingilizce-oncelikli npm description ve keywords (`anthropic`, `claude`, `claude-opus`, `claude-sonnet`, `ai-agents`, `subagents`, `cli`, `developer-tools`, `security-scanner`, `owasp`, `code-review`, `cursor`, `gemini-cli` eklendi; dar terimler atildi). README hero Anthropic + Claude Opus 4.7 / Sonnet 4.6 vurgusuyla yeniden yazildi. GitHub repo description + topics rafine edildi (20 topic limit). Sayim drift'i CLAUDE.md ve READMEs'lerde duzeltildi (21 ajan · 77 komut · 12 hook · 23 skill kategorisi · 398 test). Node badge dogrulandi (>=18 → >=20.11). |
| **v1.16.2** | Security + smoke-test hotfix. 8 CodeQL alarmi (1 high error + 7 warning) tek PR'da kapatildi: TLS strict-first, backslash escape, `node-html-parser` ile script/style strip, URL hostname exact match, workflow permissions. Ek olarak `badi tasarim` smoke fix: `lint` artik `summary.errors > 0` olunca exit 1 doner; yeni `--write <yol>` flag'i `export` ciktisini dosyaya yazar; `--out` aciklamasi netlestirildi. 395 → 398 test. v1.16.1 atlandi (npm publish 401). |
| **v1.16.0** | `badi tasarim` — gorsel kimlik komutu (#58 close). Google `@google/design.md` CLI'sini (pinned `0.1.1`, npx ile) lint/export icin sariyor. Alt komutlar: `init` (iskelet veya `--ornek`), `lint`, `export --format tailwind\|dtcg`, `show --tokens\|--prose`. Varsayilan yer: `.claude/workspace/DESIGN.md`. 16 yeni test (379 → 395). |
| **v1.15.3** | Dokumantasyon cilasi. Kod veya test degisikligi yok. |
| **v1.15.2** | Dokumantasyon cilasi. Kod veya test degisikligi yok. |
| **v1.15.1** | Dokumantasyon cilasi. Kod veya test degisikligi yok. |
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
