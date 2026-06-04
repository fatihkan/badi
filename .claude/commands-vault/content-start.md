Content production session start command. Gives the daily content session a structured start, shows pending work, and sets priorities.

# Required Tools
- Read (brand voice, calendar, existing content)
- Glob (workspace files)
- Grep (trend and pattern searches)
- Bash (date and file dates)
- Write (daily note)

# Procedure (7 Steps)

### Step 1: Load Context
Read these files:
- `.claude/workspace/marka-sesi.md` — Brand tone and rules
- `.claude/workspace/takvim/` — The latest content calendar
- `.claude/workspace/icerikler/` — Last 10 content items
- `.claude/workspace/senaryolar/` — Last 5 video scripts
- `memory.md` — Active campaign or project

If these files do not exist, guide the user:
- No brand voice: suggest `badi content brand`
- No calendar: suggest `badi content calendar`

### Step 2: What's On Today?
List the content planned for today in the calendar:
- Which platforms get posts?
- Which themes are planned?
- Any pending drafts?

If nothing is planned for today, suggest a theme by day of week:
- Monday: Motivation / Week opener
- Tuesday: Educational / Tips
- Wednesday: Behind the scenes / Community
- Thursday: Product / Service
- Friday: Fun / Trends
- Saturday: UGC / Social proof
- Sunday: Inspiration / Weekly recap

### Step 3: Pending Drafts
Scan the last 7 days of files in `.claude/workspace/icerikler/` and `.claude/workspace/senaryolar/`. For each:
- File name and date
- Filled in, or still holding placeholders?
- For which platform?

Surface the unfinished (placeholder-containing) drafts.

### Step 4: Recent Performance (if available)
If `.claude/workspace/performans.md` or a similar tracking file exists:
- Last week's 3 best-performing pieces
- The 3 lowest performers
- Trend note (rising/falling)

### Step 5: Idea Suggestions
Generate ideas from these sources:
- This month's special days and events
- Current/trending topics (brand-fit ones)
- Evergreen content templates
- Pending FAQ or customer questions

Offer 3-5 concrete content ideas:
```
1. [Platform] — [Format] — [Topic]: [why it matters]
2. ...
```

### Step 6: Today's Priority
Ask or suggest the single thing to focus on today:
- The most critical content (publish date approaching)
- The highest-impact opportunity (trend, special day)
- The fastest win (finishing a ready draft)

### Step 7: Start the Session Note
Create today's note file under `.claude/workspace/icerik-notlari/`:

```
# Content Notes — [date]

## Today's Priority
[chosen priority]

## Planned Production
- [ ] [content 1]
- [ ] [content 2]

## Ideas / Notes
- ...

## Completed
(filled during the day)
```

# Output Format
```
=== BADI CONTENT SESSION ===
Date: [date] ([day name])
Brand Voice: [loaded / missing]

-------------------------------------------
FROM TODAY'S CALENDAR
-------------------------------------------
[planned content or "nothing planned for today"]

Theme of the day: [day-based theme]

-------------------------------------------
PENDING DRAFTS
-------------------------------------------
[unfinished draft list]
Total: [count] drafts

-------------------------------------------
RECENT PERFORMANCE
-------------------------------------------
[summary if available, otherwise "no data"]

-------------------------------------------
IDEA SUGGESTIONS
-------------------------------------------
1. [Platform] [Format]: [topic]
2. ...

-------------------------------------------
FOCUS TODAY
-------------------------------------------
Single priority: [clear suggestion]

To get started:
  badi content post "[topic]"
  badi content carousel "[topic]"
  badi content video "[topic]"
  /content-generate
==============================
```

# When to Use
- Every day when starting content production (morning ritual)
- When production feels stuck
- At the start of the week
