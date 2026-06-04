Deep infrastructure audit command. Comprehensively audits all Badi components across 9 checkpoints.

# Required Tools
- Read (all config files) -- Grep (reference/pattern scan) -- Glob (file existence) -- Bash (permissions, JSON validation, file info) -- Write (report)

# Procedure (9 Checks)

## Check 1: Agent Health
- List the `.claude/agents/` files
- Each agent: YAML frontmatter format -- required fields (name, description, tools) -- are referenced tools valid -- unresolved `{{...}}` -- instruction consistency
- Agent count and status summary

## Check 2: Command Health
- List the `.claude/commands/` files
- Each command: description line -- tool requirements -- procedure steps -- output format -- valid markdown
- `command-index.md` cross-reference: in the index but no file -- file exists but not in the index -- description mismatch

## Check 3: Hook Health
- Validate `settings.json` JSON
- Each hook: does the file exist -- executable permission -- dry run (syntax) -- correct trigger
- Run order/priority -- colliding/conflicting hooks

## Check 4: Memory Layer
- `memory.md`: size (500-line limit) -- freshness (last update) -- internal consistency (contradicting info) -- source attribution
- `knowledge-base.md`: size (1000-line limit) -- categorization -- unverified information -- citation/reference

## Check 5: Log Health
- Directories: `daily-notes/`, `handoffs/` size/count -- audit trail files (audit-trail.md, incident-log.md, failure-log.md)
- Each log: size limit -- format consistency -- date accuracy
- JSONL (verdicts.jsonl): each line valid JSON -- schema consistency

## Check 6: Permissions/Configuration
- Hook file permissions -- do references inside settings.json exist -- environment variable dependencies (used but undefined) -- directory structure -- sensitive-file check against `.gitignore`

## Check 7: Cross-Consistency
- If A references B, does B exist -- circular dependencies -- orphan references (unlinked files) -- CLAUDE.md ↔ command/agent behavior alignment -- naming conventions

## Check 8: Backup/Storage
- Total `.claude/` size -- 5 largest files -- older than 30 days (archive candidates) -- automatic cleanup mechanism -- temporary files -- is the backup strategy current

## Check 9: Via Negativa
Detect needless complexity: unused components (command/agent/hook) -- duplicated/colliding functionality -- needless dependency chains -- overly complex config -- undying workarounds -- items whose removal would improve the system

# Grading
- **A:** All sub-checks passed, no improvement needed
- **B:** Minor warnings, no urgent intervention
- **C:** Issues to fix, in a planned sprint
- **D:** Serious issues, address immediately
- **F:** Critical failure, urgent intervention

**Overall Grade:** the lowest individual grade or a weighted average.

# Output Format
```
=== BADI SYSTEM AUDIT ===
Date: [date]
Overall Grade: [A-F]

## Check Results
| # | Check | Grade | Finding |
|---|-------|-------|---------|
| 1 | Agent Health | [A-F] | [summary] |
| 2 | Command Health | [A-F] | [summary] |
| 3 | Hook Health | [A-F] | [summary] |
| 4 | Memory Layer | [A-F] | [summary] |
| 5 | Log Health | [A-F] | [summary] |
| 6 | Permissions/Config | [A-F] | [summary] |
| 7 | Cross-Consistency | [A-F] | [summary] |
| 8 | Backup/Storage | [A-F] | [summary] |
| 9 | Via Negativa | [A-F] | [summary] |

## Critical Findings (D and F)
[details and urgent actions]

## Warnings (C)
[details and planned actions]

## Improvement Suggestions (A and B)
[optional improvements]

## Remediation Plan
1. [URGENT] [action] - Target: [date]
2. [PLANNED] [action] - Target: [date]
3. [SUGGESTED] [action] - Target: [date]

## Next Audit
Suggested: [date] (monthly or after major changes)
==============================
```
