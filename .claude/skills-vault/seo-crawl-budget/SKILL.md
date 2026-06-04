---
name: seo-crawl-budget
description: A 6-24 hour indexing methodology for low-competition long-tail keywords. A 20-article campaign, a cyclic internal-link matrix, manual Search Console triggering. Triggers on: crawl budget, crawl butcesi, long-tail, long tail, indexleme, search console, internal linking, ic linkleme, sitemap, hizli index, fast indexing, SEO kampanya, kampanya plani.
license: MIT
compatibility: Works with Claude Code, Cursor, or any compatible AI coding agent.
allowed-tools: Read Write Edit Grep
metadata:
  author: fatihkan
  homepage: https://github.com/fatihkan/badi/tree/main/.claude/skills-vault/seo-crawl-budget
  badi-version: ">=1.20.0"
  category: seo
  upstream: https://github.com/moneyvadi-prog/crawl-budget-manipulation
  upstream-license: MIT
---

# SEO Crawl Budget Manipulation

A systematic SEO campaign methodology targeting indexing within 6-24 hours and first-page rankings on low-competition long-tail keywords.

> **Attribution:** This skill is adapted from the methodology in the [moneyvadi-prog/crawl-budget-manipulation](https://github.com/moneyvadi-prog/crawl-budget-manipulation) (MIT) repository. Original author: Gulsah Arslan / [seodanismanlikhizmeti.com.tr](https://www.seodanismanlikhizmeti.com.tr/crawl-budget-manipulation-deneyi-gulsah-arslan/).

## When to Use

**Suitable:**
- Long-tail queries with KD (keyword difficulty) < 20
- Question-based, informational, or soft-commercial intent
- New or mid-authority domains
- When fast indexing is being tested

**Not suitable:**
- Highly competitive commercial keywords
- High-volume brand searches
- Short-tail queries requiring domain authority

## Operating Principle

Crawl budget is steered with three coordinated signals:

1. **Manual crawl triggering** — Search Console "Request indexing" + a fresh sitemap
2. **Cyclic internal linking** — every article links to 3 other articles
3. **Low-competition, intent-clear keywords** — KD < 20

This combination signals to Google that the site is **active and valuable**, raising crawl frequency.

## The 6-Phase Campaign Structure

### Phase 1 — Keyword Generation (Day 0)
- 20 long-tail keywords: 10 simultaneous-publish (Group A) + 10 time-staggered (Group B)
- Per keyword: search volume (estimated), KD, intent (informational/commercial), SERP structure
- Outputs: `keywords-A.json`, `keywords-B.json`

### Phase 2 — Content Briefs (Days 0-1)
- A standard template for all 20 articles
- Target: 800-900 words, identical H2 structure
- Brief fields: title, slug, primary keyword, secondary keywords (2-3), H2 list (4-6), TLDR, FAQ (3-5 questions), internal-link targets (3 articles)

### Phase 3 — Internal Link Matrix (Day 1)
- A cyclic link graph for the 20 articles (every node: out-degree = 3, in-degree = 3)
- The 10 Group A articles link among themselves + 1 link into Group B
- CSV/Markdown matrix output: `linking-matrix.md`

### Phase 4 — Publication Schedule (Days 1-6)
- **Group A**: 10 articles published within a 2-3 hour window on a single day
- **Group B**: spread over 5 days, 2 articles per day
- Suggested publish times: near the target market's peak hours (for TR: 10:00-12:00, 19:00-21:00)

### Phase 5 — Search Console Actions (Publish day)
- Update the XML sitemap + resubmit to Search Console
- For each URL: "Inspect URL" → "Request indexing" (daily quota: ~10-12)
- robots.txt + canonical tag verification

### Phase 6 — Tracking Metrics (Days 14-28)
- Crawl frequency (Search Console > Settings > Crawl stats)
- Indexing speed (how many hours after publication was it indexed?)
- Coverage state (Indexed / Discovered-not-indexed)
- Keyword ranking trend (manual or a rank tracker)
- Target: 70-90% of articles indexed in 6-24 hours; 40-60% of long-tail keywords on the first page

## Data Contamination Risks

**Do not change** during the experiment:
- New backlink campaigns
- Site architecture changes
- Updates to existing content
- Robot/canonical/redirect rules

These risk factors break control-group cleanliness.

## Output Template

While this skill is active, the agent produces/suggests these files:

```
seo-campaign-<slug>/
├── keywords-A.json          # 10 simultaneous
├── keywords-B.json          # 10 scheduled
├── briefs/                  # 20 article briefs
├── linking-matrix.md        # Cyclic graph
├── publication-schedule.csv # Date + time
├── search-console-checklist.md
└── tracking-template.md     # 14-28 day metrics
```

## Limitations

- **Not black hat** — only quality content + technical triggering. No spam, cloaking, or link networks.
- **Not long-term** — when the campaign ends (28 days) the content ecosystem returns to normal SEO rules.
- **Domain sensitivity** — new domains may see a sandbox effect.
