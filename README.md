# BADi: A Workflow Management System for Claude Code

> **Language / Dil:** **English** · [Turkce](README.tr.md)

<p align="center">
  <img src="https://img.shields.io/npm/v/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm downloads per month" />
  <img src="https://img.shields.io/npm/dt/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm total downloads" />
  <img src="https://img.shields.io/npm/l/@fatihkan/badi?color=00d4ff&style=flat-square" alt="license" />
  <img src="https://github.com/fatihkan/badi/actions/workflows/test.yml/badge.svg" alt="tests" />
  <img src="https://img.shields.io/badge/node-%3E%3D20.11-00d4ff?style=flat-square" alt="node" />
</p>

**Workflow management CLI for Anthropic Claude Code, Cursor, and Gemini CLI** — built for **Claude Opus 4.7** and **Sonnet 4.6**. Ships **22 AI subagents**, **77 slash commands**, **12 automation hooks**, and **24 opt-in skill categories** (OWASP Top 10 scans, code review, content production, mobile/web SEO). Cuts token consumption ~96% on repetitive workflows. **v1.12+** adds multi-harness support — the same `.claude/` tree compiles into Cursor and Gemini CLI assets. **v1.16+** hardens CodeQL surface (TLS strict-first, DOM-based HTML parsing, URL hostname validation).

## Demo

<!-- assets/demo.gif rendered from assets/demo.tape via `vhs`. See "Render the demo" below. -->
<p align="center">
  <img src="assets/demo.gif" alt="Badi 30-second demo: install, init, doctor, list, skills, stats" />
</p>

> **Render the demo:** `brew install vhs && vhs assets/demo.tape` produces `assets/demo.gif` deterministically. The tape is text-checked into the repo so the GIF is reproducible.

## One-Command Install

**As a Claude Code plugin (no Node.js required for install)**:

```bash
# Inside Claude Code
/plugin marketplace add fatihkan/badi
/plugin install badi@badi-marketplace
```

**As an npm CLI (full feature set: 22 agents · 77 commands · 12 hooks · 24 opt-in skill categories)**:

```bash
npx @fatihkan/badi init                    # interactive harness picker
npx @fatihkan/badi init --harness cursor   # non-interactive: Cursor only
npx @fatihkan/badi init --harness all      # write files for every supported harness
```

> The plugin path ships agents, slash commands, and skills via `/plugin install`. The npm path adds hooks, the multi-harness compiler (Cursor / Gemini CLI), and the full `badi` CLI toolchain.

### Supported harnesses (v1.12+)

| Harness | Rules | Commands | MCP | Subagents | Hooks | Skills |
|---------|:-----:|:--------:|:---:|:---------:|:-----:|:------:|
| Claude Code | `CLAUDE.md` | 77 | `.mcp.json` | 22 | 12 | 24 |
| Cursor | `.cursor/rules/badi-main.mdc` | 77 | `.cursor/mcp.json` | — | — | — |
| Gemini CLI | `GEMINI.md` (merged) | inline | `.gemini/settings.json` | — | — | — |

Claude is the canonical source. Cursor and Gemini adapters compile from the same `.claude/` tree. Components a target harness does not support (hooks/skills/subagents on Cursor; commands+everything-else on Gemini) are listed in the `badi init` output under `skippedComponents`.

## What You Get

| Feature | Details |
|---------|---------|
| **22 expert agents + 77 commands** | Full toolkit from security scanner to performance profiler — read-only agents enforce `disallowedTools` for defense-in-depth |
| **12 automation hooks + 24 opt-in skill categories** | Branch protection, backups, OWASP Top 10 scanning, 9 Frontend Taste variants — skills load zero tokens by default since v1.17 |
| **Multi-harness support (v1.12+)** | Claude Code, Cursor, Gemini CLI — same `.claude/` source, different targets |
| **398 passing tests** | CLI integration, harness adapters, schema/bundler/publish, watcher/scheduler, market, tasarim |
| **TR/EN content engine** | Template inheritance, auto-generated posts, threads, newsletters, podcasts, case studies |
| **WordPress + SEO + ASO + Mobile modules** | WP-CLI/REST, 20+ SEO checks, App Store + Play Store, crash/deeplink/OTA scaffolding |
| **Modular architecture** | 22 command modules, `lib/harnesses/` adapter layer, ~6MB `.claude/` tree |
| **Open source (MIT)** | Community-first, transparent licensing |

