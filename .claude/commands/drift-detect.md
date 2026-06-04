Configuration drift detection command. Finds inconsistencies, orphaned components, and stale content in the Badi system.

# Required Tools
- Read (configuration files)
- Grep (reference scan)
- Glob (file existence check)
- Bash (file info, JSON validation)

# Files to Audit
- `CLAUDE.md` (main instructions)
- `.claude/memory.md` (memory layer)
- `.claude/knowledge-base.md` (knowledge base)
- `.claude/settings.json` (settings)
- `.claude/commands/` (all command files)
- `.claude/command-index.md` (command index)
- `.claude/agents/` (agent files, if any)

# Procedure (5 Checks)

### Check 1: Contradiction Detection
Look for inconsistencies across files:

**CLAUDE.md Contradictions:**
- Are there instructions that contradict each other?
- Different directions about the same topic?
- Conflicts between old and new instructions?

**memory.md - Reality Alignment:**
- Does the project state in memory reflect reality?
- Any information no longer valid?
- Is the tech stack info current?
- Are the file paths still correct?

**knowledge-base.md Consistency:**
- Any internal contradictions?
- Information conflicting with memory.md?
- Insights inconsistent with CLAUDE.md?

**settings.json Validation:**
- Is the JSON format valid?
- Do the referenced file paths exist?
- Are the hook definitions correctly formatted?

### Check 2: Orphaned Component Detection
Find disconnected components:

- **Uninvoked Commands:** Files in `commands/` referenced nowhere
- **Unused Agents:** Agents in `agents/` never invoked anywhere
- **Broken References:** Citations to files that do not exist
- **Disconnected Hooks:** Hooks defined in settings.json without files
- **Commands Missing from the Index:** Mismatch between `command-index.md` and `commands/`
- **Redundant Files:** Old configuration files no longer in use

### Check 3: Staleness Checks
Assess content freshness:

- **memory.md Entries:** Flag entries older than 3 days
- **Daily Notes:** Unprocessed notes older than 7 days
- **Handoff Notes:** Handoffs older than 14 days
- **Task Board:** Open tasks older than 30 days
- **knowledge-base.md:** Old information needing re-verification
- **Tool References:** Citations to tools that no longer exist
- **Archive Notes:** Archive files older than 30 days (cleanup candidates)
- **Stuck Tasks:** Tasks making no progress

### Check 4: Configuration Health
Technical health checks:

- **JSON Validation:** Validity of every JSON file
- **File Size Thresholds:**
  - memory.md: over 500 lines? (WARN)
  - knowledge-base.md: over 1000 lines? (WARN)
  - Daily notes: over 200 lines? (INFO)
- **Hook Executability:** Permission check for hook files
- **Markdown Format:** Broken links, unclosed code blocks
- **Character Encoding:** UTF-8 compatibility check

### Check 5: Cross-Consistency
Consistency across the whole system:

- Are the rules in CLAUDE.md consistent with settings.json?
- Are tool references in command files valid?
- Are the dependencies in agent definitions satisfied?
- Are all file references bidirectional? (if A -> B, does B -> A exist too?)

# Output Format
```
=== BADI DRIFT DETECTION ===
Date: [date]
Status: CLEAN | WARNING | PROBLEM

## Contradiction Findings
- Found: [count]
[details if any]

## Orphaned Components
- Found: [count]
[details if any]

## Stale Content
- Found: [count]
[details if any]

## Configuration Health
- JSON: VALID / BROKEN
- Sizes: NORMAL / EXCESSIVE
- Permissions: CORRECT / BROKEN

## Cross-Consistency
- Status: CONSISTENT / MISMATCHED
[details if any]

## Remediation Suggestions
1. [URGENT] [suggestion]
2. [IMPORTANT] [suggestion]
3. [SUGGESTED] [suggestion]

## Next Scan
Suggested: [date]
============================
```

# Triggers
- Monthly routine scan
- When system behavior looks abnormal
- After a large configuration change
- After adding a new command or agent
