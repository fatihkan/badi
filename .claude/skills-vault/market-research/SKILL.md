---
name: market-research
description: Market and demand research procedures. Niche discovery, demand sizing, competitor/gap analysis, opportunity scoring, and pricing/positioning signals BEFORE building. Triggers on: market research, demand, niche, opportunity sizing, competitor analysis, TAM, positioning, pricing, go-to-market, validate idea, is there demand.
license: MIT
compatibility: Works with Claude Code, Cursor, or any compatible AI coding agent.
allowed-tools: Read Write Edit Bash Grep WebSearch WebFetch
metadata:
  author: fatihkan
  homepage: https://github.com/fatihkan/badi-skills/tree/main/skills/market-research
  badi-version: ">=1.35.0"
  category: market-research
---
# Market Research Skills

> Structured procedures for validating demand and sizing an opportunity before you build. Pairs with the `market-researcher` agent and the `/market` command; for App Store metrics use `badi market`.

## Skill List

### 1. Demand validation
Confirm a real, expressed need exists before committing build time.
- Search the language users actually use (forums, reviews, search suggest, social).
- Distinguish vitamin (nice-to-have) from painkiller (urgent, paid-for) demand.
- Look for existing spend: are people already paying for a worse alternative?
- Output: a demand verdict (strong / weak / none) with the evidence quoted.

### 2. Niche discovery
Find an under-served, winnable segment instead of a crowded horizontal.
- Decompose a broad market into segments by user, use-case, and platform.
- Score each on demand × competition × your unfair advantage.
- Prefer a narrow segment you can dominate over a wide one you can't.

### 3. Opportunity sizing
Put a credible number on the prize.
- Top-down (category size × reachable share) sanity-checked bottom-up
  (reachable users × conversion × price).
- State assumptions explicitly; size a range, not a false-precise point.
- Flag when the honest answer is "too small to matter".

### 4. Competitor + gap analysis
Map who's already here and where the opening is.
- List incumbents; for each: positioning, pricing, strengths, weak reviews.
- Mine 1-2★ reviews of incumbents for the unmet need to build around.
- Name the specific gap (segment, feature, price point, channel) to win on.

### 5. Positioning + pricing signal
Decide how to enter, not just whether.
- Anchor pricing to the value/alternative, not cost; find the willingness-to-pay band.
- Draft a one-line positioning: for [who] who [need], [product] is [category] that [benefit].
- Identify the wedge channel where the target user already congregates.

### 6. Go / shrink / pass decision
Convert research into a decision.
- Synthesize demand + size + gap into a verdict with a confidence level.
- Define the single kill-signal that would reverse a "go".
- Record the read so `/ceo-review` can challenge it.

## How to use
Run `/market` for an agent-driven synthesis, or `badi market discover|reviews|difficulty` for App Store data. This skill provides the methodology the agent and command follow; activate it with `badi skills add market-research`.
