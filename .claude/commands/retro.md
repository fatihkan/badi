Sprint retrospective command. Analyzes the past period and identifies improvement areas.

# Required Tools
- Read (daily notes, task board, memory)
- Bash (git statistics)
- Grep (pattern search)
- Write (report writing)

# Procedure (4 Steps)

### Step 1: Data Collection
Gather the data for the retrospective period:

**Git Data:**
- Commit count and distribution (by day)
- Changed file count
- Line add/delete statistics
- Branch and merge history
- Reverted commits

**Task Data:**
- Completed tasks and their durations
- Deferred or cancelled tasks
- Blocked tasks and their durations
- Scope changes

**Note Data:**
- Decisions in the daily notes
- Learnings and insights
- Problems and their solutions
- Handoff notes

### Step 2: Pattern Analysis
Detect patterns in the collected data:

**Productivity Patterns:**
- Most productive days/hours
- Areas with the most commits
- Recurring bottlenecks
- Velocity changes (slowdowns, speedups)

**Problem Patterns:**
- Recurring errors
- Frequently blocked areas
- Scope-creep examples
- Communication gaps

**Success Patterns:**
- Approaches that ended well
- Effective solution strategies
- Successful collaboration examples

### Step 3: Improvement Categorization
Classify the findings into 4 categories:

**Keep Doing (Went Well):**
- Practices that worked
- Successful approaches
- Habits worth keeping

**Stop Doing (Went Badly):**
- Time-wasting practices
- Ineffective approaches
- Recurring mistakes

**Start Doing (New Experiments):**
- Suggested new practices
- Tools worth trying
- Process improvements

**Investigate (Unclear):**
- Areas needing more data
- Hypotheses to test
- Topics awaiting a decision

### Step 4: Structured Report

# Output Format
```
=== BADI RETROSPECTIVE ===
Period: [start] - [end]
Total Days: [count]

## Metrics
- Commits: [count] (daily avg: [count])
- Completed Tasks: [count]
- Deferred: [count]
- Blocked: [count]
- Line Changes: +[added] / -[removed]

## Patterns
### Productivity
[detected patterns]

### Recurring Problems
[problem patterns]

### Successes
[success patterns]

## Action Plan

### Keep Doing
- [practice]

### Stop Doing
- [practice]

### Start Doing
- [new practice]

### Investigate
- [topic]

## Sprint Note
[overall assessment and a motivational note]

## Next Sprint Goals
1. [goal]
2. [goal]
3. [goal]
==========================
```
