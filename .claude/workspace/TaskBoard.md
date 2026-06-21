# Task Board

## Today
- [ ] Watch mode only (feature freeze) — npm publish v1.34.2 pending (user)

## This Week

- [ ] **DISTRIBUTION (CEO directive — not code). Plan + turnkey drafts in `.claude/workspace/launch/`** (2026-06-20 /market + 7-agent workflow). Order:
  1. **awesome-claude-code #1955** — OPEN, bot-validated, not listed; maintainer README is a WIP stub + 300+ queue → **watch only** (AI comments BANNED, browser-UI only).
  2. **Show HN (P1, THIS WEEK)** — owner posts (human-only, no upvote solicitation); draft ready `launch/show-hn.md`. Tue–Thu 9–12 ET.
  3. **README conversion fixes** — single repo-side lever (docs-only = freeze-safe); APPLIED on branch `docs/readme-first-impression` (uncommitted, pending review). ⚠ audit's fabricated ROI table NOT used.
  4. **r/ClaudeAI workflow writeup + dev.to/Hashnode tutorial (P2)** — human-written, value-first, compounding. Drafts `launch/social.md` + full post `launch/blog-post.md`.
  5. **awesome-ai-devtools #616** — OPEN/clean; ping ONLY after ~July 5 silence, one human line.
  6. **Product Hunt → DEFER (P3)** — premature (5 stars, no 400+ list); revisit at ~2k weekly downloads. (Corrects the earlier "PH prep" assumption.)
  - awesome-nodejs: still needs 100 stars (far off).

## Backlog

- [ ] **ON-DECK (freeze-gated, /market 2026-06-20 research)** — new skill+agent ONLY after the
  first organic external signal (3rd freeze exception → owner gate). Ranked leverage:
  (1) skill-integrity auditor (`badi skills add` static-analysis hook — scans for exfil/override/
  dangerous tool calls; 2026's #1 security story, uses existing hook infra, fits the security identity)
  (2) cost-sentinel agent (kill-risk: Anthropic native token analytics could commoditize it).
  GO condition: external signal + existing-hook-only + dogfood validation in the badi repo. Decision via /ceo-review.
- [ ] #52 (P3) feat(mobile): badi mobile crash + analytics - monitoring
- [ ] #15 (P4) feat(ai): proactive smart assistant - badi ai
- [ ] #14 (P4) feat(integration): team collaboration - badi team
- [ ] #13 (P4) feat(cli): voice input/output - badi voice
- [ ] #12 (P3) feat(ui): knowledge graph - badi kb graph
- [ ] #11 (P3) feat(integration): GitHub deep integration - badi gh
- [ ] #10 (P3) feat(plugin): plugin marketplace - discovery and install
- [ ] #9 (P3) feat(ui): badi serve - local web dashboard

## Audit Findings (T3 — 29.05.2026)

- [x] (O3/P3) split large command files — mobile.js (v1.35.0 PR-E) + seo.js (PR-F) DONE; aso.js DEFERRED (thin dispatch layer, low value)
- [~] (P5) seo.js stripTags → node-html-parser — WON'T DO: empirically a behavior regression (`.text` adds newline for `<br>`; doesn't replicate the fixpoint nested-injection collapse). Security already resolved by the fixpoint loop; regex is the correct tool. (v1.35.0 PR-F, rationale in CHANGELOG)
- [x] (P4) branch-guard hook: cwd/cd-awareness — DONE (v1.35.0 PR-C: resolveTargetDir + branchOf + stripHeredocs + segment-walk; fixed 2 false-positives + wrong-repo check)
- [ ] (P4) README.tr deep parity: ~60-80 materially divergent lines, 4 missing EN sections, version history frozen at v1.27 — decision (11.06 review): deprecation-banner approach, full resync only if Turkish-market evidence materializes

## Done
- 2026-06-20 (Sat): **v1.35.0 PUBLISHED on npm** (latest=1.35.0) — #298 + tag + GH release.
  Minor: hardening A-F + /market + /tasks; rolled up v1.34.2 (npm 1.34.1→1.35.0).
  6-lens review + live functional test (branch-guard 7/7, `<<<` bypass fix). 84→86 commands,
  62→63 skills, 1269→1321 tests. **NEXT: distribution/signal (not code) — CEO directive.**
