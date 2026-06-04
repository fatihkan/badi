End-of-day ritual command. Prepares the day for closure and sets the stage for tomorrow.

# Required Tools
- Read (memory, notes, logs)
- Write (updates and report writing)
- Bash (git status, task checks)
- Grep (event scan)

# Procedure (11 Steps)

### Step 1: Read the State
- Read `memory.md`
- Read the daily note (`daily-notes/DDMMYY.md`)
- Check the task board
- Review the git status (uncommitted changes)

### Step 2: Process the Ledger
Compile the day's events:
- Commits and changes made
- Decisions taken and their rationale
- Problems hit and their solutions
- Directions given by the user

### Step 3: Synchronize Memory
Update `memory.md`:
- Add new learnings
- Remove stale information
- Update the project state
- Record important decisions

### Step 4: Move Completed Tasks
- Mark finished tasks as "completed"
- Add the completion date
- Update the status of partially finished tasks
- Note blocked tasks and their reasons

### Step 5: Export Learnings
Record today's lessons:
- Technical learnings (new APIs, patterns, tools)
- Process learnings (what worked / what did not)
- Project insights
- Add them to `knowledge-base.md`

### Step 6: Run the Auditor
Do a quick T1 audit:
- Any uncommitted changes?
- Any broken tests?
- Any temp files or debug code left behind?
- Anything carrying a security risk?

### Step 7: Review the Event Log
- Order the day's important events chronologically
- Anything abnormal or needing attention?
- Flag topics that need follow-up

### Step 8: Preview Tomorrow
- Determine tomorrow's priority tasks
- Check dependencies (work waiting on someone else)
- Any calendar events or deadlines?
- List the suggested focus areas

### Step 9: Update the Daily Notes
Complete the `daily-notes/DDMMYY.md` file:
```markdown
## End-of-Day Summary
- Completed: [list]
- In Progress: [list]
- Deferred: [list]
- Tomorrow's Priority: [list]

## Learnings
- [learnings]

## Decisions
- [decisions and their rationale]
```

### Step 10: Coach Analysis (Fridays)
If it is Friday, run the weekly coaching analysis:
- Weekly productivity summary
- Progress toward goals
- Energy and focus patterns
- Suggestions for next week
- Wins to celebrate

### Step 11: Exit Summary
```
=== BADI END OF DAY ===
Date: [date]
Session Length: [estimate]

Completed Tasks: [count]
Commits: [count]
Line Changes: +[added] / -[removed]

In Progress: [count] tasks
Blocked: [count] tasks

Tomorrow's Priorities:
1. [priority]
2. [priority]
3. [priority]

Audit Status: CLEAN / [issue count] WARNINGS
Memory: SYNCHRONIZED

[If Friday: Weekly Coach Note]
=========================
```

# Output Format
- Updated `memory.md`
- Completed daily note
- `knowledge-base.md` update
- End-of-day summary report
- (Fridays) Weekly coaching report
