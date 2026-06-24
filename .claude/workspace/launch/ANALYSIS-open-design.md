# Analysis: nexu-io/open-design → what badi can bring in design-wise (2026-06-24)

> From the `badi-design-from-open-design` workflow (read-only). Freeze active; license = Apache-2.0.
> Informs the visual-director agent + GROWTH-PLAN.md (OG image). Internal doc — may name the repo here, NOT in shipped artifacts.

## What it is (ground truth)
`nexu-io/open-design` — **70.2k stars / 7.9k forks**, Apache-2.0, v0.11.0 (Jun 2026). A local-first open-source "Claude Design alternative": a desktop/web tool that generates UI artifacts via coding agents. Relevant parts: 150 brand **DESIGN.md** files (9-section schema), 100+ design skills, a **5-dimension critique** skill, an **anti-AI-slop checklist**, design-templates (saas-landing…), 93 image/video prompt-templates.

## The most useful, concrete takeaways

### 1. The anti-AI-slop "Seven Cardinal Sins" (P0 ban list) — adopt as a pattern
open-design's `craft/anti-ai-slop.md` bans, machine-enforced:
- default Tailwind **indigo** accent (`#6366f1 #4f46e5 #4338ca #3730a3 #8b5cf6 #7c3aed #a855f7`)
- the two-stop **"trust" gradient** on a hero (purple→blue / blue→cyan / indigo→pink)
- **emoji as feature icons** (use 1.6–1.8px monoline SVG with `currentColor`)
- **rounded card + colored left-border** ("the canonical AI dashboard tile")
- **invented metrics** ("10× faster", "99.9% uptime")
- **filler copy** (lorem ipsum, "feature one/two/three")
- sans-serif on display when a serif seed exists

### 2. The 5-dimension critique rubric — adapt the structure, not the content
open-design scores HTML artifacts 0–10 on: Philosophy consistency · Visual hierarchy · Detail execution · Functionality · Innovation. Discipline: "cite evidence; don't average up; a 7 means strong, not acceptable; numbers without evidence get rejected." Run as a **pre-emit self-check loop**.

## ADOPT (freeze-safe HARDENING candidates — pattern/idea only, no attribution needed)
**A pre-emit self-check section in `visual-director.md`** (~25-30 lines), bundling:
- **(a) Ban list** — adapt the Seven Cardinal Sins to badi's reality (8-10 items: default indigo, purple→blue hero gradient, glowing orbs/lens flare, floating abstract geometry, AI-business-handshake stock, abstract blue data-wave, glass-morphism spam, "Elevate/Seamless/Revolutionary" copy). Gate: any hit → revise before emitting.
- **(b) 5-dimension gate, adapted to badi's output** (visual briefs + AI prompts, not HTML): **Specificity** (concrete hex/dimensions/font+weight) · **Brand fidelity** (colors/fonts from DESIGN.md tokens) · **Anti-cliché** (zero ban-list items) · **Format clarity** (AI-prompt/Canva-note/typography complete) · **Tool feasibility** (a Midjourney/DALL·E/Canva user can execute it). Dims 1 & 3 must pass.

**DEFER (it's a FEATURE, not hardening):** the DESIGN.md **9-section schema enrichment** (Visual Atmosphere dials, a Motion Philosophy section, structured Do's/Don'ts ban-list, and the load-bearing `## 9. Agent Prompt Guide` role→hex quick-reference + copy-pasteable component prompts). Real gaps in badi's DESIGN.md, highest-leverage design improvement — but it changes the user-visible schema + tasarim-kurator flow → **pull first when the freeze lifts.**

## DON'T
- **Don't compete as an AI-design tool** (70k incumbent; badi's design subsystem is a *support feature*, stay narrow).
- **Don't bundle their 150 brand DESIGN.md files** into the shipped package — Apache-2.0 attribution + badi's no-third-party-names-in-shipped rule **collide**; no clean path; no user demand.
- **Don't name the repo** in shipped README/CHANGELOG/source. Internal workspace docs only.

## USE (not adopt) — the highest-leverage action
**Use open-design as a LOCAL DEV TOOL to generate badi's OWN distribution visuals** (clean Apache-2.0 use — consuming a tool, not redistributing their content; repo never named in shipped artifacts):
- Replaces the **$100-200 designer spend** in GROWTH-PLAN.md → a ~1-2 hr manual session; redirects that budget to the $300-500 demo-video editor.
- **Unblocks the dev.to incident post** (currently needs an OG image).
- Produce: **OG image 1200×627** (dev.to + social cards) · **LinkedIn carousel 5×1200×627** (incident-post narrative) · **X header 1600×900** · incident-post hero via a `prompt-templates/` query.
- Workflow: clone locally (NOT a package.json dep) → minimal badi DESIGN.md from existing tokens (primary blue / dark surface / JetBrains Mono) → load `design-templates/saas-landing` → inject badi values → generate HTML → screenshot at the sizes above → apply the ban list before finalizing. Manual one-time session; **do NOT build a schema-bridge script** (maintenance liability).

## Top 3 actions
1. **[freeze-safe HARDENING] Pre-emit gate in `visual-director.md`** (ban list + 5-dim gate, ~30 lines). Every badi-produced asset passes a quality gate going forward. *(See freeze-gate note below.)*
2. **[freeze-safe WIRING] Run the open-design local session** to produce the OG image + carousel + X header (unblocks dev.to). Human action; Claude can draft the token-injection values + the exact hero prompt-template query.
3. **[owner gate] Freeze-exception count**: this adds 2 (gate + tooling) to the existing 2 = **4 ≥ 3 threshold** → the framework prompts the owner to **hold / change-threshold / lift** the freeze. Owner decision, not a build decision.

## Bottom line
This is a **quality + production-tooling** question, not a feature question. The anti-slop gate makes badi's own assets better; the open-design tooling session makes them cheaper/faster and unblocks distribution. Neither changes what badi ships. Schema enrichment + brand-file ingestion + competing = distractions from the one metric: weekly npm downloads.
