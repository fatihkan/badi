Refactoring command. Detects code smells and creates a safe refactoring plan.

# Required Tools
- Read (code reading)
- Grep (pattern scan)
- Glob (file discovery)
- Agent (refactoring-advisor agent)
- Bash (running tests)

# Procedure (5 Steps)

### Step 1: Define the Scope
- A specific file/function or a module?
- What is the user's goal? (performance, readability, testability, SOLID compliance)

### Step 2: Delegate to the Refactoring-Advisor Agent
Pass the agent:
- Target file(s)
- The user's goal
- Current test coverage state

### Step 3: Review the Suggestions
Present the agent's suggestions to the user:
- A before/after example for each suggestion
- Risk assessment
- Other files that will be affected

### Step 4: Apply the Approved Changes
With user approval:
- Apply the refactoring steps in order
- Run the tests after each step
- Roll back on failure

### Step 5: Verify and Document
- Verify all tests pass
- Add a change summary to the daily note
- Suggest an ADR for large refactorings

# Output Format
```
=== BADI REFACTORING ===
Scope: [file/module]
Detected: [code smell count]
Applied: [refactoring count]
Tests: PASSED / FAILED
========================
```