> Note on CLI language: most CLI output text is currently Turkish (backward-compatible). Docs are English-first; full CLI i18n is on the v1.10 roadmap.

## Quick Start

```bash
# Install
npx @fatihkan/badi init

# Verify
badi doctor

# Daily workflow
badi list --agents     # List 22 agents
badi stats             # Usage analytics
badi schedule list     # Reminders
```

### Software Development
```bash
/start                 # Start the day
/audit                 # Quality audit
/security-scan         # Security scan (48 skills)
/review                # Code review
/wrap-up               # End-of-day summary
```

### Content Production
```bash
badi icerik basla                         # Morning session
badi icerik post "topic" --lang tr,en     # Parallel TR/EN generation
badi icerik karousel "5 tips"             # Carousel template
badi icerik video "tutorial"              # Video script
badi icerik ara "productivity"            # Archive search
badi icerik perf --trend                  # Performance tracking
badi icerik kapat                         # End-of-day summary
```

### WordPress Management (v1.4+)
```bash
badi wp add blog https://blog.com --method rest       # REST API
badi wp add staging --method wp-cli --ssh user@host   # SSH + WP-CLI
badi wp add local --method wp-cli --path /var/www     # Local WP-CLI
badi wp list                                          # Registered sites
badi wp status blog                                   # WP version + theme + plugins
badi wp plugins staging                               # Plugin listing
badi wp update staging all                            # Core + plugins + themes
badi wp security staging                              # 6-point security scan
```

### Mobile Development (v1.5+)
```bash
badi mobile init MyApp --framework react-native      # Project scaffold
badi mobile version bump minor                       # iOS + Android + Flutter sync
badi mobile build ios                                # Release build
badi mobile release testflight                       # TestFlight guide
badi mobile assets icon ./logo-1024.png              # 40+ size guide
badi mobile assets screenshots                       # Sizes + built-in skill
```

### Frontend Taste - Premium UI Skills (v1.10+)
```bash
badi taste                          # List the 9 design variants
badi taste show default             # Print a variant's full SKILL.md
badi taste prompt brutalist         # Show an example trigger prompt
badi taste status                   # Check install (9/9 variants)
```

Nine bundled variants that stop Claude Code from generating generic "AI-looking" UI:

| Variant | When to use |
|---------|-------------|
| **default** | All-rounder. Premium frontend with DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY dials. |
| **gpt-taste** | Strict editorial. Wide typography, AIDA structure, mandatory GSAP ScrollTriggers. |
| **minimalist** | Clean editorial (Notion / Linear feel). Warm monochrome, flat bento grids. |
| **brutalist** | Swiss typographic print + military terminal. Rigid grids, raw structure. |
| **soft** | High-end agency feel. Calm, expensive, premium fonts, spring motion. |
| **redesign** | Audits an existing UI and fixes generic AI patterns without breaking functionality. |
| **output** | Anti-truncation. Stacks with any variant when the agent keeps leaving placeholders. |
| **stitch** | Generates agent-friendly `DESIGN.md` files for Google Stitch. |
| **images-first** | Image-first workflow - generate references, analyze, then implement. |

Trigger in Claude Code by naming the variant in your prompt:

```
Build a premium landing page hero. Use the frontend-taste/default skill.
Redesign this dashboard. Use the frontend-taste/redesign skill.
```

### App Store Market Research (v1.15+)

```bash
badi market 284882215                              # Full report (Facebook example)
badi market 284882215 --country us,gb,de --pages 5 # Multi-region, deeper review pull
badi market discover 284882215 --limit 15          # Competitor discovery only
badi market difficulty 284882215                   # 0-100 score + verdict
```

Combines competitor discovery, multi-region review aggregation, complaint categorization (11 codes), and a difficulty score (BLUE_OCEAN / COMPETITIVE / HARD / SATURATED) into one report. No API keys — uses iTunes Lookup, iTunes Search, and Apple RSS endpoints.

