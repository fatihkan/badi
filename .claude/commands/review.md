Deep code review command. Comprehensive code analysis across security, performance, and architecture.

> **Argument format (v1.31.0+)**: `/review [effort] [--comment] [--correctness-only]`
> - `effort`: `low` | `medium` (default) | `high` — analysis depth
> - `--comment`: post findings as inline comments on the active PR (requires the gh CLI)
> - `--correctness-only`: run only the correctness channel (Channel D) — the single definition lives in Step 0

> **Difference vs. Anthropic's native `/code-review` (Claude Code 2.1.147+):**
> - `/code-review`: correctness bugs + effort tuning + `--comment` (native English render)
> - `/review` (badi): a **superset** of the above — 4 channels (correctness + security + performance + architecture) + structured report + classification
> - `/review --correctness-only` covers the same ground as `/code-review` (Channel D only); the full `/review` adds the security, performance, and architecture channels on top of it

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
- `--correctness-only` (**the single definition — every other mention of the flag points here**): in Step 3 run **only Channel D (Correctness)**. Skip Channel A (security), Channel B (performance), and Channel C (architecture) entirely — their findings are neither collected nor reported, so a given diff always produces the same verdict for the same flags. The Step 4 approval state is then derived from Channel D findings alone.

### Step 1: Define the Scope
Determine the code to review:
- **Active PR (auto-detect)**:
  1. Run `gh auth status` first. If it fails, say "gh is not authenticated — PR auto-detect skipped" and pick the scope manually from the options below. Never report an auth failure as "no PR".
  2. Run `gh pr view --json number,state,headRefOid,baseRefName,headRefName` and check `state`. Only `"state": "OPEN"` counts as an active PR. On a branch with no open PR, `gh pr view` can return the most recent MERGED or CLOSED PR — treat any non-OPEN state exactly like "no open PR" and choose the scope manually; never review a merged or closed PR's diff by accident.
  3. If an open PR was found, the scope is automatically the PR diff (`gh pr diff <num>`). Keep `number` and `headRefOid` for Step 5.
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

### Step 3: Parallel Analysis (4 Channels — `--correctness-only` runs Channel D only, see Step 0)

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

**Channel D: Correctness Analysis** (logic bugs — the class `/code-review` targets; always runs, and is the only channel under `--correctness-only`)
- Wrong conditionals, inverted checks, off-by-one and boundary errors
- Null/undefined/empty handling on reachable inputs
- Wrong return values and unhandled error paths (a call site that ignores a failure)
- State and ordering bugs: race conditions, use-after-close, stale caches, non-idempotent retries
- Broken contracts: caller and callee disagreeing on types, units, optionality, or encoding
- Regressions against existing tests or documented behavior
- A Channel D finding must name the concrete input or state that triggers it and the wrong output, crash, or data change it produces

### Step 4: Classify the Findings

Every finding must cite its evidence: the file and line, and for any behavioral claim, the command run and its real output. A finding with no evidence is a hunch, not a finding — drop it or downgrade it until it can be shown.

Assign every finding a level:

**CRITICAL** - Must be fixed (merge blocker)
- Security vulnerabilities
- Data loss/corruption risk
- Correctness bugs that produce wrong output, a crash, or corrupted data on a reachable input
- Errors that will break production

**HIGH** - Recommended to resolve before merge
- Correctness bugs on edge-case or unlikely inputs
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

When run with the `--comment` flag, CRITICAL + HIGH findings are posted as inline comments on the active PR, followed by one summary comment. Requires the gh CLI. Every posting call has an explicit failure branch: a finding is reported as "posted" only when the call that carried it exited 0.

