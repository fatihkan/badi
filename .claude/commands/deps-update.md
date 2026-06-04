Safe dependency update analysis. Patch/minor/major categorization with optional automatic patch application.

# Required Tools
- Bash (badi dev deps)

# Procedure

### Step 1: Scan
```bash
badi dev deps
```

The package manager (npm/yarn/pnpm) is auto-detected.

### Step 2: Categories

Every update falls into:
- **Patch** (1.2.X) — Safe, auto-applicable
- **Minor** (1.X.0) — New features, tests required
- **Major** (X.0.0) — Breaking-change potential, manual review

### Step 3: Auto-Apply Patches
```bash
badi dev deps --apply-patch
```

Applies only the patch level (the safest).

### Step 4: Minor/Major Strategy

**Minor:**
```bash
npm update [package]
npm test
```

**Major:**
1. Read the changelog (npmjs.com/package/X)
2. Check the breaking-change notes
3. Update one at a time: `npm install package@latest`
4. Full test suite

### Step 5: Security Priority

If a critical CVE exists:
```bash
npm audit
npm audit fix              # Patch + minor auto
npm audit fix --force      # Including major (risky)
```

### Step 6: Weekly Routine

```bash
# Monday morning
badi dev deps
badi dev deps --apply-patch   # Apply the patches
npm test                       # Did the tests pass
git add package-lock.json
git commit -m "chore(deps): patch updates"
```

# Example

```
/deps-update
/deps-update --apply
```
