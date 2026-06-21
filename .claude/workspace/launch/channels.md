---

## Opportunity Summary

badi is a real, functioning npm CLI with 30 agents, 86 commands, and a live v1.35.0 — but its current traction (329 weekly downloads, 5 stars, 0 forks) is below what any of these channels will convert automatically. That gap is an asset, not a liability, for the right channels: the product is demonstrably real, has shipped consistently through 35 versions, and operates in an ecosystem (Claude Code) that is actively growing in mid-2026. The channels below are ordered by the highest expected return for a tool at this stage — credibility-building and targeted reach over volume plays.

---

## Demand Evidence

| Signal | Source | Strength | Note |
|---|---|---|---|
| awesome-claude-code has 46.9k stars / 4.1k forks / 511 open issues | GitHub API, verified June 2026 | High | The list is the single most-visited index of Claude Code tooling; discovery there is durable |
| r/ClaudeAI has 947k members | GummySearch via WebSearch | High | Active, growing community; engagement on real Claude Code workflow posts is high |
| Claude Code ecosystem actively growing; 130k+ GitHub stars on main repo, GA since May 2025 | Search results | High | Rising tide; Claude Code users actively seek workflow enhancements |
| Product Hunt top-5 for niche dev tool needs ~200-350 upvotes | innmind.com launch guide 2026 | Med | Achievable only with pre-launch audience; without one, rank is low |
| Show HN visibility is unpredictable; "many good submissions die" | syften.com HN guide | Med | High upside but low-probability; worth one attempt |
| dev.to tool-list posts exist in large volume with modest engagement | Search results / dev.to | Med | Low competition but also low organic discovery for a niche tool |
| X/Twitter #claudecode hashtag community exists | Search results | Low | Build-in-public audience present; reach is low without prior following |

---

## Channel-by-Channel Plan

### 1. awesome-claude-code (hesreallyhim/awesome-claude-code)

**Fit for badi:** Direct. The list has dedicated categories — "Tooling: Config Managers" and "Slash-Commands: Miscellaneous" — that match badi's 86 commands / 14 hooks / 30 agents profile. 46.9k stars means listing discovery is passive and durable.

**Posting / self-promo rules (verified from issue template, June 2026):**
- Issues MUST be submitted via the github.com UI. The `gh` CLI and any programmatic submission method are explicitly banned and auto-closed.
- The submitter must check: "I am primarily composed of human-y stuff and not electrical circuits." This is the human-only gate.
- Resource must be at least one week old (badi qualifies at v1.35.0).
- Submitter must not have any other open issues in the repo.
- Description: 1-3 sentences, no emojis, not promotional, third-person style.
- The maintainer runs Claude Code's `evaluate-repository.md` prompt on your repo as part of review. Run that evaluation on badi first.
- Provide a specific demo prompt: "Install badi, run `/start`, and observe the morning ritual structure." Concrete tasks required.
- Recommendations must be unique (no existing badi entry confirmed — check before submitting).

**AI/bot risk:** CRITICAL. The issue template explicitly bans AI-generated or bot-submitted issues. Any content produced by this agent that is intended to be posted there must be flagged human-only. The submitter must be Fatih acting as a human via github.com browser UI. Do not pre-fill the issue form with AI-generated text without human review and rewrite.

**Effort:** Low-medium. ~1-2 hours to write a compliant submission with demo prompts. Zero ongoing cost once listed.

**Priority: P1** — Durable discovery, zero ongoing effort post-listing, direct audience fit.

---

### 2. Show HN (Hacker News)

**Fit for badi:** Good. HN has a large developer audience that actively uses and discusses Claude Code. A CLI that adds workflow structure (agents, hooks, daily rituals) is a legitimate technical topic, not just a product launch.

**Posting / self-promo rules (verified):**
- Title must start with `Show HN:` — e.g., "Show HN: badi — structured workflow management layer for Claude Code (30 agents, 86 commands)"
- You personally must have worked on the thing you are showing.
- Must be tryable: `npm install -g @fatihkan/badi && badi init` qualifies as long as the user can explore without a paywall or email gate.
- No soliciting upvotes from friends, communities, or social channels. This is a hard rule enforced by mods and users alike.
- Avoid booster comments from other accounts — HN users flag this immediately.
- Title must not contain hype, exclamation points, or marketing language.
- Reply to technical questions within the thread promptly; the maker is expected to be present.