**Pre-checks (in this order — auth first, so an expired token is never misreported as "no PR"):**
1. Is `gh` on the PATH: `which gh` → otherwise stop: "gh CLI not found. /review --comment requires the gh CLI"
2. Auth: `gh auth status` → non-zero exit means stop: "gh auth failed (token missing or expired) — run `gh auth login`". Do not continue to the PR lookup.
3. Open PR + head commit: `gh pr view --json number,state,headRefOid` (the same check as the Step 1 auto-detect; re-run it here because the scope may have been given manually)
   - the command fails → stop: "No PR found. /review --comment only works inside a PR"
   - `state` is not `OPEN` (MERGED / CLOSED) → stop: "PR #<num> is <state>, not OPEN — /review --comment only posts to an open PR". Never post onto a merged or closed PR.
   - keep `number` as `<num>` and `headRefOid` as `<head_sha>`; every inline comment is anchored to that commit
4. Diff hunks: `gh pr diff <num>` → for each file, collect the RIGHT-side line ranges from the `@@ -a,b +c,d @@` headers (lines `c` through `c+d-1`; a header with no count, `+c` alone, means `d` = 1). An inline comment can only sit on a line inside one of those ranges; the API rejects any other line with HTTP 422 even when the commit id is correct.

**Split the CRITICAL + HIGH findings:**
- **Inline set**: the finding's file + line is inside a diff hunk of the PR → goes into the review below
- **Out-of-hunk set**: the line is outside every hunk (surrounding code, an untouched file, a LEFT-side-only hunk) → not posted inline; listed under "Findings outside the diff" in the summary comment

**Inline comments — ONE atomic review, not one request per finding:**
Write `review.json` to a temp file with every inline-set finding in the `comments` array, then submit it as a single review. `event` is always `COMMENT`: the review must never approve or block on its own (the API rejects approving your own PR anyway) — the merge verdict lives in the summary comment.
```json
{
  "commit_id": "<head_sha>",
  "event": "COMMENT",
  "body": "badi /review — <N> inline finding(s); full summary in the next comment",
  "comments": [
    {
      "path": "<file_path>",
      "line": <line_no>,
      "side": "RIGHT",
      "body": "**[CRITICAL] <title>**\n<problem>\n\nSuggestion: <fix>"
    }
  ]
}
```
```bash
gh api "repos/{owner}/{repo}/pulls/<num>/reviews" --method POST --input review.json
```
- Exit 0 → every inline-set finding is posted (the review is atomic: all or none)
- Non-zero exit → **nothing was posted**. Print the error verbatim, set the inline tally to `posted 0 / failed <N>`, and move every inline-set finding into the "Findings outside the diff" list of the summary comment so it is not lost. Do not retry finding-by-finding, and do not report the review as posted.
- Empty inline set → skip this call entirely (never submit an empty review)

**Summary comment (one per run, always posted last):**
Write the Step 4 result's `## Overall Assessment` and `## Summary` blocks to a temp file and post it with `--body-file`. There is no CLI subcommand that generates this text — it comes from the review just performed — and `gh pr comment` rejects an empty `--body`, so never build the body from a command substitution.
```bash
summary_file=$(mktemp)
# write to "$summary_file", in this order:
#   ## Overall Assessment          — 1-2 sentences + Approval State
#   ## Summary                     — Critical N | High N | Medium N | Low N
#   ## Inline comments             — posted N / outside diff N / failed N
#   ## Findings outside the diff   — one line per finding: [LEVEL] file:line — title — suggestion
#                                    (the out-of-hunk set, plus the whole inline set if the review call failed)
gh pr comment <num> --body-file "$summary_file"
```
- Non-zero exit → print the error verbatim and report "summary comment NOT posted"; the terminal report (Output Format below) still carries every finding

Output: `CRITICAL N | HIGH N | MEDIUM N | LOW N` + `inline: posted N / outside diff N / failed N` + `summary: posted | NOT posted` + the suggested action (merge OK / revise / reject).

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

## PR Comments (--comment runs only)
- Inline: posted [n] / outside diff [n] / failed [n]
- Summary comment: posted | NOT posted ([error])
==============================
```
