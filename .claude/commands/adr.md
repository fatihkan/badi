Architecture Decision Record (ADR) command. Documents architectural decisions in a structured format.

# Required Tools
- Read (existing ADRs)
- Write (new ADR file)
- Grep (related decision search)
- Agent (architecture-advisor agent)

# Procedure (5 Steps)

### Step 1: Gather the Decision Context
From the user:
- What situation requires a decision?
- What constraints exist? (time, budget, technical)
- Who is affected?

### Step 2: Evaluate the Alternatives
Delegate to the architecture-advisor agent:
- Analyze the current architecture
- Identify at least 3 alternatives
- List pros/cons for each alternative
- Run a trade-off analysis

### Step 3: Document the Decision
Write in ADR format:
```markdown
# ADR-[number]: [Title]
Date: [date]
Status: ACCEPTED

## Context
[The situation requiring the decision, constraints, stakeholder needs]

## Decision
[The chosen approach and its rationale]

## Considered Alternatives
### Alternative A: [name]
- Pros: ...
- Cons: ...
- Why not chosen: ...

### Alternative B: [name]
...

## Consequences
### Positive
- ...
### Negative
- ...
### Neutral
- ...

## Related Decisions
- ADR-XX: [related decision]
```

### Step 4: Save
- Save into `docs/adr/` (create if missing)
- Assign the ADR number sequentially
- Update INDEX.md (if present)

### Step 5: Update Related Documents
- Add a reference to CLAUDE.md or knowledge-base.md (where fitting)
- Add cross-references to related ADRs

# Output Format
```
=== BADI ADR ===
Number: ADR-[number]
Title: [decision title]
Status: ACCEPTED
File: docs/adr/[number]-[title].md
================
```
