# Analysis: Meta-platform ads mechanics → sharpening badi's `/meta-review` + `/ads-review` (2026-06-26)

> Source: deep read-only of a real, in-production Meta Ads + CAPI + WhatsApp SaaS (the owner's own
> `e-meta` project). Goal: harvest the **concrete Meta-platform mechanics** that badi's two advisory
> ad commands currently describe only abstractly. Freeze active → these are `/ceo-review` HARDENING
> candidates, not an immediate build. The source project is **never named** in any shipped badi file;
> only the generic Meta-platform facts (CAPI, CTWA, event_id dedup) — which are public-API truths — travel.

## The gap (one sentence)
badi's `/meta-review`, `/ads-review`, and `ads-strategist.md` are **strategically complete but mechanically thin**:
they say "pixel/CAPI plan", "conversion tracking", "policy risk", "hash PII" as checkboxes — the source
project proves those checkboxes hide 8 load-bearing mechanics that decide whether a Meta campaign actually
measures conversions or silently burns budget. Adding them makes the advisory verdicts *operationally true*,
not just plausible.

## Ground truth (what the source implements)
A full Meta Ads API surface: campaigns (6 `OUTCOME_*` objectives, default **PAUSED**), adsets
(`QUALITY_LEAD` for lead ads), creatives, custom audiences (SHA-256 PII upload), pixels/datasets,
insights, targeting search, **Lead Ads + Instant Forms**, **CTWA (Click-to-WhatsApp Ads)**, and a
shared **`sendCapiEvents()`** core with a `CapiEvent` idempotency ledger. This is exactly the
"send-traffic-TO + measure-it" layer badi's commands gate on.

## ADOPT — ranked HARDENING candidates (sharpen existing specs; no new command/agent/skill surface)

| # | Mechanic (generic Meta fact) | Why it matters | Lands in |
|---|------------------------------|----------------|----------|
| 1 | **Deterministic `event_id` dedup** — pixel and CAPI must fire the *same* `event_id` per conversion (e.g. `lead:<id>:<stage>`) or Meta double-counts. | The single most common silent measurement bug. badi's specs say "dedup" without saying *how*. | `meta-review.md` Measurement; `ads-strategist.md` Measurement Plan |
| 2 | **Pixel ≠ Dataset** — same object, two roles: browser pixel (client) vs CAPI dataset (server-side `/events` edge). | badi conflates them ("pixel/CAPI plan"). Naming the split is the prerequisite to #1. | `meta-review.md` Step 2 / Measurement |
| 3 | **`action_source` per channel** — `website` (pixel) vs `business_messaging` (CTWA) vs `system_generated` (Lead Ads). Wrong value = unattributed. | badi treats all Meta conversions uniformly; the funnel destination dictates the setup. | `meta-review.md` Campaign Architecture |
| 4 | **PII hashing scope** — hash em/ph/fn/ln/zip/country (SHA-256, normalized); keep `ctwa_clid`/`lead_id`/`fbc`/`fbp`/IP **raw** (hashing identifiers breaks attribution). | badi says "hash PII" generically — hashing the wrong field silently kills the match. Real policy nuance. | `ads-strategist.md` Boundaries; `meta-review.md` Rules |
| 5 | **Attribution window varies by funnel** — CTWA ~90-day click window vs Lead Ads ~28-day. Drives re-engagement timing + the kill-threshold clock. | badi's kill/scale thresholds assume one window. | `meta-review.md` Budget (start/scale/kill) |
| 6 | **CTWA / Lead Ads as first-class Meta funnels** — click-to-WhatsApp and Instant Lead Forms are objectives (`OUTCOME_LEADS` + `QUALITY_LEAD` + `lead_gen_form_id`, `destination_type=ON_AD`), not afterthoughts. | badi's Meta lens only names cold/warm/hot + Advantage+; messaging/lead funnels are a whole branch it omits. | `meta-review.md` Step 2 (add a funnel-type fork); `ads-strategist.md` Platform Lenses |
| 7 | **Default-PAUSED + two-source token pattern** — never auto-activate; env system-user token (permanent) → user token (60-day refresh) fallback. | Reinforces badi's *advisory-only / no-spend* boundary with a concrete safe-default. | `ads-strategist.md` Boundaries; both command Rules |
| 8 | **Lead-form immutability** — Meta lead forms can't be updated via API; editing = new `form_id` + rebind ads. | A real launch-readiness blocker badi's readiness gate doesn't flag. | `meta-review.md` Readiness Gate (FIX FIRST list) |

