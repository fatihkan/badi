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
- Campaign architecture: Search vs Performance Max trade-off for this product; ad-group theming. For PMax, use the 2026 campaign-level negative keywords to block branded/irrelevant queries and read the new channel + search-term-theme reports to catch Search bleed.
- RSA asset coverage: headlines/descriptions angles derived from real features (hand production to content-*).
- AI Max / Final URL expansion (2026): if enabled, verify tracking templates do not break expanded landing-page URLs (a known 404 risk) and that regulated-industry disclaimers are set; Call Ads were retired in 2026, so if the plan leaned on them, rebuild as RSAs + call assets.
- Quality Score levers: landing page ↔ ad relevance gaps found in the repo's actual pages.
- Conversion tracking prerequisites (what counts as a conversion for this product; GA4/gtag plan), plus the privacy-durable layer to verify before launch:
  - Enhanced Conversions: supplement the gtag/GA4 tag with SHA-256-hashed first-party data (email required) matched to signed-in Google accounts. Google unified the old Web/Leads split into a single on/off toggle in 2026 and auto-migrated accounts — confirm the toggle is still ON and the Customer Data Terms are accepted (a migration can silently leave it off).
  - Offline Conversion Import: capture GCLID at click (or its iOS gbraid/wbraid fallbacks) and upload the CRM close with a conversion timestamp. The supported upload path moved in 2026 — new integrations use the Data Manager API; the legacy Google Ads API `UploadClickConversions` is blocked for integrations that were not already using it, so verify the pipeline still actually writes. Caveat: Enhanced Conversions for Leads does NOT match on gbraid/wbraid — iOS lead conversions stay unattributed, so size that traffic before promising volume.
  - Dedup: one unique transaction_id / order_id shared EXACTLY by the client tag and the upload, or conversions double-count.
  - Consent Mode v2 (ad_storage, analytics_storage, ad_user_data, ad_personalization), required for EEA/UK. In 2026 Google made `ad_storage` the SOLE gatekeeper for EEA ad data reaching Google Ads (decoupled from Google Signals) — verify the CMP passes `granted`/`denied` per user, not a blanket default: a universal `denied` silently zeroes out conversions and remarketing. Confirm current semantics + enforcement live (governance actively changing).
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
