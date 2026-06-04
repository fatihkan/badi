Badi session start command. Runs new-project onboarding or a daily kickoff.

# Required Tools
- Bash (filesystem access)
- Read (memory and context files)
- Glob (project structure scan)
- Grep (code search)
- Write (daily note creation)

# Mode Selection

Ask the user: "New-project onboarding or a daily kickoff?"

---

## A) New-Project Onboarding

### Step 1: Project Structure Scan
- Scan all files and folders in the root directory
- Find manifest files like `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`
- Detect infrastructure files like `.env.example`, `docker-compose.yml`, `Makefile`

### Step 2: Tech Stack Detection
- Programming languages and versions
- Frameworks and libraries
- Databases and external services
- CI/CD and deploy infrastructure
- Test tooling

### Step 3: Context Questions (4 Questions)
Ask the user:
1. "What is the core purpose of this project and who is its target user?"
2. "What is your most important priority right now?"
3. "Any technical constraints or decisions I should know about?"
4. "What are your working-style preferences? (commit style, branch strategy, test expectations)"

### Step 4: Memory Creation
Create or update `memory.md` with what was gathered:
- Project summary
- Tech stack
- User preferences
- Important file paths
- Architecture notes

### Step 5: Skill Suggestions
Suggest the Badi commands that fit the project:
- Which commands will be most useful for this project
- A suggested daily workflow
- Note any custom command needs

---

## B) Daily Kickoff

### Step 1: Get the Date
- Determine today's date in `DDMMYY` format (example: 090426)

### Step 2: Load Context
- Read `memory.md`
- Read `knowledge-base.md` if it exists
- Check the latest session notes

### Step 3: Create the Daily Note
Create `daily-notes/DDMMYY.md`:
```markdown
# Daily Note - [DD.MM.YYYY]

## Focus Areas
- [ ] ...

## Notes
...

## Decisions
...

## Tomorrow's Work
...
```

### Step 4: Review the Task Board
- List the open tasks
- Check work left from the previous session
- Detect completed-but-not-closed tasks

### Step 5: Background Watcher Summary (v1.13+)
- Run `badi agent status --since 24h` (if available; pass silently on error)
- If the output includes `!! N warnings`, add a "Watcher warnings" section to the briefing
- Ask the user: "Shall we look at these warnings?"

### Step 6: Confirm Priorities
Ask the user:
- "Are today's priorities correct?"
- "Any changes or additions?"

### Step 7: Briefing
Present a short summary:
```
=== BADI DAILY BRIEFING ===
Date: [date]
Open Tasks: [count]
Today's Focus: [priorities]
In Progress: [carried over from the previous session]
Watcher: [N warnings in 24h | all OK | no watcher]
Attention: [important notes or warnings]
===========================
```

# Output Format
- Mode A: Project profile + memory file + skill suggestions
- Mode B: Daily briefing + note file + priority list
