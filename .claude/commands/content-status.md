Content production status panel. Shows current output volume, pending items, calendar fit, and trend data.

# Required Tools
- Read (workspace files)
- Glob (all content directories)
- Grep (placeholder and status detection)
- Bash (file dates, counting)

# Procedure (5 Steps)

### Step 1: Take Inventory
Scan all content files under `.claude/workspace/`:
- `icerikler/` — Post and carousel count
- `senaryolar/` — Video script count
- `gorseller/` — Visual brief count
- `takvim/` — Calendar files
- `marka-sesi.md` if present

Per file, extract metadata:
- Creation date
- Last modified date
- File size (fill indicator)
- Placeholder count

### Step 2: Time-Based Grouping

**Today:** Created/edited today
**This week:** Last 7 days
**This month:** Last 30 days
**Old:** 30+ days

For each group:
- Total count
- Completion ratio

### Step 3: Completion Analysis
Determine each item's status:

**COMPLETE (publish-ready):**
- No placeholders
- All sections filled
- Visual note present

**PARTIAL (needs editing):**
- Some parts filled
- Main message set but details missing

**DRAFT (freshly created):**
- Mostly placeholders
- Basic structure present

**STALE (archive candidate):**
- Untouched for 30+ days
- Still holding placeholders

### Step 4: Calendar Fit Check
If a calendar file exists:
- How many items planned?
- How many produced?
- How many published?
- Any delays?

```
Plan fit ratio: [percent]%
```

### Step 5: Trends and Suggestions
Compute the last 2 weeks' trends:
- Production speed (average per day)
- Most produced format
- Least produced format (dormant channel warning)
- Stalls (zero-production days)

Generate suggestions:
- Neglected platforms
- Drafts starting to go stale
- Unfinished work

# Output Format
```
=== BADI CONTENT STATUS ===
Date: [date] [time]

-------------------------------------------
INVENTORY
-------------------------------------------
Total Files: [count]

Posts/Carousels:    [count]
Video Scripts:      [count]
Visual Briefs:      [count]
Calendars:          [count]

Brand Voice: [PRESENT / MISSING]

-------------------------------------------
TIME DISTRIBUTION
-------------------------------------------
Today:      [count]  [======    ]
This Week:  [count]  [========  ]
This Month: [count]  [==========]
Old:        [count]

-------------------------------------------
COMPLETION
-------------------------------------------
Complete:  [count] (%[ratio])
Partial:   [count]
Draft:     [count]
Stale:     [count]

-------------------------------------------
CALENDAR FIT
-------------------------------------------
Planned:    [count]
Produced:   [count]
Published:  [count]
Fit:        [percent]%

-------------------------------------------
TREND (Last 2 Weeks)
-------------------------------------------
Daily Average: [count] items
Most Popular: [format] ([count])
Least: [format] ([count])
Stalls: [day count]

-------------------------------------------
WARNINGS
-------------------------------------------
- [staleness warning]
- [dormant channel]
- [overdue content]

-------------------------------------------
SUGGESTIONS
-------------------------------------------
1. [concrete suggestion]
2. [concrete suggestion]
3. [concrete suggestion]

-------------------------------------------
QUICK ACTIONS
-------------------------------------------
Finish a pending draft:  [file]
Produce new content:     badi content [type] "[topic]"
Create a calendar:       badi content calendar "[period]"
Generate ideas:          /content-idea
==========================
```

# When to Use
- Daily status check
- Before the weekly retro
- In stuck moments ("what should I do?")
- Plan vs. reality comparison