**AI/bot risk:** Medium. HN users are sophisticated enough to ask pointed questions about implementation choices. Unprepared or canned answers are immediately visible. AI-written replies would be spotted and hurt credibility. All engagement must be authentic and human.

**Effort:** Low to prepare the post; medium engagement effort on launch day (be present for 6-8 hours). Timing: Tuesday-Thursday 9am-12pm US Eastern.

**Realistic expectations:** Many well-built tools post Show HN and get fewer than 10 comments. For a niche v1.35 CLI, realistic outcome is 5-40 upvotes and 3-15 comments. A thread that gets 50+ upvotes is a strong result. This is not a volume channel — it is a credibility and developer-quality signal channel. Even a modest HN thread is useful social proof for later outreach.

**Priority: P1** — One-time shot with asymmetric upside; pairs well with the awesome-claude-code listing.

---

### 3. r/ClaudeAI and r/SideProject (Reddit)

**Fit for badi:**
- r/ClaudeAI (947k members): Best fit. Users are Claude power users, many of whom use Claude Code. A post framed as "how I structured my Claude Code workflow" fits naturally.
- r/SideProject (~350k members): Explicitly welcomes self-promotion of developer projects. Less audience specificity but friendly rules.
- r/programming: Strict. Mods remove obvious self-promotion. Only viable if the post is a technical writeup, not a launch announcement.

**Posting / self-promo rules:**
- Reddit platform rule: 90/10 ratio (90% participation, 10% promotion). For a first post, this means having a minimal history of non-promotional activity in the target subreddit.
- r/ClaudeAI: No specific self-promo flair confirmed from publicly available rules; disclose affiliation clearly ("I built this"). Value-first framing required — post a workflow story, not a product announcement.
- r/SideProject: Self-promotion is expected. Must include what/why/tech/feedback-wanted. One post per meaningful update; don't repost the same project within 3-4 weeks.
- Flair disclosure: Always state "I made this" or "I am the author" in the post body.

**AI/bot risk:** High if comments are AI-generated. Reddit users and mods flag AI-written promotional comments aggressively in 2026. All post text and comment replies must be human-written. Do not paste AI output into Reddit posts.

**Effort:** Medium. Two separate posts with distinct angles (one for r/ClaudeAI as a workflow writeup, one for r/SideProject as a builder story). Reddit accounts need some history — plan ahead.

**Realistic expectations:** r/ClaudeAI posts about Claude Code tools regularly get 50-300 upvotes if framed as workflow tips rather than ads. r/SideProject is lower engagement but more forgiving. Neither is a reliable download channel in isolation.

**Priority: P2** — Good reach within the target audience; requires careful framing and human-written content.

---

### 4. dev.to and Hashnode

**Fit for badi:** Good for SEO and credibility, moderate for direct discovery. Developer-audience platforms where a long-form "How I structured my Claude Code workflow with badi" post can rank in Google searches over time.

**Posting / self-promo rules:**
- dev.to Code of Conduct does not explicitly ban self-promotion. The platform encourages full posts (not landing-page links). Use tags: `#claudecode`, `#devtools`, `#opensource`, `#productivity`.
- Hashnode: No known self-promotion restrictions. Cross-posting to Hashnode's community feed via tags is explicitly supported.
- Both platforms allow canonical URL pointing back to badi's GitHub/README, which helps SEO.
- Cross-posting the same post on both platforms is common practice and not against rules (use canonical URL on Hashnode pointing to dev.to, or vice versa).

**AI/bot risk:** Low for the post itself, but AI-generated content that reads as such hurts engagement (readers skip it). Any post must be genuinely useful — tutorial-style, real workflow examples, screenshots of the CLI in action.

**Effort:** Medium. A single well-written tutorial post (~1500-2500 words, real terminal output, real use case) can be published to both platforms. Takes 3-5 hours to write properly.

**Realistic expectations:** A dev.to post about a niche CLI tool typically gets 100-500 reads in the first week organically. Google indexing can drive 10-50 visits/month passively over 6+ months. Not a spike channel — a compounding one.

**Priority: P2** — Best long-term SEO play; moderate immediate impact.

---

### 5. Product Hunt

