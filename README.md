# BADi: A Workflow Management System for Claude Code

> **Language / Dil:** **English** · [Turkce](README.tr.md)

<p align="center">
  <img src="https://img.shields.io/npm/v/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm downloads per month" />
  <img src="https://img.shields.io/npm/dt/@fatihkan/badi?color=00d4ff&style=flat-square" alt="npm total downloads" />
  <img src="https://img.shields.io/npm/l/@fatihkan/badi?color=00d4ff&style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/tests-1274%20passing-00d4ff?style=flat-square" alt="tests" />
  <img src="https://img.shields.io/badge/node-%3E%3D20.11-00d4ff?style=flat-square" alt="node" />
</p>

**Workflow management CLI for Anthropic Claude Code, Cursor, and Gemini CLI** — built for **Claude Opus 4.7** and **Sonnet 4.6**. Ships **30 AI subagents** (incl. a virtual eng team, ads strategist, and market/SEO/data analysts), **84 slash commands** (profile-based core/dev/content/pentest management since v1.26), **14 automation hooks**, and **62 opt-in skill categories** (25 general + 25 pentest-* advisory/defensive since v1.25 + 12 expo-* mobile dev lifecycle since v1.27) with **prompt-aware auto-routing** for both skills and commands (v1.20+ / v1.26+). OWASP Top 10 scans, code review, content production, mobile/web SEO, App Store market research with `wishlist` + `gaps` analysis. Cuts token consumption ~96% on repetitive workflows. **v1.12+** adds multi-harness support — the same `.claude/` tree compiles into Cursor and Gemini CLI assets. **v1.16+** hardens CodeQL surface (TLS strict-first, DOM-based HTML parsing, URL hostname validation).

## Demo

<!-- assets/demo.gif rendered from assets/demo.tape via `vhs`. See "Render the demo" below. -->
<p align="center">
  <img src="assets/demo.gif" alt="Badi 30-second demo: install, init, doctor, list, skills, stats" />
</p>

> **Render the demo:** `brew install vhs && vhs assets/demo.tape` produces `assets/demo.gif` deterministically. The tape is text-checked into the repo so the GIF is reproducible.

## Install Options (v1.30.1+)

| Channel | Command | Status |
|---------|---------|--------|
| **npm** (primary) | `npm i -g @fatihkan/badi` | ✅ Live |
| **Claude Code marketplace** | `/plugin install fatihkan/badi` | ✅ Live (manifest in repo) |
| **Homebrew** (macOS / Linux) | _planned — tap repo not yet published; use npm_ | ⏳ Planned |
| **Scoop** (Windows) | _planned — bucket repo not yet published; use npm_ | ⏳ Planned |

Source of truth: npm. Other channels mirror the same `@fatihkan/badi-<version>.tgz`. Sha256/hashes are populated by the release workflow (`.github/workflows/dist-publish.yml`). Homebrew and Scoop channels are skeletoned in [`dist/`](dist/README.md) but the **tap/bucket mirror repos (`fatihkan/homebrew-badi`, `fatihkan/scoop-bucket`) are not yet created** — until then, use npm or the Claude Code marketplace.

## One-Command Install

**As a Claude Code plugin (no Node.js required for install)**:

```bash
# Inside Claude Code
/plugin marketplace add fatihkan/badi
/plugin install badi@badi-marketplace
```

**As an npm CLI (full feature set: 30 agents · 84 commands with profile management (v1.26+) · 14 hooks · 62 opt-in skill categories with auto-router)**:

```bash
npx @fatihkan/badi init                    # interactive harness picker
npx @fatihkan/badi init --harness cursor   # non-interactive: Cursor only
npx @fatihkan/badi init --harness all      # write files for every supported harness
```

> The plugin path ships agents, slash commands, and skills via `/plugin install`. The npm path adds hooks, the multi-harness compiler (Cursor / Gemini CLI), and the full `badi` CLI toolchain.

### Windows install (v1.23+)

Badi runs on Windows out of the box: hooks are pure Node.js (no bash required), the scheduler uses Windows Task Scheduler, and `badi doctor` reports OS-aware status.

```powershell
# PowerShell or cmd
npm install -g @fatihkan/badi
badi init --harness claude
badi doctor                    # OS / Bash / Sched / UTF-8 status
```

For Turkish/UTF-8 output in cmd, run `chcp 65001` once or use Windows Terminal / PowerShell 7+. WSL users can install normally — Linux path is auto-detected.

### Supported harnesses (v1.12+)

