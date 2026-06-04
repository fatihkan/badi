Meta (Facebook/Instagram) advertising review command. Builds a project-aware Meta ads strategy — audience, campaign structure, creative angles, budget, policy risks — via the ads-strategist agent. Advisory only: plans and verdicts, no ad spend.

# Required Tools
- Read (memory, README, product context)
- Grep / Glob (map the product surface: features, pricing, landing pages)
- Bash (git log for product maturity signals)
- WebSearch / WebFetch (market + competitor + policy research)
- Agent (delegate to ads-strategist)

# When to Use
When you want to advertise this project on Meta (Facebook/Instagram) and need a strategy grounded in what the project actually is. Works like `/ceo-review`: context in, structured verdict out. For Google Ads use `/ads-review`; for producing the actual creatives use `/content-generate`, `/content-visual-brief`, `/content-video-script`.

# Procedure

### Step 1: Project Intake
- Read `memory.md`, README, and any landing/marketing pages in the repo.
- Derive: what the product does, who it serves, pricing/offer, current maturity (is there something to send traffic TO?).

### Step 2: Delegate to Ads Strategist (Meta lens)
Launch the **ads-strategist** agent with the project context. Ask for:
- Market & competitor research (who advertises in this category on Meta, with what angles).
- 2-3 ranked audience hypotheses (interests, behaviors, lookalike seeds).
- Campaign architecture: funnel stages (cold/warm/hot), CBO vs ABO, Advantage+ trade-offs.
- 3-5 creative angles mapped to funnel stages (hand production to content-* commands).
- Starting budget + scaling rule + kill threshold.
- Policy risk scan (restricted categories, claim rules) — verified by research, not memory.

### Step 3: Readiness Gate
Require an explicit verdict:
- **READY TO LAUNCH** — funnel complete (landing page, pixel/CAPI plan, offer clear).
- **FIX FIRST** — launchable after named blockers (e.g., no conversion tracking).
- **DON'T ADVERTISE YET** — spending now would burn budget; say what to build first.

### Step 4: Handoffs
- Creative production → `/content-generate`, `/content-visual-brief`, `/content-video-script`.
- Deeper competitor work → `/competitive-intel`.
- Record the verdict + blockers in the daily note / task board.

# Rules
- **Advisory only** — never call ad-platform APIs, never handle credentials; the user executes spend.
- Policies are researched live, never recalled from training.
- An honest DON'T ADVERTISE YET beats a polite launch plan.

# Output Format
- **Verdict** + rationale
- **Offer & Audience** (project-derived, ranked)
- **Market Snapshot** (with sources)
- **Campaign Architecture + Budget** (start / scale / kill)
- **Creative Direction** (handoff-ready)
- **Measurement Plan + Blockers**
