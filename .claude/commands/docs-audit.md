Documentation audit command. Evaluates completeness, freshness, and quality of technical documentation.

# Required Tools
- Read (documentation files)
- Grep (reference scan)
- Glob (file discovery)
- Bash (git log, file dates)

# Procedure (5 Steps)

### Step 1: Documentation Inventory
Scan all documentation files:
- README.md files (root + subdirectories)
- API documentation
- Architecture documentation (including ADRs)
- User guides
- Developer guides
- Install/getting-started instructions
- CHANGELOG, CONTRIBUTING, SECURITY
- In-code comments (JSDoc, docstrings, etc.)

### Step 2: Completeness Check
For each document, verify:
- [ ] Is it current? (last change date vs. related code changes)
- [ ] Do referenced files/functions still exist?
- [ ] Do the install steps still work?
- [ ] Are the code examples current?
- [ ] Any broken links?
- [ ] Any missing sections?

### Step 3: Coverage Gap Analysis
Detect undocumented areas:
- Public APIs without documentation
- Important directories without a README
- Configuration files without explanations
- Undocumented environment variables
- Missing error-code descriptions

### Step 4: Quality Assessment
- Consistent format and tone?
- The right level for the target audience?
- Do the code examples run?
- Are visuals/diagrams current?

### Step 5: Report and Action Plan
Prioritize the findings:
- **CRITICAL**: Wrong/misleading information
- **HIGH**: Entirely missing documentation
- **MEDIUM**: Outdated content
- **LOW**: Improvable format/style

# Output Format
```
=== BADI DOCUMENTATION AUDIT ===
Files Scanned: [count]
Coverage Score: [percent]%

CRITICAL: [count] findings
HIGH: [count] findings
MEDIUM: [count] findings
LOW: [count] findings

Most Urgent: [top 3 actions]
===================================
```
