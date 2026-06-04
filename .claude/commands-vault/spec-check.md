Specification conformance command. Audits the current code against SPECIFICATION.md, detecting feature gaps and scope drift.

# Required Tools
- Read (SPECIFICATION.md, source code)
- Grep (feature search)
- Glob (file scan)
- Agent (auditor agent)
- Bash (running tests)

# Procedure (5 Steps)

### Step 1: Load the Specification
- Read `docs/SPECIFICATION.md`
- Extract the core features (Must Have)
- List the acceptance criteria
- Identify the Non-Goals items

### Step 2: Codebase Scan
For every "Must Have" feature:
- Search for the related code (functions, routes, components)
- Assess whether the acceptance criterion is met
- Check test coverage

### Step 3: Drift Detection
**Missing Features:**
- Features in the spec but not found in the code

**Scope Creep:**
- Features in the code but NOT in the spec
- Things marked Non-Goals yet implemented anyway

**Partial Implementations:**
- Features started but not finished
- Implementations that fail the acceptance criteria

### Step 4: Build the Conformance Report
A status per feature:
- **DONE** — Acceptance criteria met
- **PARTIAL** — Started but unfinished
- **MISSING** — Not implemented yet
- **DRIFT** — Implemented differently from the spec

### Step 5: Action Suggestions
- Prioritized missing-feature list
- Scope-creep remediation suggestions
- TaskBoard.md update (new tasks for the gaps)

# Output Format
```
=== BADI SPEC CONFORMANCE CHECK ===
Specification: docs/SPECIFICATION.md
Date: [date]

Conformance Rate: [percent]%

Must Have: [done]/[total]
Should Have: [done]/[total]
Could Have: [done]/[total]

MISSING Features:
- [feature name] — [status]

DRIFT Findings:
- [drift description]

SCOPE CREEP:
- [marked non-goal but implemented]

Next: [priority action]
=========================================
```
