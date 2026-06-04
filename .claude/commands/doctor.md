Badi configuration validation. Checks all Badi components and produces a diagnostic report.

# Required Tools
- Bash (file permissions, directory structure checks)
- Read (configuration and manifest files)
- Glob (file existence scan)
- ...

# Purpose
This command verifies that the Badi system is configured correctly.
Recommended after a fresh install or whenever problems occur.

---

## Check 1: Hook Scripts

### Step 1: Hook File Presence
- Scan the `.claude/hooks/` directory
- List all `.sh` and `.js` files
- Verify the expected hooks exist:
  - Pre-commit hook
  - Post-commit hook
  - Pre-push hook (if any)
  - Custom Badi hooks

### Step 2: Execute Permissions
- Check the execute permission of every hook file (`chmod +x`)
- Give a WARNING for files lacking permission
- Check the shebang line (`#!/bin/bash` or `#!/usr/bin/env node`)
- ...

---

## Check 2: settings.json Validation

### Step 3: File Presence and Format
- Check that `.claude/settings.json` exists
- Verify the JSON format is valid (parseable)
- FAIL on an empty or missing file

### Step 4: Hook References
- Read the hook definitions inside settings.json
- Verify every referenced hook file physically exists
- FAIL on broken references (hook entries without files)
- ...

---

## Check 3: Agent Files

### Step 5: Agent Directory Scan
- Scan the `.claude/agents/` directory
- List all `.md` files

### Step 6: Frontmatter Validation
For each agent file:
- Check whether valid frontmatter exists at the top
- Required fields: `name`, `description` (or a first-line description)
- Verify tool definitions are in a valid format
- ...

---

## Check 4: Command-Index References

### Step 7: Read the Index File
- Find and read `command-index.md`
- Extract all command references listed in the index

### Step 8: Reference Matching
- Check that every index entry has a corresponding file under `.claude/commands/`
- Detect files under commands/ that are missing from the index
- Mark index entries without files as FAILED
- ...

---

## Check 5: Memory Files

### Step 9: Memory File Sizes
- Check that `memory.md` exists
- Measure the file size
- Check whether the size limit is exceeded (suggested: WARN above 50KB)
- ...

### Step 10: Memory Content Check
- Verify the mandatory sections exist inside memory.md
- WARN on an empty or unstructured memory file
- Result: PASS / WARN / FAIL

---

## Check 6: Skill Directory Structure

### Step 11: Skills Directory
- Check the `.claude/skills/` directory (if present)
- Verify the `INDEX.md` file exists
- Check that every skill file is in a valid format
- ...

---

## Diagnostic Report

### Step 12: Build the Combined Report
```
[abridged]
```
