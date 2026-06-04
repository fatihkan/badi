Scheduled command reminders. Shell-based reminder system for daily/weekly recurring tasks.

# Required Tools
- Bash (badi schedule)

# Procedure

### Step 1: Existing Reminders

```bash
badi schedule list
```

### Step 2: Add a New Reminder

```bash
# Every workday morning
badi schedule add "content start" --at "09:00" --days "mon-fri"

# Weekly (Sunday evening)
badi schedule add "content plan" --at "20:00" --days "sun"

# Daily
badi schedule add "wrap-up" --at "18:00" --days "daily"
```

Day ranges: pzt/sal/car/per/cum/cts/paz (TR) or mon/tue/wed/thu/fri/sat/sun (EN).
Wrap-around supported: sat-sun, fri-mon.

### Step 3: Shell Integration (first setup)

Add to `~/.zshrc` or `~/.bashrc`:
```bash
command -v badi &>/dev/null && badi schedule check 2>/dev/null
```

Shows due reminders at every shell start (60-minute tolerance).

### Step 4: Removal

```bash
badi schedule list            # See the IDs
badi schedule remove [id]     # Remove
```

### Step 5: Check

```bash
badi schedule check           # Show what is due
```

# Example Routines

```bash
# Workday mornings (09:00): content production session
badi schedule add "content start" --at "09:00" --days "mon-fri"

# Weekdays 18:00: end-of-day summary
badi schedule add "wrap-up" --at "18:00" --days "mon-fri"

# Weekly: Sunday evening content planning
badi schedule add "content plan" --at "20:00" --days "sun"

# Every Monday: weekly health
badi schedule add "health" --at "09:30" --days "mon"

# Start of each month: audit
badi schedule add "audit" --at "10:00" --days "mon"
```

# Example Usage

```
/schedule list
/schedule add "content review" --at "16:00" --days "fri"
```