**Fit for badi:** Developer tool category is viable. However, Product Hunt in 2026 is increasingly dominated by AI-first products with visual interfaces. A terminal CLI with low prior traction faces an uphill climb.

**Posting / self-promo rules (verified):**
- Self-hunting (posting your own product) is fully normalized in 2026. No penalty.
- Do NOT ask for upvotes directly. Ask people to "visit, comment, try, and give feedback."
- Do NOT pay for or reward upvotes.
- Do NOT use artificial upvote rings. The algorithm detects sudden spikes and filters them.
- Launch day engagement must be staggered in waves, not blasted all at once.
- Maker must respond to all comments, especially technical questions.

**AI/bot risk:** Medium. The algorithm can detect suspicious engagement patterns. Fake comments or AI-posted comments in threads are visible and counterproductive. Human engagement only.

**Effort:** High pre-launch (gallery assets, tagline, demo GIF/video, email list required). Minimum viable pre-launch list is ~400 people; without this, ranking is unlikely. This is a significant investment relative to current audience size.

**Realistic expectations:** Without a pre-existing email list of 400+ developers, a niche CLI tool can realistically expect 20-80 upvotes and no front-page placement. Top-5 placement requires 200-350 upvotes, which is a stretch. The primary value at this stage would be having a Product Hunt page for credibility, not ranking. Consider launching on a low-competition day (Saturday or Sunday) to minimize the vote gap.

**Priority: P3** — Premature at 5 stars and 329 weekly downloads. Revisit when there is a pre-built audience of at least a few hundred interested users.

---

### 6. X/Twitter

**Fit for badi:** Indirect. The #claudecode and #claudeai communities exist on X and are active in mid-2026, but the audience is fragmented and reach is strongly gated by follower count.

**Posting / self-promo rules:**
- No platform-level rules against self-promotion. X has no 90/10 policy.
- Build-in-public framing (sharing milestones, usage numbers, before/after comparisons) performs better than product announcements.
- Relevant hashtags: `#claudecode`, `#devtools`, `#buildinpublic`, `#opentowork` (for the workflow angle).

**AI/bot risk:** Low for the content; high if replies are AI-generated. Automated engagement is visible and builds no real audience.

**Effort:** Low per tweet; high for sustained presence. Without an existing following, individual tweets have near-zero organic reach. Strategy would require consistent posting over weeks/months, not a one-shot.

**Realistic expectations:** A single launch tweet from a low-follower account typically reaches under 200 people organically. Even a well-crafted thread rarely breaks out without retweets from accounts with significant reach. Not a standalone channel.

**Priority: P3** — Worth doing alongside other channels (a tweet linking to the Show HN post or the dev.to article), but not a primary channel.

---

### 7. Claude Code Community Discords

**Fit for badi:** Potentially high — these are concentrated user bases actively seeking Claude Code enhancements. However, specifics of moderation rules, channel structure, and self-promo policies are not publicly documented in a way that can be verified read-only.

**Posting / self-promo rules:** Unverified. Most developer Discords have a dedicated `#showcase` or `#show-and-tell` channel. Posting in the wrong channel is a quick mod removal. Must verify channel rules before posting.

**AI/bot risk:** Low for a human-written post; high if engagement is automated.

**Effort:** Low per post, but requires joining the community, reading the rules, and participating before posting. Cold-posting self-promotion in a Discord is a reliable way to get kicked.

**Realistic expectations:** Discord shares can drive meaningful traffic if the server has an active, relevant audience. Quality and timing matter more than in other channels. Unknown without deeper access.

**Priority: P2** — Good potential, but requires human reconnaissance (join, read rules, participate first). Cannot be pre-planned from the outside.

---

## Ranked Opportunities

1. **awesome-claude-code listing** — Durable passive discovery in the highest-signal index for Claude Code tooling; one-time low effort; clear submission rules; fits multiple categories. Risk: maintainer may not review quickly (511 open issues). Requires human submission via browser UI.

2. **Show HN** — One-time credibility play with asymmetric upside. Even a modest thread provides social proof and indexes in Google as a "Show HN: badi" search result. No pre-audience required. Must be submitted by a human, no upvote solicitation.

3. **r/ClaudeAI workflow writeup** — 947k targeted audience. High fit. Must be framed as "how I solved a Claude Code workflow problem" not "here is my tool." Human-written content only.

