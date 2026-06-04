Memory and knowledge-base limit check + global project comparison.

# Required Tools
- Bash (badi ai memory-diff)

# Procedure

### Step 1: Run
```bash
badi ai memory-diff
```

### Step 2: Interpret the Results

Three sections:
1. **memory.md** — Session memory, 100-line limit
2. **knowledge-base.md** — Knowledge base, 200-line limit + TBD forbidden
3. **Global projects** — MEMORY.md comparison across other projects

### Step 3: Actions

**memory.md > 80 lines:**
- Reset with `/clear` + move the important parts to the knowledge base

**TBD/TODO in knowledge-base.md:**
- FORBIDDEN (CLAUDE.md rule)
- Complete the content or remove it
- `[Kaynak: ...]` source tag is mandatory if missing

**knowledge-base.md > 200 lines:**
- Consolidation with Auditor approval
- Move old/irrelevant parts to archive/knowledge-archive.md

### Step 4: Weekly Routine

Run `/ai-memory-diff` every Monday and check memory health.

# Memory Rules (CLAUDE.md)

| Layer | Limit | Action |
|-------|-------|--------|
| memory.md | 100 lines | /clear |
| knowledge-base.md | 200 lines | Auditor approval |
| TaskBoard.md | Unlimited | - |

# Example

```
/memory-diff
```
