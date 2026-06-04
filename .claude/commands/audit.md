Quality audit command. Runs a systematic audit over code, structure, or process.

## Badi CLI Commands (v1.6+)
A Level T4 (Comprehensive) audit runs these CLI tools:
- `badi secret-scan --git` — Secret scan + git history
- `badi lighthouse [url]` — Performance + Core Web Vitals
- `badi a11y [url]` — Accessibility (WCAG 2.1)
- `badi ssl/dns/whois [domain]` — Domain health (if production exists)
- `badi commit --check` — Last commit conventional format

# Required Tools
- Read (file reading)
- Grep (code scan)
- Glob (file discovery)
- Bash (analysis tools)
- Write (report writing)

# Procedure (5 Steps)

### Step 1: Define the Scope
Ask the user: "Pick the audit scope:"
- **File/Directory:** A specific file or folder
- **Module:** A whole module or feature
- **Project-Wide:** The entire codebase
- **Process:** CI/CD, test, deploy processes

### Step 2: Pick the Audit Level (T1-T4)

**T1 - Quick Scan (2-5 min)**
- Syntax and format checks
- Obvious security issues (hardcoded secrets, SQL injection)
- Missing files or broken imports
- Lint rule violations

**T2 - Standard Audit (5-15 min)**
- T1 + code quality metrics
- Duplicated code (DRY violations)
- Naming consistency
- Comment and documentation gaps
- Test coverage analysis

**T3 - Deep Audit (15-30 min)**
- T2 + architectural fit analysis
- Dependency graph review
- Performance bottlenecks
- Error handling patterns
- Access control and authorization

**T4 - Comprehensive Audit (30+ min)**
- T3 + security scan (OWASP Top 10)
- Scalability assessment
- Disaster recovery readiness
- Compliance checks (licenses, GDPR/KVKK, etc.)
- Technical debt inventory
- **Badi CLI Extras**:
  - `badi secret-scan --git` — Secrets + git history
  - `badi lighthouse [url]` — Performance + SEO + A11y + Best Practices
  - `badi a11y [url]` — WCAG 2.1 detail
  - `badi ssl/dns/whois [domain]` — Production domain health
  - `badi commit --check` — Commit format compliance

### Step 3: Delegate to the Audit Agent
Start the audit at the chosen level:
- Mark every check item PASS / FAIL / WARN
- Collect and classify the findings
- Attach evidence (code lines, file paths)

### Step 4: Process the Results
Classify the findings:
- **CRITICAL:** Immediate intervention required (security hole, data-loss risk)
- **HIGH:** Resolve in the short term (performance, error handling)
- **MEDIUM:** Handle in a planned sprint (code quality)
- **LOW:** Improvement opportunity (refactoring, documentation)

### Step 5: Update the Logs
- Add the audit results to the daily note
- Add detected tasks to the task board
- Record important findings in `memory.md`

# Output Format
```
=== BADI AUDIT REPORT ===
Date: [date]
Scope: [specified scope]
Level: T[1-4]
Duration: [elapsed]

## Summary
- Total Checks: [count]
- Passed: [count] | Failed: [count] | Warnings: [count]
- Overall Score: [percent]%

## Critical Findings
[list if any]

## High-Priority Findings
[list]

## Medium-Priority Findings
[list]

## Low Priority / Improvements
[list]

## Suggested Actions
1. [action]
2. [action]
...

## Next Audit Suggestion
Date: [suggested date]
Scope: [suggested scope]
=============================
```
