Daily standup command. Produces a quick status summary in under 30 seconds.

# Required Tools
- Bash (git log)
- Read (task board, notes)
- Grep (activity scan)

# Procedure (Target: 30 seconds)

### Step 1: Git Activity (Parallel)
- Get the last working day's commits: `git log --oneline --since="yesterday"`
- Count the changed files
- Check the branch status

### Step 2: Task Board (Parallel)
- Read the active tasks
- Count the completed ones
- Detect blocked tasks
- Identify newly added tasks

### Step 3: Previous Notes (Parallel)
- Read the latest daily note
- Check the handoff note if one exists
- Find the "tomorrow's work" section

### Step 4: Current Focus
- Determine today's priorities
- Check dependencies
- Any risks or blockers?

# Output Format
```
=== BADI STANDUP ===
Date: [date]

YESTERDAY:
- [work done - from git commits and notes]
- [completed tasks]

TODAY:
- [planned work - in priority order]
- [in-progress tasks]

BLOCKERS:
- [blockers and expectations, if any]
- [otherwise: "No blockers, road clear."]

METRICS:
- Commits (yesterday): [count]
- Open Tasks: [count]
- Completed (yesterday): [count]
====================
```

# Rules
- Keep it short and tight, 15 lines of output max
- One line per item
- Highlight blockers (if any)
- Always include the metrics
- Do not exceed 30 seconds
