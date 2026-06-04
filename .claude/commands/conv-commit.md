Conventional commit helper command. Reads staged files, suggests type/scope/message, and validates.

# Required Tools
- Bash (badi commit command invocation)
- git

# Procedure

### Step 1: Read the Staged Changes
```bash
git diff --cached --stat
git diff --cached | head -100
```

### Step 2: Type Selection

By the nature of the change:
- **feat**: A new user-facing feature
- **fix**: An existing bug fixed
- **refactor**: Behavior unchanged, restructuring (rename, extract)
- **perf**: A measured performance improvement
- **docs**: Markdown/comment-only changes
- **test**: Test files only
- **chore**: Maintenance, config, dependencies
- **ci**: `.github/workflows` etc.
- **build**: Build system (webpack, tsconfig, etc.)

### Step 3: Pick a Scope (optional)

The affected area: `auth`, `api`, `ui`, `db`, `config`, a module name, etc.

### Step 4: Write the Short Message

Rules:
- Imperative mood, start lowercase
- No trailing period
- < 100 characters (< 70 preferred)
- WHY > WHAT (the commit history must stay readable)

### Step 5: Check + Commit with the Badi CLI

```bash
# Guidance only
badi commit

# Conventional-format validation + commit
badi commit --message "feat(auth): add JWT refresh tokens"

# Lint check on the last commit
badi commit --check
```

### Step 6: Body and Footer (optional)

For complex changes:
```
feat(auth): add JWT refresh tokens

1h + refresh pattern instead of a 15-minute expiry.
Offline support for mobile clients.

Closes #123
BREAKING CHANGE: use tokens.access instead of access_token
```

# Example
```
/conv-commit
```
