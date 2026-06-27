# Feature-Freeze Exceptions Log

> Freeze (CEO directive): no new features until the FIRST ORGANIC EXTERNAL SIGNAL
> (star/fork/issue from outside). Current: 5 stars / 0 forks / 0 external issues —
> signal NOT arrived. Owner-requested work during the freeze is logged here per the
> product-strategist freeze-exception framework (classify: wiring | hardening |
> feature; only wiring/hardening qualify). 3+ exceptions without the signal → prompt
> the owner to lift/tighten the freeze or change the threshold.

| # | Date | Item | Classification | Verdict | Rationale |
|---|------|------|----------------|---------|-----------|
| 1 | 2026-06-20 | `/market` slash command + market-research vault skill | **wiring** | SHRINK & BUILD | The capability already ships — `badi market` CLI (v1.15) + `market-researcher` agent (v1.34). Only the slash-command wrapper + vault-skill packaging are missing. Completing existing infra, no new logic. |
| 2 | 2026-06-20 | "Fix PR #281" (biome 2.4.16→2.5.0) | n/a | KILL | Already resolved by #283 (merged today); #281 closed/superseded. Non-item. |
| 3 | 2026-06-20 | spec-kit-derived dependency-aware task sequencing → Workflow | **hardening** (engine) | SHRINK & BUILD (engine only) | The one badi-native, non-overlapping idea from spec-kit: a dependency-aware tasks.md whose `[P]` markers feed badi's existing Workflow `parallel()`. The rest of spec-kit (constitution agent, /clarify, /specify, /plan) KILLED — heavy overlap with existing `/architect`, `/brief`, `/proposal`, `/spec-check`, `/team`, `/eng-review`. |
| 4 | 2026-06-26 | Ground `/meta-review` + `/ads-review` + `ads-strategist` in live-verified Meta/Google measurement mechanics (commit `1037613`, branch `feat/ads-review-mechanics`) | **hardening** (existing advisory specs) | BUILD (owner-directed) | Sharpens 3 existing advisory files — no new command/agent/skill surface. 8 Meta + 4 Google mechanics, each live-verified against current docs before edit; mechanics enter as *what to verify*, never as API code. Honors advisory-only + research-live rules; no baked numbers, no source-project naming. Tests 1321 green, doctor 53/0/0. |

## Count
- Exceptions logged without organic signal: **3 build items** (#1 wiring, #3 engine, #4 hardening). #2 is a non-item.
- **GATE FIRED (2026-06-27):** 3rd build exception reached. Owner prompted to lift / tighten / change-threshold → **decision: keep the freeze ACTIVE, threshold unchanged** (target still the first organic external signal). Exceptions remain owner-directed only.