| Harness | Rules | Commands | MCP | Subagents | Hooks | Skills |
|---------|:-----:|:--------:|:---:|:---------:|:-----:|:------:|
| Claude Code | `CLAUDE.md` | 84 | `.mcp.json` | 30 | 14 | 62 |
| Cursor | `.cursor/rules/badi-main.mdc` | 84 | `.cursor/mcp.json` | — | — | — |
| Gemini CLI | `GEMINI.md` (merged) | inline | `.gemini/settings.json` | — | — | — |
| Windsurf (v1.30+) | `.windsurfrules` (merged) | inline | — | — | — | — |
| AGENTS.md (v1.30+) | `AGENTS.md` (merged) | inline | — | — | — | — |

Claude is the canonical source. Cursor/Gemini/Windsurf/AGENTS.md adapters compile from the same `.claude/` tree. Components a target harness does not support (hooks/skills/subagents) are listed in the `badi init` output under `skippedComponents`. AGENTS.md is the neutral fallback for OpenAI Codex CLI, Aider, and any other tool that reads project-level agent context.

## What You Get

| Feature | Details |
|---------|---------|
| **30 expert agents + 84 commands** | Full toolkit from security scanner to performance profiler, plus a virtual eng team (CEO / eng manager / release manager / QA lead) wired together by `/team`, and an ads strategist (`/meta-review`, `/ads-review`) — profile-based filtering (core/dev/content/pentest) since v1.26 |
| **14 automation hooks + 62 opt-in skill categories** | Branch protection, backups, OWASP Top 10 scanning, 9 Frontend Taste variants. Skills load zero tokens by default since v1.17; auto-router (v1.20+) injects matching skills per prompt; pentest-* family (v1.25+ advisory/defensive); expo-* family (v1.27+ mobile dev lifecycle); command routing (v1.26+); plan-injection hook (v1.30+) |
| **App Store market research** | `badi market discover/reviews/difficulty/wishlist/gaps` — competitor maps, demand×supply matrix (Reddit + App Store), opportunity gap cross-analysis |
| **Multi-harness support (v1.12+, expanded v1.30+)** | Claude Code, Cursor, Gemini CLI, Windsurf, AGENTS.md — same `.claude/` source, 5 targets |
| **Observability (v1.29+) + self-telemetry (v1.30+)** | Read Claude Code transcripts (`badi stats --session/--models/--cost`, `badi search`, `badi session`) + emit own command events (`badi events list/stats`, BADI_TELEMETRY=off to disable) |
| **1274 passing tests** | CLI integration, harness adapters, schema/bundler/publish, watcher/scheduler, market, design, profile management, hook fail-safe resilience, secret-scan hardening, plugin manifest schema, transcript-reader, event emitter, vault frontmatter, hook-path anchoring |
| **Content engine (English)** | Template inheritance, auto-generated posts, threads, newsletters, podcasts, case studies |
| **WordPress + SEO + ASO + Mobile modules** | WP-CLI/REST, 20+ SEO checks, App Store + Play Store, crash/deeplink/OTA scaffolding |
| **Modular architecture** | 36 command modules, `lib/harnesses/` adapter layer, ~6MB `.claude/` tree |
| **Open source (MIT)** | Community-first, transparent licensing |

> CLI language: all output, command grammar, and slash commands are English as of v1.32 (English-only migration complete).

## Quick Start

```bash
# Install
npx @fatihkan/badi init

# Verify
badi doctor

# Daily workflow
badi list --agents     # List 30 agents
badi stats             # Usage analytics
badi schedule list     # Reminders
```

### Auto Skill Router (v1.20+)

Stop manually opting skills in. The router reads each prompt, scores it against the vault's `SKILL.md` descriptions, and injects matching skill bodies into context only when relevant.

```bash
badi skills route "add schema markup for SEO"     # show ranked matches
badi skills route --inject "..." | jq             # SKILL.md bodies + JSON
badi skills auto on                                # install UserPromptSubmit hook
badi skills auto off                               # remove hook
badi skills auto status                            # current state
```

#### Inside a Claude Code session — example flow

```
You ▸ Build a 5-frame carousel for Instagram, keep the brand voice consistent.

[Badi auto-router]
  Based on your prompt, these skills were auto-activated:
  - social-media (score 6) — triggers: instagram, post
  - content (score 4) — triggers: carousel, brief

Claude ▸ {The SKILL.md bodies of social-media + content were injected into
         context — short-form publishing flow, hashtag strategy, and the
         brand-voice consistency guide are now loaded.}
         Building a 5-frame carousel...
```

Per-turn injection: the hook **does not write to the filesystem**, it only adds to that turn's context. The token cost applies only when there is a match — for a short prompt or no match, the hook silently passes.

