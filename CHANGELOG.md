# Changelog

> **Language / Dil:** **English** · [Turkce](CHANGELOG.tr.md)

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and [Semantic Versioning](https://semver.org/).

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
