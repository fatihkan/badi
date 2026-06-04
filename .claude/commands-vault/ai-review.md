AI code review of the staged git diff via the Claude API.

# Required Tools
- Bash (badi ai review)

# Prerequisite

The ANTHROPIC_API_KEY environment variable must be set:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```
Sign-up: https://console.anthropic.com/settings/keys

# Procedure

### Step 1: Stage the Changes
```bash
git add [files]
```

### Step 2: AI Review
```bash
badi ai review
```

The staged diff is reviewed with the Claude Haiku 4.5 model. A fast pass taking ~1-3 seconds.

### Step 3: Interpret

Findings in 5 categories:
1. **CRITICAL security** — fix immediately
2. **Bug potential** — check test coverage
3. **Performance** — hot-path changes
4. **Code quality** — DRY, naming, complexity
5. **Positive observations** — things done well

### Step 4: Action

- Critical finding: do not commit; fix first
- High: add a review note, separate commit
- Medium/Low: create a TODO/issue

### Step 5: Follow-up

A git hook to use before every commit:
```bash
# .git/hooks/pre-commit
badi ai review || exit 1
```

# Cost

- Haiku 4.5: ~$0.25 / 1M input, ~$1.25 / 1M output
- Average review: 2-3K input, 500-1000 output tokens
- **Approximate cost: $0.001 per review**

# Example

```
git add src/auth.js
/ai-review
```