#### Example 2 — `seo-crawl-budget` skill auto-trigger

```
You ▸ Blog posts on my new domain aren't getting indexed within 24 hours,
       how do I manage crawl budget? I have a long-tail keyword list.

[Badi auto-router]
  Based on your prompt, these skills were auto-activated:
  - seo-crawl-budget (score 12) — triggers: crawl budget, indexing,
    long-tail, search console
  - seo (score 4) — triggers: SEO, keyword

Claude ▸ {seo-crawl-budget SKILL.md injected: 6-phase campaign methodology,
         20-article plan, cyclical internal-link matrix, and Search Console
         actions are loaded.}
         Planning a 20-article campaign: 10 articles in Group A
         (even publishing), 10 articles in Group B (spread over 5 days)...
```

**Manual usage** (without the auto-router):

```bash
badi skills available | grep seo-crawl-budget   # present in the list
badi skills add seo-crawl-budget                  # opt-in (persistent)
badi skills list                                  # see active skills
```

When the skill is active, Claude Code loads the SKILL.md body on `/start` or in a new session. The difference from the auto-router: no persistent activation, it only kicks in on SEO-related prompts (token savings).

### Profile-Based Commands + Command Router (v1.26+)

Same opt-in philosophy applied to the 84 slash commands. Pick a profile (`core`, `dev`, `content`, `pentest`, `all`) to physically filter `.claude/commands/`; the canonical store lives in `.claude/commands-vault/`. The router additionally scores prompts against command descriptions and surfaces top matches as a lightweight hint blob — your skills router hook calls both routers automatically.

```bash
# Profile management
badi commands                              # status: active profile + counts
badi commands profile content --yes        # switch profile, no prompt
badi commands profile dev --dry-run -v     # preview which commands change
badi commands restore                      # back to "all" profile
badi commands available                    # list every command in the vault

# Prompt-aware command routing
badi commands route "write a new post"     # ranked matches
badi commands route "react bug fix" --top 5 --json
echo "release plan" | badi commands route --inject   # hook-format hint blob
```

Full flag list: `badi commands --help` (route flags: `--top N`, `--inject`, `--json`; profile flags: `--yes`, `--dry-run`, `--force`, `--verbose`). User-authored commands (not registered in the profile map) are never touched on profile switch.

### Output Styles + Status Line (v1.22+)

Customize Claude Code response style and the bottom status line:

```bash
# Output styles — concise/detailed/eli5 response modes
badi outputstyle available
badi outputstyle add terse
# Then in Claude Code: /output-style terse

# Status line — branch + skill chip
badi statusline set git           # [branch*]
badi statusline set skill-chip    # [branch] [skills:N]
```

Both write to `.claude/` (output-styles/, status-line/, settings.json) — opt-in, project-scoped.

### MCP Server (v1.23+)

