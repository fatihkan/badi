Security scan. Searches the codebase and dependencies for vulnerabilities and produces a severity-ranked report.

> **Native command (v1.31.0+)**: With Claude Code 2.1.140+, `/security-review` is now a **native** command (built-in slash). This command complements it with a **deterministic baseline** (`badi security baseline`) + **post-scan triage** (`badi security triage`).
>
> **Recommended flow**:
> 1. `badi security baseline` — secrets + dependencies (deterministic)
> 2. `/security-review` — AI semantic vulnerability hunt (Anthropic native)
> 3. `badi security triage` — report severity filtering
> 4. CI: `badi security init --ci` — automatic review on PRs

## Badi CLI Commands (v1.6+)
This command first invokes these CLI tools:
- `badi secret-scan` — 17-pattern secret/credential scan (AWS, GCP, GitHub, OpenAI, Stripe, DB URIs, private keys)
- `badi secret-scan --git` — Also scan the last 100 commits
- `badi a11y [url]` — Accessibility (part of the security audit)
Then it delegates to the security-scanner agent (code pattern analysis).

# Required Tools
- Bash (npm audit, dependency scan)
- Read (configuration files)
- Grep (code pattern scan)
- ...

# Agent Delegation
This command delegates the main scan to the security-scanner agent.
If the agent is unavailable, apply the steps below directly.

---

## Section 1: Dependency Vulnerability Scan

### Step 1: Package Manager Detection and Audit
- npm: run `npm audit --json`
- yarn: run `yarn audit --json`
- pip: run `pip audit` or `safety check`
- ...

### Step 2: Vulnerability Classification
Record per finding:
- Package name and version
- CVE number (if any)
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- ...

### Step 3: Dependency Chain Analysis
- Determine direct vs. transitive dependency
- For transitive ones, show which parent package pulls it in
- Verify the lock file is current

---

## Section 2: Code Pattern Analysis

### Step 4: Hardcoded Secret Scan

**Run `badi secret-scan` first** — a fast scan with 17 patterns:
- AWS Access/Secret, GCP, GitHub PAT (classic + fine-grained), Slack, Stripe,
  OpenAI, Anthropic
- npm, SendGrid, Twilio, MongoDB/Postgres URIs
- RSA/EC private keys, JWT tokens
- Generic secrets (20-64 chars)

Commands:
```bash
badi secret-scan                                       # Working tree
badi secret-scan --git                                 # + git history (last N commits)
badi secret-scan --format json                         # JSON output
badi secret-scan --exit-code strict                    # exit 1 on any finding
badi secret-scan --max-commits 500 --git               # deeper history
badi secret-scan --ignore jwt,github-pat               # ignore specific patterns
badi secret-scan --ignore-file .secretignore           # read from a file
badi secret-scan --patterns custom-org-patterns.json   # load extra patterns
```

**Exit codes (for CI):**
- `0`  No findings (or --exit-code never, or only MEDIUM/LOW by default)
- `1`  CRITICAL or HIGH finding — the pipeline should stop

**Out of scope (worth knowing in CI):**
- `git stash`, `reflog`, packed-refs are not scanned — only reachable commits
- Symlinks are skipped (cycle + path traversal protection)
- File size limit: 2MB, file count limit: 5000 (tune with --max-files)

**Then extra code pattern analysis** (what the CLI may have missed):
- API keys: `api[_-]?key\s*[:=]`
- Tokens: `token\s*[:=]\s*['"][A-Za-z0-9]`
- Passwords: `password\s*[:=]\s*['"]`
- ...

### Step 5: Injection Vector Scan
- SQL injection: raw query concatenation, non-parameterized queries
- XSS: `innerHTML`, `dangerouslySetInnerHTML`, unfiltered user input
- Command injection: `exec()`, `eval()`, `child_process` usage
- ...

### Step 6: Authentication and Authorization Patterns
- Review the JWT implementation (algorithm pinning, expiry)
- Check the password hashing method (bcrypt/argon2 vs. MD5/SHA1)
- Check whether rate limiting is in place
- ...

---

## Section 3: Configuration Review

### Step 7: CORS Policy
- Find and read the CORS configuration
- Check for wildcard origin (`*`) usage
- Verify the allowed origins are acceptable
- ...

### Step 8: Security Headers
Check that the following headers are configured:
- Content-Security-Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options or frame-ancestors
- ...

### Step 9: Auth Configuration
- Review the session management configuration
- Cookie settings: secure, httpOnly, sameSite
- Evaluate the token lifetimes
- ...

---

## Section 4: Findings Report

### Step 10: Severity Ranking
Report all findings in this order:

```
[abridged]
```

### Step 11: Remediation Suggestions
For each finding:
- A short description of the problem
- The suggested fix
- An example code or configuration change
- ...
