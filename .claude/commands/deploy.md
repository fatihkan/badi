Deployment checklist. Verifies all pre-deployment requirements and produces a readiness report.

## Badi CLI Pre-Deploy Checklist (v1.6+)
ALWAYS run these checks before deploying:
- `badi secret-scan` — No secret leakage allowed (CRITICAL — block the deploy on exit 1)
- `badi commit --check` — Last commit in conventional format (for changelog generation)
- `badi changelog` — Review the changes since the last tag
- `badi ssl [production-domain]` — Warn if SSL expires in < 30 days
- `badi dns [domain]` — DNS health (email security)
- `badi lighthouse [url]` — Performance baseline (for regression detection)

# Required Tools
- Bash (git commands, running tests, env variable checks)
- Read (configuration files, changelog)
- Grep (code and configuration scan)
- ...

# Important Note
This command does NOT deploy by itself. It evaluates deployment readiness
and leaves the final decision to the user.

---

## Section 1: Pre-Deployment Validation

### Step 1: Test Suite Check
- Run the full test suite (or check the latest CI result)
- Determine whether any tests fail
- Report the coverage ratio
- ...

### Step 2: Critical Audit Finding Check
- Read `audit-trail.md` (if present)
- Check for T0 (critical) findings since the last deploy
- Scan for unresolved security warnings
- ...

### Step 3: Changelog Validation
- Check whether `CHANGELOG.md` has been updated
- Verify a changelog entry exists since the last commit
- If missing, suggest running the `/changelog` command
- ...

---

## Section 2: Environment Variable Validation

### Step 4: Env File Comparison
- Read `.env.example` or `.env.template`
- List the variables that must be defined
- Detect variables possibly missing in production

### Step 5: Sensitive Value Check

**Run the Badi Secret Scanner:**
```bash
badi secret-scan --git    # Working tree + last 100 commits
```

If the exit code is 1 (critical/high secret found), the deploy **MUST BE BLOCKED**.
- Scan for hardcoded environment values in the code
- Find environment references containing `TODO` or `FIXME`
- Verify debug mode is off (NODE_ENV, DEBUG, etc.)
- ...

---

## Section 3: Database Migration State

### Step 6: Migration Check
- Detect pending migration files
- Verify the migration order is consistent
- Check rollback files exist for reversible migrations
- ...

### Step 7: Schema Compatibility
- Detect schema changes with breaking potential (column drops, type changes)
- Note backward-compatibility risks
- Result: COMPATIBLE / RISKY / NOTHING_TO_APPLY

---

## Section 4: Deployment Manifest

### Step 8: Build the Change Summary
Since the last deploy (last tag or a given commit):
- Changed file count: `git diff --stat [last-tag]..HEAD`
- Newly added files
- Deleted files
- ...

### Step 9: Write the Manifest File
Create `deploy-manifest-[date].md`:
```
[abridged]
```

---

## Section 5: Post-Deployment Smoke Test Plan

### Step 10: Build the Test Plan
Prepare a smoke-test checklist based on the changes:
- Critical user paths (login, core functions)
- Changed API endpoints
- Database connectivity verification
- ...

---

## Output: Deployment Readiness Report

### Step 11: Final Assessment
```
[abridged]
```

### GO/NO-GO Criteria Table
- GO: All checks PASSED/CLEAN/CURRENT/SECURE/COMPATIBLE
- NO-GO: Any check FAILED/BLOCKED/RISKY
- Exceptional GO: Only with a MISSING changelog or a WARNING env variable, GO may be given with user approval
