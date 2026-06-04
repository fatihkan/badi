Mid-session context refresh command. Keeps context fresh and consistent during work.

# Required Tools
- Read (memory and context files)
- Write (writing updates)
- Grep (change scan)
- Bash (git status)

# Procedure (9 Steps)

### Step 1: Read Context
- Read `memory.md`
- Read `knowledge-base.md`
- Read the active daily note (`daily-notes/DDMMYY.md`)
- Check the latest `handoffs/` note

### Step 2: Process Notes
- List the decisions made this session
- Identify new learnings
- Note changed requirements
- Record solved and newly surfaced problems

### Step 3: Manage Tasks
- Mark completed tasks as "done"
- Add newly surfaced tasks
- Re-evaluate priorities
- Check dependencies

### Step 4: Contextual Self-Check
Evaluate these questions as an internal check:
- "Is the current work aligned with the goal?"
- "Any signs of scope creep?"
- "Anything skipped or postponed?"
- "Am I consistent with the user's latest requests?"

### Step 5: Boyd Loop Check (OODA)
- **Observe:** What is the current state?
- **Orient:** How do I interpret this information?
- **Decide:** What should the next step be?
- **Act:** What action will I propose?

### Step 6: Update Memory
- Add new information to `memory.md`
- Update or remove stale information
- Resolve and note any contradictions

### Step 7: Review the Event Log
- Scan recent changes (git log, file changes)
- Warn about unexpected changes
- Order important events chronologically

### Step 8: Coach Insight
Offer a brief assessment:
- How is the productivity flow going?
- Any distraction or blocking?
- Is a break recommended?

### Step 9: Status Report
```
=== BADI SYNC ===
Time: [time]
Session Length: [estimate]
Completed: [since the last sync]
In Progress: [active work]
New Tasks: [added]
Memory State: CURRENT / WARNING
Boyd Analysis: [summary]
Coach Note: [insight]
============================
```

# Output Format
- Updated memory file
- New information added to the daily note
- Status report (format above)
- Suggestion or warning list when needed
