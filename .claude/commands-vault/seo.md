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

### Step 6: AI Search Optimization

GEO (Generative Engine Optimization) matters in modern SEO:
- Being cited by ChatGPT/Perplexity
- Schema.org structured data
- An llms.txt file (optional)

In Claude Code, invoke the `ai-seo` or `seo-geo` skill (advanced).

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
