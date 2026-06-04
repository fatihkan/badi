Deep code review command. Comprehensive code analysis across security, performance, and architecture.

> **Argument format (v1.31.0+)**: `/review [effort] [--comment] [--correctness-only]`
> - `effort`: `low` | `medium` (default) | `high` — analysis depth
> - `--comment`: post findings as inline comments on the active PR (requires the gh CLI)
> - `--correctness-only`: focus only on correctness bugs (skip the architecture/perf/security channels)

> **Difference vs. Anthropic's native `/code-review` (Claude Code 2.1.147+):**
> - `/code-review`: correctness bugs + effort tuning + `--comment` (native English render)
> - `/review` (badi): a **superset** of the above — 3 channels (security+perf+architecture) + structured report + classification
> - Combined use: `/code-review high --comment` (logic) then `/review high --comment` (architecture/perf/security)

# Required Tools
- Read (code reading)
- Grep (pattern search)
- Glob (file scan)
- Bash (git diff, gh CLI inline PR comments, analysis tools)

# Procedure (4 Steps + optional PR Comment)

### Step 0: Argument Parse + Effort & Mode (v1.31.0+)

> **Note**: This command is **interpreted by Claude in prompt context** — there is
> no code-based argument parsing. The arguments arrive as "review high --comment"
> and Claude applies the behavior described in this procedure.


Command arguments:
- `effort` (positional): `low` | `medium` | `high`
  - `low`: only CRITICAL + HIGH findings; fast pass over the performance/architecture channels
  - `medium` (default): current behavior — CRITICAL + HIGH + MEDIUM classes
  - `high`: all classes (CRITICAL/HIGH/MEDIUM/LOW) + positive observations + alternative solutions
- `--comment`: enables Step 5 (PR inline comments)
- `--correctness-only`: in Step 3 focus only on Channel A security + correctness bugs, skip Channel B (performance) + Channel C (architecture)

### Step 1: Define the Scope
Determine the code to review:
- **Active PR (auto-detect)**: detect the current branch's PR via `gh pr view --json number,baseRefName,headRefName`. If found, the scope is automatically the PR diff (`gh pr diff <num>`).
- **PR/Commit:** take the `git diff` output (by branch or commit hash)
- **File:** a specific file or files
- **Module:** a feature or module directory
- **Change Set:** the last N commits' changes

Record the scope:
- File count
- Changed line count (added/removed)
- Affected modules

### Step 2: Read the Code
- Read all the changes carefully
- Review the surrounding code for context
- Find and read the related test files
- Check the affected APIs or interfaces

### Step 3: Parallel Analysis (3 Channels — `--correctness-only` skips Channels B+C)

**Channel A: Security Analysis**
- Missing input validation
- SQL/NoSQL injection risks
- XSS and CSRF holes
- Sensitive data leakage (in logging, in error messages)
- Authorization checks
- Cryptographic weaknesses
- Dependency vulnerabilities
- Hardcoded secrets or keys

**Channel B: Performance Analysis**
- N+1 query patterns
- Needless computation or loops
- Memory-leak risks
- Index usage (database queries)
- Caching opportunities
- Async-processing needs
- Large dataset operations
- API call optimizations

**Channel C: Architecture Analysis**
- SOLID compliance
- Separation of concerns
- Dependency direction (dependency inversion)
- Code duplication (DRY violations)
- Naming consistency
- Error-handling strategy
- Testability
- Extensibility and maintainability

### Step 4: Classify the Findings

Assign every finding a level:

**CRITICAL** - Must be fixed (merge blocker)
- Security vulnerabilities
- Data loss/corruption risk
- Errors that will break production

**HIGH** - Recommended to resolve before merge
- Performance issues
- Error-handling gaps
- Test coverage holes (critical paths)

**MEDIUM** - Improvement opportunity
- Code quality
- Readability
- Minor refactoring

**LOW** - Advisory
- Style preferences
- Documentation improvements
- Future refactoring opportunities

### Step 5 (optional): PR Inline Comments (`--comment`)

When run with the `--comment` flag, findings are posted as inline comments on the active PR. Requires the gh CLI.

**Pre-checks:**
1. Is `gh` on the PATH: `which gh`
2. Does the current branch have a PR: `gh pr view --json number,headRefName` (otherwise error: "No PR found. /review --comment only works inside a PR")
3. Auth check: `gh auth status`

**Comment posting (for every CRITICAL + HIGH finding):**
```bash
gh api repos/:owner/:repo/pulls/<num>/comments \
  --method POST \
  --field body="<finding_description>" \
  --field path="<file_path>" \
  --field line=<line_no> \
  --field side="RIGHT"
```

**Summary comment (on the PR):**
```bash
gh pr comment <num> --body "$(badi review --format markdown-summary)"
```

Output: CRITICAL N | HIGH N | MEDIUM N | LOW N + the suggested action (merge OK / revise / reject).

# Output Format
```
=== BADI CODE REVIEW ===
Date: [date]
Scope: [specified scope]
File Count: [count]
Changed Lines: +[added] / -[removed]

## Overall Assessment
[1-2 sentence summary]
Approval State: APPROVED / CHANGES REQUIRED / REJECTED

## Critical Findings ([count])
### [Finding Title]
- File: [path:line]
- Problem: [description]
- Suggestion: [fix]

## High Priority ([count])
...

## Medium Priority ([count])
...

## Low Priority ([count])
...

## Positive Observations
- [things done well]

## Summary
- Critical: [count] | High: [count] | Medium: [count] | Low: [count]
==============================
```
