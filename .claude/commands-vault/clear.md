Context-clearing command. Provides a seamless transition across session boundaries. Target: under 30 seconds.

# Required Tools
- Read (context files)
- Write (handoff note and memory update)

# Procedure (6 Steps)

### Step 1: Reset the Gates
- Clear the active file-watch list
- Reset temporary analysis results
- Close any open parallel work
- Clear in-session variables

### Step 2: Summarize the Session (7 Components)
Build a summary covering these 7 components:

1. **Active Task:** What task is being worked on right now?
2. **Status:** What stage? (start/middle/done/blocked)
3. **Last Action:** What was the most recent work?
4. **Next Step:** What needs to happen immediately?
5. **Open Questions:** Any questions awaiting answers?
6. **Changed Files:** Files modified this session
7. **Key Context:** Critical information the next session must know

### Step 3: Write the Handoff Note
Create `handoffs/handoff-[DDMMYY-HHMM].md`:
```markdown
# Handoff Note - [date time]

## Active Task
[task description]

## Current Status
[status detail]

## Recent Actions
- [action list]

## Next Steps
1. [step]
2. [step]

## Open Questions
- [questions]

## Changed Files
- [file list]

## Critical Context
[information that must not be lost]
```

### Step 4: Update Memory
In `memory.md`:
- Update the latest task status
- Add the handoff note reference
- Update the timestamp

### Step 5: Move Learnings
Transfer this session's learnings into `knowledge-base.md`:
- Technical knowledge
- Project decisions
- Process notes

### Step 6: Auto-Continue
Prepare for the next session's start command:
- Point to the handoff note path
- Highlight the priority actions
- Offer a starting suggestion

# Output Format
```
=== BADI CONTEXT CLEAR ===
Duration: [seconds]s
Handoff Note: handoffs/handoff-[date].md
Memory: UPDATED
Learnings: [count] items transferred

For the Next Session:
> [one-line starting suggestion]
===============================
```

# Performance Target
- The whole operation must finish in under 30 seconds
- The memory file must not exceed 500 lines
- The handoff note must be concise and clear (no needless detail)