- 2026-06-20 (Sat): **/ceo-review → 2 builds (#292, #293)** — owner exceptions (logged in freeze-exceptions.md).
  #292 `/market` slash + market-research vault skill (WIRING: agent+CLI already existed). #293 `/tasks`
  dependency-aware sequencing ([P]→Workflow parallel(); the one piece distilled from spec-kit, rest KILLed).
  PR #281 "fix" was a non-item (already #283). Commands 84→86, skills 62→63. Freeze still active (5 stars/0 forks).
- 2026-06-20 (Sat): **v1.35.0 hardening round — 6 PRs (#285-#290), accrued in [Unreleased]**
  (no version bump at the time; release cut + v1.34.2 npm publish with the user). Code-grounded
  8-agent scoping workflow → sequential PRs: A doctor-hooks-from-settings + release suite-count +
  --skip-test warn + vault INDEX guard · B parseVersion/bumpVersion/semverGt → helpers.js ·
  C branch-guard cwd/cd awareness · D stats flake fix (BADI_TRANSCRIPTS_ROOT seam) ·
  E mobile.js split + help-doctor directory-module coverage · F seo.js split. Tests 1269→1317.
  DEFERRED: aso split. NOT DONE: seo stripTags→parser (empirical regression).
- 20.06.2026 (Sat): **v1.34.2 + dev-tooling round** — #282 hook commands anchored to
  `$CLAUDE_PROJECT_DIR` (relative `node .claude/hooks/X.mjs` broke every hook when Claude
  was launched from a SUBDIRECTORY → MODULE_NOT_FOUND; reported from e-meta/metaflow) +
  new doctor check `findRelativeHookCommands` (52→53); tests 1269→1274. tag v1.34.2 +
  GH release ready, **npm publish pending (user)**. #283 biome 2.4.16→2.5.0 (config migrate,
  `useIndexOf`, `assets/` excluded from linter), #281 superseded/closed. EOD completeness
  sweep (4 agents) caught a scoop url drift (version 1.34.2 but url badi-1.34.1.tgz) →
  fixed + new `checkScoopManifest` release gate (tests 1274→1279).
- 11.06.2026 (Thu): **3-lens project review** (CEO: feature freeze, target = first organic external signal · ENG: drift root cause = no docs-sync release gate · QA: CLEAN WITH RISKS) → hygiene round: docs credibility PR (README 1161/1184→1191, 27→30, SECURITY.md 1.34.x, scoop manifest, INDEX.md regen 62, docs-sync release gate, memory.md consolidation) + vault validation PR (37× homepage backfill, vault-walking test, doctor 14th hook)
- 06.06.2026 (Sat): **v1.34.0 published on npm** — tag + GH release ✅ (#271 harness-compatible artifact chain THREAT_MODEL→VULN-FINDINGS→TRIAGE folded into security-check; #272 `badi security pipeline` CLI; #273 release). Tests 1185 → 1191
- 06.06.2026: Plan de-risked pre-build — 6-dimension adversarial verification returned NO_GO; 3 blockers fixed before any code (real upstream filename TRIAGE.json, full 11-field VULN-FINDINGS schema, sc-verifier duplication → fold-in); 4-lens diff review fixed 5 more verified findings pre-commit
- 06.06.2026: X tweet reply drafts delivered (4, all <280 chars; 2 flagged as likely bots)
- 05.06.2026 (Fri): **v1.33.2 published on npm** — tag + GH release ✅ (#263-#265: network transparency/BADI_NO_DEP_AUDIT, discoverability keywords, help/doctor hygiene)
- 05.06.2026: evaluate-repository self-review (maintainer's verbatim prompt, independent agent) — 7.5/10 "Recommend with caveats"; top-3 findings fixed in #264
- 05.06.2026: GitHub topics +chatgpt +codex +openai (live); LinkedIn project blurb + post + NotebookLM infographic prompt delivered (not stored)
- 05.06.2026 (Fri): **v1.33.0 + v1.33.1 published on npm** — tags + GitHub releases ✅ (PR #248-#260)
- 05.06.2026: English-only migration VERIFIED CLEAN — 7-round independent adversarial audit (171→0)
- 05.06.2026: 3 advisory agents added (market-researcher/seo-strategist/data-analyst, 27→30) — atoms.dev gap-fill (#251)
- 05.06.2026: `badi skills auto on` dead-hook fix (bash .sh → node .mjs) + hardened test (#259)
- 05.06.2026: Hygiene PR — `--help` events/security same-line bug + missing sections (commands/schedule/agent/transcript/gh-kb/ai-dev); command-index 4 profiles; doctor agent list 21→30; README Version History rows v1.19 + v1.28–v1.31 added; memory/TaskBoard refresh
- 05.06.2026: Small-leftover triage: completion.js "Usage" comments already EN (closed); /icerik-notlari refs are a workspace DATA path (allowlisted, not an issue)
- 04.06.2026 (Thu): **v1.32.0 published on npm** — tag + GitHub release + smoke (npx) ✅
- 03-04.06.2026: i18n 2p-2s (#222/#223/#225/#226) — English-only lib/CLI output done
- 03-04.06.2026: Virtual eng team: 4 agents + /ceo-review /eng-review /qa /ship + /team (#224)
- 03-04.06.2026: CLI grammar English (BREAKING #227) + slash commands content-* (BREAKING #228)
- 03-04.06.2026: dependabot (#221/#198) + biome 2.4.16 migrate (#229) + release PR (#230)
- 04.06.2026: (O2/T3) en.js/tr.js locale parity finding CLOSED — tr.js removed (English-only), parity moot
- 29.05.2026 (Fri): #202 session sync · #197 publish auto-sync + isManifestStale root fix · O1 release check lint gate (audit finding closed)
- 29.05.2026 (Fri): Maintenance round (test/lint/drift/changelog) PR #199 · manifest re-sync PR #200 · T3 audit (KB+taskboard) PR #201
- 22.05.2026 (Fri): #192 hook isolation audit (15 hooks, 2 fixes) — PR #193
- 22.05.2026: #188 /security-review integration + badi security CLI — PR #193
- 22.05.2026: #189 /review effort + --comment + --correctness-only parity — PR #193
- 22.05.2026: #190 marketplace manifest lastUpdated (2.1.144+ compat) — PR #193
- 22.05.2026: #191 CI scaffold (anthropics/claude-code-security-review wrap) — PR #193
