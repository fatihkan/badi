Coaching analysis command. Performs data-driven work-pattern analysis and offers personal improvement suggestions.

# Required Tools
- Read (memory, tasks, notes, previous coaching reports)
- Write (coaching report)
- Grep (pattern scan)
- Glob (finding data sources)
- Bash (git statistics)

# Optional Time Window
Ask the user: "Which period shall we analyze?"
- **Weekly:** Last 7 days
- **Monthly:** Last 30 days
- **All Data:** Every existing record

# Procedure (4 Sections)

### Section 0: Data Collection
Gather the data sources for analysis:
- Read `memory.md`
- Review the task board (completed, in progress, deferred)
- Scan the daily notes (for the chosen period)
- Collect git statistics (commit frequency, change volume)
- Read previous coaching observations (if any)
- Review the handoff notes
- Check the retrospective reports

### Section 1: Productivity Analysis

**Metrics:**
- Task completion rate (completed / planned)
- Average daily commit count
- Productive day count and patterns
- Average time spent per task
- Time distribution analysis (development / meetings / management / research)
- Most productive hour and day analysis
- Bottlenecks and waiting times

**Assessment:**
- Top-performance areas
- Areas needing improvement
- Productivity trend (rising/falling/flat)

### Section 2: Growth Analysis

**Metrics:**
- Newly learned technologies and tools
- Content production frequency (blog, documentation, etc.)
- Tasks with rising complexity (difficulty progression)
- Change in problem-solving speed
- Channel diversity (development, design, business development, etc.)
- Technical depth indicator

**Assessment:**
- Skill development areas
- Did they step out of the comfort zone?
- Were new challenges sought?

### Section 3: Sustainability Analysis

**Signals:**
- Burnout symptoms:
  - Weekend work frequency
  - Excessively long sessions (4+ hours uninterrupted)
  - Late-night development activity
  - Rising error rate
- Blocker density (how often blocked?)
- Recurring problems (how many times did the same thing break?)
- Break patterns (enough breaks taken?)
- Work/life balance indicators

**Assessment:**
- Is the current pace sustainable?
- Any risk signals?
- Improvement suggestions

### Section 4: Opportunity Analysis

**Missed Opportunities:**
- Valuable but unfinished work
- Repetitive manual operations (automation candidates)
- Unused tools or skills
- Delegation opportunities
- Parallelizable workflows

**New Opportunities:**
- Trending technologies and tools
- Areas to extend existing skills
- Efficiency-gain potential
- Strategy-change opportunities

### Follow-up Check
- Check the status of previous coaching suggestions
- Assess the impact of applied suggestions
- Review unapplied suggestions older than 3 weeks:
  - Still valid? Reprioritize
  - No longer valid? Remove and note why

# Output Format
```
=== BADI COACHING REPORT ===
Period: [start] - [end]
Date: [date]

## Data Summary
- Days Analyzed: [count]
- Total Commits: [count]
- Completed Tasks: [count]
- Task Completion Rate: [percent]%

## Strengths (2-3 Items)
1. [strength and evidence]
2. [strength and evidence]
3. [strength and evidence]

## Warnings
- [area needing attention and why]

## Opportunities
- [opportunity and how to use it]

## Sustainability Note
[burnout risk assessment]

## Single Priority
> The one thing to focus on this week:
> [clear, actionable suggestion]

## Previous Suggestion Follow-up
| Suggestion | Status | Impact |
|------------|--------|--------|
| [suggestion] | Applied/Pending/Cancelled | [assessment] |

## Motivation Note
[a personal, genuine motivational message]
=============================
```

# Notes
- The coaching report is saved into `memory.md`
- Integrates with the weekly wrap-up command (Friday analysis)
- Tone: supportive, data-driven, motivating
