# Proje Bellegi

## Mevcut Durum
- Proje: Badi - Claude Code Is Akisi Yonetim Sistemi
- npm: @fatihkan/badi v1.30.1 (yayinda) — 19.05.2026 marketplace sync + multi-channel dist + 9 hotfix bulgu
- Tests: 1074 (Linux+macOS yesil; Windows non-blocking)
- Marketplace: .claude-plugin/{plugin,marketplace}.json v1.30.1 ile senkron (badi release sync-manifest komutu ile)
- Dagitim kanallari: npm (✅) + Claude Code marketplace (✅) + Homebrew (⏳ tap repo pending) + Scoop (⏳ bucket repo pending)
- Yan repo: github.com/fatihkan/badi-skills v1.0.0 (25 skill bundle)
- Engines: Node >=20.11.0
- CodeQL: tum workflow'lar kaldirildi (10.05.2026, afe099e) — local lint/test + manuel publish
- Skill kategorisi: 62 (25 genel + 25 pentest-* + 12 expo-*)
- Komut: 84 (78 vault + 6 wrapper — v1.30+ release/events eklendi)
- Harness: 5 (claude/cursor/gemini varolan + windsurf/agents v1.30+)
- Hook: 14 (v1.30+ inject-active-plan eklendi)
- Self-telemetry: badi.command.* event'leri lokal JSONL (~/.claude/projects/<slug>/badi-events.jsonl), BADI_TELEMETRY=off ile kapali
- Auto-router: prompt -> matched skill + command injection (v1.20+ skills, v1.26+ commands)
- Windows compat: phase 1-4 yayinda; phase 5 (native VM smoke test) bekliyor

## Mimari Notlar
- `lib/commands/icerik/` 13 alt-komut moduluyle bolundu (v1.13.1) — diger buyuk komutlar (mobile.js 1226, seo.js 1071, aso.js 820) ayni pattern adayi
- `lib/commands/plugin/` 8 dosyaya split (v1.30+) — icerik/ pattern; install/remove/list/show/doctor/graph/help/_shared
- `lib/harnesses/_single-file.js` factory (v1.30+) — gemini/windsurf/agents 551 -> 339 satir; yeni tek-dosya harness ~26 satir
- `lib/commands/release.js` CHECKS array (v1.30+) — 9 pure check fonksiyonu, plugin'ler `CHECKS.push()` ile genisletebilir. v1.30.1+ `checkMarketplaceManifest` eklendi + `runSyncManifest` subcommand
- `lib/data/marketplace-manifest.js` (v1.30.1+) — pure generator (buildPluginManifest/buildMarketplaceManifest/isManifestStale/writeManifests/deepEqualJson); `.claude-plugin/*.json` package.json + .claude/ icerigine bakarak yeniden uretilir
- `.github/workflows/dist-publish.yml` (v1.30.1+) — opt-in workflow (workflow_dispatch only); env: pattern + Authorization header (Y1 leak fix); DIST_PUBLISH_TOKEN secret yoksa mirror push skip
- `lib/observability/event-emitter.js` (v1.30+) — `badi.*` closed list + `plugin.<owner>.<event>` regex namespace; emit() best-effort, BADI_TELEMETRY=off no-op
- `.claude/hooks/inject-active-plan.mjs` (v1.30+) — UserPromptSubmit, `.claude/plans/<slug>.approved` markerlerini inject; BADI_PLAN_INJECT_* env override
- `lib/skills/schema.js` — skill bundle validator. parseFrontmatter inline kopya
  tutuluyor (badi-skills CI curl ediyor); canonical `lib/frontmatter.js`
- `lib/harnesses/skills-bundler.js` — `.claude/skills/` -> bundle compiler
- `lib/market-helpers.js` — App Store competitor + complaint cat (v1.15.0)
- `lib/commands/tasarim.js` — `@google/design.md` wrapper (v1.16.0)
- `lib/commands/seo.js` countWords — `node-html-parser` ile DOM bazli
- `_bootstrap/badi-skills/` — bootstrap kit (generated skill output gitignored, badi-discipline tracked)

