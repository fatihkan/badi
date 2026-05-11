# Changelog

> **Language / Dil:** **English** · [Turkce](CHANGELOG.tr.md)

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and [Semantik Versioning](https://semver.org/).

## [Unreleased]

## [1.22.1] - 2026-05-11

### Fixed — Windows ESM URL scheme + chmod assertion (#126 phase 3)

Phase 2 sonrasi kalan iki Windows test failure kategorisi temizlendi:

**ESM URL scheme**: `tests/harness.test.js` icindeki iki dynamic import
Windows absolute path (`D:\...`) ile cagriliyordu. Node 22 ESM loader
reddediyordu (`Received protocol 'd:'`). `pathToFileURL` ile `file://`
URL'e cevrildi.

**chmod assertion**: Eski test `install hook'lari +x yapar` chmod mode
bit'lerini kontrol ediyordu (Windows'ta no-op). Phase 2'de hook'lar
.mjs olduktan sonra +x bit zaten gerekmiyordu; test sadece dosya
varligini kontrol etmeye guncellendi (`statSync` import'u temizlendi).

### Added — Windows kurulum bolumu (README) (#126 phase 4)

README.md ve README.tr.md'ye yeni "Windows install" bolumu eklendi:
- `npm install -g @fatihkan/badi` + `badi init --harness claude`
- `chcp 65001` ipucu (Turkce karakter destegi)
- WSL otomatik tespit notu

### Changed — Bash hooks ported to Node.js (#126 phase 2)

Tum 13 hook script'i `.sh` -> `.mjs` cevrildi. Bash artik gerekli degil;
Windows kullanicilari WSL/Git Bash kurmadan hook'lari calistirabilir.

**Etkilenen dosyalar:**
- 13 yeni `.claude/hooks/<name>.mjs` (eski `.sh` dosyalari silindi)
- `lib/hooks/util.js` — paylasilan yardimcilar (readStdinJson, projectRoot,
  appendLog, writeDecision, truncateLog, vb.)
- `.claude/settings.json` — komutlar `bash X.sh` -> `node X.mjs`
- `lib/harnesses/{claude,cursor,gemini}.js` — `.sh` -> `.mjs` veya
  `.mjs|.sh` cift filtresi (geri uyumluluk)
- `tests/cli.hooks-node.test.js` — 22 yeni test (her hook icin smoke +
  contract). Eski `tests/hooks.test.js` silindi.
- `biome.json` — `package.json` icin 2-space override (npm konvansiyonu)

**Davranis korundu:**
- `guard-bash`: HARD_BLOCK / SOFT_BLOCK / LOG_WARNING uc katmanli izin
- `branch-guard`: main/master/release/* korumasi
- `completeness-gate`: secret patterns (Stripe, GitHub, AWS, Slack, JWT)
  + knowledge-base TBD/TODO + memory.md 100 satir + settings.json JSON
- `dependency-audit`: 24 saat cache + lock dosyasi hash + npm/yarn/pnpm
- `session-reset`: dizin yapisini olustur + counter/marker temizligi +
  log rotasyonu
- `skill-router`: prompt -> matched skill SKILL.md govdesi context
  injection
- log-changes / log-failures / log-stop-verdict / track-usage / pre &
  post-compact: ayni kayit/temizlik akisi

**Test:** 624 -> 642 (+18 net, 22 yeni hook + bazi cross-platform fix)
**Lint:** 0 issue.

### Added — Windows compatibility baseline (#126 phase 1)

`lib/platform.js` capabilities API + Windows Task Scheduler backend +
`badi doctor` Windows-aware section + CI `windows-latest` matrix.

**`lib/platform.js`** — single source of truth for OS detection:

```js
import { isWindows, bashAvailable, getOpener, getSchedulerKind, osSummary } from "./platform.js";
```

Exposes: `platform`, `isMac`, `isLinux`, `isWindows`, `isWsl()`,
`commandExists()`, `bashAvailable()` (handles WSL + Git Bash + native),
`getOpener()` (cmd-args tuple per platform), `getSchedulerKind()`,
`osSummary()`, `utf8Console()`, `utf8Hint()`.

**`badi doctor`** now prints OS / bash / scheduler / UTF-8 status and
warns if Windows + no bash detected (hooks won't run).

**Windows Task Scheduler** (`lib/schedulers/taskscheduler.js`) — full
adapter matching launchd/systemd shape: `id`, `platform`, `isAvailable`,
`install`, `uninstall`, `isInstalled`, `describe`. Auto-selected by
`pickScheduler()` on Windows.

**File opener** (`lib/commands/icerik/ac.js`) — Windows uses
`cmd /c start`, no longer falls back silently.

**CI matrix** — `.github/workflows/test.yml` adds `windows-latest`
alongside ubuntu/macos for Node 20.x and 22.x.

**Follow-up phases** (still in #126):

- Convert bash hooks to Node.js (so they run cross-platform without
  needing bash)
- README Windows install section
- Cmd/PowerShell hook fallback for users without WSL/Git Bash

## [1.22.0] - 2026-05-09

### Added — `badi mcp serve` Model Context Protocol server (#120)

Badi can now expose itself as an MCP server over stdio. External AI
clients (Claude Code, Cursor, Continue.dev, Claude Desktop) can plug
Badi in via `claude mcp add badi -- npx -y @fatihkan/badi mcp serve`
and call Badi tools/resources from any session.

**Tools** (read-only, safe):

- `badi.skills.route` — score matching skills for a given prompt
- `badi.skills.list` — list active opt-in skills
- `badi.skills.available` — list all skill categories in the vault
- `badi.skills.inject` — return concatenated SKILL.md bodies for a prompt

**Resources**:

- `badi://memory` — `.claude/memory.md`
- `badi://knowledge-base` — `.claude/knowledge-base.md`
- `badi://taskboard` — `.claude/workspace/TaskBoard.md`

```bash
# One-time install for Claude Code
claude mcp add badi -- npx -y @fatihkan/badi mcp serve

# Or write the snippet manually
badi mcp config > .mcp.json

# Inspect what's exposed
badi mcp tools
badi mcp resources
```

Zero external dependencies — JSON-RPC over stdio implemented in ~100
LOC; no `@modelcontextprotocol/sdk` required (which pulls express +
hono + zod). MCP spec version `2024-11-05`.

### Added — `outputstyle` and `statusline` commands (#118)

Two new opt-in commands for Claude Code harness customization:

**`badi outputstyle`** — manage `.claude/output-styles/<name>.md`
profiles that Claude Code activates with `/output-style <name>`. Three
built-ins: `terse` (concise, no fluff), `verbose` (detailed rationale +
trade-offs), `eli5` (plain-language explanations).

```bash
badi outputstyle available     # list built-ins
badi outputstyle add terse     # install profile
badi outputstyle list          # show installed
badi outputstyle remove terse
badi outputstyle clear
```

Then in Claude Code: `/output-style terse`

**`badi statusline`** — write `statusLine` config to
`.claude/settings.json` and emit the helper script under
`.claude/status-line/`. Two built-ins: `git` (branch + dirty mark),
`skill-chip` (branch + active skill count).

```bash
badi statusline available
badi statusline set git
badi statusline list
badi statusline reset
```

Restart Claude Code to see the status line update.

### Fixed — lint baseline + dep bump (#119)

- biome lint: 28 errors → 0; refactored 6 `noAssignInExpressions` to
  `for (const m of str.matchAll(regex))` (modern idiom)
- biome.json schema 2.4.8 → 2.4.14 (synced with CLI)
- @biomejs/biome 2.4.13 → 2.4.14
- vitepress 1.6.3 → 1.6.4
- Tests: 580 → 595 (15 new for outputstyle + statusline)

### Notes

- Component count: 79 commands (was 77), 22 agents, 13 hooks, 25 skills
- Three open `npm audit` moderate (transitive `esbuild` via vitepress)
  remain — upstream "no fix available", dev-only

## [1.21.0] - 2026-05-03

### Added — `seo-crawl-budget` skill (#109)

Yeni opt-in skill: dusuk rekabetli long-tail keyword'ler icin 6-24
saatte indexlenme metodolojisi. 20 makalelik kampanya, dongusel
ic-link matrisi, Search Console manuel tetikleme, 6 fazli yapi
(keyword uretimi, brief sablonlari, link matrisi, yayin takvimi,
GSC aksiyonlari, takip metrikleri).

[moneyvadi-prog/crawl-budget-manipulation](https://github.com/moneyvadi-prog/crawl-budget-manipulation)
(MIT, Gulsah Arslan) reposundan adapte edildi.

v1.20 auto-router ile entegre: `badi skills auto on` aktifken
"crawl budget", "long-tail", "search console", "indexleme",
"internal linking" gibi TR/EN trigger'lar prompt'ta gectiginde
SKILL.md govdesi otomatik enjekte edilir.

#### Kullanim — Otomatik mod (onerilir)

```bash
# Bir kerelik kurulum
badi skills auto on
```

Sonrasinda Claude Code icinde dogrudan istersin:

```
You ▸ Yeni blog yazilarim indexlenmiyor, crawl budget yonetimi nasil?
[Badi auto-router]
  - seo-crawl-budget (skor 12) — triggers: crawl budget, indexleme
Claude ▸ {SKILL.md gomulu} 20 makalelik kampanya planliyorum...
```

#### Kullanim — Manuel mod

```bash
badi skills available | grep seo-crawl-budget   # listede mevcut
badi skills add seo-crawl-budget                  # kalici opt-in
badi skills list                                  # aktif skill'leri gor
```

#### Kullanim — Tek seferlik (router olmadan, opt-in olmadan)

```bash
badi skills route --inject "long-tail keyword indexlenme problemi"
# SKILL.md govdesini stdout'a yazar — pipe edip baska araca verebilirsin
```

#### Skill ne uretiyor

Aktif olunca ajan asagidaki dosyalari onerir / sablon olarak verir:

```
seo-campaign-<slug>/
├── keywords-A.json          # 10 esit yayinlanan
├── keywords-B.json          # 10 zamanlanmis
├── briefs/                  # 20 makale brief'i
├── linking-matrix.md        # Dongusel ic-link grafi
├── publication-schedule.csv # Tarih + saat
├── search-console-checklist.md
└── tracking-template.md     # 14-28 gun metrik
```

**Yeni dosyalar**: `.claude/skills-vault/seo-crawl-budget/SKILL.md`.
Test: `tests/cli.skills-router.test.js` TR + EN trigger eslesme
case'leri (3 yeni test, 583 toplam).

Skill kategorileri sayisi: 24 -> 25.

## [1.20.0] - 2026-05-02

### Added — auto skill router (`badi skills route` + `auto on/off`)

Prompt-based otomatik skill activation. Vault'taki SKILL.md
aciklamalarindan keyword indeksi kurulur, kullanici prompt'una karsi
puanlama yapilir. UserPromptSubmit hook'u ile entegre olunca prompt
tipine gore eslesen skill'lerin govdesi context'e inject edilir
(per-turn, filesystem'e yazma yok).

```
badi skills route "SEO icin schema markup ekle"   # eslesenleri puanla
badi skills route --inject "..."                   # SKILL.md govdesi yazar
badi skills auto on                                # hook'u aktif et
badi skills auto off                               # kapat
badi skills auto status                            # durum
```

**Skor formulu**: trigger token (`triggers on:` listesi) eslesmesi 3x,
description token eslesmesi 1x agirlikli. Esik default `minScore=2`,
top default 3 skill. Stopword filtresi (TR + EN) yanlis match'leri
azaltir.

**Auto-router opt-in**: `badi skills auto on` settings.json'a
UserPromptSubmit hook ekler. Hook prompt'u okur, vault'tan eslesen
skill'lerin SKILL.md govdesini Claude'a additionalContext olarak
verir. Token vergisi sadece eslesme oldugunda — prompt 3 kelimeden
kisaysa veya match yoksa hook sessizce gecer.

**Yeni dosyalar**: `lib/skills-router.js` (matcher),
`.claude/hooks/skill-router.sh` (hook), `tests/cli.skills-router.test.js`
(22 test). doctor `skill-router.sh` hook'unu da denetliyor.

### Added — `badi market gaps` (#84 phase 2)

New `gaps` subcommand cross-references the existing market signals into
ranked opportunity findings:

```
badi market gaps 284882215
badi market gaps 284882215 --query "facebook alternative" --json
```

For every cross-competitor complaint code the helper computes a
`gapScore = coverage% * volume * (1 - difficulty/100)`, optionally
boosted by Reddit demand when `--query` is supplied. Each finding
carries a coverage percentage (how many competitors carry the
complaint), volume (negative review count), severity (`HIGH` /
`MEDIUM` / `LOW`), and a one-line human-readable rationale.

Output sorted by `gapScore` descending — top entries are the strongest
signals for "this market segment has a broadly under-served need".
`--json` mode emits the structured report (target + difficulty +
demand + ranked findings).

This closes the third Phase-2 capability for #84. SensorTower revenue
(#84-1) stays blocked on paid API access; `gaps` does not depend on it.

## [1.19.0] - 2026-05-02

### Added — `badi market wishlist` (#84 phase 2)

New subcommand for the demand × supply matrix:

```
badi market wishlist "habit tracker"
badi market wishlist "ai journaling" --json --days 60
```

Demand signal: Reddit anonymous JSON search (no API key, last 30 days
by default). Supply signal: App Store search result count for the
same query. The matrix maps four quadrants: `BLUE_OCEAN` (high demand
× low supply), `COMPETITIVE`, `NICHE`, `SATURATED`.

`--json` flag emits a structured report with the demand sample (top
posts + subreddits) and supply sample (top apps with rating + count)
for piping into other tools.

Implements the second of three Phase-2 capabilities. SensorTower
revenue (#84-1) stays blocked on paid API access; opportunity gaps
cross-analysis (#84-3) follows up.

## [1.18.0] - 2026-05-02

### Added — agent frontmatter audit (#90)

Each of the 21 agents now carries an explicit `permissionMode: default`.
The 15 read-only / advisor agents (archaeologist, api-designer,
architecture-advisor, debt-collector, error-whisperer, migration-pilot,
onboarding-sherpa, performance-profiler, pr-ghostwriter,
refactoring-advisor, rubber-duck, security-scanner, test-strategist,
unsticker, yak-shave-detector) now declare
`disallowedTools: [Write, Edit, NotebookEdit]` for defense-in-depth
under Claude Code 2.1.119+ headless/`--print` execution where these
fields are honored.

A new `tests/agent-frontmatter.test.js` validates the policy on every
run (122 assertions covering all 21 agents).

### Added — `badi tasarim` Phase 2 (#85)

- New `tasarim-kurator` agent — interactive DESIGN.md producer that
  questions brand identity, color psychology, typography character,
  and component decisions, then writes a rationale-rich DESIGN.md
- New `design-tokens` skill (vault) — when active, agents producing
  UI/components/visuals consult the project's DESIGN.md frontmatter
  for canonical tokens instead of inventing ad-hoc values
- `visual-director` agent now declares DESIGN.md delegation: reads
  tokens via `design-tokens`, surfaces brand-drift warnings, hands
  off new color/typography decisions to `tasarim-kurator`

The skill is opt-in (per v1.17 model). Activate via:
```
badi skills add design-tokens
```

## [1.17.0] - 2026-04-29

### Changed — opt-in skills (BREAKING)

Skills are no longer auto-loaded. All 23 skill categories now live in
`.claude/skills-vault/` (Claude Code does NOT scan this directory).
The active `.claude/skills/` folder starts empty; users opt in to
exactly the skills they want via the new `badi skills` command.

**Why:** auto-loading 23 skill categories cost ~10–15k tokens per
turn even when none were used. Opt-in cuts that to zero by default
and lets users dial in the cost they want to pay.

**Plugin path also drops the `skills` field** in `plugin.json`. Plugin
users get the same opt-in flow once they install the npm CLI for
`badi skills` — the plugin itself stops shipping skills entirely so
no auto-load tax for plugin consumers either.

### Added — `badi skills` command

```
badi skills                  # status table + interactive picker
badi skills available        # list every skill in the vault
badi skills list             # list active skills
badi skills add <name…>      # opt one or more in
badi skills remove <name…>   # opt one or more out
badi skills clear            # reset all active skills
badi skills reset            # alias for clear
```

Interactive mode (TTY only) shows a numbered checklist and accepts
selections like `1,3,5-7`, `all`, or `none` to set the active set in
one operation.

### Migration notes

Existing installs are protected: the update path treats
`.claude/skills/` as user-customizable, so anything already there
stays intact. To migrate to the lean default, run
`badi skills clear` and then `badi skills add <only what you need>`.
Token analyzer (`badi ai token`) reports vault size separately as
"Vault (yuklenmez)" so you can see the savings.

## [1.16.5] - 2026-04-29

### Added — plugin-level safety hooks

The Claude Code plugin path now ships two universal safety hooks
inline in `plugin.json`, so `/plugin install badi@badi-marketplace`
gives users the same Bash-level protections as the npm path:

- **`guard-bash.sh`** (PreToolUse, matcher `Bash`) — blocks
  destructive command patterns (`rm -rf /`, force-push to
  main/master, `chmod 777`, `curl | bash`, secret exfiltration,
  `dd of=/dev/`, etc.). Three-tier system: hard-block, prompt,
  allow.
- **`branch-guard.sh`** (PreToolUse, matcher `Bash`) — refuses
  direct `git commit` on `main` / `master` / `production`, and
  `git push --force` on `main` / `master` / `release/*`. Pushes
  to feature branches pass through.

Hooks reference scripts via `${CLAUDE_PLUGIN_ROOT}/.claude/hooks/`
so they resolve correctly from the plugin cache regardless of the
user's project layout.

### Skipped on purpose

Project-state hooks (`pre-compact-handoff`, `post-compact-resume`,
`session-reset`, `track-usage`, `log-*`, `backup-before-write`,
`completeness-gate`, `dependency-audit`) stay npm-only. They depend
on a writable project-local `.claude/` tree (memory.md,
TaskBoard.md, logs/, backups/) that the plugin cache can't provide.
Plugin users who want the full hook suite still get it via
`npx @fatihkan/badi init`.

## [1.16.4] - 2026-04-29

### Added — Claude Code plugin distribution

Badi can now be installed as a Claude Code plugin, in addition to the
existing npm path:

```
/plugin marketplace add fatihkan/badi
/plugin install badi@badi-marketplace
```

Two new manifests under `.claude-plugin/`:

- `plugin.json` — declares 21 agents (`./.claude/agents/*.md`),
  commands (`./.claude/commands`), and skills (`./.claude/skills`) via
  custom paths, so the existing `.claude/` tree stays canonical with
  no duplication. The `agents` field rejects directory paths in the
  current schema, so all 21 agent files are listed individually.
- `marketplace.json` — single-plugin marketplace entry under
  `badi-marketplace` (category: productivity, strict: true).

Both manifests pass `claude plugin validate`. End-to-end smoke-tested
from a real Claude Code session: `marketplace add fatihkan/badi` →
`install badi@badi-marketplace` lands version 1.16.3 in the plugin
cache with the full agent/command/skill tree intact.

`.claude-plugin/` was added to `package.json#files` so the npm tarball
also carries the manifests — a single checkout serves both
distribution channels.

### Distribution scope

| Component | Plugin (`/plugin install`) | npm CLI (`npx @fatihkan/badi init`) |
|-----------|:--------------------------:|:----------------------------------:|
| 21 agents | ✓ | ✓ |
| 77 slash commands | ✓ | ✓ |
| 23 skill categories | ✓ | ✓ |
| 12 automation hooks | — | ✓ |
| Multi-harness compiler (Cursor / Gemini CLI) | — | ✓ |
| `badi` CLI toolchain (icerik / market / tasarim / publish / schedule / list / stats / doctor) | — | ✓ |

Hooks stay npm-only because they need a project-local writable
`.claude/` tree the plugin cache cannot provide (plugin contents are
read-only and cached separately from the user's project).

## [1.16.3] - 2026-04-29

### Changed — discoverability

English-first metadata across npm and GitHub surfaces, plus explicit
references to Anthropic Claude Opus 4.7 and Sonnet 4.6 to broaden
search visibility.

- `package.json` description rewritten in English with brand + model
  versions: "Workflow management CLI for Claude Code, Cursor, and
  Gemini CLI — 21 AI agents, 77 commands, OWASP security scans. Built
  for Anthropic Claude Opus 4.7 and Sonnet 4.6."
- `package.json` keywords curated for SEO: dropped narrow terms
  (`turkish`, `business-operating-system`); added `anthropic`,
  `claude`, `claude-opus`, `claude-sonnet`, `ai-agents`, `subagents`,
  `cli`, `developer-tools`, `security-scanner`, `owasp`,
  `code-review`, `cursor`, `gemini-cli` (20 total).
- README hero (EN + TR) rewritten to lead with Anthropic + Claude
  Opus 4.7 / Sonnet 4.6 + multi-harness support.
- GitHub repo description and topics updated via API: 6 low-value
  topics removed (`typescript`, `nodejs`, `npm-package`,
  `workflow-automation`, `open-source`, `security-scanning`),
  11 high-value topics added (full set above).

### Fixed — count drift

CLAUDE.md and README files were citing inconsistent component counts.
Cross-checked against the filesystem and standardized on:

- 21 agents (`.claude/agents/*.md`)
- 77 commands (`.claude/commands/*.md`)
- 12 hooks (`.claude/hooks/*.sh`)
- 23 skill categories (`.claude/skills/*/`)
- 398 passing tests

CLAUDE.md hero was reading "50 komut, 21 beceri kategorisi"; README
table was citing "25 skill categories" / "395 tests".

### Fixed — node badge

README.md and README.tr.md badge said `node >=18` but `engines.node`
has been `>=20.11.0` since v1.13. Badge now matches.

## [1.16.2] - 2026-04-26

### Fixed — security

8 open CodeQL alerts (1 high-severity error + 7 warnings) closed in
a single PR. Highlights:

- `domain.js`: strict-first TLS connection — only fall back to
  insecure mode on known cert-verify errors (expired, self-signed,
  hostname mismatch). Returned data includes `validForDomain` flag
  surfaced as a new check line in `badi ssl-check` output.
- `skills-bundler.js#formatScalar`: now escapes backslash before
  double-quote — Windows paths and regex-literal-bearing strings
  round-trip losslessly.
- `seo.js#countWords`: switched from regex-based script/style strip
  (CodeQL kept finding bypasses across nesting / attribute-bearing
  closings) to `node-html-parser` DOM tree. New runtime dependency
  but eliminates an entire class of sanitization issues.
- `plugin.js`: `source.includes("github.com")` replaced with
  `new URL(source).hostname` exact match — `evil.com/?github.com=1`
  no longer counted as a GitHub URL.
- `.github/workflows/test.yml`: `permissions: { contents: read }`
  added (other 4 workflows already had explicit permissions).

New rule recorded in `.claude/memory.md`: HTML processing for
sanitization or text extraction must use a parser, not regex.

### Fixed — `badi tasarim`

Manual smoke-test of `badi tasarim` (v1.16.0) revealed three usability
issues. All three closed in this hotfix; tests 395 → 397.

- **Lint exit code now reflects findings.** `badi tasarim lint` was
  returning exit 0 even when the underlying `@google/design.md` lint
  reported errors — silent failure for CI/automation. Now the JSON
  output is parsed; exit 1 if `summary.errors > 0`.
- **`--write` flag for export.** `badi tasarim export` previously
  had no way to direct output to a file (stdout only). Added
  `--write <path>` for explicit file output.
- **Help text clarified.** `--out` documentation now states that it
  is the DESIGN.md file path (init: write target; lint/show/export:
  source). The previous "Cikti dosya yolu" wording mis-implied a
  destination across all subcommands.

Two upstream issues remain (filed as GitHub issues, not addressable
in this repo):
- `@google/design.md@0.1.1` lint emits `raw.match is not a function`
  on the default `badi tasarim init` skeleton.
- `@google/design.md@0.1.1` export returns empty token categories
  for that same skeleton — same parse defect.

## [1.16.0] - 2026-04-26

### Added — `badi tasarim`

Visual identity command. Closes #58. Wraps Google's `@google/design.md`
CLI (pinned to `0.1.1`, called via `npx`) for lint/export and provides
local init/show.

Subcommands:
- `badi tasarim init [--ornek <name>] [--out PATH] [--force]` — write a
  fresh `DESIGN.md` with frontmatter tokens (colors / typography /
  spacing / radius / elevation / components) + 8-section prose
  skeleton. `--ornek paws-and-paths|atmospheric-glass|totality-festival`
  writes a stub pointing to the upstream example.
- `badi tasarim lint [--strict]` — validates `DESIGN.md` via
  `@google/design.md lint`.
- `badi tasarim export --format tailwind|dtcg [--out PATH]` — exports
  tokens to a Tailwind config or DTCG JSON.
- `badi tasarim show [--tokens|--prose]` — prints frontmatter only,
  prose only, or both (default).

Default location: `.claude/workspace/DESIGN.md`. Internet required for
the first `npx` invocation; subsequent runs use cache.

### Tests

379 → 395 (+16). 7 suites covering help, init (default + --ornek +
--force + --out), show (--tokens/--prose/default/missing-file),
export validation, and unknown-subcommand handling.

## [1.15.3] - 2026-04-26

Documentation polish. No code or test changes.

## [1.15.2] - 2026-04-26

Documentation polish. No code or test changes.

## [1.15.1] - 2026-04-26

Documentation polish. No code or test changes.

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
