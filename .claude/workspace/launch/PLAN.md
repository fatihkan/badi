# badi — Distribution / Launch Plan (2026-06-20)

> Freeze-safe distribution work. CEO directive: grow organic signal, not features.
> Source: 7-agent `/market` + `badi-distribution-launch-prep` workflow (read-only research).
> Companion files in this dir: submission-status · credibility-audit · channels ·
> product-hunt · show-hn · social · blog-outline · blog-post.

## TL;DR
The binding constraint is **distribution + trust** (5 stars, ~329 weekly npm downloads),
not features. Highest-leverage, freeze-safe moves, in order:
1. **awesome-claude-code listing (#1955)** — already submitted & bot-validated; just **wait** (the maintainer's catalog README is still a WIP stub; the queue is 300+ deep). Nothing to do but watch. Human-only repo (AI comments are BANNED).
2. **Show HN this week** — P1, asymmetric upside, no pre-audience needed. **Owner posts** (human-only; no upvote solicitation). Draft ready → `show-hn.md`.
3. **README conversion fixes** — the single repo-side lever to convert the ~329 weekly downloaders into stars. Docs-only = freeze-safe. **Applied on branch `docs/readme-first-impression` (uncommitted, pending review).**
4. **r/ClaudeAI workflow writeup (P2)** + **dev.to/Hashnode tutorial (P2)** — human-written, value-first, compounding. Full post drafted → `blog-post.md`.
5. **Product Hunt → DEFER (P3)** — premature; revisit at ~2k weekly downloads or a 400+ email list. (Corrects the earlier wrap-up "PH prep" assumption.)

---

## Submission status (read-only, verified 2026-06-20)
- **awesome-claude-code #1955** — OPEN, `validation-passed` + `resource-submission`, **not listed yet**. The maintainer's README is an explicit WIP stub (no tools enumerated); the validation-passed backlog is 300+ deep with infrequent batch processing. **Action: watch only.** No unsolicited comments (bot ban + counterproductive). The repo requires submissions via the browser UI; `gh`/automation is auto-closed.
- **awesome-ai-devtools #616** — OPEN, mergeable, clean, zero maintainer comments. No merges in the repo for ~2 weeks (66 PRs open). **Action: a single polite *human* one-line check-in is appropriate only if there is no response by ~July 5.** Not before.
- Cross-cutting: both lists implicitly weight adoption → **growing stars is the real unblock**, which loops back to moves 2–4.

---

## This week (owner actions — all human-performed)
| When | Action | Owner/Me | Notes |
|------|--------|----------|-------|
| Tue–Thu 9–12 ET | Post **Show HN** | **Owner** | Use `show-hn.md`. Be present 6–8h. No upvote asks. |
| Same day | Tweet linking the HN thread | **Owner** | `social.md` thread; X is amplifier only |
| Within the week | Publish **dev.to/Hashnode** tutorial | **Owner** | Full draft in `blog-post.md` — edit into your own voice |
| When ready | r/ClaudeAI **workflow writeup** (not an ad) | **Owner** | Human-written; "how I structured my Claude Code workflow"; disclose "I built this" |
| Ongoing | Watch #1955 / #616 | Me (read-only) | Ping #616 only after ~July 5 |

> Every external post is a **human action** by design — awesome-cc bans AI comments; HN/Reddit/PH flag AI-written promo. I prepare turnkey drafts; you post.

---

## README conversion (freeze-safe, docs-only) — APPLIED on branch, pending review
Branch: `docs/readme-first-impression` (not committed; `git diff README.md` to review).
The credibility audit (`credibility-audit.md`) ranked 8 fixes. **I adopted the structure, NOT
its copy** — its ROI table ("~280 hours/year", "$15K/year consultant", "~120 hours") is
**fabricated and would hurt credibility; it was NOT used.** What was applied:

1. **Hero → leads with the job-to-be-done** ("Stop re-wiring `.claude/` for every project") plus a one-line try command, replacing the stat-dump opener. Tagline used: "your Claude Code setup, ready on day one" (option a).
2. **"Why Badi?" section** — answers the "why not roll my own?" objection with verifiable points only (curated/tested, one-source-five-harnesses, opt-in by default, safe by default, 1321 tests). No invented numbers.
3. **Get Started — "Pick your path"** one-liner (Quick = plugin / Full = npm) to kill decision paralysis.

Verified: markdown lint clean (README not flagged), all counts preserved (30/86/63/14/1321) → docs-sync gate unaffected. No version bump; this is distribution, not a feature, so not a freeze exception.

**Not yet applied (owner's call — MED/LOW):** security-transparency note (advisory-only + triage verdicts, no autonomous execution); an honest "Status" line; a `/team` end-to-end example; an agent-name quick-reference.

---

## Reality check (set expectations)
- Show HN realistic: 5–40 upvotes / 3–15 comments for a niche v1.35 CLI; 50+ is strong. Value = credibility + a permanent "Show HN: badi" Google result, not a download spike.
- dev.to: ~100–500 reads in week 1; compounds via Google over months.
- r/ClaudeAI: 50–300 upvotes IF framed as workflow tips, not an ad.
- None is a volume channel on its own; the **stack** (list + HN + blog + Reddit within ~2 weeks) is the play.

## Kill / revisit signals
- Product Hunt: revisit only at ~2k weekly downloads OR a 400+ interested-dev list.
- #616 ping: only after ~30 days of silence (~July 5), one human line.
- If, after the full stack, there's still no organic movement → that's the data point to reconsider positioning (back to `/ceo-review`), not to add features.
