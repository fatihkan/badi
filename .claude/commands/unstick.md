Unblocking command. Finds a fast solution with a structured approach when you're stuck.

# Required Tools
- Read (code and context reading)
- Grep (error and pattern search)
- Glob (file discovery)
- Bash (running tests, debugging)

# Starting Format
From the user: "I'm stuck on [X] because of [Y]"
Example: "I'm stuck on the API integration because of a CORS error"

# Procedure (5 Steps)

### Step 1: Capture the Blocker
Collect from the user:
- **What:** Which task/operation is stuck? (X)
- **Why:** What is the nature/cause of the blocker? (Y)
- **Tried:** What has been attempted so far?
- **Error Message:** The actual error output, if any
- **Expected:** What did they expect to happen?
- **Actual:** What happened instead?
- **Environment:** Which environment? (local, staging, production)

### Step 2: Classify
Assign the blocker to one of 5 categories:

**A) Missing Information**
- Missing data, documentation, or API knowledge
- Fix: Find and review the relevant sources
- Tools: Grep, Read, documentation scan

**B) Decision Paralysis**
- Stuck between multiple options
- Fix: Comparative analysis of the options; list pros/cons
- Approach: Start with "is it reversible?"; if reversible, pick the simplest

**C) Circular Debugging**
- Hitting the same error repeatedly
- Fix: Question the assumptions, narrow the problem area
- Approach: Binary search — systematically narrow where the problem lives

**D) Scope Confusion**
- Unclear what to do, vague requirements
- Fix: Clarify requirements, define the smallest useful piece
- Approach: the question "what is the smallest thing that could work?"

**E) Environment Issues**
- Configuration, dependencies, access, version mismatch
- Fix: Environment check, dependency verification
- Approach: Reproduce in a clean environment, isolation test

### Step 3: Activate the Analyst
Start the analysis per the classification:

**Information gathering:**
- Read the relevant code and understand its context
- Research the error message
- Search for solutions to similar problems
- Check the documentation

**Root cause analysis:**
- Apply the 5 Whys technique
- List the assumptions and verify each one
- Narrow the problem area as much as possible
- Check whether it can be reproduced

**Solution generation:**
- Offer at least 2, at most 4 solution proposals
- For each: what to do, risk level, estimated time
- Mark the one likely to deliver fastest (quick win)

### Step 4: Apply the Proposal
Pick the best proposal and apply it immediately:
- Execute the proposal step by step
- Verify the result at each step
- If it does not work, move to the next proposal
- If all proposals fail, return to Step 3 with the new information

### Step 5: Document the Solution
Make the fix durable:

**Add to the daily note:**
```markdown
## Unblock Solution - [time]
- **Blocker:** [X] - [Y]
- **Category:** [A-E]
- **Root Cause:** [real reason]
- **Solution:** [applied solution]
- **Duration:** [time spent]
- **Learning:** [lesson learned]
```

**Recurrence check:**
- Has this problem happened before? (recurring pattern check)
- If recurring, add a durable fix to `knowledge-base.md`
- Any automation opportunity? (preventable via a hook or script?)

# Output Format
```
=== BADI UNBLOCK ===
Blocker: [X] - [Y]
Category: [A-E]: [category name]
Duration: [time to solve]

Root Cause: [explanation]
Applied Solution: [what was done]
Result: SOLVED / PARTIAL / ONGOING

Learning: [lesson learned]
Recurrence Risk: LOW / MEDIUM / HIGH
[If high: durable fix suggestion]
===============================
```

# Quick Tips
- Some blockers dissolve after a 5-minute break — suggest that too
- The "is it reversible?" question breaks decision paralysis
- Searching the error message verbatim often finds the fix
- Explaining the problem to someone (rubber duck debugging) can solve it on its own