### App Store Optimization (v1.5+, extended in v1.11)
```bash
badi aso audit 284882215                 # App listing audit (iOS)
badi aso playstore com.facebook.katana   # Google Play listing audit (v1.11+)
badi aso reviews 284882215 --country us  # Real reviews + sentiment (v1.11+)
badi aso screenshots 284882215           # App-specific asset analysis (v1.11+)
badi aso keywords 284882215              # Keyword analysis
badi aso compete 284882215 310633997     # Competitor comparison
badi aso metadata appstore               # Character-limit guide
badi icerik release-notes --platform ios --version 2.0.0 --lang tr,en
```

### SEO (extended in v1.11)
```bash
badi seo audit https://example.com       # Full SEO audit (20+ checks)
badi seo meta https://example.com        # Meta-tag analysis
badi seo sitemap https://example.com     # sitemap.xml + robots.txt check
badi seo speed https://example.com       # Page-speed + resource analysis
badi seo backlinks example.com           # DuckDuckGo mentions + Wayback snapshots (v1.11+)
badi seo rank example.com "keyword"      # DuckDuckGo organic rank check (v1.11+)
badi seo compare https://a.com https://b.com  # Side-by-side SEO audit (v1.11+)
```

### Content Templates (extended in v1.11)
```bash
badi icerik post "launch"                # Social post (3 variants)
badi icerik karousel "5 tips"            # Instagram/LinkedIn carousel
badi icerik video "30s demo"             # Video script (hook → beats → CTA)
badi icerik newsletter "weekly update"   # Email newsletter (v1.11+)
badi icerik podcast "episode 01"         # Podcast episode + show notes (v1.11+)
badi icerik thread "10 tips"             # X/LinkedIn 10-post thread (v1.11+)
badi icerik case-study "acme"            # Customer success story (v1.11+)
```

### Mobile (extended in v1.11)
```bash
badi mobile crash-setup react-native sentry       # Sentry/Crashlytics scaffold (v1.11+)
badi mobile deeplink example.com                  # Universal link + AASA/assetlinks (v1.11+)
badi mobile ota expo                              # OTA update setup (v1.11+)
```

### Publish Orchestrator (v1.11+)
One command replaces the full release ritual.
```bash
badi publish check                       # Preflight (git clean, branch, gh/npm auth)
badi publish --dry-run                   # Print every step without applying
badi publish --version minor             # Bump + commit + tag + push + gh release + npm publish
badi publish --skip-npm                  # Git + GitHub only
```

### Domain Health (v1.6+)
```bash
badi ssl example.com              # SSL cert + TLS + cipher
badi dns example.com              # A/MX/SPF/DMARC/CAA + email security score
badi whois example.com            # Registration + expiry + transfer lock
```

### Performance & Accessibility (v1.6+)
```bash
badi lighthouse https://site.com          # Core Web Vitals + Perf/A11y/SEO/BP
badi a11y https://site.com                # WCAG 2.1 (axe-core)
badi secret-scan                          # 17 patterns (working tree)
badi secret-scan --git                    # + last 100 commits
```

### AI/LLM Tools (v1.8+)
```bash
badi ai token                              # .claude/ token-usage analysis
badi ai prompt-test                        # Slash/agent regression tests
badi ai memory-diff                        # memory.md limit check
badi ai review                             # Claude API code review (Haiku 4.5)
badi ai translate file.md --to en          # Markdown translation

# Claude API setup:
export ANTHROPIC_API_KEY=sk-ant-...
```

### DevOps + Code Quality (v1.8+)
```bash
badi dev deps                              # Dependency update analysis
badi dev deps --apply-patch                # Auto patch-level updates
badi dev bundle                            # Bundle size + framework detection
badi dev docker-lint                       # Dockerfile best practices
badi dev env-check                         # .env validation
badi dev api-test https://api.com/health   # HTTP endpoint tester
```

### Git Workflow (v1.6+)
```bash
badi commit                       # Conventional-type suggestions + staged diff
badi commit --check               # Last commit format check
badi commit --message "feat: X"   # Format validation + git commit
badi changelog                    # Preview
badi changelog --write --version 1.6.0   # Write to CHANGELOG.md
```

### SEO Audits (v1.4+)
```bash
badi seo audit https://example.com       # 20+ checks, SEO score
badi seo meta https://example.com        # Meta tag analysis
badi seo sitemap https://example.com     # robots.txt + sitemap.xml
badi seo speed https://example.com       # TTFB + resource analysis
```

