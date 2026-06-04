Workflow-to-command command. Converts repetitive manual workflows into reusable Badi commands.

# Required Tools
- Read (existing commands) -- Write (new command) -- Glob (existing command list) -- Grep (pattern/reference)

# Procedure (7 Steps)

## 1. Name It
- Use the argument if given -- otherwise derive it from the description
- Rules: kebab-case (`bug-triage`, `sprint-plan`) -- short and memorable (1-3 words) -- action-reflecting (verb/verb-object) -- no collision with existing names

Collision check: scan `.claude/commands/` -- same/similar exists? -- suggest alternatives.

## 2. Capture the Workflow
For every step: what is done (action) -- where (file/directory/system) -- why (purpose/context) -- inputs -- outputs -- success criterion -- failure case

Chronological order + numbering.

## 3. Detect the Patterns
- **Parallelism:** independent steps -- parallel subtasks
- **User input:** human decisions -- approval waits -- data-collection points
- **Conditional branching:** "If X then Y, else Z" -- optional steps -- error routing
- **Tool needs:** Claude tools (Read, Write, Bash, Grep, ...) -- external tools (git, npm, docker, ...)
- **Existing skill matches:** do parts overlap with an existing command -- can it be invoked as a substep

## 4. Define the Arguments
Identify the inputs that change per run:
- Which values vary -- defaults -- required/optional split -- the `argument-hint` description

```
Argument: [project-name]  Default: current directory  Description: "Name of the project the playbook targets"
```

## 5. The Command File
Create `.claude/commands/[name].md` in the standard format:

```markdown
[One-line description]

# Required Tools
- [Tool 1] ([for what])
- [Tool 2] ([for what])

# Procedure ([step count] Steps)

### Step 1: [Name]
[instruction]

### Step 2: [Name]
[instruction]

# Output Format
```
[template]
```
```

Rules: write in English, clear and direct -- every step understandable on its own -- tool usage explicit -- failure cases covered -- a crisp output format.

## 6. Validate and Refine
Present to the user: does it reflect the workflow correctly -- missing/wrong steps -- extra conditions/special cases -- apply the edits -- final approval.

Technical: referenced tools valid -- file paths -- markdown -- output format consistent.

## 7. Add to the Index
`command-index.md` (if present): the new command in the right category -- a description line -- cross-references to related commands

`| /[name] | [short description] | [category] |`

# Output Format
```
=== BADI PLAYBOOK ===
Command: /[name]
File: .claude/commands/[name].md
Step Count: [count]
Tool Count: [count]
Argument: [description or "none"]

Status: CREATED
Index: UPDATED / NO INDEX

> The "[name]" command was registered as `/[name]`.
> Run it any time to repeat this workflow.
======================
```

# Tips
- Do not over-complicate simple workflows -- 3-7 steps ideal (never past 10) -- one purpose per command (single responsibility) -- split complex flows -- reference existing commands as substeps
