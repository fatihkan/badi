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

#### Funnel destination — fork before staging (each first-class, not an afterthought to cold/warm/hot)
Pick the conversion destination first, then layer cold → warm → hot inside it:
- **Web conversion** — traffic to a landing page; Pixel + CAPI both feeding one dataset (`action_source=website`). Standard cold→warm→hot retargeting.
- **Click-to-WhatsApp (CTWA)** — messaging-destination funnel; the conversation *is* the funnel. Server signal `action_source=business_messaging` + `ctwa_clid` (+ `messaging_channel`), not an on-page pixel. The sales cycle runs longer than a web lead, so re-engagement timing and the kill clock should reflect that (verify the current attribution window for this funnel type live).
- **Lead Ads / Instant Forms** — on-ad form, no landing page. Ad set carries `promoted_object={page_id}` + `destination_type=ON_AD`, baseline `optimization_goal=LEAD_GENERATION`; the `lead_gen_form_id` binds on the AD CREATIVE, not the ad set. `QUALITY_LEAD` is an opt-in "conversion leads" upgrade that ALSO requires CRM lead-stage events returned via CAPI (`action_source=system_generated` + `lead_id`) — do not present it as the default.

#### Measurement prerequisites (verify live)
Before any READY verdict, the strategist must confirm the tracking the chosen funnel depends on:
- **One dataset, two write-paths** — the browser Pixel (client tag) and the CAPI server endpoint feed ONE shared dataset (the Dataset ID; in the common case the former Pixel ID). Confirm both paths target the same dataset — "pixel" = the browser tag, "dataset" = the container both feed.
- **Deterministic `event_id` dedup** — for a single conversion the Pixel event and the CAPI event must carry an IDENTICAL `event_id` AND the same `event_name`, derived from a stable source (e.g. `order_id` for purchases, the form-submit/lead UUID for leads). A mismatch or missing id double-counts. Dedup is also bounded by a rolling time window — verify the current window live and keep the two timestamps close.
- **`action_source` matches the channel** — required on every server event: `website` (web/Pixel conversions), `business_messaging` (CTWA + messaging, paired with `ctwa_clid`), `system_generated` (CRM lead-stage events, paired with `lead_id`). A wrong value yields unattributed / mis-optimized conversions.
- **PII hash scope** — SHA-256 *after normalization* the identifiers: `em, ph, fn, ln, ct, st, zp, country, external_id` (plus `db/ge` if sent). Keep RAW, never hash: `fbc, fbp, client_ip_address, client_user_agent, ctwa_clid, lead_id, subscription_id, order_id` — hashing these breaks matching/attribution.
- **Server-pipeline count (2026 dedup trap)** — Meta's one-click / "Meta-enabled" CAPI (rolled out 2026) can stand up a SECOND server pipeline on top of an existing CAPI integration; two pipelines emitting mismatched `event_id`s for one conversion double-count. If one-click CAPI is enabled, confirm in Events Manager → Test Events that paired browser/server events read **Deduplicated**, not two separate rows. (Manual AEM event-ranking — the old 8-events step — is auto-managed now; don't configure it by hand.)
- **EEA signal + Pixel auto-enrichment (2026)** — two EU-facing changes to verify: (a) Meta's DMA "less personalized ads" consent split cuts behavioral signal for EEA users, so first-party CAPI is the most reliable remaining input and EU lookalike/retargeting will not match non-EU benchmarks — separate EU campaigns to read performance honestly; (b) the Pixel's AI auto-enrichment (auto-collects page/product/price data) may have defaulted ON — confirm what it sends matches the site's consent scope and privacy policy.

### Step 3: Readiness Gate
Require an explicit verdict:
- **READY TO LAUNCH** — funnel complete (landing page, pixel/CAPI plan, offer clear).
- **FIX FIRST** — launchable after named blockers (e.g., no conversion tracking).
  - *Lead-form immutability* — a published/active Instant Lead Form cannot be edited (API or UI); changing its questions/fields means a NEW `form_id` + rebinding the ad (a new/duplicated creative). FIX FIRST: lock the form's fields before publish — it is editable only while in DRAFT, and duplicate-then-edit is the supported path.
- **DON'T ADVERTISE YET** — spending now would burn budget; say what to build first.

### Step 4: Handoffs
- Creative production → `/content-generate`, `/content-visual-brief`, `/content-video-script`.
- Deeper competitor work → `/competitive-intel`.
- Record the verdict + blockers in the daily note / task board.

# Rules
- **Advisory only** — never call ad-platform APIs, never handle credentials; the user executes spend.
- Policies are researched live, never recalled from training.
- **Safe default: any proposed campaign starts PAUSED** — badi's no-spend posture, not a Meta rule (Meta otherwise creates new campaigns ACTIVE); verify tracking end-to-end before recommending activation.
- An honest DON'T ADVERTISE YET beats a polite launch plan.

# Output Format
- **Verdict** + rationale
- **Offer & Audience** (project-derived, ranked)
- **Market Snapshot** (with sources)
- **Campaign Architecture + Budget** (start / scale / kill)
- **Creative Direction** (handoff-ready)
- **Measurement Plan + Blockers**
