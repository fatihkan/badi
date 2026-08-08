# Proje Bellegi

## Mevcut Durum
- Proje: Badi - Claude Code Is Akisi Yonetim Sistemi
- npm: @fatihkan/badi **v1.37.0 YAYINDA** (06.08.2026, dist-tag latest=1.37.0; #339 + tag + GH release; publish=owner elle npm login+publish). Minor: **Qwen Code 6. harness** (`--harness qwen`) — hook'lari tasiyan ILK Claude-disi hedef + `SessionStart` matcher fix. Onceki: v1.36.0 (11.07, 2026 advisory currency + stats Opus-pricing fix). Detay: CHANGELOG + memory-archive
- **Konumlandirma (2026-06-22): agentic safety layer for Claude Code** — README lede + Why-Badi
  deterministik guvenlik hook'larina cevrildi (#302, dogrulanmis gercek hook'lar). Dagitim kiti +
  kanonik mesaj + buyume plani: `.claude/workspace/launch/` (POSITIONING/GROWTH-PLAN/incident-post/demo-script/outreach)
- **English-only goc DOGRULANDI (05.06)**: bagimsiz adversarial audit 7 turda `VERIFIED CLEAN` (171→0, PR #248-257). Kasitli TR kalanlar: stopword Set'leri, icerik-helpers normalize tablosu, workspace veri yollari (takvim/, gorseller/, marka-sesi.md), CHANGELOG version-history girdileri
- **Sanal eng ekibi (v1.32+)**: product-strategist/engineering-manager/release-manager/qa-lead ajanlari + /ceo-review /eng-review /qa /ship + /team orkestratoru (kapi zinciri: strateji->plan->build->QA->ship)
- **Advisory uclu (v1.33, atoms.dev bosluk-doldurma)**: market-researcher / seo-strategist / data-analyst (read-only, ads-strategist kalibi)
- Ajan: 30 · Komut: 86 · Skill: 63 · Harness: 6 · Hook: 14 (13 varsayilan + skill-router opt-in)
- Tests: 1325 yesil · biome 2.5.2 clean (npm run lint = `biome check .` gate; no-arg check farkli kume tarar!) · doctor 53/0/0 (hooks settings.json'dan; help-doctor dizin-modulleri de — 38 komut)
- Dagitim: npm (✅ 1.37.0 YAYINDA — latest) + marketplace (✅ senkron) + Homebrew + Scoop (⏳, repo'lar yok — "Planned"; scoop version+url senkron, checkScoopManifest gate) + GH Actions templates
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
- 2026-08-08: **Harvest-hardening batch (#344, freeze #6, YAYINLANMADI — CHANGELOG [Unreleased], paket 1.37.1)**. 5 harici
  repoyu `/market`+`/ceo-review`+`/team` `/workflows` (13 ajan) ile taradik. **Gate net-yeni her fikri KILL/DEFER etti** —
  hicbir net-yeni ozellik hayatta kalmadi; ciken 6 sey sadece MEVCUT yuzeyi sertlestiriyor: (A) completeness-gate'e URL-userinfo
  + ciplak-token-param regex, (B) "var ama olu" matcher tespiti (doctor+test, `deadToolMatchers`), (C) 6 ajana untrusted-input
  siniri, (D) INCONCLUSIVE grade-floor (/system-audit+auditor) + /review kanit satiri, (E) shipped-surface denylist testi,
  (F) /deps-update cooldown doc. **Kalici dersler:** (1) unit E **3 mevcut `spec-kit` sizintisini yakaladi** (README+2 CHANGELOG) — denylist tests/'te yasar (files[] disi); (2) unit A regex'i kendi CHANGELOG taslagimi blokladi (moat calisiyor); (3) permission-topology adayinin kendi sayisi yanlisti (25/30 Bash, 17 degil) — **projede 2. kez** (ilki pentest-scan) = red flag. 1327→1333 test.
- 2026-08-06: **v1.37.0 YAYINDA — Qwen Code harness (#336/#338/#339)**. `--harness qwen`; init menusu HARNESSES'tan
  dinamik turedigi icin otomatik gorundu. Qwen, Claude Code kontratini klonlamis (PreToolUse DENY + subagent +
  dosya-basina komut) → **hook'lari tasiyan ILK Claude-disi hedef**. **Kalici:** (a) TOOL_MAP Bash→run_shell_command,
  Write|Edit|NotebookEdit→write_file|edit|notebook_edit, Read→read_file, Grep→search_file_content — Qwen surum
  yukseltmesinde YENIDEN DOGRULA (kurulu binary'nin `.../qc-helper/docs/features/hooks.md`'sinden, dokumandan degil);
  (b) hook govdeleri fork EDILMEDI — `_util.mjs` proje kokunu `git rev-parse`'tan buluyor, `$CLAUDE_PROJECT_DIR`
  okumuyor, o yuzden iki harness'ta da ayni calisiyor; (c) yanlis matcher = **sessizce olu guard**, bu yuzden doctor
  Claude-tarzi tool id sizarsa fail veriyor. **BULUNAN BUG:** badi'nin kendi SessionStart matcher'lari `new`/`resumed`
  gecersizmis → 3 hook hic calismamis, `pre-compact-handoff→compact→post-compact-resume` devri yarisindan kirikmis
  (`startup|clear` / `resume|compact` oldu + kablolama regresyon testleri). **DERS: hook kablolamasini da test et —
  calismayan dogru bir hook ne hata verir ne test kirar.** Freeze istisnasi #5 (feature, owner-directed: owner Qwen kullaniyor).
- 2026-07-05: **Model katalog refresh (#325)** — MODEL_PRICING Opus $15/$75→$5/$25 + fable-5/opus-4.8/sonnet-5. **Kalici:** agent `model:` = Claude Code alias → latest'e OTO-track; versiyonlu ID/fable hardcode ETME; MODEL_PRICING her model launch'ta ELLE guncelle. Detay: CHANGELOG.
- 2026-06-26/27: **Ads-mechanics HARDENING (#307)** — 3 advisory dosyasi live-Meta/Google olcum mekaniklerine baglandi. **Freeze istisnasi #3** → KAPI ACILDI; owner: **freeze AKTIF kalsin**. Detay: CHANGELOG.
- 2026-06/07: **2026-currency hatti — v1.36.0'da yayinlandi** (#309/#311 ads · #312 meta/market algoritma · #314 seo/aso ·
  #316 content · **#319 adversarial re-verify**). Tum advisory yuzeyi canli-arastirmayla 2026 mekanik+algoritmalarina
  temellendirildi; verify-live, baked-number yok. **Kalici dersler:** (a) #319'da 4 ajan primary-source'a karsi tekrar
  denetledi → hicbiri uydurma degildi ama **6 duzeltme** cikti (Consent Mode ad_storage TEK-gate DEGIL; Call Ads
  creation-disabled-2026/serve-2027; IG watermark sadece 3rd-party; "~1s hook"→"opening seconds") — **saglam itirazi
  abartmak onu curutur**; (b) `llms.txt` Google tarafindan gormezden geliniyor (eski oneri kaldirildi, GEO=SEO). Detay: CHANGELOG.
- 2026-06-21/22: **Dagitim pivotu + kiti (#301-303, merged)**. Konumlandirma = agentic safety layer (deterministik
  hook'lar — README #302). Buyume plani `launch/GROWTH-PLAN.md` (cold-start fizigi, Phase-0 ucretsiz kilitler,
  metrik=haftalik npm indirme). **Reklam: YAPMA** (ucretsiz arac). Detay: launch/. Outreach taslaklari hazir.
- 2026-06-20: **/ceo-review → 2 owner-istisnasi build (#292, #293)**: `/market` slash+vault skill (WIRING) +
  `/tasks` dependency-aware sequencing (spec-kit'ten TEK parca; gerisi KILL). Komut 84→86, skill 62→63.
  Freeze istisna framework'u + `freeze-exceptions.md` burada basladi. Detay: CHANGELOG.
- 2026-06-20: **v1.35.0 hardening — 6 PR (#285-#290)** (doctor/release-gate, semver, branch-guard, stats env-seam, mobile/seo split). Detay: CHANGELOG.
- 2026-06-06: **v1.34.0** (#271-#273). **Kalici dersler:** buyuk plan=ONCE adversarial workflow; commands-vault→commands oto-senkron YOK (ikisini de edit, byte-ayni); `skills add` aktif skill'i ezmez.
- 2026-06-05: v1.33.0/.1/.2 (#248-#267) — English-only CLEAN + 3 advisory ajan (27→30). **AKTIF KISIT**: awesome-claude-code #1955'e AI yorumu YASAK (tum etkilesim kullanicidan).
- 2026-05-22..06-04: v1.31.0 + v1.32.0 (sanal eng ekibi + CLI grammar). Detay: memory-archive.md.

## Yan Repo & Engeller
- **badi-skills** v1.0.0 — CI `lib/skills/schema.js`'i ana repo'dan curl ile cekiyor. Engeller: (henuz yok).
