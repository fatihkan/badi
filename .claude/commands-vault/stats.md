Usage analytics command. Badi tool usage statistics, bar charts, daily trends, habit streaks.

# Required Tools
- Bash (badi stats)

# Procedure

### Step 1: Pick a Period

```bash
badi stats                    # Last 7 days (default)
badi stats --week             # Last 7 days
badi stats --month            # Last 30 days
badi stats --all              # All time
```

### Step 2: Filter and Detail

```bash
badi stats --command Bash     # Bash usage only
badi stats --habits           # Habit streaks
badi stats --export csv       # Export as CSV
```

### Step 3: Interpret

Based on the output, tell the user:
- **High Bash usage**: command shortcuts could be suggested
- **Broken streak**: weekly/daily routine reminder
- **Rarely used tool**: offer guidance

### Step 4: Visual Report

Summarize bar charts, daily trends, and habit streaks.

# Example
```
/stats --habits
/stats --month --command Bash
/stats --export csv > usage-report.csv
```
