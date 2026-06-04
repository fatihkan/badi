Regression test for slash command and agent files. Format and content validation.

# Required Tools
- Bash (badi ai prompt-test)

# Procedure

### Step 1: Run
```bash
badi ai prompt-test
```

### Step 2: Checks

For every `.claude/commands/*.md` and `.claude/agents/*.md`:

1. **Empty/too-short file** — warning under 50 characters
2. **Agent frontmatter** — `---` + `name:` + `description:` mandatory
3. **TODO/FIXME/TBD** — flagged for production
4. **Long lines** — 500+ characters break formatting

### Step 3: Actions

Based on the findings:
- Empty file: add content or delete
- Missing frontmatter: add it
- TODO: complete or remove
- Long line: reformat

### Step 4: CI Integration

Add to GitHub Actions:
```yaml
- name: Prompt Regression
  run: badi ai prompt-test
```

Since there is no exit code, enforce with:
```bash
badi ai prompt-test | grep -q "clean" || exit 1
```

# Example

```
/prompt-test
```
