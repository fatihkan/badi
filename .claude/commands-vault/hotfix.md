Emergency fix workflow. Manages a fast, safe patching process for production errors.

# Required Tools
- Bash (git operations, running tests)
- Read (error logs, stack trace analysis)
- Write (fix files)
- Grep (error source detection)
- Glob (related file scan)
- Agent (auditor: fast T1 audit)

# Scope Protection
IMPORTANT: This workflow is for emergency fixes only. Scope creep is strictly rejected.
If another improvement opportunity appears during the fix, record it as a note but continue WITHOUT applying it.

---

## Step 1: Create the Hotfix Branch

### 1a: Check the Current State
- Verify a clean working directory with `git status`
- Stash uncommitted changes if any

### 1b: Create the Branch
- Detect the main branch: `main` or `master`
- Create it with `git checkout -b hotfix/[short-description] [main-branch]`
- Branch naming: descriptive names like `hotfix/fix-login-crash`, `hotfix/patch-api-timeout`

---

## Step 2: Isolate the Bug

### 2a: Gather the Error Info
- Ask the user for the error log or stack trace
- Read the bug report if one exists
- Determine the reproduction conditions

### 2b: Source Detection
- Follow the files and line numbers in the stack trace
- Grep the error message across the codebase
- Check when the bug first appeared via git log
- Suggest `git bisect` (if needed)

### 2c: Impact Analysis
- Identify the modules affected by the bug
- Check the current state of the related tests

---

## Step 3: Apply the Minimal Fix

### 3a: Scope Check
- The fix must target only the bug's root cause
- NO refactoring
- NO new features
- NO touching unrelated code
- For every change ask: "Is this change essential to fixing the bug?"

### 3b: Write the Fix
- Make the smallest possible change
- Add a comment explaining why the change was made
- Minimize side effects

---

## Step 4: Run the Targeted Tests

### 4a: Run the Existing Tests
- Run the tests of the module the bug relates to
- Run the whole related test suite as a regression check
- Report the test results

### 4b: Fix Verification Test
- Suggest writing a test that proves the bug no longer occurs
- If existing tests do not cover the bug, add a new test

---

## Step 5: Build the Rollback Plan

### 5a: Prepare the Revert Command
- Prepare the `git revert` command in advance and present it:
```
# Rollback command (runnable immediately if needed):
git revert [commit-hash] --no-edit
```

### 5b: Rollback Scenario
- State the conditions under which a rollback should happen
- Explain the side effects of rolling back
- List alternative rollback strategies

---

## Step 6: Create the PR

### 6a: Commit the Changes
- `git add` only the fix files
- Commit message format: `[HOTFIX] [short description]`
- Example: `[HOTFIX] Fix null pointer in user auth flow`

### 6b: Auditor Review
- Start a fast T1 audit via Agent(auditor)
- Verify the fix has not drifted out of scope
- Run a security-impact assessment

### 6c: Create the Pull Request
- Prefix the PR title with `[HOTFIX]`
- Include in the PR description:
  - The bug description
  - Root cause analysis
  - The applied fix
  - Test results
  - The rollback plan

# Output Format
```
=== HOTFIX SUMMARY ===
Branch: hotfix/[name]
Bug: [short description]
Root Cause: [cause]
Fix: [what was done]
Change: [file count] files, [line count] lines
Tests: [PASSED/FAILED]
Rollback: git revert [hash]
PR: [PR URL]
===================
```
