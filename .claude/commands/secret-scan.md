Project-wide secret/credential scan command. AWS/GCP/GitHub/npm/Stripe/OpenAI/Anthropic keys, JWTs, database URIs, private keys.

> **For wider coverage**: `badi security baseline` (secret-scan + npm audit), `/security-review` (Anthropic native AI semantic — Claude Code 2.1.140+).

# Required Tools
- Bash (badi secret-scan command invocation)

# Procedure

### Step 1: Define the Scope

Ask the user:
- Working tree only? (fast)
- Include git history? (default 100 commits; raise with --max-commits)
- For CI/pipelines? (--exit-code strict + --format json)

### Step 2: Run the Scan

```bash
badi secret-scan                                       # Working tree
badi secret-scan --git                                 # + git history
badi secret-scan --format json                         # JSON output
badi secret-scan --exit-code strict                    # exit 1 on any finding
badi secret-scan --max-commits 500 --git               # deeper history
badi secret-scan --ignore jwt,github-pat-fine          # ignore specific patterns
badi secret-scan --ignore-file .secretignore           # read from a file
badi secret-scan --patterns custom-org-patterns.json   # load extra patterns
```

**CI exit codes:**
- `0`  No findings (or `--exit-code never`; or only MEDIUM/LOW by default)
- `1`  CRITICAL or HIGH finding

**Out of scope:** symlinks are skipped; `git stash`/`reflog`/packed-refs are not scanned.

### Step 3: Interpret the Results

By severity:
- **CRITICAL**: AWS Access/Secret, GCP, GitHub PAT (classic + fine-grained), Slack, Stripe, OpenAI, Anthropic, RSA/EC private keys
- **HIGH**: npm token, SendGrid, Twilio, MongoDB/Postgres URIs
- **MEDIUM**: JWT tokens
- **LOW**: Generic secret variables (high false-positive risk — `--ignore generic-secret` helps)

### Step 4: Action Plan

For every finding:

1. **Rotate** — Invalidate the secret immediately (it may live in git log)
2. **Gitignore** — Add the `.env` or secret file to `.gitignore`
3. **Environment variables** — Use `process.env.X` instead of hardcoded values
4. **Git history cleanup** — Use `git filter-repo` or `BFG`

### Step 5: Future Protection

- `.gitignore` check: `.env`, `.env.*`, `secrets.json`, `*.pem`
- Pre-commit hook: run secret-scan automatically
- Suggest a weekly `/secret-scan --git` cronjob

# Example
```
/secret-scan
/secret-scan --git   # include git history
```
