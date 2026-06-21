# badi — Awareness / Growth Plan (2026-06-21)

> From the `badi-awareness-growth` workflow (research + product-strategist + ads-strategist synthesis).
> Companion: `POSITIONING.md` (the safety wedge), `incident-post.md` / `demo-script.md` / `show-hn.md`
> / `social.md` (the assets this plan distributes). Metric of record: **weekly npm downloads**.

## The honest diagnosis (why "post sometimes on LinkedIn/X" isn't working)
It's not a content-quality problem — it's **cold-start physics**:
- **badi is invisible in the channels that DON'T depend on followers** — not yet listed on awesome-claude-code, not on dev.to, not on Hacker News, not on console.dev. Those are where a 5-star project actually gets discovered.
- **Social posts from a small account die in the first 30–60 min.** X's ranker needs ~10 engagements in 30 min to amplify to non-followers; LinkedIn's 360Brew needs early network signals in 60 min. A small follower pool can't clear that gate. Worse: **posts with an external link get 50–90% reach suppression** on both platforms. So a sporadic "here's my tool + GitHub link" post reaches almost no one — by design.

The fix is two-part: **(a) one-time unlocks** that create permanent, follower-independent inbound, and **(b) a consistent cadence** that *builds* an engaged audience (to ~300–800) so posts start clearing the gate. Consistency beats one-off launches.

## Phase 0 — One-time unlocks (do FIRST, ~3–4 hrs total, no repeating)
These have zero follower dependency and the highest leverage. Treat them as blocking.
1. **Follow up on awesome-claude-code #1955** (open since 06-05, no maintainer reply). One polite **human** follow-up comment, browser UI only. (AI comments BANNED — human-only.) Permanent passive inbound from a 46.9k-star list.
2. **Email console.dev** (`hello@console.dev`) — 2–3 sentences + link + target user (Claude Code users running agents in CI / on real repos). Free; they curate 2–3 tools/week to a CTO/eng-lead audience.
3. **Publish the incident post on dev.to** (`incident-post.md`, "agentic safety" angle). Tags `#claudecode #devtools #opensource #security`. Becomes the canonical long-form artifact with Google search distribution; everything else links to it.
4. **Build HN karma first** — 2–3 thoughtful HN comments/week for ~3 weeks. Do NOT post Show HN cold.

## Weekly cadence (~3 hrs/week, weeks 1–8) — engage, don't broadcast
- **Mon (30m):** Engage on X — reply to 3–5 accounts (500–5k followers) discussing Claude Code problems. One HN comment. Don't post; don't mention badi unless directly relevant. (Replies are weighted ~27× likes and build the warm audience.)
- **Wed (45m):** X post or short thread, **no link in the body** (put the link in the first reply). An observation or before/after from building badi (the hook-vs-prompt contrast). End with a question. Reply to every comment.
- **Thu (45m):** LinkedIn **document/carousel** post (5 slides adapted from the incident post — native content, no link in body). Frame for eng managers: risk & reliability. Reply within 60 min.
- **Fri (30m):** One Reddit post, rotating: r/SideProject (wk1) → r/ClaudeAI (wk2) → r/devops (wk3). Value-first builder story, disclose "I built this," human-written. Max once/month per subreddit.
- **Show HN (wk 4–6, after ~50 HN karma):** Title e.g. *"Show HN: badi — hooks that block Claude Code from destroying your repo."* Post Tue–Thu 9–12 ET; maker comment at minute 1 (backstory + one honest limitation); reply to every comment within 15 min; stay present 2 hrs. (`show-hn.md` is drafted.)

## Top 5 amplification targets (named) + next action
1. **awesome-claude-code #1955** — follow up now (human-only). Permanent inbound.
2. **console.dev** — email this week (free, right audience).
3. **Hacker News (Show HN)** — wk 4–6 after karma. 5k–30k visitors + ~1.4 stars/upvote if it front-pages.
4. **Bytes.dev** (216k+ JS devs) — pitch AFTER dev.to + Show HN are live; lead with the story, not a feature list.
5. **r/ClaudeAI** — wk2 Friday rotation; disclose affiliation; human-written.

## Paid ads verdict: **DON'T** (the math is broken for a free tool with no LTV)
Every platform fails the test for a free, no-revenue tool: Meta (wrong audience, ~$14–17/install), Google (the "agentic safety" search category barely exists yet), Reddit (devs are hostile to promoted posts — can *harm* reputation), X (fragmented dev audience + cold-trust deficit), large newsletters (TLDR ~$15k/issue; Bytes/JS Weekly $2–8k → $25–50/install). **Spend $0 on ad platforms.**

**Better use of a small budget (this is the real lever):**
- **$300–500 — freelance video editor** (Upwork/Fiverr) for a polished 90-second branch-guard screencast with captions (from `demo-script.md`). One-time spend that compounds across the README, Show HN, dev.to, X, LinkedIn, and any future newsletter. **Highest-leverage spend available.**
- **$100–200 — designer** for an OG image / social card on the incident post (lifts click-through on every share).
- **Narrow exception, LATER only:** a niche Claude-Code newsletter micro-sponsorship ($150–400, 2k–10k subs, demonstrable audience overlap) — ONLY after organic has run and the npm baseline is tracked. **Kill if no download spike in the 48 hrs after publish.**

## 30 / 60 / 90-day milestones (metric of record: weekly npm downloads)
> Baseline: confirm your real current number on npmjs.com (research saw ~329/wk; you said ~1k is hard to reach — use your actual figure as the baseline).
- **30 days:** #1955 followed up · console.dev emailed · dev.to post live · HN karma 50+ · cadence running. **Target: 500+ weekly** (or +50% over baseline). Kill: flat → fix title/tags/hook before Show HN.
- **60 days:** Show HN resolved · X ~200–300 engaged followers · LinkedIn 20+ engagements/post · Bytes.dev pitched · demo video delivered. **Target: 800–1,200 weekly.**
- **90 days:** First external mention / star cluster from outside your network · first external GitHub issue or PR (which *ends the feature freeze*). **Target: 1,500+ weekly + one traceable star cluster.**

**Kill / pivot signal:** under 500/wk at day 60 AND Show HN didn't front-page AND no external mention → the *message* isn't resonating. Stop the cadence, talk to 5 Claude Code users who've never heard of badi, rebuild the one-liner + dev.to post from that. **Do not add features. Freeze holds.**

## Sequence (what to actually do, in order)
1. Phase 0 unlocks (zero cost, this week): #1955 follow-up → console.dev email → publish dev.to incident post → start HN karma.
2. Commission the demo video ($300–500) + OG image ($100–200).
3. Run the weekly cadence; build HN karma.
4. Show HN (wk 4–6) → then pitch Bytes.dev.
5. Only after organic proves the message: consider ONE niche-newsletter micro-sponsorship.
