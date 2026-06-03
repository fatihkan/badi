Ship command. Runs the pre-flight gate, decides the version bump, assembles the changelog, and opens the PR via the release-manager agent. Nothing ships unless the gate is green.

# Required Tools
- Read (diff, CHANGELOG, version files)
- Edit / Write (CHANGELOG, release notes, version bump)
- Grep / Glob (scan the change set)
- Bash (tests, lint, build, git, gh CLI)
- Agent (delegate to release-manager)

# When to Use
After `/qa` returns SHIP, as the final step. Run this to turn verified changes into a released PR. For emergency production fixes use `/hotfix`; for deploy orchestration use `/deploy` — `/ship` owns the PR-level release gate.

# Procedure

### Step 1: Confirm Readiness
- Confirm `/qa` (or equivalent) has signed off.
- Check `git status` and that the change set is scoped to this release.

### Step 2: Delegate to Release Manager
Launch the **release-manager** agent. Ask it to run the pre-flight gate and, only if fully green, assemble the release:
- **Gate**: tests pass, lint/typecheck clean, build succeeds, no secrets in diff, not on the default branch.
- **Version**: choose patch / minor / major from the actual change scope.
- **Changelog**: group commits by type (Features / Fixes / Breaking); write user-facing notes.
- **PR**: branch (if needed), commit, push, open the PR with a clear body and test plan.

### Step 3: Honor the Gate
If any gate item fails, **stop**: report the failing check with its real output and do not ship. Do not commit or push to the default branch.

### Step 4: Authorization
Commit, push, and open the PR only when the user has asked to ship (or the workflow authorizes it). Otherwise, output the exact branch/commit/PR commands for the user to run.

### Step 5: Post-release
- Provide the post-release checklist (tag, deploy steps, smoke verification, what to watch).
- Provide the rollback path (how to revert this release).

# Output Format
- **Gate Result** (each check PASS/FAIL + evidence)
- **Version** (bump + justification)
- **Changelog** (Features / Fixes / Breaking)
- **PR** (branch, title, body, test plan)
- **Post-release & Rollback**
