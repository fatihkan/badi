Handoff briefing command. Enables a smooth transition to another developer or session.

# Required Tools
- Read (context, notes, tasks)
- Bash (git status)
- Write (handoff file)

# Procedure (5 Steps)

### Step 1: Gather Context
Build the full picture of the current state:
- Read `memory.md`
- Review the daily notes
- Check the git status (branch, uncommitted changes)
- Read the task board
- Check previous handoff notes

### Step 2: Document Achievements
List the work completed in this period:
- Completed features and improvements
- Fixed bugs
- Completed research or analyses
- Architectural decisions taken and their rationale
- Refactoring or cleanup work done

### Step 3: Identify Prerequisites
Prepare what the recipient needs:
- Development environment requirements
- Special configuration or access needs
- Migrations or scripts that must be run
- Environment variables
- Third-party service access details (excluding secrets)

### Step 4: Build the Recipient Context
So the person taking over can start immediately:
- Current branch state and where it merges
- Open tasks in priority order
- Known issues and workarounds
- Blocked work and what it waits on
- Test status (passing/failing tests)
- Critical deadlines

### Step 5: Create the Handoff File
Create `handoffs/handoff-[DDMMYY].md`:

```markdown
# Handoff Briefing - [date]

## Project Summary
[the project's current state, 2-3 sentences]

## Period Summary
**Start:** [date]
**End:** [date]
**Focus Area:** [main work area]

## Achievements
- [list of completed work]

## Current State

### Branch Status
- Active Branch: [branch name]
- Base: [target branch]
- Uncommitted Changes: [yes/no]
- CI Status: [passed/failed/pending]

### Open Tasks (In Priority Order)
1. **[HIGH]** [task description]
   - Status: [status]
   - Next step: [step]
2. **[MEDIUM]** [task description]
   ...

### Known Issues
- [issue]: [workaround or plan]

### Blocked Work
- [work]: [why blocked, waiting on whom/what]

## Prerequisites
- [environment requirements]
- [configuration steps]

## Critical Dates
- [date]: [for what]

## Important Files
- [file path]: [why it matters]

## Notes and Warnings
[special situations to watch]

## Contact
[contact info for questions]
```

# Output Format
- The `handoffs/handoff-[DDMMYY].md` file
- Updated `memory.md` (handoff reference)
- Terminal summary (short list of what was handed off)
