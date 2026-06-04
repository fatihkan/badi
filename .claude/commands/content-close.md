Content session close command. Summarizes the day's output, prepares for tomorrow, and notes learnings.

# Required Tools
- Read (today's content, notes)
- Glob (files created today)
- Grep (placeholder check)
- Write (daily note update)
- Bash (date and file listing)

# Procedure (6 Steps)

### Step 1: Collect Today's Output
Find today's files under `.claude/workspace/`:
- `icerikler/` — Posts and carousels
- `senaryolar/` — Videos
- `gorseller/` — Visual briefs
- `takvim/` — Calendar updates

For each file:
- File name
- Content type
- Complete? (any placeholders?)
- For which platform?

### Step 2: Completion Check
Look for placeholder markers in every draft:
- `[...]` (bracketed placeholders)
- `TODO`, `TBD`, `FIXME`
- Empty sections

**Complete**: No placeholders, publish-ready
**Partial**: Some parts filled, some missing
**Draft**: Mostly empty

### Step 3: Publishing Plan
Suggest publish times for completed content:
- Platform-optimal hours
- Theme fit (day/time)
- Suggestion to add to the calendar

```
[Content] -> [Platform] -> [Day] [Time]
```

### Step 4: Prepare for Tomorrow
Create a prep note for tomorrow:
- **What's on tomorrow?** Check the calendar
- **Any unfinished drafts?** Make them tomorrow's first job
- **Any ongoing series?** (carousel series, video series)
- **Any trend opportunities?** (current events, special days)

### Step 5: Learnings and Notes
Note today's insights:
- **What went well?** (content that came easily)
- **What was hard?** (where you got stuck)
- **Any new ideas born?** (for future use)
- **Does the brand voice need a correction?**

Learnings can be nominated into `knowledge-nominations.md`.

### Step 6: Close the Session Note
Update `.claude/workspace/icerik-notlari/[date].md`:

```markdown
# Content Notes — [date]

## Today's Priority
[the priority set in the morning]

## Completed
- [x] [content 1] — [platform]
- [x] [content 2] — [platform]

## Partially Completed
- [ ] [content 3] — [what's missing]

## Ideas / Notes
- [new idea]
- [learning]

## For Tomorrow
- [ ] [priority 1]
- [ ] [priority 2]

## Performance Notes
[numbers if any]
```

# Output Format
```
=== BADI CONTENT CLOSE ===
Date: [date]
Duration: [estimated working time]

-------------------------------------------
PRODUCED TODAY
-------------------------------------------
Complete: [count]
Partial: [count]
Draft: [count]
Total: [count]

-------------------------------------------
DETAIL LIST
-------------------------------------------
COMPLETE:
  + [file 1] ([platform])
  + [file 2] ([platform])

PARTIAL:
  ~ [file 3] ([what's missing])

-------------------------------------------
PUBLISHING SUGGESTIONS
-------------------------------------------
| Content | Platform | Suggested Time |
|---------|----------|----------------|

-------------------------------------------
FOR TOMORROW
-------------------------------------------
Priorities:
1. [finish the partial one]
2. [calendar-planned content]
3. [new idea]

-------------------------------------------
LEARNINGS
-------------------------------------------
- [note 1]
- [note 2]

-------------------------------------------
SESSION NOTE
-------------------------------------------
File: .claude/workspace/icerik-notlari/[date].md
============================
```

# When to Use
- Every day when content production ends (evening ritual)
- At the end of a batch production session
- For the weekly close on weekends
