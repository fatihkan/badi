# Badi - Workflow Management System

> Structured operations management for Claude Code. 30 agents, 86 commands, 14 hooks, 63 opt-in skill categories. v1.20+ prompt-aware skill router; v1.25+ pentest-* family (25 categories, advisory/defensive); v1.26+ profile-based command management (core/dev/content/pentest) + command routing; v1.27+ expo-* family (12 categories, Expo + React Native mobile dev lifecycle); v1.32+ virtual eng team (product-strategist, engineering-manager, release-manager, qa-lead + /ceo-review, /eng-review, /qa, /ship) + the /team orchestrator; v1.33+ ads review (ads-strategist agent + /meta-review + /ads-review, advisory-only). v1.34+ research/SEO/data advisory agents (market-researcher, seo-strategist, data-analyst).

## Memory Rules

| Layer | File | Limit |
|-------|------|-------|
| Session | `.claude/memory.md` | 100 lines; `/clear` when exceeded |
| Knowledge Base | `.claude/knowledge-base.md` | 200 lines, with Auditor approval |
| Task Board | `.claude/workspace/TaskBoard.md` | No limit |
| Skills Vault | `.claude/skills-vault/` | 63 categories (26 general + 25 pentest-* + 12 expo-*), not loaded (opt-in) |
| Active Skills | `.claude/skills/` | User selection (`badi skills`) |
| Commands Vault | `.claude/commands-vault/` | 86 commands canonical (v1.26+), not loaded |
| Active Commands | `.claude/commands/` | Filtered by profile (`badi commands profile`) |

- TBD/TODO/FIXME are **FORBIDDEN** inside `knowledge-base.md`
- A source is mandatory for knowledge entries: `[Kaynak: ...]`
- `settings.json` must be valid JSON; hooks must be executable

## Daily Flow

```
Morning: /start | Midday: /sync | Evening: /wrap-up | When needed: /audit, /review, /unstick
```

## CLI

```bash
badi init | update | doctor | list | plugin | content | stats | completion | schedule
badi skills [available|list|add|remove|clear]    # Opt-in skill management (v1.17+)
badi list --agents|--commands|--hooks|--skills    # Detailed component listing
badi content [post|carousel|video|visual|calendar|brand|search|template|perf]
badi schedule [add|list|remove|check]
```

## Context Health

- Suggest `/clear` when the token limit approaches
- `memory.md` > 80 lines: consolidation warning
- Compaction: `pre-compact-handoff.mjs` → compact → `post-compact-resume.mjs`
