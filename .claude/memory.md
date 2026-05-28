# Proje Bellegi

## Mevcut Durum
- Proje: Badi - Claude Code Is Akisi Yonetim Sistemi
- npm: @fatihkan/badi v1.31.0 (yayinda) — 22.05.2026 Anthropic 2.1.126-147 uyum + 13 hotfix bulgu
- v1.30.2 install UX rafa kaldirildi (kullanici karari, 22.05.2026 — guvenlik daha onemli)
- Tests: 1130 (Linux+macOS yesil; Windows non-blocking)
- Marketplace: .claude-plugin/{plugin,marketplace}.json v1.31.0 ile senkron + `lastUpdated` field (2.1.144+ Browse pane uyumu)
- Dagitim kanallari: npm (✅) + Claude Code marketplace (✅) + Homebrew (✅ tap fatihkan/homebrew-badi) + Scoop (⏳ bucket repo pending) + GitHub Actions templates (v1.31+ `dist/github-actions/`)
- Yan repo: github.com/fatihkan/badi-skills v1.0.0 (25 skill bundle)
- Engines: Node >=20.11.0
- CodeQL: tum workflow'lar kaldirildi (10.05.2026, afe099e) — local lint/test + manuel publish
- Skill kategorisi: 62 (25 genel + 25 pentest-* + 12 expo-*)
- Komut: 77 (.claude/commands/ canonical; CLI alt-komutlari ayri)
- Harness: 5 (claude/cursor/gemini varolan + windsurf/agents v1.30+)
- Hook: 14 (v1.30+ inject-active-plan; v1.31+ terminal-isolation audit edildi — `docs/hooks/isolation-audit.md`)
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

## Son Kararlar (son ~2 hafta — eskiler `memory-archive.md`)
- 2026-05-28 (bakim turu, branch chore/maintenance-test-lint-drift): (1)
  cli.hooks-node.test.js sandbox `.hook-sandbox/` + her sandbox git-init —
  eski os.tmpdir() TMPDIR=/tmp'de completeness-gate/backup-before-write
  skip'ine takiliyordu (4 fail), bare .test-tmp cli.integration ile
  cakisiyordu. (2) Lint 19->0: biome auto-fix+format (14 dosya) +
  ${CLAUDE_PLUGIN_ROOT}/ANSI regex biome-ignore/override; lint
  CI/release'de gate edilmiyordu. (3) Sayim drift -> kanonik 22/77/14/62
  (plugin.json). (4) CHANGELOG [1.29.0]->[1.28.1] security reorg. Test 1130 yesil.
- 2026-05-22 (Cuma): v1.31.0 — Anthropic 2.1.126-147 uyum. `badi security`
  (/security-review koprusu), /review parity (effort/--comment/
  --correctness-only), marketplace lastUpdated, GH Action scaffold, hook
  terminal-isolation audit (15 hook, 2 fix). Internal 13 bulgu ayni release.
  Test 1074 -> 1130.
- 2026-05-19 (gece): v1.30.1 — multi-channel dist + marketplace sync + 9
  review bulgu. .claude-plugin/*.json stale idi -> senkron. `badi release
  sync-manifest` + checkMarketplaceManifest. dist/homebrew + scoop +
  dist-publish.yml opt-in. Test 1054 -> 1074.
- 2026-05-19 (ayni gun gec): v1.30.0 — 5-feature bundle + 11 review hotfix.
  windsurf+agents harness (5), `badi release check`, plan inject hook,
  plugin apiVersion+graph+doctor, `badi events`. Refactor: harness factory
  551->339, plugin.js 437->8 dosya, release.js CHECKS array. Test 967 -> 1054.

## Yan Repo
- **badi-skills** v1.0.0 — bundle generated by `badi publish --skill-bundle`.
  CI workflow `lib/skills/schema.js`'i ana repo'dan curl ile cekiyor.

## Engeller
- (henuz yok)
