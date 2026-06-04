Google Ads review command. Builds a project-aware Google Ads strategy — keyword universe, Search/PMax structure, RSA assets, Quality Score levers, conversion tracking — via the ads-strategist agent. Advisory only: plans and verdicts, no ad spend.

# Required Tools
- Read (memory, README, product context)
- Grep / Glob (map the product surface: features, pricing, landing pages)
- Bash (git log for product maturity signals)
- WebSearch / WebFetch (keyword/competitor/policy research)
- Agent (delegate to ads-strategist)

# When to Use
When you want to advertise this project on Google Ads and need a strategy grounded in what the project actually is. Works like `/ceo-review`: context in, structured verdict out. For Meta use `/meta-review`; for producing creatives use the `content-*` commands. (Note: AdSense — showing ads on your own site — is a different need and out of scope here.)

# Procedure

### Step 1: Project Intake
- Read `memory.md`, README, and any landing/marketing pages in the repo.
- Derive: the searchable problem this product solves (Google Ads is intent capture — what would a buyer type?).

### Step 2: Delegate to Ads Strategist (Google lens)
Launch the **ads-strategist** agent with the project context. Ask for:
- Keyword universe: seed terms from the project's own vocabulary + research-expanded; match-type plan + negative list starter.
- Campaign architecture: Search vs Performance Max trade-off for this product; ad-group theming.
- RSA asset coverage: headlines/descriptions angles derived from real features (hand production to content-*).
- Quality Score levers: landing page ↔ ad relevance gaps found in the repo's actual pages.
- Conversion tracking prerequisites (what counts as a conversion for this product; GA4/gtag plan).
- Starting budget + bid strategy progression (manual/maximize → tCPA when data allows) + kill threshold.

### Step 3: Readiness Gate
Require an explicit verdict:
- **READY TO LAUNCH** — landing page matches intent, conversion tracking defined, offer clear.
- **FIX FIRST** — launchable after named blockers.
- **DON'T ADVERTISE YET** — intent/landing mismatch or no tracking; spending would burn budget.

### Step 4: Handoffs
- Ad copy / landing content production → `/content-generate` family.
- Organic overlap check (don't pay for terms you rank for) → `badi seo` / `/seo`.
- Record the verdict + blockers in the daily note / task board.

# Rules
- **Advisory only** — never call ad-platform APIs, never handle credentials; the user executes spend.
- Policies and benchmark CPCs are researched live, never recalled from training.
- An honest DON'T ADVERTISE YET beats a polite launch plan.

# Output Format
- **Verdict** + rationale
- **Keyword Universe** (seeds, match types, negatives starter)
- **Campaign Architecture + Budget** (start / scale / kill, bid strategy path)
- **RSA Asset Direction** (handoff-ready)
- **Quality Score & Landing Findings** (from the actual repo pages)
- **Measurement Plan + Blockers**