SEO audit checks: Title, Description, Open Graph, Twitter Card, H1 structure, image alt tags, canonical URL, viewport, lang, charset, HTTPS, Schema.org, robots meta, word count, link analysis.

### Project Architecture
```bash
/architect             # Turn an idea into 5 documents
/scaffold              # Generate code scaffolding
/adr                   # Architecture Decision Record
/spec-check            # Spec compliance check
```

## Security Layer

Comprehensive scanning with 48 security skills:

| Category | Scope |
|----------|-------|
| **Injection** | SQLi, NoSQLi, XSS, CSRF, SSRF, SSTI, XXE, Command, LDAP |
| **Auth & Access** | Authentication, Authorization, JWT, Privilege Escalation |
| **Data** | Secret scanning, Crypto, Data exposure |
| **API** | API security, CORS, GraphQL, Rate limiting, WebSocket |
| **Infrastructure** | Docker, IaC, CI/CD security |
| **Language scanners** | Go, TypeScript, Python, PHP, Rust, Java, C# |

4-phase pipeline: **Discover** → **Scan** → **Verify** → **Report**

## Performance

| Metric | Before | After |
|--------|--------|-------|
| CLI file | 3,812 lines | 157 lines (17 modules) |
| Startup (v1.4.2) | 813ms | 26ms (**~97% reduction**) |
| Token consumption | ~30K/session | ~2K/session |
| CLAUDE.md | 6.8KB | 1.2KB |
| Hook triggers | 200+/session | ~30/session |
| Template loading | Eager (~800 lines) | Lazy (on demand) |

## CLI Commands

```bash
badi init [--target DIR] [--force] [--dry-run] [--harness ID]  # Configure project (v1.12+: harness picker)
badi update [--target DIR] [--force] [--harness ID]            # Update (--force overwrites)
badi doctor [--target DIR] [--harness ID]                      # Verify setup (auto-detects installed harnesses)
badi list [--agents|--commands|--hooks|--skills]     # List components
badi plugin [install|remove|list]                    # Plugin management
badi stats [--week|--month|--habits|--export csv]    # Usage analytics
badi completion [bash|zsh|fish]                      # Shell completion
badi schedule [add|list|remove|check]                # Reminders
badi icerik [post|karousel|video|gorsel|takvim|marka|ara|sablon|perf]
badi wp [add|list|remove|status|plugins|themes|update|security]   # v1.4+
badi seo [audit|meta|sitemap|speed|backlinks|rank|compare]        # v1.4+ (backlinks/rank/compare v1.11+)
badi aso [audit|playstore|keywords|metadata|review|reviews|compete|screenshots|search]  # v1.5+ (playstore/reviews v1.11+)
badi mobile [init|version|build|release|assets|crash-setup|deeplink|ota]  # v1.5+ (crash-setup/deeplink/ota v1.11+)
badi taste [list|show|prompt|status]                              # v1.10+
badi publish [check|--version|--dry-run]                          # v1.11+
badi agent [create|list|run|install|uninstall|tail|status|remove] # v1.13+
badi ssl|dns|whois [domain]                                       # v1.6+
badi lighthouse|a11y [url]                                        # v1.6+
badi secret-scan [--git]                                          # v1.6+
badi commit|changelog [options]                                   # v1.6+
badi ai [token|prompt-test|memory-diff|review|translate]          # v1.8+
badi dev [deps|bundle|docker-lint|env-check|api-test]             # v1.8+
```

## Agents (21)

| Category | Agents |
|----------|--------|
| **Software** | auditor, security-scanner, performance-profiler, test-strategist, api-designer, migration-pilot, code-generator, refactoring-advisor, architecture-advisor, project-architect |
| **Diagnostics** | archaeologist, error-whisperer, unsticker, yak-shave-detector, debt-collector |
| **Content** | content-creator, visual-director |
| **Support** | coach, onboarding-sherpa, pr-ghostwriter, rubber-duck |

## Directory Structure

