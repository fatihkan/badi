Content idea generation command. Creates a structured idea list for a topic, theme, or platform.

# Required Tools
- Read (brand voice, past content, trend notes)
- Grep (repeat check)
- Glob (archive scan)
- Bash (trend data, time)

# Procedure (5 Steps)

### Step 1: Idea Parameters
From the user:
- **Topic area:** General theme or sector (optional)
- **Platform:** For which platform? (if any)
- **Format:** Post / Carousel / Video / All
- **Tone:** Must match the brand voice (automatic)
- **Count:** How many ideas? (default: 10)
- **Goal:** Engagement / Sales / Awareness / Education

### Step 2: Source Scan
Feed from idea sources:

**Internal sources:**
- Content produced in the last 30 days (repeat prevention)
- Pending drafts (improvable)
- Customer questions / FAQ
- Current product / service list

**External sources (if available):**
- Seasonal calendar (month / week)
- Special days (world X day, holidays)
- Industry trends
- Popular format examples

### Step 3: Generate 10 Ideas
Categorize by different angles:

**Educational (3-4 ideas):**
- How-to
- X-tip lists
- Common mistakes
- Beginner guides

**Story (2-3 ideas):**
- Personal experience
- Customer success story
- Behind the scenes

**Fun/Trend (2-3 ideas):**
- Meme adaptation
- Trending format
- Challenge

**Sales-Focused (1-2 ideas):**
- Product promo
- Discount announcement
- Case study

### Step 4: Quick Brief per Idea
A mini summary for each idea:
```
[number]. [Platform] — [Format] — [Title]
   Tone: [tone]
   Hook: [first-sentence idea]
   Message: [one-sentence summary]
   CTA: [suggested call]
   Impact: [LOW / MEDIUM / HIGH]
   Effort: [LOW / MEDIUM / HIGH]
```

### Step 5: Priority Suggestion
Rank by impact/effort ratio:
- **Quick Win** (High impact, low effort) — Do today
- **Strategic** (High impact, high effort) — Plan it
- **Filler** (Low impact, low effort) — When the chance comes
- **Avoid** (Low impact, high effort) — Drop from the list

# Output Format
```
=== BADI CONTENT IDEAS ===
Date: [date]
Topic Area: [area]
Platform: [platform]
Count: [number]

-------------------------------------------
QUICK WINS (Do Today)
-------------------------------------------
1. [Platform] [Format]: [title]
   Hook: [sentence]
   Message: [summary]
   CTA: [call]
   Time: ~[minutes]

2. ...

-------------------------------------------
STRATEGIC (Plan)
-------------------------------------------
3. [Platform] [Format]: [title]
   ...

-------------------------------------------
FILLER
-------------------------------------------
4. ...

-------------------------------------------
SPECIAL DAY TIE-INS
-------------------------------------------
Upcoming special days:
- [date]: [event] -> idea: [suggestion]

-------------------------------------------
NEXT STEP
-------------------------------------------
Quick start:
  badi content post "[chosen idea]"
  badi content carousel "[chosen idea]"
  /content-generate
=============================
```

# When to Use
- When stuck for ideas (creative block)
- Before weekly planning
- To catch trends
- To speed up production (a ready idea pool)
