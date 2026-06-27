# Proje Bellegi

## Mevcut Durum
- Proje: Badi - Claude Code Is Akisi Yonetim Sistemi
- npm: @fatihkan/badi **v1.35.0 YAYINDA** (20.06.2026, dist-tag latest=1.35.0; #298 + tag + GH release — minor: hardening A-F + /market + /tasks; v1.34.2'yi rollup etti, npm 1.34.1→1.35.0). v1.34.2 (tag+GH, npm'e cikmadi — 1.35.0'a folded). Detay: CHANGELOG + memory-archive
- **Konumlandirma (2026-06-22): agentic safety layer for Claude Code** — README lede + Why-Badi
  deterministik guvenlik hook'larina cevrildi (#302, dogrulanmis gercek hook'lar). Dagitim kiti +
  kanonik mesaj + buyume plani: `.claude/workspace/launch/` (POSITIONING/GROWTH-PLAN/incident-post/demo-script/outreach)
- **English-only goc DOGRULANDI (05.06)**: bagimsiz adversarial audit 7 turda `VERIFIED CLEAN` (171→0, PR #248-257). Kasitli TR kalanlar: stopword Set'leri, icerik-helpers normalize tablosu, workspace veri yollari (takvim/, gorseller/, marka-sesi.md), CHANGELOG version-history girdileri
- **Sanal eng ekibi (v1.32+)**: product-strategist/engineering-manager/release-manager/qa-lead ajanlari + /ceo-review /eng-review /qa /ship + /team orkestratoru (kapi zinciri: strateji->plan->build->QA->ship)
- **Advisory uclu (v1.33, atoms.dev bosluk-doldurma)**: market-researcher / seo-strategist / data-analyst (read-only, ads-strategist kalibi)
- Ajan: 30 · Komut: 86 · Skill: 63 · Harness: 5 · Hook: 14 (13 varsayilan + skill-router opt-in)
- Tests: 1321 yesil · biome 2.5.0 clean (npm run lint = `biome check .` gate; no-arg check farkli kume tarar!) · doctor 53/0/0 (hooks settings.json'dan; help-doctor dizin-modulleri de — 38 komut)
- Dagitim: npm (✅ 1.35.0 YAYINDA — latest) + marketplace (✅ senkron) + Homebrew + Scoop (⏳, repo'lar yok — "Planned"; scoop version+url senkron, checkScoopManifest gate) + GH Actions templates
- Yan repo: badi-skills v1.0.0 · Engines: Node >=20.11.0
- Self-telemetry: badi.command.* lokal JSONL, BADI_TELEMETRY=off
- Auto-router: prompt -> skill+command injection (dinamik, slash adlarini hardcode etmez — rename'de kirilmadi)
- Windows compat: phase 5 (VM smoke) bekliyor

## Mimari Notlar
- **Token-only rename pattern (v1.32)**: kullanici-yuzeyi token'lari degisir, ic fonksiyon/dosya/dizin adlari kalir (runBasla, basla.js, takvim/). template.js'de token->dir map (visual->gorseller). ~300 referansli rename'i guvenli kildi
- `lib/commands/icerik/` 13 modul (v1.13.1) · `mobile/` (v1.35.0 PR-E) · `seo/` (v1.35.0 PR-F) ayni dizin-modul pattern'inde bolundu. aso.js (819) ERTELENDI: zaten ince dispatch katmani (mantik aso-helpers.js'te), dusuk degerli churn. Dir-modul = `<dir>/index.js` dispatch + `help.js` + subcommand dosyalari; help-doctor index.js+help.js'i birlestirip denetler
- `lib/commands/plugin/` 8 dosya split (v1.30+) · `lib/harnesses/_single-file.js` factory (v1.30+)
- `lib/commands/release.js` CHECKS array — 11 pure check (+docs-sync test'ten SONRA sirali
  ki ctx.actualTests dolsun; +checkScoopManifest: scoop version+url senkronu); `runSyncManifest` subcommand. **GOTCHA**: test runner SPEC
  reporter basar (`ℹ pass N`), TAP DEGIL (`# pass N`) — test ciktisi parse eden her sey
  iki formati da okumali (`parseTestSummary` export). docs-sync README sayisini GERCEK
  suite'e karsi dogrular (sadece ic-tutarlilik degil) — her test eklemede README guncelle.
- `lib/data/marketplace-manifest.js` — pure generator; komutlar dir+count ile referansli (isimle DEGIL) -> komut rename manifest'i etkilemez
- `lib/observability/event-emitter.js` — badi.* closed list + plugin namespace
- `lib/skills/schema.js` — badi-skills CI curl ediyor; canonical `lib/frontmatter.js`
- `lib/aso-helpers.js` stopword Set'i KASITLI Turkce (keyword-analiz verisi, UI degil — cevirme!)
- agent-frontmatter.test.js: ajan sayisi (30) + READ_ONLY/PRODUCER setleri hardcoded — yeni ajan eklerken guncelle
- harnesses/claude.js doctor ajan listesi 30'a guncellendi (05.06 hijyen PR) — yeni ajan eklerken burayi da guncelle

## Kesin Kurallar
- **Harici proje atifi yok** — README/CHANGELOG/source/PR'da random 3rd-party repo adi olmaz (kurumsal markalar haric)
- **Branch-guard** — main'a dogrudan commit yasak (pre-commit hook engeller), hep feature branch
- **Yerel-saat tarih kiyasi** — `startOfToday` lokal; toISOString UTC kiyasi yapilmaz
- **TLS strict-first** — `rejectUnauthorized: true` default
- **HTML parsing icin parser** — regex-HTML yasak; `node-html-parser`
- **Workflow permissions** — her workflow'da `permissions:` zorunlu
- **URL host kontrolu** — `new URL(x).hostname === "github.com"`; `.includes()` yasak
- **`console.log(a, b, c)` newline koymaz** — coklu satir = ayri cagri
- **zsh word-split yok** — script'lerde unquoted `$VAR` bolunmez; coklu-dosya perl/sed icin acik glob/dizi kullan (3 sessiz-basarisizlik dersi, 04.06)
- **`badi commands profile` non-TTY'de `--yes` ister** (`--force` degil); test-kaynakli profil mutasyonunu commit oncesi `profile all --yes` ile geri yukle

## Acik Konular
- **Kullanici-aksiyonu**: #33 awesome-claude-code basvuru · #126 Windows VM smoke
- **Scope-acik MVP**: #11 badi gh (P3) · #12 badi kb (P3)
- **P3/P4**: #9 serve · #10 marketplace · #52 mobile crash · #13/#14/#15
- **11-13.06 degerlendirme + hijyen turu KAPANDI (5 PR #275-#278, hepsi merged)**:
  3-mercek review → CEO "feature freeze, hedef ILK ORGANIK DIS SINYAL". Hijyen: docs
  credibility + YENI docs-sync release kapisi (checkDocsSync) + vault backfill 37 +
  vault-gezen test + README.tr arsiv banner (#207 KAPANDI). 2 tur /code-review kendi
  isimizi denetledi, 2 gercek regresyon yakaladi: (1) docs-sync kapisi gerceklige karsi
  dogrulamiyordu → checkNpmTest ctx.actualTests besliyor; (2) stray expo skill npm'e
  siziyordu → files[] daraltildi + .gitignore. DEVAM: yeni feature/release YOK.

## Son Kararlar (son ~2 hafta — eskiler `memory-archive.md`)
- 2026-06-26/27: **Ads-mechanics HARDENING merged (#307)**. `/meta-review`+`/ads-review`+`ads-strategist`
  live-dogrulanmis Meta/Google olcum mekaniklerine baglandi (8 Meta + 4 Google; CTWA/CAPI/Lead-Ads/
  event_id dedup/Enhanced Conv/Consent v2). Yeni yuzey YOK; "ne dogrulanmali" olarak girdi (advisory-only +
  research-live korundu, baked-number/3rd-party-ad yok). Kaynak: owner'in kendi e-meta projesi (READ-ONLY harvest).
  **Freeze istisnasi #3** loglandi → 3. build istisnasinda KAPI ACILDI; owner karari: **freeze AKTIF kalsin**,
  esik degismedi (ilk organik dis sinyal). Test 1321 yesil, doctor 53/0/0.
- 2026-06-27: **2026 guncellik refresh (#309)** — ayni 3 advisory dosya canli-arastirmayla 2026 degisikliklerine
  guncellendi (Meta: one-click-CAPI ikinci-pipeline dedup tuzagi, AEM oto, DMA less-personalized-ads, Pixel
  auto-enrichment; Google: `ad_storage` tek EEA kapi, offline-import Data Manager API'ye tasindi, EC tek toggle,
  EC-for-Leads gbraid/wbraid eslemiyor, AI Max URL-expansion 404, Call Ads kapandi, PMax negatives). Hepsi
  verify-live, baked-number/kaynak YOK. Sinif **maintenance** (yeni yuzey yok) → freeze etkilenmedi.
  +#311 (kalan Meta: Advantage+ Sales rename+ASC/AAC API deprecation, webhook mTLS, purchase-audience retention).
  +#312 **algoritma refresh**: meta-review/ads-strategist'e "delivery-algorithm reality 2026" (creative=targeting,
  Advantage+ default, cross-surface, incrementality, learning-phase, AI-creative disclosure); market/market-researcher'a
  "2026 signal reliability" (search volume=floor, TikTok/Reddit/Amazon-SQP stack, AI answer engines, AI-citation≠SERP).
- 2026-06-21/22: **Dagitim pivotu + kiti (#301-303, merged)**. Konumlandirma = agentic safety layer (deterministik
  hook'lar — README #302). Buyume plani `launch/GROWTH-PLAN.md` (cold-start fizigi, Phase-0 ucretsiz kilitler,
  metrik=haftalik npm indirme). **Reklam: YAPMA** (ucretsiz arac). Detay: launch/. Outreach taslaklari hazir.
- 2026-06-20: **/ceo-review → 2 owner-istisnasi build (#292, #293)**. Komut 84→86, skill 62→63.
  (1) `/market` slash + `market-research` vault skill — WIRING istisnasi (market-researcher ajani
  v1.34 + `badi market` CLI v1.15 zaten vardi). (3) `/tasks` dependency-aware sequencing
  (`[P]`→Workflow parallel()) — spec-kit'ten damitilan TEK parca; constitution/clarify/specify/plan
  KILL (architect/brief/spec-check/team ile ortusur). #2 (PR #281 "fix") non-item (zaten #283).
  **Freeze hala aktif** (5⭐/0fork); istisnalar `.claude/workspace/freeze-exceptions.md`'de loglu
  (2 build istisnasi; 3'te owner'a freeze lift/tighten sor — product-strategist framework'u).
- 2026-06-20: **v1.35.0 hardening turu — 6 PR (#285-#290) merged** (A doctor/release-gate, B semver
  helpers, C branch-guard cwd/cd, D stats env-seam, E mobile.js+help-doctor coverage, F seo.js split).
  Test 1269→1317. ERTELENEN: aso.js split. YAPILMADI: seo stripTags→node-html-parser (ampirik regresyon).
  Detay: CHANGELOG + memory-archive.
- 2026-06-06: **v1.34.0** (#271-#273) — Anthropic artifact-kontrati security-check'e FOLD-IN. **Kalici dersler:**
  buyuk plan = ONCE adversarial workflow; commands-vault→commands oto-senkron YOK (ikisini de edit'le, byte-ayni);
  `skills add` aktif skill'i ezmez (retrofit=remove+add). Detay: CHANGELOG.
- 2026-06-05: v1.33.0/.1/.2 (#248-#267) — English-only VERIFIED CLEAN + 3 advisory ajan
  (27→30). **AKTIF KISIT**: awesome-claude-code #1955'e AI yorumu YASAK (maintainer kuyrugu,
  cooldown riski; tum etkilesim kullanicidan). Detay: memory-archive.md.
- 2026-05-22..06-04: v1.31.0 + v1.32.0 (sanal eng ekibi + CLI grammar). Detay: memory-archive.md.

## Yan Repo & Engeller
- **badi-skills** v1.0.0 — CI `lib/skills/schema.js`'i ana repo'dan curl ile cekiyor. Engeller: (henuz yok).
