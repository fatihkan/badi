Daily statistics panel. Presents task, audit, event, and performance data as a unified table.

# Required Tools
- Bash (date calculations, file statistics)
- Read (TaskBoard.md, audit-trail.md, incident-log.md, failure-log.md, daily notes)
- Grep (data extraction and counting)
- ...

# Data Sources
This command collects data from the following files:
- `TaskBoard.md` - Task status information
- `audit-trail.md` - Audit trail records
- `incident-log.md` - Incident records
- ...

---

## Section 1: Task Statistics

### Step 1: Read the TaskBoard Data
- Read `TaskBoard.md`
- Count the task states:
  - Done (DONE)
  - In Progress (IN_PROGRESS)
  - Waiting (TODO)
  - Blocked (BLOCKED)

### Step 2: Today's Task Movement
- Filter tasks completed today
- Detect new tasks created today
- List tasks whose status changed
- ...

---

## Section 2: Change Statistics

### Step 3: Audit Trail Analysis
- Read `audit-trail.md`
- Filter entries matching today's date
- Extract the changed file count
- ...

### Step 4: Git Statistics
- Get today's commit count with `git log --since="today" --format="%H" | wc -l`
- Compute the change size with `git diff --stat HEAD~[count]`
- Report added and removed line counts

---

## Section 3: Incident and Failure Statistics

### Step 5: Review the Incident Records
- Read `incident-log.md` (if present)
- Filter today's incidents
- Extract the severity distribution:
  - CRITICAL: production-impacting
  - HIGH: affects important functionality
  - MEDIUM: limited impact
  - LOW: cosmetic or small issues

### Step 6: Review the Failure Records
- Read `failure-log.md` (if present)
- Filter today's failures
- Detect recurring failure patterns
- ...

---

## Section 4: Session Length Estimate

### Step 7: Duration Calculation
- Find the first entry in audit-trail.md or the daily notes (session start)
- Find the last entry (now or the latest activity)
- Compute the difference
- ...

---

## Section 5: Weekly Comparison

### Step 8: Collect Last Week's Data
- Find last week's same-day statistics (if available)
- Comparison metrics:
  - Completed task count
  - Commit count
  - Incident/failure count
  - Work duration

### Step 9: Trend Calculation
- Compute the percent change for each metric
- Determine the trend direction:
  - UP (increase; good for positive metrics)
  - DOWN (decrease)
  - FLAT (stable within +-5%)
- UP is good for task completion; DOWN is good for incident counts

---

## Output: Formatted Table

### Step 10: Build the Dashboard
```
[abridged]
```

### Trend Arrow Legend
- Up arrow: value increased (positive for tasks, negative for failures)
- Down arrow: value decreased
- Flat arrow: value stable (within +-5%)
- ...

### Step 11: Daily Summary Comment
- Overall productivity assessment (1 sentence)
- The most notable metric or trend
- A suggestion for tomorrow (if a clear pattern exists)