## Kesin Kurallar
- **Harici proje atifi yok** — README/CHANGELOG/source-comments/PR/issue/release
  notes'ta random 3rd-party repo veya marketplace adi olmayacak. Istisna:
  Google, Meta gibi kurumsal markalar.
- **Yerel-saat tarih kiyasi** — mtime karsilastirmasi yerel `startOfToday`
  ile, `toISOString()` UTC kiyasi yapilmaz.
- **Branch-guard** — main'a dogrudan commit yasak, hep feature branch.
- **PR templating** — title/body'de specific 3rd-party adlar yerine notr ifade.
- **TLS strict-first** — `rejectUnauthorized: true` default; sadece bilinen
  cert hatalari icin raporlama insecure fallback. Asla kosulsuz `false`.
- **HTML parsing icin parser** — Regex bazli HTML sanitization YASAK.
  `node-html-parser` veya DOM tree kullan.
- **Workflow permissions** — Tum workflow'larda `permissions:` block'u
  zorunlu (minimum `contents: read`).
- **URL host kontrolu** — `source.includes("github.com")` yasak,
  `new URL(source).hostname === "github.com"` kullan.
- **`console.log(a, b, c)` bosluk koyar, NEWLINE koymaz** — coklu satir
  icin ayri cagri kullan (v1.27.1 top-level help bug dersi).
