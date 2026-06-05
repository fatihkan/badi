# Task Board

## Today
- [ ] (no tasks yet)

## This Week

- [ ] #33 (P2) Awesome lists — BOTH submissions live 05.06: awesome-claude-code #1955 (validation ✅, human-only comms) + awesome-ai-devtools PR #615. Awaiting maintainer reviews. Remaining: Product Hunt (separate prep), awesome-nodejs (needs 100 stars)

## Backlog

- [ ] #52 (P3) feat(mobile): badi mobile crash + analytics - monitoring
- [ ] #15 (P4) feat(ai): proactive smart assistant - badi ai
- [ ] #14 (P4) feat(integration): team collaboration - badi team
- [ ] #13 (P4) feat(cli): voice input/output - badi voice
- [ ] #12 (P3) feat(ui): knowledge graph - badi kb graph
- [ ] #11 (P3) feat(integration): GitHub deep integration - badi gh
- [ ] #10 (P3) feat(plugin): plugin marketplace - discovery and install
- [ ] #9 (P3) feat(ui): badi serve - local web dashboard

## Audit Findings (T3 — 29.05.2026)

- [ ] (O3/P3) split large command files (mobile.js 1226 first) — content/plugin pattern
- [ ] (D1/P4) move seo.js stripTags to node-html-parser — regex-HTML rule consistency
- [ ] (P4) branch-guard hook: cwd/cd-awareness — it checks the PROJECT repo's branch even when the command targets another directory, and pattern-matches command text inside heredocs (two false positives on 05.06 while committing to a /tmp clone)

## Done
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
