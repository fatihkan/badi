.env file validation. Detects missing, extra, empty, and placeholder values + .gitignore check.

# Required Tools
- Bash (badi dev env-check)

# Procedure

### Step 1: Check
```bash
badi dev env-check
```

Reference file detection: `.env.example`, `.env.template`, `.env.sample`

### Step 2: Findings

**Missing (CRITICAL):**
- In .env.example, not in .env
- The user must add it

**Extra (WARNING):**
- In .env, not in .env.example
- Documentation gap — add to .env.example

**Empty value (WARNING):**
- The `KEY=` or `KEY=""` form
- Fill in the value

**Placeholder (CRITICAL):**
- `your_api_key`, `xxx`, `changeme`, `todo`, `<...>`
- Not updated with real values

**gitignore (CRITICAL):**
- If .env is not in .gitignore, add it URGENTLY

### Step 3: Common Pattern

```bash
# .env.example (committed, with placeholders)
DATABASE_URL=postgresql://user:password@localhost/dbname
API_KEY=your_api_key_here
NODE_ENV=development

# .env (not committed, with real values)
DATABASE_URL=postgresql://prod_user:real_password@prod.host/prod_db
API_KEY=sk-abc123...
NODE_ENV=production
```

### Step 4: Automation

Pre-commit hook:
```bash
#!/bin/sh
badi dev env-check || exit 1
```

CI pipeline:
```yaml
- name: Validate .env
  run: badi dev env-check
```

### Step 5: Combine with the Secret Scanner

Comprehensive security:
```bash
badi dev env-check     # .env validation
badi secret-scan       # in-code secret scan
```

# Example

```
/env-check
```