```
bin/badi.js            Entry point (157 lines)
lib/                   17 ESM modules
  cli.js               Shared utilities (chalk, figlet, VERSION)
  commands/            11 command modules (init, update, doctor, list,
                       plugin, icerik, stats, completion, schedule,
                       wp, seo)
  templates/           TR/EN template generators
  icerik-helpers.js    Search, similarity, frontmatter
.claude/
  agents/              22 expert agents
  commands/            50 workflow commands
  hooks/               12 automation hooks
  skills/              22 categories + 48 security skills
                       (incl. mobile/app-store-screenshots)
  references/          8 project guides
  workspace/           Content files, task board
  settings.json        Hook configuration
```

## Install Options

```bash
# npm (recommended)
npx @fatihkan/badi init

# Global
npm install -g @fatihkan/badi

# From GitHub
npm install -g github:fatihkan/badi

# Development
git clone https://github.com/fatihkan/badi.git
cd badi && npm install && npm link
```

### Requirements

- **Node.js 18+** ([download](https://nodejs.org))
- **Claude Code** CLI ([installation](https://docs.anthropic.com/en/docs/claude-code))
- **jq** (for hooks: `brew install jq`)

### Shell Completion

```bash
badi completion bash >> ~/.bashrc
badi completion zsh >> ~/.zshrc
badi completion fish > ~/.config/fish/completions/badi.fish
```

## Troubleshooting

### `bash: .claude/hooks/guard-bash.sh: No such file or directory`

A hook is defined in `.claude/settings.json` but the file is missing. Fix:

```bash
badi update          # Adds missing files, preserves user customizations (recommended)
badi doctor          # Verify 12 hooks are present
```

If the problem persists:
```bash
badi update --force  # Force-refresh slash/agent/hook files (preserves memory/workspace)
badi init --force    # Fully reinstall (user customizations are lost)
chmod +x .claude/hooks/*.sh  # If files are not executable
```

### `badi: command not found`

```bash
npm install -g @fatihkan/badi    # Global install
# or
npx @fatihkan/badi doctor         # Run without installing
```

### Hook permission error
```bash
chmod +x .claude/hooks/*.sh
```

### Node version error
Badi requires Node 20.11+:
```bash
node --version   # Must be v20.11.0+
```

### Temporarily disable all hooks
```bash
mv .claude/settings.json .claude/settings.json.bak
```

## Network Usage (Transparency)

Badi makes network requests only when you invoke features that require them. Nothing is sent in the background.

| Feature | Endpoint | Purpose |
|---------|----------|---------|
| Update check | `registry.npmjs.org` | Notify when a newer version is published |
| `badi aso *` | `itunes.apple.com` | App Store listing data |
| `badi seo *` | URL you provide | SEO audits |
| `badi lighthouse`, `badi a11y` | `googleapis.com/pagespeedonline` | PageSpeed Insights |
| `badi ai *` | `api.anthropic.com` | Claude API (requires `ANTHROPIC_API_KEY`) |
| `badi wp *` | Your WordPress site | WP REST/WP-CLI operations |
| `badi dev api-test` | URL you provide | HTTP endpoint testing |

No telemetry, no analytics. See `lib/update-check.js` and `lib/commands/*` for the source.

## Development

```bash
npm install
npm test           # 251 tests (207 CLI + 44 harness adapter)
npm run lint       # Biome code-quality checks
npm run format     # Biome formatting
```

## Version History

| Version | Summary |
|---------|---------|
| **v1.18.0** | **Agent frontmatter audit + `badi tasarim` Phase 2.** All 22 agents now declare explicit `permissionMode: default`; the 15 read-only / advisor agents add `disallowedTools: [Write, Edit, NotebookEdit]` for defense-in-depth under Claude Code 2.1.119+ headless / `--print` execution. New `tasarim-kurator` agent: interactive DESIGN.md producer with 4-stage flow (brand identity → color psychology → typography → component decisions). New opt-in `design-tokens` skill: when active, agents producing UI/components/visuals consult the project's DESIGN.md frontmatter for canonical tokens. `visual-director` now delegates token reads to `design-tokens` and hands off new color/typography decisions to `tasarim-kurator`. Plus VitePress docs scaffold (GitHub Pages workflow), reproducible vhs demo tape, social preview SVG. 411 → 538 tests. |
| **v1.17.0** | **Opt-in skills (BREAKING).** Skills no longer auto-load. All 23 categories live in `.claude/skills-vault/`; `.claude/skills/` starts empty. New `badi skills` command (status table + interactive picker, `add`/`remove`/`list`/`available`/`clear`/`reset`) lets users opt into exactly what they want. Plugin path also drops the `skills` field — no auto-load tax for plugin consumers either. Saves ~10–15k tokens per turn. Existing installs are protected: `.claude/skills/` is treated as user-customizable on update, so anything already there stays. Token analyzer reports vault size as "Vault (yuklenmez)" so the savings are visible. |
| **v1.16.5** | **Plugin-level safety hooks.** The Claude Code plugin path now ships two universal Bash safety hooks inline in `plugin.json`: `guard-bash.sh` (blocks `rm -rf /`, force-push to main, `chmod 777`, `curl \| bash`, secret exfiltration, etc.) and `branch-guard.sh` (refuses direct commits to main/master/production and force-push to release/*). Hooks reference scripts via `${CLAUDE_PLUGIN_ROOT}/.claude/hooks/` so they resolve from the plugin cache. Project-state hooks (memory handoff, logs, backups) stay npm-only — they need a writable `.claude/` tree the plugin cache can't provide. |
| **v1.16.4** | **Claude Code plugin distribution.** Badi now installs via `/plugin marketplace add fatihkan/badi` + `/plugin install badi@badi-marketplace` — alongside the existing npm path. New `.claude-plugin/plugin.json` + `marketplace.json` declare 21 agents, 77 commands, and 23 skill categories via custom paths to the canonical `.claude/` tree (no duplication). Both manifests pass `claude plugin validate`; end-to-end smoke-tested. Hooks and the multi-harness compiler stay npm-only — they need a project-local writable `.claude/` tree the plugin cache can't provide. |
| **v1.16.3** | SEO + discoverability push. English-first npm description and keywords (added `anthropic`, `claude`, `claude-opus`, `claude-sonnet`, `ai-agents`, `subagents`, `cli`, `developer-tools`, `security-scanner`, `owasp`, `code-review`, `cursor`, `gemini-cli`; dropped narrow terms). README hero rewritten with Anthropic + Claude Opus 4.7 / Sonnet 4.6 references. GitHub repo description + topics curated (20-topic limit). Component count drift fixed across CLAUDE.md and READMEs (21 agents · 77 commands · 12 hooks · 23 skill categories · 398 tests). Node badge corrected (>=18 → >=20.11). |
| **v1.16.2** | Security + smoke-test hotfix. 8 CodeQL alerts (1 high error + 7 warnings) closed in a single PR: TLS strict-first, backslash escape before quote, `node-html-parser` for script/style strip, URL hostname exact match, workflow permissions. Plus `badi tasarim` smoke fix: `lint` now exits 1 on `summary.errors > 0`; new `--write <path>` flag for `export`; `--out` help text clarified. 395 → 398 tests. v1.16.1 skipped (npm publish 401). |
| **v1.16.0** | `badi tasarim` — visual identity command (closes #58). Wraps Google's `@google/design.md` CLI (pinned `0.1.1`, via `npx`) for lint/export. Subcommands: `init` (skeleton or `--ornek`), `lint`, `export --format tailwind\|dtcg`, `show --tokens\|--prose`. Default location: `.claude/workspace/DESIGN.md`. 16 new tests (379 → 395). |
| **v1.15.3** | Documentation polish. No code or test changes. |
| **v1.15.2** | Documentation polish. No code or test changes. |
| **v1.15.1** | Documentation polish. No code or test changes. |
| **v1.15.0** | `badi market` — App Store market research command. MVP: competitor discovery + multi-region reviews + 11-code complaint categorization + difficulty score (BLUE_OCEAN / COMPETITIVE / HARD / SATURATED). Subcommands: `discover`, `reviews`, `difficulty`, full report. No API keys. 379 tests (+20). Phase 2 (issues): SensorTower revenue, wishlist demand×supply matrix, opportunity gaps. |
| **v1.14.1** | Drop Node 18 from CI matrix. Tests use `import.meta.dirname` (Node 20.11+); Node 18 row was failing silently. `engines.node` bumped to `>=20.11.0`. No runtime-code changes; production CLI already works on Node 20+. |
| **v1.14.0** | Skill ecosystem MVP — portable skill bundle pipeline. New `lib/skills/schema.js` validator + `lib/harnesses/skills-bundler.js` compiler + `badi publish --skill-bundle` orchestrator. 23 `.claude/skills/*/SKILL.md` enriched with full frontmatter. New `badi-discipline` behavioral skill (8 principles) ready to ship in the separate `badi-skills` repo. Bootstrap kit under `_bootstrap/badi-skills/` for one-time repo setup. 307 → 359 tests (+52). Closes #56 and #57. |
| **v1.13.2** | 7-finding code-review hotfix: UTC-bias in `icerik durum/kapat` "today" counts (now uses local `startOfToday`); `runTemplate` switch hardened with `default: throw`; "unknown subcommand" error lists all 21 valid commands; `icerik.js` shim removed (direct import in `bin/badi.js`); doc/comment polish. 307 tests still green. |
| **v1.13.1** | Hotfix on v1.13.0 review: `agent install` confirmation actually waits for y/N (was logging the prompt then proceeding) + `--yes`/`-y` flag for scripted use. Clean errors for missing watchers in `install` and `tail`. Includes the icerik split refactor (issue #41) — `lib/commands/icerik.js` (1667 lines) split into per-subcommand modules under `lib/commands/icerik/`. 304 → 307 tests. |
| **v1.13.0** | Background agents — define `.claude/watchers/*.md` with git/shell/file/log/http checks, install to launchd/systemd/cron, alerts surface in next `/start` briefing. 8 new `badi agent` subcommands + 2 templates + 38 new tests (total 304). |
| **v1.12.1** | Hotfix — 10 review findings fixed (`BADI_PREFS_HOME` env isolation, non-TTY safe init, Cursor content preface, case-insensitive `--harness`, validation, brittle test cleanup). 266 tests. |
| **v1.12.0** | Multi-harness support — `badi init` now targets Claude Code, Cursor, or Gemini CLI. Interactive picker + `--harness` flag. New `lib/harnesses/` adapter layer. Update + doctor auto-detect installed harnesses. 44 new tests (total 251). |
| **v1.11.0** | Content types (newsletter, podcast, thread, case-study). ASO Play Store + real review sentiment + per-app screenshots. SEO backlinks/rank/compare. Mobile crash-setup/deeplink/ota. `badi publish` release orchestrator. |
| **v1.10.0** | Frontend Taste — 9 bundled premium UI skills + `badi taste` command. Anti-slop design rules for Claude Code. |
| **v1.9.0** | English-first docs (README/CHANGELOG); built-in `app-store-screenshots` skill under `.claude/skills/mobile/` |
| **v1.8.2** | `badi update --force` — force-refresh slash/agent/hook files |
| **v1.8.1** | Troubleshooting guide; better `doctor` output |
| **v1.8.0** | AI/LLM (`badi ai`) + DevOps (`badi dev`) — 10 new CLIs, 10 new slashes |
| **v1.7.0** | 9 new slash commands + slash/CLI integrations (66 slashes total) |
| **v1.6.0** | Domain health (ssl/dns/whois), Lighthouse, secret-scan, a11y, commit/changelog |
| **v1.5.0** | Mobile + ASO: `badi aso` (iTunes API), `badi mobile` (init/build/release/assets), release-notes |
| **v1.4.3** | External references cleaned up, metadata simplified |
| **v1.4.2** | Lazy loading: startup ~97% faster (813ms → 26ms) |
| **v1.4.1** | SSRF protection, appPassword obfuscation, sitemap precedence fix |
| **v1.4.0** | Digital agency: `badi wp` (WordPress) + `badi seo` (20+ checks) |
| **v1.3.2** | 16 bug/security fixes, CI infra, community files |
| **v1.3.1** | 48 security-skill integration |
| **v1.3.0** | Modularization, token optimization, log rotation |
| **v1.2.0** | Content search, multilingual (TR/EN), template inheritance, schedule |
| **v1.1.0** | Stats, completion, content perf tracking, update notifier |
| **v1.0.0** | Initial release: 21 agents, 50 commands, 12 hooks, plugin system |

## License

MIT — [Fatih Kan](https://github.com/fatihkan)

## Contributing

PRs, issues and stars are welcome. See `CONTRIBUTING.md`.
