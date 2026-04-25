# Changelog

> **Language / Dil:** **English** · [Turkce](CHANGELOG.tr.md)

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and [Semantik Versioning](https://semver.org/).

## [1.15.2] - 2026-04-26

### Removed
- All third-party project attributions (external skill marketplace
  names, ecosystem-standard URLs, third-party repo references) stripped
  from user-facing documentation, source-code comments, and bundle
  metadata. README, CHANGELOG (EN+TR), schema.js, skills-bundler.js,
  v1.14 plan doc, all 23 in-repo SKILL.md `compatibility:` fields, the
  bootstrap kit's README/CLAUDE.md/AGENTS.md/plugin.json, and the
  `badi-discipline` SKILL.md are now neutral about external ecosystems.
- The `badi-discipline` SKILL.md tradeoff note no longer attributes the
  framing to any external author. The 8 principles stand on their own
  as Badi's coding discipline.

### Changed
- `compatibility` default text in `lib/harnesses/skills-bundler.js`:
  `"Works with Claude Code, Cursor, or any compatible AI coding agent."`
- `_bootstrap/badi-skills/README.md` install section dropped the
  external skills-CLI invocation; lists Claude Code marketplace,
  Cursor Remote Rule, and manual setup only.

No code or test changes; documentation/comment cleanup only.

## [1.15.1] - 2026-04-26

### Removed
- External attribution to a third-party skill page in the `badi market`
  documentation and source code comments. README, CHANGELOG (EN+TR),
  `lib/commands/market.js`, and `lib/market-helpers.js` no longer
  reference any external URL.

No code or test changes; documentation/comment cleanup only.

## [1.15.0] - 2026-04-26

### Added — `badi market`

App Store pazar arastirmasi komutu. MVP scope: rakip kesfi + coklu
bolge yorum aggregation + 11-kod sikayet kategorize + zorluk skoru
(BLUE_OCEAN / COMPETITIVE / HARD / SATURATED).

Subcommands:
- `badi market <appId>` — full report (5-stage pipeline)
- `badi market discover <appId>` — competitor discovery (genre filter)
- `badi market reviews <appId>` — multi-region multi-page reviews +
  rating distribution + complaint categories
- `badi market difficulty <appId>` — 0-100 score + categorical verdict

Flags: `--country <c1,c2,...>`, `--pages <N>`, `--limit <N>`. No API keys
required (iTunes Lookup, iTunes Search, Apple RSS endpoints).

New `lib/market-helpers.js`: `discoverCompetitors`,
`aggregateReviewsMultiRegion`, `categorizeReviewIssue` (11 codes,
TR+EN stem patterns), `summarizeReviews`, `calculateDifficulty`,
`findCrossCompetitorComplaints`. Reuses existing `aso-helpers.js` for
the iTunes API surface.

### Phase 2 (separate issues, not in 1.15.0)

- SensorTower revenue scrape (real $/downloads)
- Wishlist demand×supply matrix (`✓✓✓ eksik` / `✓✓ buggy` / `✓ var ama
  kötü` / `✓✓✓ var` notation)
- Opportunity gap report (complaint ∩ wishlist intersection + verbatim
  quotes)
- `--format json` for piping
- Region-aware difficulty (US vs TR vs JP)

### Tests

359 → 379 (+20). 7 helper unit-test suites + 4 CLI smoke tests.

## [1.14.1] - 2026-04-26

CI / engines bump. No runtime-code changes.

### Changed
- **CI matrix dropped Node 18.** `tests/cli.*.test.js` (14 files) and
  `scripts/enrich-skills.js` use `import.meta.dirname`, which requires
  Node 20.11+. The Node 18 row in CI had been failing silently for
  these files; bumping the matrix surfaces the rest of the suite cleanly.
- **`engines.node` bumped to `>=20.11.0`** (was `>=18.0.0`). Aligns
  package metadata with the actual runtime requirement of the test suite.
- README install instructions updated to require Node 20.11+.

### Notes
- Production CLI surface (`bin/badi.js` and `lib/`) already used the
  cross-version-safe `fileURLToPath(import.meta.url)` pattern; users
  on Node 20+ are unaffected. Node 18 users were never able to run the
  test suite, but the CLI itself worked.

## [1.14.0] - 2026-04-26

**Skill ecosystem MVP.** Closes issue #56 (skill-bundle infrastructure)
and #57 (badi-discipline behavioral skill).

### Added — Skill bundle pipeline

- `lib/skills/schema.js` — Badi skill bundle frontmatter validator
  (required/optional fields, allowed-tools allowlist, semver-shaped
  badi-version, known categories). Two modes: warn (default) and
  strict (CI). Includes `parseRichFrontmatter` for nested metadata
  blocks.
- `lib/harnesses/skills-bundler.js` — compiles `.claude/skills/<name>/`
  into `<target>/skills/<name>/` with auto-enriched frontmatter,
  copies `references/` subdirs, and generates a router skill grouping
  bundled skills by category.
- `badi publish --skill-bundle [--target <dir>] [--source <dir>]
  [--strict] [--dry-run]` — wires the bundler into the publish
  orchestrator. The actual git/npm push for the badi-skills repo is
  out of scope; the orchestrator stops after writing the bundle and
  prints next-step git commands.
- `scripts/enrich-skills.js` — in-place enrichment for the source
  `.claude/skills/<name>/SKILL.md` files. Idempotent. Reads
  `scripts/skill-descriptions.json` for curated trigger-rich
  descriptions.
- All 23 top-level `.claude/skills/<name>/SKILL.md` files now carry
  the full Badi skill bundle frontmatter (name, description, license,
  compatibility, allowed-tools, metadata.{author, homepage,
  badi-version, category}).

### Added — `badi-skills` bootstrap kit

- `_bootstrap/badi-skills/` — bare repo skeleton for the separate
  `badi-skills` GitHub repo. LICENSE (MIT), README install
  instructions for skills CLI / Claude Code marketplace / Cursor
  Remote Rule / OpenAI Codex, CLAUDE.md and AGENTS.md routing,
  `.claude-plugin/plugin.json` and `.cursor-plugin/manifest.json`
  manifests, `.github/workflows/validate.yml` CI that pulls the
  schema from this repo and validates every SKILL.md in strict mode.
- `_bootstrap/README.md` walks through one-time repo creation:
  `gh repo create` → push bootstrap → `badi publish --skill-bundle`
  → copy bundle → tag `v1.0.0`.

### Added — `badi-discipline` behavioral skill

- `_bootstrap/badi-skills/skills/badi-discipline/SKILL.md` — 8
  principles: Think Before Coding, Simplicity First, Surgical
  Changes, Goal-Driven Execution, Yak-Shave Detection, TaskBoard
  Discipline, Knowledge-Base Source Requirement, and Destructive
  Action Gate (extracted from Badi's own subagents and hooks).
- 4 progressive-disclosure references: task-discipline,
  destructive-actions, yak-shave-patterns, knowledge-base-sources.
- Carries an explicit tradeoff note: "These are prompt-level
  guidelines, not enforcement. Bias toward caution over speed; for
  trivial tasks, use judgment."

### Tests

- 307 → 359 (+52). Schema 32, bundler 17, publish 3.

## [1.13.2] - 2026-04-25

Code-review follow-up to v1.13.1. Seven findings from the post-merge review
addressed in a single hotfix.

### Fixed
- **Yerel-saat "bugun" hesabi.** `badi icerik durum` ve `badi icerik kapat`
  bugun sayisini `mtime.toISOString()` (UTC) ile yerel `getDateString()`
  arasinda kiyasliyordu. UTC siniri yerel sinirla farkliysa (ornek: UTC+3
  saat 01:00) "bugun" yanlis sayilirdi. Artik yerel `startOfToday` ile
  karsilastirma yapiliyor.
- **`runTemplate` switch** olası tip drift'ine karsi `default: throw` ile
  korundu. `TEMPLATE_TYPES` listesi switch ile esitsiz olursa erken patliyor
  (uretilen dosya bos icerikle yazilmiyor).
- **`badi icerik` bilinmeyen subcommand mesaji** sadece template-tiplerini
  degil, oturum komutlarini (`list`, `basla`, `durum`, ...) da gosteriyor.

### Refactored
- `lib/commands/icerik.js` shim'i kaldirildi; `bin/badi.js` artik
  `lib/commands/icerik/index.js`'i dogrudan import ediyor (gereksiz
  indirection silindi).
- `lib/commands/agent.js` `subInstall` yorumu shell-watcher onayinin
  *neden* gerekli oldugunu anlatiyor.

### Tests
- 307/307 yesil — davranis korundu.

## [1.13.1] - 2026-04-25

### Fixed — `badi agent`
- **`agent install` confirmation was fake.** When a watcher contained a `shell`
  check, install printed "shall I register this with the scheduler?" and then
  installed anyway, without reading any input. The prompt now actually waits
  for `y/N`. Added `--yes` / `-y` to opt out for non-interactive use.
- **`agent install <unknown>` and `agent tail <unknown>` threw raw stack
  traces** from `WatcherError`. Both now print a clean `Watcher yok: <path>`
  message and exit `1`.

### Refactored
- `lib/commands/icerik.js` was a single 1,667-line if-chain over 13
  subcommands. Split into per-subcommand modules under `lib/commands/icerik/`
  (issue #41). `icerik.js` was a one-line re-export shim — kept for
  backwards compatibility with imports, removed in 1.13.2.

### Tests
- 304 → 307 (+3): `--yes` flag visible in help, clean errors for missing
  watchers in `install` and `tail`. The +3 came entirely from the `agent.js`
  polish; the icerik refactor itself was test-equivalent.

## [1.13.0] - 2026-04-24

### Added — Background Agents (issue #55)

Badi now has a **background watcher** system. Users can define YAML-frontmatter watchers in `.claude/watchers/` that run on an OS-native scheduler and produce reports consumed by the next `/start` session.

New commands:
- `badi agent create <name> [--template project-health|deploy-watchdog]` — scaffold a watcher.
- `badi agent list` — enumerate installed watchers + scheduler state.
- `badi agent run <name>` — execute once manually (great for dev).
- `badi agent install <name> [--scheduler launchd|systemd|cron] [--dry-run]` — register with the best available OS scheduler.
- `badi agent uninstall <name>` — remove scheduler registration (keeps the `.md`).
- `badi agent tail <name> [-n N]` — stream the watcher's report.
- `badi agent status [--since 24h|7d] [--format text|json]` — aggregate recent alerts across all watchers.
- `badi agent remove <name>` — full cleanup (scheduler + watcher file).

### 5 built-in watch types

| Type | Checks |
|------|--------|
| `git` | `git log` scoped by `last-N-commits` / `since:<ref>` / `all`, regex pattern match |
| `shell` | arbitrary command + `alert_on: exit-nonzero / stdout-match:<re> / stderr-match:<re>` + timeout |
| `file` | file change detection (mtime+size) and `package.json` dependency-added/removed |
| `log` | offset-tracked tail with `new-entry` or `pattern-match:<re>` |
| `http` | HEAD/GET with SSRF guard, `status-nonok`, `latency>Ns`, `body-match:<re>` (composite via `|`) |

### 3 OS scheduler adapters

- **launchd** (macOS) — `~/Library/LaunchAgents/com.badi.watcher.<name>.plist` + `launchctl bootstrap/bootout`.
- **systemd** (Linux) — `~/.config/systemd/user/badi-watcher-<name>.{service,timer}` + `systemctl --user enable --now`.
- **cron** (universal fallback) — marked lines in user crontab, cleanly added/removed.

`pickScheduler()` auto-selects by platform; `--scheduler` flag overrides; `--dry-run` shows the plan + full unit content without writing.

### /start integration

The `/start` slash command now calls `badi agent status --since 24h` before the daily briefing. Alerts from the last 24h show up in the Brifing block as a "Watcher" line, and Claude will offer to investigate.

### Templates shipped

- `.claude/watchers/project-health.md` — git + npm test + package.json + failures log (15m).
- `.claude/watchers/deploy-watchdog.md` — http health + deploy error log (5m, `active: false` by default — edit URL and flip to `true`).

### Technical
- New `lib/watchers/{index,parse}.js` + `lib/watchers/types/{git,shell,file,log,http}.js`.
- New `lib/schedulers/{index,launchd,systemd,cron}.js`.
- New `lib/commands/agent.js` + wired into `bin/badi.js`.
- 38 new tests in `tests/watcher.test.js` (parse 13, types 10, schedulers 5, runWatcher e2e 2, agent CLI 6 + misc).
- Total suite: **304/304 green** (266 → 304).

### Security notes
- Watchers with `type: shell` execute arbitrary commands. The install flow prints a warning in TTY mode. Treat `.claude/watchers/*.md` as trusted code — do not install third-party watchers blindly.
- `http` type uses `validateUrl()` (helpers.js) for SSRF protection — localhost / private IPs blocked.
- Scheduler unit files are installed at user scope (no sudo). `cron` edits only the user's crontab.

## [1.12.1] - 2026-04-24

Post-release review hotfix. Addresses all 10 findings from the v1.12.0 code review in a single PR.

### Fixed — High

- **Test isolation** — `preferences.js` now honors `BADI_PREFS_HOME` (base dir) and `BADI_PREFS_PATH` (full override). Previously the env var passed by the test harness was a no-op, which meant any test that forgot `--no-save` would write to the real `~/.config/badi/preferences.json`.
- **Non-TTY silent save** — `badi init` no longer writes `defaultHarness` to preferences when running headless without a `--harness` flag. CI pipelines can no longer accidentally pin a harness choice.

### Fixed — Medium

- **Cursor content transform** — Every Cursor-bound file (`.cursor/commands/*.md` and `.cursor/rules/badi-main.mdc`) now opens with a preface that warns about Claude-specific path references (`.claude/hooks/`, subagents, skills). Bodies are still preserved 1:1; the preface is idempotent (re-running install does not stack it).
- **Interactive menu testability** — `parseMenuAnswer()` extracted from `selectHarnessInteractive()` as a pure function and exported. 9 offline tests cover number / id / Enter / invalid / out-of-range / negative / unknown-id paths.

### Fixed — Low

- **Cursor rule header** — dropped the redundant `globs: **/*` line (irrelevant when `alwaysApply: true`).
- **`setPreference` validation** — `defaultHarness` values are validated against the harness registry before writing to disk.
- **Case-insensitive `--harness`** — `badi init --harness CURSOR` / `Gemini` / `ALL` now resolve correctly.
- **Brittle test assertions** — hard-coded `>10` / `>30` thresholds replaced with checks against actual source counts (`readdirSync(SRC/commands).length`, `pass + warn + fail === checks.length`).
- **Cursor directory counting** — removed duplicate `result.created++` for `.cursor/` so the install summary reflects real file/dir creation counts.

### Technical
- `lib/preferences.js` — env-var support + `VALIDATORS` registry.
- `lib/commands/init.js` — `parseMenuAnswer` exported; `selectHarnessInteractive` now delegates parsing; non-TTY branch disables `saveDefault`.
- `lib/harnesses/cursor.js` — `transformCommand()` exported; rule header trimmed; `.cursor/` creation accounting fixed.
- `lib/harnesses/index.js` — `resolveHarnesses` lowercases inputs before lookup.
- `tests/harness.test.js` — 15 new tests (case-insensitive resolve, preface idempotency, rule header shape, `parseMenuAnswer` 9 cases, env-var isolation 2 cases). Total: 266/266 green.

## [1.12.0] - 2026-04-24

### Added — Multi-harness support (issue #54)

Badi now supports multiple LLM CLIs. `badi init` can generate assets for Claude Code, Cursor, or Gemini CLI.

- **Interactive selector** — running `badi init` without flags shows a harness selection menu.
- **`--harness <id>`** — non-interactive install: `claude`, `cursor`, `gemini`, `all`, or comma-separated (`claude,cursor`).
- **Harness-aware update/doctor** — `badi update` and `badi doctor` auto-detect the installed harness and target it.
- **Preferences** — `~/.config/badi/preferences.json` stores `defaultHarness` (the next `badi init` will suggest it). `--no-save` opts out.

### Harness matrix

| Harness | Rules | Commands | MCP | Subagents | Hooks | Skills |
|---------|:-----:|:--------:|:---:|:---------:|:-----:|:------:|
| Claude Code | `CLAUDE.md` | 77 | `.mcp.json` | 21 | 12 | 23 |
| Cursor | `.cursor/rules/badi-main.mdc` | 77 | `.cursor/mcp.json` | — | — | — |
| Gemini CLI | `GEMINI.md` (merged) | inline | `.gemini/settings.json` | — | — | — |

On Cursor 12 hooks + 23 skills are skipped; on Gemini 21 subagents + 77 slash commands are skipped as well — the `badi init` output lists them in a `skippedComponents` report.

### Technical
- New `lib/harnesses/` dir: `claude.js`, `cursor.js`, `gemini.js`, `index.js` (registry + `resolveHarnesses` + `detectHarness`).
- New `lib/preferences.js` — `~/.config/badi/preferences.json` read/write.
- `lib/commands/init.js`, `update.js`, `doctor.js` — refactored to dispatch through the adapter registry. Claude-only behavior preserved when no other harness detected.
- 44 new tests in `tests/harness.test.js` (7 suites: registry, 3 adapters, init/update/doctor CLI flows). Full suite: 251/251 green.

## [1.11.0] - 2026-04-22

### Added — Content Types
- **`badi icerik newsletter [topic]`** — weekly email newsletter scaffold (subject A/B, preview text, hook, CTA, footer, HTML config).
- **`badi icerik podcast [topic]`** — episode notes + show notes skeleton (hook, draft flow by timecode, transcript scaffold, platform metadata, social promo clips).
- **`badi icerik thread [topic]`** — 10-post X/LinkedIn thread (hook → problem → story → 3 key points → counterargument → takeaway → application → CTA, plus engagement strategy).
- **`badi icerik case-study [topic]`** — customer success story with one-liner, headline metric, problem/solution/results table, testimonial, distribution plan.
- All four types support TR + EN via `--lang tr,en`.

### Added — ASO extensions
- **`badi aso playstore <app-id>`** — Google Play audit using existing `lookupPlayStore` scraper.
- **`badi aso reviews <app-id>`** — fetches real iTunes RSS reviews, runs keyword-based sentiment classifier (positive / negative / bug / feature_request / neutral), surfaces top 5 critical reviews + top 5 feature requests.
- **`badi aso screenshots <app-id>`** — app-specific asset dump: orientation split, resolution distribution, sample URLs, sizing advice. The old `badi aso screenshots` (no id) still shows the generic sizing guide.

### Added — SEO extensions
- **`badi seo backlinks <domain>`** — best-effort, free tooling only. Combines a DuckDuckGo mention search (site-exclude filter) with Wayback Machine CDX snapshot presence. Clearly labelled as directional, not a full backlink profile.
- **`badi seo rank <domain> <keyword>`** — DuckDuckGo organic rank check (top ~30 results), highlights position when the domain is found.
- **`badi seo compare <url1> <url2>`** — side-by-side SEO audit across HTTPS, title/meta lengths, OG tags, canonical, heading structure, image alt coverage, word count, schema, HTML size, script count, compression.

### Added — Mobile extensions
- **`badi mobile crash-setup <framework> <provider>`** — Sentry or Crashlytics scaffolding for React Native, Flutter, iOS, and Android with paste-ready config snippets.
- **`badi mobile deeplink [domain|scheme://]`** — validates URL schemes (RFC 3986), fetches `apple-app-site-association` + `assetlinks.json`, reports appIDs, package names, SHA256 fingerprint previews, and tester URL commands.
- **`badi mobile ota [codepush|expo]`** — step-by-step OTA update setup for App Center CodePush (with deprecation notice) and Expo EAS Update (configure → release → rollback).

### Added — Publish Orchestrator
- **`badi publish`** — release orchestrator that runs the full sequence in one command: clean-git check → branch verification → CHANGELOG gate → `package.json` version bump (also `package-lock.json` if present) → commit → tag → push main + tag → `gh release create --generate-notes` → `npm publish --access public`.
- Flags: `--version patch|minor|major`, `--dry-run`, `--skip-npm`, `--skip-github`, `--skip-changelog`, `-m/--message`.
- **`badi publish check`** — pre-flight readiness: git cleanliness, branch, package metadata, CHANGELOG presence, `gh` CLI, `npm whoami`.

### Technical
- `lib/templates/tr.js` + `lib/templates/en.js` — 4 new template functions (newsletter, podcast, thread, caseStudy) per language.
- `lib/aso-helpers.js` — new exports: `fetchAppStoreReviews`, `analyzeSentiment`, `parseScreenshotUrl`.
- `lib/commands/seo.js` — DuckDuckGo uses POST + browser UA so results actually come back (GET returns a shell page).
- `lib/commands/publish.js` — new ~330-line orchestrator module.
- 27 new tests across icerik, aso, seo, mobile, publish test files (total suite 202/202 green).
- No new runtime dependencies.

## [1.10.0] - 2026-04-22

### Added — Frontend Taste (Premium UI Skills)
- **9 bundled design variants** under `.claude/skills/frontend-taste/` — stops Claude Code from producing generic "AI-looking" UI:
  - `default` (design-taste-frontend) — all-rounder with DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY dials
  - `gpt-taste` — strict editorial, AIDA structure, mandatory GSAP ScrollTriggers
  - `minimalist` (minimalist-ui) — Notion / Linear editorial feel
  - `brutalist` (industrial-brutalist-ui) — Swiss typography + raw grid
  - `soft` (high-end-visual-design) — high-end agency feel, spring motion
  - `redesign` (redesign-existing-projects) — audit + fix existing UIs
  - `output` (full-output-enforcement) — anti-truncation, stacks with others
  - `stitch` (stitch-design-taste) — Google Stitch `DESIGN.md` generator
  - `images-first` (image-taste-frontend) — reference-led visual workflow
- **`badi taste` CLI** — inspect, show, prompt, status the bundled variants
  - `badi taste` — list all 9 variants with usage hints
  - `badi taste show <id>` — print a variant's full SKILL.md
  - `badi taste prompt <id>` — show an example Claude Code trigger prompt
  - `badi taste status` — verify 9/9 variants installed
- Trigger in Claude Code by naming the variant in the prompt (e.g. "Use the frontend-taste/brutalist skill.")

### Technical
- `lib/commands/taste.js` — new command module (~170 lines)
- `bin/badi.js` — help and command map updated
- No new dependencies; skills are copied via existing `badi init` / `badi update`
- `package.json` version bumped to 1.10.0

## [1.9.0] - 2026-04-21

### Added — Global Documentation + Built-in Skill
- **English-first documentation**: `README.md` and `CHANGELOG.md` are now English (primary for global npm discovery)
- **Turkish docs preserved**: `README.tr.md` and `CHANGELOG.tr.md` — linked from both sides
- **Mobile App Store Screenshots skill**: `.claude/skills/mobile/app-store-screenshots/` bundled skill
  - Auto-triggers in Claude Code when the user asks for App Store / Google Play screenshots
  - Scaffolds a Next.js project and exports at all Apple / Google required resolutions (html-to-image)
  - Installed automatically via `badi init` — no extra command needed
- `badi mobile assets screenshots` output now references the skill and how to trigger it

### Technical
- New files in `files` array: `README.tr.md`, `CHANGELOG.tr.md`
- `package.json` version bumped to 1.9.0
- CLI output text still Turkish (backward compatible) — full CLI i18n is planned for v1.10

## [1.8.2] - 2026-04-19

### Added
- **`badi update --force`** — Force-refresh slash/agent/hook files (overwrites leftovers from older versions)
- User files are preserved: `memory.md`, `knowledge-base.md`, `workspace/`, `plugins/`, `logs/`, `backups/`
- Clearer update summary — overwritten vs preserved files shown separately
- If no new files were added, the user now sees a hint to try `--force`

### Previous behavior
`badi update` only added new files and did not refresh existing slash/agent content.
With `--force`, a full update is now possible (user customizations are preserved only in the memory/workspace areas).

### Usage
```bash
badi update              # Safe — only missing files
badi update --force      # Full — refresh all content except memory/workspace
badi update --dry-run    # Preview
```

## [1.8.1] - 2026-04-19

### Improved
- `badi doctor` produces more actionable suggestions when issues are detected
- Added a "Troubleshooting" section to the README — common errors + fixes
- Explicit guidance for the missing-hook error (`guard-bash.sh: No such file or directory`)

## [1.8.0] - 2026-04-19

### Added — AI/LLM + DevOps

**badi ai (5 subcommands):**
- `ai token` — `.claude/` token-usage analysis (by category + largest files)
- `ai prompt-test` — Regression tests for slash/agent files
- `ai memory-diff` — `memory.md` + `knowledge-base` limit check
- `ai review` — Staged-diff code review via Claude API (Haiku 4.5)
- `ai translate [file] --to [lang]` — Markdown translation

**badi dev (5 subcommands):**
- `dev deps` — Dependency update analysis (patch/minor/major)
- `dev deps --apply-patch` — Automatic patch-level updates
- `dev bundle` — Bundle size + framework detection + largest assets
- `dev docker-lint` — Dockerfile best practices (FROM/USER/HEALTHCHECK etc.)
- `dev env-check` — `.env` validation (missing/extra/placeholder)
- `dev api-test [url]` — HTTP endpoint tester (method/body/header/expect)

**Slash commands (10 new):**
- `/ai-token`, `/ai-review`, `/ai-translate`, `/prompt-test`, `/memory-diff`
- `/deps-update`, `/bundle-analyze`, `/docker-lint`, `/env-check`, `/api-test`

### Technical
- `lib/commands/ai.js` — Claude API integration (`ANTHROPIC_API_KEY`)
- `lib/commands/dev.js` — npm/yarn/pnpm detect + native tooling
- 11 new tests (total 169)
- **76 slash commands** total (66 + 10)

## [1.7.0] - 2026-04-19

### Added — Missing Slash Commands
CLI commands existed but slash commands were missing — 9 new `.claude/commands/`:
- `/wp` — WordPress site management (v1.4+)
- `/seo` — SEO audit (v1.4+)
- `/aso` — App Store Optimization (v1.5+)
- `/mobile` — Mobile project management (v1.5+)
- `/stats` — Usage analytics (v1.1+)
- `/schedule` — Scheduled reminders (v1.2+)
- `/icerik-ara` — Archive search (v1.2+)
- `/icerik-sablon` — Template inheritance (v1.2+)
- `/icerik-perf` — Content performance (v1.1+)

### Changed — Existing Slash Integrations
Integrated v1.6 CLI tools into existing slash commands:
- `/health` — `badi secret-scan`, `ssl`, `dns`, `lighthouse`, `a11y`
- `/security-scan` — Runs `badi secret-scan` first
- `/audit` — T4-tier Badi CLI suite
- `/deploy` — Pre-deploy `secret-scan --git` (block on critical)
- `/perf-check` — `badi lighthouse` production metrics
- `/changelog` — Quick generation via `badi changelog --write`
- `/release` — 4-command workflow (scan/changelog/check/release)

### Result
- **66 slash commands** (57 + 9)
- **21 CLI commands** (each with a slash counterpart)
- **12 hooks** (all active)
- Layered architecture: CLI → Slash → Agent

## [1.6.0] - 2026-04-19

### Added — Domain Health + Security + Git Workflow

- **`badi ssl [domain]`** — SSL certificate analysis (expiry, TLS version, cipher strength)
- **`badi dns [domain]`** — DNS record audit (A/AAAA/MX/TXT/SPF/DMARC/CAA) + email-security score
- **`badi whois [domain]`** — Domain registration + expiry + transfer lock
- **`badi lighthouse [url]`** — Core Web Vitals + Perf/A11y/SEO/BP via PageSpeed Insights
- **`badi secret-scan`** — 17 patterns (AWS/GCP/GitHub/OpenAI/Stripe/npm/DB URI/private keys); `--git` scans history
- **`badi a11y [url]`** — WCAG 2.1 accessibility audit (axe-core)
- **`badi commit`** — Conventional-commit helper + format validation (`--check`, `--message`)
- **`badi changelog`** — Grouped CHANGELOG.md generation from git log (`--from`, `--to`, `--version`, `--write`)

### Added — Slash Commands (.claude/commands/)
- `/ssl-check` — Badi CLI + interpretation guide
- `/dns-audit` — DNS + email security analysis
- `/whois` — Domain health
- `/lighthouse` — Performance/A11y/SEO audit
- `/secret-scan` — Secret scanning + action plan
- `/a11y-audit` — WCAG compliance + manual-test reminders
- `/conv-commit` — Staged-change analysis + commit
- `/changelog-gen` — Release workflow

### Technical
- `lib/commands/domain.js` — SSL (TLS socket), DNS (`node:dns`), WHOIS (TCP socket)
- `lib/commands/lighthouse.js` — PSI API integration
- `lib/commands/secret-scan.js` — 17 regex patterns, false-positive filter
- `lib/commands/a11y.js` — PSI accessibility category
- `lib/commands/commit.js` — Conventional format regex, git log parsing
- 15 new tests (total 158)

## [1.5.0] - 2026-04-18

### Added — Mobile and ASO

- **`badi aso`** — App Store Optimization command set (closes #47)
  - `audit` — iOS app listing audit + score calculation
  - `keywords` — Title/subtitle/description keyword analysis
  - `metadata` — iOS/Android character-limit guide
  - `review` — Review response templates
  - `compete` — App-to-app comparison + common/unique keywords
  - `screenshots` — iOS/Android size guide
  - `search` — iTunes API app search
- **`badi mobile`** — Mobile project lifecycle (closes #49, #50, #51)
  - `init` — React Native / Flutter / Expo / Swift / Kotlin templates
  - `version bump` — iOS/Android/Flutter version sync (package.json + Info.plist + build.gradle + pubspec.yaml)
  - `build` — iOS/Android release build (RN + Flutter)
  - `release` — TestFlight, Play Internal, App Store, Play guides
  - `assets icon/splash/screenshots` — Size and design guides
- **`badi icerik release-notes`** — App Store/Play Store release notes (closes #48)
  - `--platform ios|android` — 4000 / 500 character limits
  - `--lang tr,en` — Parallel generation
- **`badi icerik post --platform`** — Mobile platform variants (closes #53)
  - `appstore`, `playstore`, `mobile` CTA blocks

### Technical
- `lib/aso-helpers.js` — iTunes Lookup/Search + Play Store scrape
- `lib/commands/aso.js` — 7 subcommands
- `lib/commands/mobile.js` — 5 subcommand groups
- 28 new tests (total 143)

## [1.4.3] - 2026-04-18

### Changed
- External repo references cleaned up (52 files)
- External links removed from README, SECURITY, CHANGELOG
- Metadata simplified in 49 SKILL.md files under `.claude/skills/security-check/`
- Badi-focused metadata (dropped author, homepage, organization fields)

## [1.4.2] - 2026-04-17

### Performance
- **Startup time reduced by ~96%** (813ms → 26ms) — lazy command loading
- `bin/badi.js` now imports commands dynamically — only the invoked command is loaded
- Template lazy loading: TR/EN templates (~800 lines) only loaded during template generation
- `levenshteinDistance` memory reduced from O(m·n) to O(n) (single-row DP)
- Early-exit optimization (length-difference check)

### Measurements
| Command | Before | After | Improvement |
|---------|--------|-------|-------------|
| `badi --version` | 813ms | 26ms | ~97% |
| `badi list --agents` | ~800ms | 29ms | ~96% |

## [1.4.1] - 2026-04-17

### Fixed
- **Security**: SSRF protection added to SEO commands (localhost, private IP, non-http blocked)
- **Security**: WordPress `appPassword` base64 obfuscation + `wp-sites.json` file mode 0600
- **Bug**: `seo sitemap` operator precedence error (considered sitemap found even on 404)
- Increased `wp update` timeout to 120s (previously too short for large sites)
- WP test cleanup improvements

## [1.4.0] - 2026-04-17

### Added
- **`badi wp`** — WordPress site management (digital-agency feature)
  - `wp add/list/remove` — site configuration (WP-CLI or REST API)
  - `wp status` — WP version, active theme, plugin status
  - `wp plugins/themes` — detailed plugin and theme listing
  - `wp update` — bulk core/plugins/themes update
  - `wp security` — 6-point security scan
- **`badi seo`** — SEO audits and analysis
  - `seo audit` — 20+ checks, score calculation
  - `seo meta` — meta tag analysis and missing-tag detection
  - `seo sitemap` — robots.txt + sitemap.xml validation
  - `seo speed` — TTFB, HTML size, resource analysis, compression
- 10 new tests (total 115)

### Fixed
- CI test script compatibility (`tests/` → `tests/*.test.js`)

## [1.3.2] - 2026-04-16

### Fixed
- **CRITICAL**: Command injection — replaced `execSync` with `execFileSync` (plugin.js)
- **CRITICAL**: `guard-bash.sh` pipe chain bug (out-of-project write detection was broken)
- `VERSION` now read from `package.json` (single source, avoids sync drift)
- Habit streak calculation logic bug (stats.js)
- CSV-export formula-injection hardening (stats.js)
- Schedule wrap-around day ranges (sat-sun, fri-mon now work)
- Chalk fallback via Proxy (all chain combinations supported)
- `perf add` atomic append (race condition prevented)
- `session-reset.sh` macOS-incompatible `-printf` removed
- `dependency-audit.sh` cross-platform date + pnpm support
- `badi list` now lists the user's project (not `PKG_ROOT`)
- `badi update` adds `CLAUDE.md` if missing
- `badi icerik ac --open` opens file in editor
- `checkDuplicates` warning code set to `exit(2)` (warning, not error)
- Removed unused imports (helpers.js)
- `schedule parseTimeSpec` invalid-time validation (0-23:0-59)

### Added
- GitHub Actions CI workflow (Node 18/20/22 x ubuntu/macos)
- GitHub Actions publish workflow (npm provenance)
- Dependabot weekly npm + actions updates
- `FUNDING.yml` (GitHub Sponsors + Buy Me a Coffee)
- npm downloads + CI status badges in README
- v1.0.0, v1.1.0, v1.2.0, v1.3.0 GitHub Releases

## [1.3.1] - 2026-04-13

### Added
- 48 security-skill integration
- Full OWASP Top 10 coverage: SQLi, XSS, CSRF, SSRF, RCE, XXE and more
- 7 language-specific security scanners: Go, TypeScript, Python, PHP, Rust, Java, C#
- 3000+ security checklist items
- 4-phase security pipeline: Discover → Scan → Verify → Report
- Confidence scoring to reduce false positives

## [1.3.0] - 2026-04-12

### Changed
- `bin/badi.js` reduced from 3,812 lines to 135 lines (15 ESM modules)
- `CLAUDE.md` simplified from 6.8KB to 1.2KB (~82% reduction)
- Skills optimized from 676KB to 256KB (~62% reduction)
- Commands optimized from 264KB to 236KB
- `track-usage.sh` matcher narrowed (all tools → Bash|Write|Edit)
- 24-hour cache added to `dependency-audit.sh`
- Smart filtering in hooks (skips test/tmp files)
- Log rotation added (usage 1000, incident/failure 500 lines)

## [1.2.0] - 2026-04-12

### Added
- `badi icerik ara` — archive search + similarity detection + `--force`
- `--lang tr,en` — multilingual content generation (TR/EN parallel)
- `badi icerik sablon` — template inheritance (create/list/delete + `--sablon`)
- `badi schedule` — scheduled reminders (add/list/remove/check)
- EN templates: English versions for 6 content types
- Levenshtein + Jaccard similarity algorithms
- Frontmatter parse support
- Default language setting via `preferences.json`
- 33 new tests (total 105)

## [1.1.0] - 2026-04-12

### Added
- `badi stats` — usage statistics (bar chart, trend, habit streak, CSV export)
- `badi completion bash|zsh|fish` — shell-completion script generation
- `badi icerik perf` — content performance tracking (add/list/trend/roi/platform)
- Update notifier — npm registry check, 24-hour cache
- `track-usage.sh` hook — usage logging via PostToolUse
- 24 new tests (total 72)

## [1.0.0] - 2026-04-09

### Added
- 21 expert agents (security, performance, test, API, architecture, content, project planning)
- 50 workflow commands (session, quality, deployment, strategy, content)
- 12 security hooks (guard-bash, branch-guard, backup, completeness-gate)
- 21 skill categories (1,000+ procedures)
- CLI: init, update, doctor, list, plugin subcommands
- Content production engine: post, karousel, video, gorsel, takvim, marka
- Plugin system
- 6-layer memory architecture
- 48 tests