Expose Badi as a [Model Context Protocol](https://modelcontextprotocol.io/) server. Any MCP-compatible client (Claude Code, Cursor, Continue.dev, Claude Desktop) can call Badi tools/resources from any project:

```bash
# One-time install for Claude Code
claude mcp add badi -- npx -y @fatihkan/badi mcp serve

# Or write the .mcp.json snippet manually
badi mcp config > .mcp.json

# Inspect what's exposed
badi mcp tools         # 4 read-only tools
badi mcp resources     # memory, knowledge-base, taskboard
```

Zero external dependencies (JSON-RPC over stdio, ~100 LOC). Tools cover the auto-router (`badi.skills.route`, `.list`, `.available`, `.inject`) — perfect for piping prompt-aware skill injection into other agents.

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
badi content start                         # Morning session
badi content post "topic" --lang tr,en     # Parallel TR/EN generation
badi content carousel "5 tips"             # Carousel template
badi content video "tutorial"              # Video script
badi content search "productivity"            # Archive search
badi content perf --trend                  # Performance tracking
badi content close                         # End-of-day summary
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
badi content release-notes --platform ios --version 2.0.0 --lang tr,en
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
badi content post "launch"                # Social post (3 variants)
badi content carousel "5 tips"            # Instagram/LinkedIn carousel
badi content video "30s demo"             # Video script (hook → beats → CTA)
badi content newsletter "weekly update"   # Email newsletter (v1.11+)
badi content podcast "episode 01"         # Podcast episode + show notes (v1.11+)
badi content thread "10 tips"             # X/LinkedIn 10-post thread (v1.11+)
badi content case-study "acme"            # Customer success story (v1.11+)
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

Comprehensive scanning with the security + pentest-* skill families:

| Category | Scope |
|----------|-------|
| **Injection** | SQLi, NoSQLi, XSS, CSRF, SSRF, SSTI, XXE, Command, LDAP |
| **Auth & Access** | Authentication, Authorization, JWT, Privilege Escalation |
| **Data** | Secret scanning, Crypto, Data exposure |
| **API** | API security, CORS, GraphQL, Rate limiting, WebSocket |
| **Infrastructure** | Docker, IaC, CI/CD security |
| **Language scanners** | Go, TypeScript, Python, PHP, Rust, Java, C# |

4-phase pipeline: **Discover** → **Scan** → **Verify** → **Report**

### Harness-Compatible Artifact Chain (v1.34+)

The `security-check` skill family chains its phases through file contracts, using
the artifact names of [Anthropic's defending-code-reference-harness](https://github.com/anthropics/defending-code-reference-harness)
(Apache-2.0) — badi emits the harness's artifact *names* and verdict vocabulary, so
output is structurally familiar to harness-side tooling (field-level value
compatibility is not guaranteed; badi intentionally diverges in places):

```
THREAT_MODEL.md  →  VULN-FINDINGS.json/.md  →  TRIAGE.json/.md
(threat model)      (raw findings, hunt)       (verified verdicts)
```

Quickstart (skills are opt-in):

```bash
badi skills add security-check pentest-threat-model
# then, in Claude Code:
#   "create a threat model"  → writes THREAT_MODEL.md (commit it)
#   "run security check"     → emits VULN-FINDINGS.json/.md, then TRIAGE.json/.md
```

- `VULN-FINDINGS.json` carries `confidence: null` by design — confidence is authored
  only by the verify stage (`sc-verifier`), never by the producer.
- `TRIAGE.json` records `TRUE_POSITIVE` / `FALSE_POSITIVE` / `CANNOT_VERIFY` verdicts,
  dedupe links (`duplicate_of`), and 0-10 one-decimal confidence scores.
- Interop is **outbound and name-level**; the upstream autonomous pipeline
  (gVisor + ASAN execution) is not reproduced — this is a simplified,
  advisory-only adaptation.
- Gitignore the generated `VULN-FINDINGS.*` / `TRIAGE.*`; commit `THREAT_MODEL.md`.
- Note: `badi security triage` (CLI) is a *deterministic severity filter* over
  `/security-review` reports — distinct from the agentic verify stage above.
- Already activated `security-check` or `pentest-threat-model` before v1.34? Re-activate
  to pick up the chain: `badi skills remove <name> && badi skills add <name>`.

### Security Notes (v1.31.0+)

> ⚠️ **`--dangerously-skip-permissions`**: Claude Code 2.1.126+ (May 2026) widened
> this flag's scope — it now also bypasses writes to `.claude/`, `.git/`, `.vscode/`,
> and shell config files. DO NOT USE this flag in Badi `init`/`update`/CI scripts.
> Only for manual debugging.

> 🔒 **Hook isolation (Claude Code 2.1.139+)**: All 14 of Badi's hooks are in the
> JSON output protocol or log-only category. No terminal manipulation.
> Audit report: [docs/hooks/isolation-audit.md](./docs/hooks/isolation-audit.md).

> 🏢 **Enterprise managed-settings compatibility**: `forceLoginOrgUUID`,
> `allowManagedDomainsOnly`, `allowManagedReadPathsOnly` are compatible with
> Anthropic managed-settings. Details: [docs/enterprise.md](./docs/enterprise.md).

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
badi init [--target DIR] [--force] [--dry-run] [--harness ID]  # Configure (v1.12+: harness; v1.30+: windsurf, agents)
badi update [--target DIR] [--force] [--harness ID]            # Update (--force overwrites)
badi doctor [--target DIR] [--harness ID]                      # Verify setup (auto-detects installed harnesses)
badi list [--agents|--commands|--hooks|--skills|--mcp]  # List components
badi plugin [install|remove|list|show|doctor|graph]     # Plugin management (v1.30+: apiVersion + dep graph)
badi stats [--week|--month|--habits|--export csv|--session|--models|--cost]   # Usage + transcript analytics
badi completion [bash|zsh|fish]                      # Shell completion
badi schedule [add|list|remove|check]                # Reminders
badi content [post|carousel|video|visual|calendar|brand|search|template|perf]
badi wp [add|list|remove|status|plugins|themes|update|security]   # v1.4+
badi seo [audit|meta|sitemap|speed|backlinks|rank|compare]        # v1.4+ (backlinks/rank/compare v1.11+)
badi aso [audit|playstore|keywords|metadata|review|reviews|compete|screenshots|search]  # v1.5+ (playstore/reviews v1.11+)
badi mobile [init|version|build|release|assets|crash-setup|deeplink|ota]  # v1.5+ (crash-setup/deeplink/ota v1.11+)
badi taste [list|show|prompt|status]                              # v1.10+
badi publish [check|--version|--dry-run]                          # v1.11+
badi release check [--bump|--strict|--skip-test]                  # v1.30+ pre-flight verifier
badi agent [create|list|run|install|uninstall|tail|status|remove] # v1.13+
badi plan [list|new|show|status|approve|deny|reset]               # v1.29+ local plan approval
badi search "<query>"                                             # v1.29+ AND search across transcripts
badi session <id-prefix> [--full|--tools|--files]                 # v1.29+ single Claude Code session detail
badi events [list|stats|tail|path|status]                         # v1.30+ self-telemetry (BADI_TELEMETRY=off to disable)
badi ssl|dns|whois [domain]                                       # v1.6+
badi lighthouse|a11y [url]                                        # v1.6+
badi secret-scan [--git]                                          # v1.6+
badi commit|changelog [options]                                   # v1.6+
badi ai [token|prompt-test|memory-diff|review|translate]          # v1.8+
badi dev [deps|bundle|docker-lint|env-check|api-test]             # v1.8+
```

## Agents (30)

| Category | Agents |
|----------|--------|
| **Software** | auditor, security-scanner, performance-profiler, test-strategist, api-designer, migration-pilot, code-generator, refactoring-advisor, architecture-advisor, project-architect |
| **Diagnostics** | archaeologist, error-whisperer, unsticker, yak-shave-detector, debt-collector |
| **Content & Design** | content-creator, visual-director, tasarim-kurator |
| **Strategy & Ops** | product-strategist, engineering-manager, release-manager, qa-lead, ads-strategist, market-researcher, seo-strategist, data-analyst |
| **Support** | coach, onboarding-sherpa, pr-ghostwriter, rubber-duck |

## Directory Structure

```
bin/badi.js            Entry point (thin dispatcher)
lib/                   13 top-level ESM modules
  cli.js               Shared utilities (chalk, figlet, VERSION)
  commands/            36 command modules (init, update, doctor, list,
                       plugin, stats, completion, schedule, wp, seo,
                       security, release, …) + icerik/ and plugin/ splits
  harnesses/           Multi-harness adapters (Claude, Cursor, Gemini, …)
  icerik-helpers.js    Search, similarity, frontmatter
.claude/
  agents/              30 expert agents
  commands/            84 workflow commands (profile-filtered active set)
  commands-vault/      84 commands canonical store
  hooks/               14 automation hooks
  skills-vault/        62 skill categories (25 general + 25 pentest + 12 expo)
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
badi doctor          # Verify 14 hooks are present
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

Badi makes network requests only for the features below. The single automatic one is the session-start dependency audit (24h-cached; disable with `BADI_NO_DEP_AUDIT=1`) — everything else fires only when you invoke it. No payload of yours is ever uploaded anywhere.

| Feature | Endpoint | Purpose |
|---------|----------|---------|
| Update check | `registry.npmjs.org` | Notify when a newer version is published (opt-out: `BADI_NO_UPDATE_NOTIFIER=1`) |
| Dependency audit hook (SessionStart) | package registry via `npm/yarn/pnpm audit` | Vulnerability counts at session start, 24h cache (opt-out: `BADI_NO_DEP_AUDIT=1`) |
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
npm test           # 1274 tests across 222 suites
npm run lint       # Biome code-quality checks
npm run format     # Biome formatting
```

## Version History

| Version | Summary |
|---------|---------|
| **v1.34.0** | **Harness-compatible security artifact chain + `badi security pipeline`.** The `security-check` skill family now chains its phases through file contracts using the artifact names of Anthropic's defending-code-reference-harness (Apache-2.0): `THREAT_MODEL.md → VULN-FINDINGS.json/.md → TRIAGE.json/.md`. `sc-orchestrator` emits raw findings (producer `confidence: null` by design), `sc-verifier` emits triage verdicts (exhaustive 0-100 mapping, `duplicate_of` links), `pentest-threat-model` gains a file-output convention. New read-only CLI: `badi security pipeline [--json]` — per-stage exists/missing/stale + next-step suggestion. Interop is outbound and name-level; the upstream autonomous pipeline (gVisor + ASAN) is deliberately not reproduced. TR headline counts reconciled. 1185 → 1191 tests. |
| **v1.33.2** | **Network transparency + discoverability.** The SessionStart dependency-audit hook's `npm audit` registry call — Badi's only automatic network call — is now disclosed in the README Network Usage table and can be disabled with `BADI_NO_DEP_AUDIT=1` (hook exits before any cache write or registry call; regression-tested). SECURITY.md refreshed (1.33.x, 14 hooks, 62 skill categories). `badi --help` gained six missing sections and the events/security same-line fix; `badi doctor` now verifies all 30 agents; README Version History backfilled (v1.19, v1.28–v1.31). npm keywords broadened for adjacent-ecosystem search (`chatgpt`, `codex`, `openai`, `copilot`…). 1185 tests. |
| **v1.33.1** | **Fix: `badi skills auto on` registered a dead hook.** The prompt-aware auto-router opt-in wrote `bash .claude/hooks/skill-router.sh`, but hooks migrated `.sh → .mjs` (Node) in v1.22 — so the enabled hook silently never ran. Now registers `node .claude/hooks/skill-router.mjs`; test hardened to reject any `bash`/`.sh` form. (14 hook files ship; 13 default-active + `skill-router` opt-in.) 1184 tests. |
| **v1.33.0** | **English-only migration verified clean + research/SEO/data agents + ads layer.** v1.32 renamed the CLI grammar; v1.33 translates every remaining body/comment/string across 60+ surfaces (30 agent bodies, 14 hooks, 84 commands, 59 SKILL.md, lib/tests/docs/dist/watchers) and proves zero residue via **7 rounds of adversarial multi-agent audit** (residue 171→55→6→4→7→0, `VERIFIED CLEAN`). New advisory agents: `ads-strategist` (+ `/meta-review`, `/ads-review`) and the atoms.dev gap-fill trio `market-researcher` / `seo-strategist` / `data-analyst`. Fleet 26→30 agents, 82→84 commands. **Fixed:** `badi init` clean English seed templates — no maintainer-data leak (new `lib/seed/`; `files[]` no longer ships maintainer memory/KB/workspace). 1184 tests. |
| **v1.32.0** | **English-only migration completed + virtual engineering team.** The whole user-facing CLI surface is now English: command output (i18n phases 2p–2s), **command grammar** (`badi icerik`→`badi content`, `badi tasarim`→`badi design`, all subcommands/flags; `karousel`→`carousel`), and **slash commands** (`/icerik-uret`→`/content-generate` … 14 renamed under a `content-` prefix). New managerial agent layer (gstack-inspired "virtual eng team"): `product-strategist` / `engineering-manager` / `release-manager` / `qa-lead` agents + `/ceo-review`, `/eng-review`, `/qa`, `/ship`, and `/team` (end-to-end orchestrator). Fleet 22→26 agents, 77→82 commands. Tooling: biome 2.4.15→2.4.16, actions/checkout 4→6. **Breaking:** old Turkish commands/flags/slash commands are rejected. 1155 tests. |
| **v1.31.0** | **Anthropic Claude Code 2.1.126–2.1.147 compatibility + `badi security` orchestration.** New `badi security baseline/triage/init --ci` bridges Anthropic's native `/security-review` (built-in in 2.1.140+) with a deterministic baseline (secret-scan + audit) and a GitHub Action scaffold wrapping the official `claude-code-security-review`. `/review` reaches `/code-review` (2.1.147+) feature parity (effort levels, `--comment`). Hook terminal-isolation audit (2.1.139+): every hook verified JSON-only stdout / no ANSI / empty stderr (45 new tests). Marketplace manifest gains `lastUpdated` (2.1.144+). 1074 → 1128 tests. |
| **v1.30.x** | **Release pre-flight + self-telemetry + multi-channel distribution.** New `badi release check` (9 pre-flight checks: version presence, CHANGELOG entries, npm test…) and `badi release sync-manifest` (regenerates `.claude-plugin/` JSONs from package.json). New `badi events` self-telemetry — local JSONL command counters/durations, opt-out with `BADI_TELEMETRY=off`. Agent-agnostic context export adapters (`lib/harnesses/_single-file.js` factory), `inject-active-plan` UserPromptSubmit hook, plugin manifest `apiVersion` + `badi plugin doctor/graph`. Homebrew/Scoop distribution mirrors skeletoned in `dist/`. 967 → 1074 tests. |
| **v1.29.0** | **Transcript-based observability + help-doctor.** New commands reading `~/.claude/projects/*.jsonl` locally (privacy-preserving, nothing leaves the machine): `badi stats --session`, `badi search "<query>"` (multi-token AND), `badi session <id-prefix>`, `badi plan list/new/approve/deny` (local plan approval flow), `badi list --mcp`. New help-doctor drift detector (`badi doctor help`) walks every `lib/commands/*.js` and fails CI on help drift. Security hardening pass (6 `/security-scan` findings closed). 915 → 967 tests. |
| **v1.28.0** | **secret-scan critical CI silent-pass fixed.** Empirical probes (planted secrets in a sandbox project) uncovered five real bugs — two merge-blocker critical: a CI pipeline using `badi secret-scan --format json` could pass green despite leaked credentials. Scanner restructured into exported pure functions, configurability + transparency flags added, suite rewritten (4 → 51 tests). Help completeness fixed across CLI surfaces. 868 → 915 tests. |
| **v1.27.0** | **`expo-*` skill family (12 categories, advisory) + hook defensive fail-safe (#162).** Expo + React Native mobile development lifecycle: `expo-orchestrator` + `expo-router` + EAS triplet (build/submit/update) + `expo-config-plugin` + `expo-prebuild` + `expo-modules` + `expo-dev-client` + `expo-notifications` + `expo-app-config` + `expo-troubleshooting`. Each skill is advisory only — Badi guides configuration, command sequences, and trade-offs; user runs build/submit/update themselves. Stack-map: 6 new detection entries (`eas.json`, `expo-router`, `expo-modules`, `expo-notifications`, `expo-dev-client`, `expo-config-plugin`); existing `expo` entry expanded. 13 hooks hardened with a defensive `uncaughtException`/`unhandledRejection` handler that exits 0 (`BADI_HOOK_DEBUG=1` for opt-in stderr). 805 → 868 tests (+53 hook fail-safe resilience). |
| **v1.26.0** | **Profile-based command management + prompt-aware command routing.** New `.claude/commands-vault/` canonical store (77 commands); `badi commands migrate / profile <core\|dev\|content\|all> / restore` filter active commands by profile (core 21 / dev 39 / content 17 / pentest 0). Top 10 verbose commands slimmed ~24% tokens / 45% lines (no info loss). New `badi commands route "<prompt>"` + `--inject` flag; `skill-router.mjs` hook now dispatches to both skills and commands routers. 774 → 805 tests. |
| **v1.25.0** | **pentest-* skill family (25 categories, advisory/defensive).** Authorized penetration-testing engagement discipline added to the vault: orchestrator + engagement + recon + web + api + bizlogic + bugbounty + ad + cloud + mobile + wireless + cicd + social + llm + privesc + credentials + threat-model + detection + forensics + malware + stig + report + ctf + exploit-chain + opsec-evidence. Live exploit / payload / C2 explicitly excluded — methodology, output analysis, detection rule authoring, reporting only. Inspired by 0xSteph/pentest-ai-agents (MIT) engagement discipline (scope-guard, OPSEC QUIET/MODERATE/LOUD, hard refusal). 768 → 774 tests. |
| **v1.24.0** | **Stack-aware skill curation (#152).** New `badi skills detect` (read-only project scan) + `badi skills auto-install` (interactive opt-in) — 35+ technologies → Badi skill manifest. Five signal types: packages, configFiles/Dirs, fileExtensions, manifestKeys, scripts. Inspired by midudev/autoskills install-time model. 727 → 768 tests. |
| **v1.23.0** | **`badi gh sync` + `badi kb` knowledge graph.** GitHub integration (issue → TaskBoard) and knowledge base graph/backlinks/orphans/stats with vanilla SVG (zero CDN). XSS-safe rendering, O(1) graph build, spawnSync 50MB buffers. 624 → 727 tests. |
| **v1.22.x** | **Windows compatibility + MCP server.** 13 bash hooks → Node.js (.mjs); platform-aware launchd/Task Scheduler; MCP stdio JSON-RPC server (`badi mcp serve`); outputstyle + statusline profiles. 577 → 624 tests. |
| **v1.21.0** | **Plugin marketplace polish + auto-router improvements.** |
| **v1.20.0** | **Auto skill router + market Phase 2.** New `badi skills route` and `badi skills auto on/off` — UserPromptSubmit hook reads each prompt, scores it against vault `SKILL.md` triggers (3x weight) + descriptions (1x), and injects matching skill bodies into context per-turn (no filesystem write). Stops manual `skills add` overhead. New `badi market gaps <appId>` — cross-analysis of difficulty + cross-competitor complaints + (optional) Reddit demand into ranked opportunity findings (`gapScore = coverage% × volume × (1 - difficulty/100)`). 538 → 577 tests. Closes #84 phase 2. |
| **v1.19.0** | **`badi market wishlist` (#84 phase 2 start).** Demand × supply matrix: Reddit anonymous JSON search (demand signal, no API key, last 30 days) × App Store search result count (supply signal) → four quadrants `BLUE_OCEAN` / `COMPETITIVE` / `NICHE` / `SATURATED`; `--json` emits a structured report (top posts + subreddits, top apps) for piping. |
| **v1.18.0** | **Agent frontmatter audit + `badi design` Phase 2.** All 22 agents now declare explicit `permissionMode: default`; the 15 read-only / advisor agents add `disallowedTools: [Write, Edit, NotebookEdit]` for defense-in-depth under Claude Code 2.1.119+ headless / `--print` execution. New `tasarim-kurator` agent: interactive DESIGN.md producer with 4-stage flow (brand identity → color psychology → typography → component decisions). New opt-in `design-tokens` skill: when active, agents producing UI/components/visuals consult the project's DESIGN.md frontmatter for canonical tokens. `visual-director` now delegates token reads to `design-tokens` and hands off new color/typography decisions to `tasarim-kurator`. Plus VitePress docs scaffold (GitHub Pages workflow), reproducible vhs demo tape, social preview SVG. 411 → 538 tests. |
| **v1.17.0** | **Opt-in skills (BREAKING).** Skills no longer auto-load. All 23 categories live in `.claude/skills-vault/`; `.claude/skills/` starts empty. New `badi skills` command (status table + interactive picker, `add`/`remove`/`list`/`available`/`clear`/`reset`) lets users opt into exactly what they want. Plugin path also drops the `skills` field — no auto-load tax for plugin consumers either. Saves ~10–15k tokens per turn. Existing installs are protected: `.claude/skills/` is treated as user-customizable on update, so anything already there stays. Token analyzer reports vault size as "Vault (not loaded)" so the savings are visible. |
| **v1.16.5** | **Plugin-level safety hooks.** The Claude Code plugin path now ships two universal Bash safety hooks inline in `plugin.json`: `guard-bash.sh` (blocks `rm -rf /`, force-push to main, `chmod 777`, `curl \| bash`, secret exfiltration, etc.) and `branch-guard.sh` (refuses direct commits to main/master/production and force-push to release/*). Hooks reference scripts via `${CLAUDE_PLUGIN_ROOT}/.claude/hooks/` so they resolve from the plugin cache. Project-state hooks (memory handoff, logs, backups) stay npm-only — they need a writable `.claude/` tree the plugin cache can't provide. |
| **v1.16.4** | **Claude Code plugin distribution.** Badi now installs via `/plugin marketplace add fatihkan/badi` + `/plugin install badi@badi-marketplace` — alongside the existing npm path. New `.claude-plugin/plugin.json` + `marketplace.json` declare 21 agents, 77 commands, and 23 skill categories via custom paths to the canonical `.claude/` tree (no duplication). Both manifests pass `claude plugin validate`; end-to-end smoke-tested. Hooks and the multi-harness compiler stay npm-only — they need a project-local writable `.claude/` tree the plugin cache can't provide. |
| **v1.16.3** | SEO + discoverability push. English-first npm description and keywords (added `anthropic`, `claude`, `claude-opus`, `claude-sonnet`, `ai-agents`, `subagents`, `cli`, `developer-tools`, `security-scanner`, `owasp`, `code-review`, `cursor`, `gemini-cli`; dropped narrow terms). README hero rewritten with Anthropic + Claude Opus 4.7 / Sonnet 4.6 references. GitHub repo description + topics curated (20-topic limit). Component count drift fixed across CLAUDE.md and READMEs (21 agents · 77 commands · 12 hooks · 23 skill categories · 398 tests). Node badge corrected (>=18 → >=20.11). |
| **v1.16.2** | Security + smoke-test hotfix. 8 CodeQL alerts (1 high error + 7 warnings) closed in a single PR: TLS strict-first, backslash escape before quote, `node-html-parser` for script/style strip, URL hostname exact match, workflow permissions. Plus `badi design` smoke fix: `lint` now exits 1 on `summary.errors > 0`; new `--write <path>` flag for `export`; `--out` help text clarified. 395 → 398 tests. v1.16.1 skipped (npm publish 401). |
| **v1.16.0** | `badi design` — visual identity command (closes #58). Wraps Google's `@google/design.md` CLI (pinned `0.1.1`, via `npx`) for lint/export. Subcommands: `init` (skeleton or `--ornek`), `lint`, `export --format tailwind\|dtcg`, `show --tokens\|--prose`. Default location: `.claude/workspace/DESIGN.md`. 16 new tests (379 → 395). |
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
