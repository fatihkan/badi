Technical debt mapping command. Systematically detects and prioritizes technical debt in the codebase.

# Required Tools
- Grep (code scan)
- Glob (file discovery)
- Read (file reading)
- Bash (complexity analysis, git blame)
- Write (report writing)

# Procedure (4 Steps)

### Step 1: Define the Scope
Ask the user:
- **Whole project:** Scan the complete codebase
- **Module:** A specific module or directory
- **Layer:** A specific layer (API, UI, database, etc.)

Record the scope:
- Directories to scan
- File types to include
- Directories to exclude (node_modules, vendor, dist, build, etc.)

### Step 2: 3 Parallel Scans

**Scan A: TODO/FIXME Inventory**
- Scan and categorize `TODO` tags
- Scan `FIXME` tags (needing urgent attention)
- Scan `HACK` tags (temporary fixes)
- Scan `WORKAROUND` tags (known-issue workarounds)
- Scan `DEPRECATED` tags (should no longer be used)
- Scan `XXX` and `BUG` tags
- For each finding record file path, line number, and context
- Date them via git blame and highlight the old ones

**Scan B: Complexity Analysis**
- Detect 500+ line files (oversized)
- Find 100+ line functions (overlong)
- Find 3+ level nested conditionals (deep nesting)
- Files with too many imports/dependencies
- Duplicated code blocks (copy-paste detection)
- Functions with 5+ parameters
- Deep inheritance hierarchies (3+ levels)
- God class / god function detection

**Scan C: Staleness and Dead Code Detection**
- Unused exports/functions
- Deprecated API usage (per language and framework)
- Outdated dependencies
- Incompatible version pairings
- Removed or unsupported libraries
- Old configuration formats
- Commented-out code blocks (zombie code)
- Undying feature flags

### Step 3: Scoring
Compute a score per debt item:

**Impact Score (1-5):**
- 5: Production-outage risk, security vulnerability
- 4: Performance degradation, data inconsistency
- 3: Significantly slows development
- 2: Reduces readability and maintainability
- 1: Cosmetic issue, minor inconsistency

**Effort Score (1-5):**
- 1: Quick fix (< 1 hour)
- 2: Short task (1-4 hours)
- 3: Half-day job (4-8 hours)
- 4: Full-day job (1-2 days)
- 5: Multi-day refactoring (3+ days)

**Priority Calculation:** Impact / Effort = Priority Score
- **High priority:** score >= 2.0 (high impact, low effort = do now)
- **Medium priority:** score 1.0 - 1.99 (plan within the sprint)
- **Low priority:** score < 1.0 (leave in the background)

### Step 4: Build the Markdown Report

# Output Format
```markdown
# Technical Debt Map - [date]

## Summary Statistics
- Total Debt Items: [count]
- Critical (High Priority): [count]
- Medium Priority: [count]
- Low Priority: [count]
- Estimated Total Effort: [hours/days]
- Most Indebted Module: [module name]

## TODO/FIXME Inventory
| # | File | Line | Type | Age | Impact | Effort | Priority | Description |
|---|------|------|------|-----|--------|--------|----------|-------------|
| 1 | ... | ... | TODO | ... | ... | ... | ... | ... |

## Complexity Hot Spots
| # | File | Line Count | Complexity | Impact | Effort | Issue |
|---|------|------------|------------|--------|--------|-------|
| 1 | ... | ... | ... | ... | ... | ... |

## Stale Components
| # | Component | Type | Risk | Effort | Suggestion |
|---|-----------|------|------|--------|------------|
| 1 | ... | ... | ... | ... | ... |

## Prioritized Action Plan
### Do Now (Priority >= 2.0)
1. [item] - Impact: [score] / Effort: [score] = Priority: [score]

### Within the Sprint (Priority 1.0 - 1.99)
1. [item]

### Background (Priority < 1.0)
1. [item]

## Trend Analysis
[comparison with previous scans, debt growth/shrinkage]

## Tracking Metrics
[baseline values for the next scan]
```
