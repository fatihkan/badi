Weekly content planning session command. Sets next week's content strategy, themes, and production targets.

# Required Tools
- Read (brand voice, past calendars, performance)
- Write (new calendar file)
- Grep (past content analysis)
- Glob (file search)
- Bash (date calculations)

# Procedure (6 Steps)

### Step 1: Last Week's Review
Analyze the last 7 days of production output:
- How much content was produced? (per platform)
- Which were planned, which spontaneous?
- Any planned content left unfinished?
- Which format do you produce most? (post, carousel, video)

Ask:
- **What were your 3 best pieces?** (by engagement or satisfaction)
- **Which was the hardest?** (why was it hard?)

### Step 2: Next Week's Themes
Build the week's theme map:

**Data sources:**
- Special days and events (check the calendar)
- Seasonal opportunities
- Current topics (brand-fit)
- Ongoing campaigns
- Customer questions / FAQ

Set 1 main theme per day:
```
Monday: [theme] — [why]
Tuesday: [theme]
...
```

### Step 3: Platform Distribution
Set a weekly target per platform:

| Platform | Format | Target Count | Theme Link |
|----------|--------|--------------|------------|
| Instagram Post | ... | ... | ... |
| Instagram Reel | ... | ... | ... |
| Twitter/X | ... | ... | ... |
| LinkedIn | ... | ... | ... |
| TikTok | ... | ... | ... |

Note: 3-5 items per platform is enough (quality > quantity).

### Step 4: Build the Content Matrix
Clear planning per day and platform:

```
Monday:
  - IG Post: "[topic]" (theme: [theme])
  - Twitter: thread "[topic]"

Tuesday:
  - IG Reel: 30s "[topic]"
  - LinkedIn: "[topic]"

...
```

### Step 5: Production Cadence
Plan when you will produce the content:
- Batch production day (example: Monday morning for the whole week)
- Daily production (each day for that day)
- Mixed model (prepared ahead + current)

Tip: batch production is efficient, but topical content keeps things dynamic.

### Step 6: Save the Calendar File
Create the detailed file with the `/content-calendar` command, or suggest the
`badi content calendar "[week-date]"` CLI command.

# Output Format
```
=== BADI CONTENT PLAN ===
Week: [start] - [end]
Date: [date]

-------------------------------------------
LAST WEEK SUMMARY
-------------------------------------------
Produced: [count] items
Plan fit: [percent]%
Best: [content]
Hardest: [content]

Learned: [1-2 items]

-------------------------------------------
NEXT WEEK THEMES
-------------------------------------------
Mon: [theme]
Tue: [theme]
Wed: [theme]
Thu: [theme]
Fri: [theme]
Sat: [theme]
Sun: [theme]

-------------------------------------------
PLATFORM DISTRIBUTION
-------------------------------------------
Total target: [count] items
[table]

-------------------------------------------
SPECIAL DAYS
-------------------------------------------
[list if any, otherwise "none"]

-------------------------------------------
PRODUCTION SCHEDULE
-------------------------------------------
Batch: [day/time]
Daily: [day/time]

-------------------------------------------
NEXT STEP
-------------------------------------------
  badi content calendar "[week-date]"
  or
  the /content-calendar command
========================
```

# When to Use
- Sunday evening or Monday morning (weekly planning)
- Before a new campaign
- Re-planning after performance dips