4. **dev.to / Hashnode tutorial post** — Best long-term SEO value. A practical "structured workflow for Claude Code" post compounds over months. Low risk, medium effort.

5. **r/SideProject builder story** — Friendly rules, modest but real reach. Pairs well with a r/ClaudeAI post if you wait a few weeks between them.

6. **Discord communities** — Good potential but requires join-and-observe before posting. Cannot be planned without access.

7. **X/Twitter threads** — Valuable as amplifier for other channels (link to Show HN, link to dev.to post), not as a primary channel. Low standalone ROI.

8. **Product Hunt** — Defer. At current traction, launching without a 400-person pre-list will result in <100 upvotes and no ranking. The listing itself has minor SEO value but won't drive meaningful discovery. Revisit at 2k+ weekly downloads or after building an email list.

---

## Market Gap

The awesome-claude-code list has 511 open resource submissions and the maintainer processes them at his own pace. Getting listed does not require competing with other tools — it only requires meeting the quality bar. badi's differentiation (30 agents, 86 commands, profile-based routing, virtual eng team, advisory-only subagents) is genuinely broader than most single-purpose tools in the list. The risk is being perceived as "too general" — the submission copy must highlight one specific, demonstrable value (e.g., the daily ritual system or the /team orchestrator) rather than trying to enumerate every feature.

---

## Recommendation

**PURSUE — start with the awesome-claude-code listing, immediately followed by a Show HN post within the same week.**

**Strongest reason:** The awesome-claude-code list is the only channel where a tool with 5 GitHub stars can achieve durable, targeted discovery without a pre-built audience. 46.9k stars means users of the list represent exactly the audience badi needs. A listing there is passive and permanent. A Show HN post the same week creates a second indexed signal ("Show HN: badi") that serves as social proof for anyone who finds the list entry and searches for context.

**Biggest risk:** The awesome-claude-code maintainer has 511 open issues; review timelines are unpredictable. The submission must be airtight on first submission — the "I am primarily composed of human-y stuff" checkbox, no open existing issues, a concrete demo prompt, and a description that is descriptive not promotional. There is no second-chance process documented. The Show HN risk is unpredictability — a low-engagement thread is not a failure, but Fatih must be available to engage promptly on launch day.

**Hard constraint reminder:** The awesome-claude-code submission must be filed by Fatih using the github.com browser UI. It must not be filed via the `gh` CLI, any automated tool, or by pasting AI-generated text without human rewrite. The checklist box "I am primarily composed of human-y stuff and not electrical circuits" must be checked by a human.

---

Sources:
- [How to Launch on Product Hunt in 2026](https://blog.innmind.com/how-to-launch-on-product-hunt-in-2026/)
- [Hacker News Posting Guide: Rules, Show HN, and Timing](https://syften.com/blog/hacker-news-marketing/)
- [How to Submit a Show HN (GitHub gist)](https://gist.github.com/tzmartin/88abb7ef63e41e27c2ec9a5ce5d9b5f9)
- [The complete guide to Reddit self-promotion rules in 2026](https://redship.io/blog/reddit-self-promotion-rules)
- [r/SideProject Rules & Posting Guide](https://www.redditmaster.com/subreddit-rules/sideproject)
- [r/ClaudeAI — Subreddit Stats & Analysis](https://gummysearch.com/r/ClaudeAI/)
- [DEV Community Code of Conduct](https://dev.to/code-of-conduct)
- [awesome-claude-code repository (hesreallyhim)](https://github.com/hesreallyhim/awesome-claude-code)
- [awesome-claude-code Issues](https://github.com/hesreallyhim/awesome-claude-code/issues)
- [Product Hunt Launch Guide: Checklist, Strategy, and ROI](https://syften.com/blog/product-hunt-launch/)
- [The Complete Product Hunt Launch Playbook for AI Tools (2026)](https://www.tooljunction.io/guides/product-hunt-launch-checklist-2026)
- [How to launch a developer tool on Product Hunt in 2026](https://hackmamba.io/developer-marketing/how-to-launch-on-product-hunt/)
- [Claude Code Channels: Message Your AI Coding Agent From Telegram and Discord](https://pub.towardsai.net/claude-code-channels-message-your-ai-coding-agent-from-telegram-and-discord-2026-5f263ccc4b9c)
