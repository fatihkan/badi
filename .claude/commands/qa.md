QA sign-off command. Verifies a change against acceptance criteria, runs the test suite, probes edge cases, and issues a ship / no-ship verdict via the qa-lead agent.

# Required Tools
- Read (change, specs, acceptance criteria)
- Grep / Glob (locate affected tests and behavior)
- Bash (run the test suite, exercise the CLI/app)
- Agent (delegate to qa-lead)

# When to Use
After implementation, before `/ship`. Run this to get an evidence-backed verdict on whether the change is safe to release. Complements `/review` (which reads the diff) by actually executing and judging behavior.

# Procedure

### Step 1: Establish Acceptance Criteria
- Derive checkable criteria from the spec, `/eng-review` plan, or the user's intent.
- If criteria are unclear, state the assumptions being verified.

### Step 2: Delegate to QA Lead
Launch the **qa-lead** agent. Ask it to:
- Map the change to each acceptance criterion (PASS/FAIL).
- Run the project's full test suite and capture real pass/fail counts.
- Probe edge cases (empty, max, invalid, concurrent) and negative paths.
- Check for regressions in adjacent features.
- Smoke-test the primary user path.

### Step 3: Collect Evidence
Ensure every PASS/FAIL cites the command run and its real output. A skipped check is reported as skipped; a flaky/failing test blocks SHIP.

### Step 4: Issue the Verdict
- **SHIP** — all criteria pass, suite green, no regressions.
- **SHIP WITH RISK** — passes with a named, accepted risk.
- **NO-SHIP** — blocking issues; list exactly what must be fixed.

### Step 5: Record
- Add the verdict and any blocking issues to the task board.
- On NO-SHIP, route defects back to the implementing agent.

# Output Format
- **Verdict** (SHIP / SHIP WITH RISK / NO-SHIP)
- **Acceptance Criteria** (each PASS/FAIL + evidence)
- **Test Run** (pass/fail counts + quoted failures)
- **Edge & Regression Findings**
- **Blocking Issues** (if any)