**Best single edit:** fold #1–#4 into a tight **"Measurement prerequisites"** block in `meta-review.md` +
the matching 3 lines in `ads-strategist.md`'s Measurement Plan. ~25-30 lines total, turns the readiness
gate from "do you have tracking?" into "is your tracking *correct*?" — the difference between a verdict
that sounds right and one that is.

## `/ads-review` (Google) — lighter touch
The source is Meta-only, so the direct transfer is the **principle**, not the mechanics: Google's analogue
to #1/#2 is **enhanced conversions + offline conversion import (GCLID)** and **dedup on the conversion
`order_id`**. Worth one sentence in `ads-review.md`'s Measurement Plan; no deep adoption — don't fabricate
Google specifics from a Meta codebase.

## DON'T
- **Don't add an ads *execution* surface.** badi's commands are advisory by hard rule (no API calls, no
  credentials, user executes spend). These mechanics enter as **what to verify**, never as code that calls Meta.
- **Don't name the source project** (or any repo) in shipped `meta-review.md` / `ads-review.md` /
  `ads-strategist.md` / README. The mechanics are public Meta-API facts; they need no attribution and
  carry none. This internal doc may reference it; shipped files may not.
- **Don't build a new agent or skill.** Everything here sharpens 3 existing files. New surface = the
  exact anti-pattern the freeze guards against.
- **Don't import TRY currency / WhatsApp-specifics as defaults** — they're the source's locale, not badi's.
  Keep adopted text channel-agnostic.

## Freeze + posture
- **Classification:** HARDENING (internal quality of existing advisory specs; zero new user-visible surface).
  Still a freeze-touch → route through `/ceo-review` before editing, per the exception framework.
- **Freeze-exception count:** this would be the **3rd** standing exception (gate at 3 → product-strategist
  prompts the owner to hold / change-threshold / lift). So adoption is explicitly an **owner decision**, not
  a build decision.
- **Posture:** this is tooling-quality, not promotion — fully consistent with "don't over-advertise badi."

## Bottom line
Real, shippable sharpening: the source project is a working proof of the exact layer badi's two commands
advise on, and it exposes 8 concrete mechanics that make the difference between a measurement plan that
*reads* correct and one that *is*. Adopting #1–#4 (Measurement prerequisites block) is the high-leverage,
low-risk move. It's freeze-gated and owner-decided — not something to ship unprompted.

---

## APPLIED (2026-06-26) — owner-directed, live-verified, shipped
Owner green-lit the build ("use the improvements to make the skill better"). A 3-phase workflow
(verify-facts-live → draft → adversarial-review, 8 agents) verified every mechanic against **current**
Meta/Google docs before any edit. Net: 6 of 8 are stable structural facts, 1 verify-live, 1 needed
correction. The harvested mechanics were corrected against ground truth — what shipped reflects the
corrections, not the original harvest:
- **#6 corrected** — `lead_gen_form_id` binds on the **ad creative** (`object_story_spec→link_data→call_to_action`),
  **not** the ad set. The ad set carries `promoted_object={page_id}` + `destination_type=ON_AD`. The instant-form
  **baseline** is `optimization_goal=LEAD_GENERATION`; `QUALITY_LEAD` is the **opt-in** "conversion leads"
  upgrade that *additionally* needs CRM lead-stage events via CAPI. (Original harvest conflated these.)
- **#4 expanded** — must-hash list adds `ct, st, external_id` (+ `db/ge`); never-hash list adds `subscription_id`.
  Real Meta param key is `zp` (not `zip`).
- **#2 terminology** — current Meta naming is **dataset** (Dataset ID ≈ former Pixel ID); "pixel" = the browser tag.
- **#5 kept verify-live** — no day-count baked; windows differ by funnel, pulled live.
- **#7 reframed** — default-PAUSED is **badi's advisory best practice**, not a Meta rule, and is phrased as
  *advice to the user* (badi never creates campaigns / calls the API).

**Shipped:** `meta-review.md` (+vault), `ads-strategist.md`, `ads-review.md` (+vault) — HARDENING only, no new
surface. Vault/active copies in parity; line-1 descriptions untouched. 1321 tests green, doctor 53/0/0, lint clean.
The full live-verified fact sheet (8 Meta + 4 Google, with evidence/citations) is in the workflow result
journal for this session.
