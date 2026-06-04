Project planning command. Turns vague project ideas into 5 structured documents: specification, implementation plan, task list, brand identity, and a kickoff prompt.

# Required Tools
- Read (reference files, existing project info)
- Write (5 documents + TaskBoard integration)
- Agent (project-architect agent)
- Bash (project analysis)

# Procedure (7 Steps)

### Step 1: Get the Project Idea
Ask the user to describe the project:
- The project idea (1-2 sentences is enough, raw is fine)
- Size estimate: Small (weekend) / Medium / Large

### Step 2: Activate the Project-Architect Agent
Delegate to the agent:
- Pass the project idea
- Pick the question layer by the size estimate
- Start the interactive discovery (Layer 1-3 questions)

### Step 3: Load the References
The agent reads these reference files:
- `.claude/references/design-patterns.md`
- `.claude/references/specification-guide.md`
- `.claude/references/implementation-guide.md`
- `.claude/references/tasks-guide.md`
- `.claude/references/tech-stacks.md`
- `.claude/references/elicitation-guide.md`

### Step 4: Tech Stack Selection
Interactive tech-stack advisory:
- Offer options at 8 decision points
- Show pros/cons for each option
- Get the user's approval

### Step 5: Create the 5 Documents
Create in order:
1. `docs/SPECIFICATION.md` — Scope, features, acceptance criteria
2. `docs/IMPLEMENTATION.md` — Tech stack, patterns, directory structure
3. `docs/TASKS.md` — Ordered task list (by phase)
4. `docs/BRANDING.md` — Visual identity (user-facing projects)
5. `docs/PROMPT.md` — A single-pass kickoff prompt

### Step 6: Badi Integration
Integrate the produced documents into the Badi system:
- Move tasks from TASKS.md into `.claude/workspace/TaskBoard.md`
- Nominate the key architecture decisions from IMPLEMENTATION.md into `knowledge-base.md`
- Add the SPECIFICATION.md summary to `memory.md`

### Step 7: Next Steps
Point the user to:
- `/scaffold` to build the project structure (from IMPLEMENTATION.md)
- `/start` to begin the development session
- `/spec-check` for conformance checks (during development)

# Output Format
```
=== BADI PROJECT ARCHITECTURE ===
Project: [project name]
Size: [small/medium/large]
Tech Stack: [main technologies]

Created Documents:
  + docs/SPECIFICATION.md
  + docs/IMPLEMENTATION.md
  + docs/TASKS.md
  + docs/BRANDING.md (if applicable)
  + docs/PROMPT.md

Integration:
  ~ TaskBoard.md updated ([count] tasks added)
  ~ memory.md updated (project summary)

Next:
  1. /scaffold — Build the project structure
  2. /start — Start developing
==============================
```
