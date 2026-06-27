SEO audit command. Website SEO analysis, meta tag checks, sitemap validation, and speed assessment.

# Required Tools
- Bash (badi seo commands)

# Procedure

### Step 1: Define the Scope

Ask the user: "Which analysis shall we run?"
- **Full audit** — 20+ checks (recommended starting point)
- **Meta tags** — OG, Twitter Card detail
- **Sitemap + robots.txt** — Crawlability
- **Speed + resources** — Performance starter

### Step 2: SEO Audit (Default)
```bash
badi seo audit [url]
```

What is checked:
- Title, Description, OG tags, Twitter Card
- H1 structure (must be single)
- Image alt tags
- Canonical URL, Viewport, lang, charset
- HTTPS, Schema.org, robots meta
- Word count, link analysis

An SEO score of 0-100 is given.

### Step 3: Detailed Analyses

```bash
badi seo meta [url]        # Meta tag analysis (missing detection)
badi seo sitemap [url]     # robots.txt + sitemap.xml
badi seo speed [url]       # TTFB + HTML size + compression
```

### Step 4: Improvement Suggestions

If the score < 80, based on the findings:
- **Title missing/long**: 30-60 character suggestion
- **No description**: 120-160 character example
- **H1 problem**: page structure suggestion
- **Missing image alts**: combined WCAG + SEO benefit
- **No canonical**: duplicate-content risk
- **No Schema.org**: structured-data opportunity

### Step 5: Lighthouse Deep Analysis

For deeper metrics:
```bash
badi lighthouse [url]
```
Core Web Vitals + Performance + Accessibility + Best Practices + SEO score.

### Step 6: AI Search Optimization (GEO/AEO)

Per Google's 2026 guidance, optimizing for AI features (AI Overviews, AI Mode) IS SEO — they pull from the same Search index via retrieval + query fan-out, so there is no separate "AI index" to target and indexability is AI visibility. Verify live (this space moves fast), but the durable levers:
- **No special files or schema for Google AI** — Google explicitly *ignores* `llms.txt` and requires no AI-specific schema or content "chunking." Don't waste effort there; foundational SEO + original, non-commodity content is the lever. (Other engines may read `llms.txt`, but none have committed to acting on it — don't rely on it.)
- **Lead with the answer + evidence** — front-load the substantive answer and original data/statistics/citable claims; studies show AI engines preferentially quote early, evidence-rich passages.
- **Earn off-site brand mentions** — authentic third-party mentions/press correlate with AI citation more than backlinks; build distribution, not just links.
- **Structured-data hygiene** — schema still aids eligibility, but FAQ rich results were deprecated (2026); audit and remove inert FAQ markup.
- **Measure AI visibility, not just clicks** — clicks fall when AI answers appear while brand exposure rises; track the Search Console Gen AI (AI feature) impression report + branded-search volume. Don't block `Google-Extended` expecting to control AI Overviews — it governs Gemini Apps, not Search AI features.
- **Preferred Sources** — if you run a publisher/brand, add Google's Preferred Sources button (the official user-level mechanism to surface in Top Stories / AI features).

For deep, multi-engine GEO work (ChatGPT/Perplexity/Gemini citation), invoke the `ai-seo` or `seo-geo` skill.

# Example Usage

```
/seo https://example.com
```

```
User: /seo blog.com
Assistant: [runs badi seo audit]
         SEO score: 72/100
         Critical issues:
           - Meta description missing
           - 3 images lack alt tags
         For detail: shall we continue with /seo-audit?
```
