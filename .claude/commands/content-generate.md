Social media content generation command. Produces ready-to-use posts, captions, visual briefs, and hashtags for the given platform and type.

# Required Tools
- Read (brand voice, previous content, project context) -- Write (content file) -- Grep (previous content scan) -- ...

# Procedure (6 Steps)

## 1. Gather Input
- **Platform:** Instagram / Twitter-X / LinkedIn / TikTok / YouTube / Facebook / All
- **Type:** Informative (tips, lists, how-tos) / Inspirational (motivation, success) / Entertainment (memes, trends) / Sales (product, discount, launch) / ...
- **Topic/Message:** detail
- **Tone:** Friendly / Professional / Fun / Inspirational / Provocative / Minimal
- **Visual brief wanted?** (yes/no) -- ...

## 2. Brand Context
**Mandatory:** `.claude/workspace/marka-sesi.md` (tone, address style, emoji policy) -- `memory.md` (campaign/launch/project)

**Optional:** `.claude/workspace/icerikler/` (last 5, repeat prevention) -- `.claude/workspace/takvim/` (timing fit) -- `knowledge-base.md` (phrases to avoid, rules)

If no brand voice exists, suggest `/content-brand-voice` without making it mandatory.

## 3. Platform Rules

**Instagram:** post max 2200 chars (first 125 critical, cut-off point) -- hashtags 20-30 (niche+general, first comment also OK) -- visuals 1080x1080 or 1080x1350 -- ...

**Twitter/X:** max 280 chars (each tweet in a thread separate) -- thread: 1/ main message, 2-N/ support, last/ CTA -- hashtags 1-3 (more reads as spam) -- ...

**LinkedIn:** max 3000 chars (first 210 before "see more") -- tone professional + human, personal experience -- hashtags 3-5 (sector) -- ...

**TikTok:** caption max 2200 (keep it short) -- video first, text supporting -- hashtags 3-5 (trend + niche) -- ...

**YouTube:** title max 100 chars (keyword) -- description 5000 chars (first 2-3 lines SEO-critical) -- tags 10-15 -- ...

**Facebook:** post limit 63,206 but optimal 40-80 words -- asking a question lifts engagement -- link description short and clear

## 3.5 2026 Algorithm Reality (verify live)
Apply these so the output actually reaches — they trump the static limits above (delegate to the **content-creator** agent for the full playbook):
- **Original or materially transformed only** — Instagram de-recommends reposted/aggregated/watermarked content across Reels, photos AND carousels; strip foreign watermarks.
- **AI assist OK, AI slop penalized** — vary every asset and add genuine value; disclose realistic AI media (auto-detected via C2PA/SynthID, mandatory on major platforms; EU AI Act transparency lands 2026).
- **Build for sends + watch-through** — engineer DM-able, save-worthy content (sends-per-reach is the strongest IG signal); favor watch-time over sub-15s clips with mid-video hooks; lead with a fast payoff hook in the opening seconds, captions burned in (sound-off).
- **Search-on-social** — put the exact phrase people would search in the first caption line + on-screen text.
- **Human over polish** — visibly human, lo-fi, founder-led beats AI-perfect sameness in 2026.

## 4. Content Variations (3 approaches)

**A — Direct Value:** clear open message -- immediate benefit -- "Here are Y ways to do X..."

**B — Story:** open with personal experience/scenario -- emotional connection -- "Last week I experienced X and..."

**C — Question/Curiosity:** open with a question/surprising claim -- curiosity gap -- "Most people do X wrong. Here's why..."

For each variation: full copy (copy-paste ready) -- platform hashtag list -- CTA -- ...

## 5. Visual Brief (if requested)
For each variation: **Description** (object/scene/emotion) -- **Size** (1080x1080, 1080x1350, 1920x1080 etc.) -- **Style** (Photographic/Minimalist/Illustration/Typographic/Collage) -- ...

## 6. Package and Save
1. Check/create `.claude/workspace/icerikler/`
2. Create `[YYYY-MM-DD]-[topic-kebab].md`
3. Write variations + brief + metadata into one file
4. Present a summary

# Output Format
```
[abridged]
```

# Timing Guide
| Platform | Best Days | Best Hours | Why |
|----------|-----------|------------|-----|
| Instagram | Tue, Thu | 11:00-13:00, 19:00-21:00 | Lunch break and evening downtime |
| Twitter/X | Mon, Wed | 09:00-11:00, 13:00-15:00 | Work start and post-lunch |
| LinkedIn | Tue, Wed, Thu | 08:00-10:00, 17:00-18:00 | Work start and end of day |
| TikTok | Wed, Fri | 19:00-23:00 | Evening downtime |
| YouTube | Fri, Sat | 14:00-16:00 | Weekend viewing |
| Facebook | Wed, Thu | 12:00-15:00 | Noon and afternoon |

Note: general data; varies with the target audience. Prioritize analytics when available.

# Tips
- On multi-platform, adapt for each one (no copy-paste) -- hashtags: 30% large (100K+), 50% medium (10K-100K), 20% niche (<10K) -- 1 in 5 sales-focused (80/20) -- ...
