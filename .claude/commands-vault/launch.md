Product launch plan command. Creates a comprehensive plan for a new product or feature launch.

# Required Tools
- Read (project data)
- Grep (market research data)
- Write (plan file)
- Bash (current project analysis)
- Glob (resource scan)

# Procedure (7 Steps)

### Step 1: Product Summary
Get from the user:
- Product/feature name
- One-sentence value proposition
- Target audience definition
- Launch date or time window
- Success metrics (KPIs)

Build the summary:
- Problem statement (what problem does it solve?)
- Solution statement (how does it solve it?)
- Unique value proposition (why this solution?)
- Target market size estimate

### Step 2: Competitive Research
Analyze the competitive landscape:
- Direct competitors (solving the same problem, 3-5)
- Indirect competitors (alternative solutions)
- For each competitor: strengths, weaknesses, pricing
- Market gap analysis
- Differentiation opportunities
- Competitor positioning matrix

### Step 3: Positioning
- Target audience segmentation (primary, secondary personas)
- Unique selling proposition (USP) definition
- Messaging framework:
  - Headline
  - Subheadline
  - 3 core benefit bullets
  - Social proof strategy (testimonials, statistics, logos)
- Tone and voice (brand-aligned)
- Keywords and SEO strategy

### Step 4: Pricing Analysis
- Cost-base calculation
- Competitor pricing comparison
- Value-based pricing suggestion
- Price tiers (if applicable):
  - Free / Freemium
  - Starter
  - Professional
  - Enterprise
- Intro pricing strategy
- Revenue projection (3-6-12 months)

### Step 5: Landing Page Draft
Design a conversion-driven page structure:
- **Hero Section:** Headline + value proposition + primary CTA + visual placeholder
- **Problem/Solution:** Name the user's pain, show the solution
- **Features:** 3-6 core features, with benefits
- **How It Works:** A 3-4 step visual flow
- **Social Proof:** Testimonials, customer logos, statistics
- **Pricing:** Comparison table
- **FAQ:** 5-8 frequent questions
- **Final CTA:** Strong closing message + action button
- **Technical:** SEO meta tags, OG image, structured data

### Step 6: Go-to-Market Checklist

**Pre-Launch (-2 weeks):**
- [ ] Landing page build and test
- [ ] Email list segmentation and prep
- [ ] Social media content calendar
- [ ] Press release draft and distribution list
- [ ] Beta group feedback collection
- [ ] Support documentation (FAQ, guides)
- [ ] Analytics and tracking setup (GA, Mixpanel, etc.)
- [ ] A/B test plans

**Launch Day:**
- [ ] Landing page go-live
- [ ] Email campaign send (by hour)
- [ ] Social media posting plan (per platform, per hour)
- [ ] Product Hunt / Hacker News post (if fitting)
- [ ] Community announcements (Discord, Slack, forums)
- [ ] Live support team ready
- [ ] Real-time metric tracking

**Post-Launch (+2 weeks):**
- [ ] Daily metric tracking and reporting
- [ ] User feedback collection and analysis
- [ ] Bug and issue tracking (prioritized fixes)
- [ ] Content marketing (blog, video, podcast)
- [ ] Performance optimization (page speed, conversion)
- [ ] Retrospective and learnings report

### Step 7: Create the Plan File
Create `launch-plan-[product-name].md`:
- Combines every step's output into one document
- Trackable format with a dated checklist
- Blank fields for ownership assignments

# Output Format
```
=== BADI LAUNCH PLAN ===
Product: [product name]
Target Date: [date]
Status: DRAFT

Created: launch-plan-[product-name].md

Contents:
1. Product Summary and Value Proposition
2. Competitive Analysis Matrix
3. Positioning and Messaging
4. Pricing Strategy
5. Landing Page Draft
6. Go-to-Market Checklist
7. Success Metrics and KPIs
===========================
```
