Badi/.claude/ token usage analysis command. Categorized token counts, largest files, optimization suggestions.

# Required Tools
- Bash (badi ai token)

# Procedure

### Step 1: Run
```bash
badi ai token
```

### Step 2: Interpret the Results

Category breakdown:
- **agents** — Agent definitions
- **commands** — Slash commands
- **hooks** — Shell hooks
- **skills** — Skill library (usually the largest)
- **references** — Project guides
- **memory/workspace** — Project notes

Total token thresholds:
- `< 80K` — Healthy
- `80-150K` — Needs monitoring
- `> 150K` — Optimization mandatory

### Step 3: Optimization Suggestions

If the total is high:
1. **Split large SKILL.md files** — move into a `references/` subdirectory
2. **Remove unused commands** — slash commands nobody invokes
3. **Minimize CLAUDE.md** — 1.2KB target
4. **Log rotation** — automatic cap on .claude/logs/

### Step 4: Follow-up

Weekly check:
- `/ai-token` every Monday morning
- Watch the trend (investigate on 10%+ weekly growth)

# Example

```
/ai-token
```