- **Release-prep PR'da package.json bump etme** — `badi publish --version
  patch` kendi bump'lar. CHANGELOG'a sayim yazarken `npm test | tail -3`
  ile dogru sayiyi kullan (v1.27 release drift dersi).

## Acik Konular
- **Kullanici-aksiyonu bekleyen**:
  - #33 (P2) awesome-claude-code basvuru (web UI only, icerik hazir)
  - #126 phase 5 manuel Windows VM smoke test
- **Scope-acik MVP**:
  - #11 (P3) badi gh: pr draft, release draft, 2-yonlu (sync MVP yayinda)
  - #12 (P3) badi kb: --topic, --open, --strict, cache (graph MVP yayinda)
- **P3 yatirim**: #9 serve, #10 plugin marketplace, #52 mobile crash
- **P4 ar-ge**: #13 voice, #14 team, #15 ai

## Son Kararlar (son 4 hafta — eskiler `memory-archive.md`)
- 2026-05-15 (ek seans): v1.26.0 yayinlandi — profil bazli komut yonetimi +
  prompt-aware komut routing. 77 komut 4 profile etiketli. Test 774 -> 805.
- 2026-05-15: pentest-* skill ailesi (25 kategori, advisory). Vault 25 -> 50.
- 2026-05-15 (gec seans): v1.27.0 yayinlandi — expo-* skill ailesi (12
  kategori) + #162 hook defensive fail-safe handler (13 hook hardened).
  Vault 50 -> 62. Test 805 -> 868 (+53 hook resilience + 10 stack).
- 2026-05-16: v1.27.1 yayinlandi — doc-only patch (PR #164 + #165).
  Help completeness: `badi commands --help` (route + 8 flag eksik),
  `badi skills --help` (--top/--json eksik + stale count), top-level
  `badi --help` newline bug (console.log 3-arg). README drift fix.
- 2026-05-16 (wrap-up sonrasi): Tier 1 quality pass — lint auto-fix,
  memory konsolidasyon (175 -> ~95), 15 komutta help-drift audit.
- 2026-05-16 (max-effort review): v1.28.0 yayina hazirlik — secret-scan
  sertlestirme. K1 (JSON exit-code) + K2 (dedup collision) empirik
  dogrulandi + duzeltildi. Y1 (symlink), Y2 (github-classic SHA-1 false
  positive) + O2-O5+D1-D4. Pattern registry externalize edildi.
  6 yeni flag: --exit-code, --max-commits, --max-files, --ignore,
  --ignore-file, --patterns. Test 868 -> 915 (+47). Davranis degisikligi:
  JSON modu artik kritik bulguda exit 1 dondurur (eski bug'a guvenen CI
  pipeline'lar surecekler).
- 2026-05-16 (ek seans): v1.28.1 yayinlandi. (1) Help-doctor detektoru
  (PR #170): `lib/help-doctor.js` parser context + console.log help body
  karsilastirir; `badi doctor help --strict --format json` CI'da
  calisabilir. Allowlist `_why:` zorunlu. (2) 6 security finding kapali
  (PR #171): Y1 skills.js path traversal (kebab-case regex), O1 plugin.js
  git arg injection ('-' reject + `--` separator), O2 test SAMPLES split-
  string concat, O3a tasarim.js --write scope guard, O3b secret-scan
  --patterns/--ignore-file scope guard, D1 doc. Test 915 -> 934 (+19).
  Davranis degisikligi: plugin install '-' prefix red, tasarim/secret-
  scan path'leri proje kokune sinirli, skills add sadece [a-z0-9-].
- 2026-05-16 (gec seans): v1.29 observability paketi merge edildi
  (PR #173). Karma-equivalent ama bagimsiz tasarim — `~/.claude/projects/
  *.jsonl` transcript'lerini direk okur (privacy-preserving).
  Yeni komutlar: `badi stats --session/--models/--cost/--since/--until/
  --branch/--limit`, `badi search "<q>"`, `badi session <id>`, `badi plan
  list/new/show/status/approve/deny/reset`, `badi plugin show <name>`,
  `badi list --mcp`. Paylasimli reader: `lib/data/transcript-reader.js`
  (parseSession, MODEL_PRICING, costForUsage, findSession). Test 934 ->
  967 (+33).
- 2026-05-19: v1.29.0 npm yayinlandi. GH release notes zenginlestirildi.
  Yayin oncesi 2 chore PR (#174 memory satir, #175 changelog basligi).
  Changelog organizational debt: v1.28.1 security hardening section'i
  [1.29.0] altinda gozukur — onceki seans accept edilmis trade-off,
  ileri surumde cleanup yapilacak.
- 2026-05-19 (ayni gun gec): v1.30.0 yayinlandi — 5-feature bundle
  (PR #182) + 11 review bulgu hotfix (PR #183) ayni surumde. Yeni:
  windsurf+agents harness (5 toplam), `badi release check` pre-flight,
  plan inject hook (UserPromptSubmit), plugin apiVersion+graph+doctor,
  `badi events` self-telemetry. Refactor: harness factory 551->339,
  plugin.js 437->8 dosya, release.js CHECKS array. Test 967 -> 1054
  (+87). WrongStack repo analizinden ilham, "harici proje atifi yok"
  kurali korunarak (issue/CHANGELOG/release notes'ta isim yok).
- 2026-05-19 (gece): v1.30.1 yayinlandi — multi-channel dist + marketplace
  sync + 9 review bulgu hotfix. (1) .claude-plugin/*.json v1.16.5'ten beri
  stale idi -> v1.30.1 senkron (PR #185). (2) badi release sync-manifest
  yeni komut + checkMarketplaceManifest CHECKS'ine eklendi (drift
  publish'i bloklar). (3) dist/homebrew/badi.rb + dist/scoop/badi.json
  iskeletleri + .github/workflows/dist-publish.yml opt-in workflow. (4)
  Karpathy-skills repo analizinden ilham (marketplace pattern) — harici
  isim yok. (5) Hotfix #186: K1 workflow shell injection (env: pass-thru),
  Y1 token URL leak (extraHeader auth), Y2 docs coming-soon etiketleri,
  O1/O2/O3 + D1/D2/D3 quality. Test 1054 -> 1074 (+20).

## Yan Repo
- **badi-skills** v1.0.0 — bundle generated by `badi publish --skill-bundle`.
  CI workflow `lib/skills/schema.js`'i ana repo'dan curl ile cekiyor.

## Engeller
- (henuz yok)
