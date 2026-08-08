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

### Step 6: Supply-Chain Cooldown

A freshly published version is the highest-risk window for a compromised package (a hijacked maintainer account ships malware, and it is caught days later). Prefer your package manager's native minimum-release-age gate over pulling `@latest` the day it ships: npm (`minimumReleaseAge` in `.npmrc`, npm 11+), pnpm (`minimumReleaseAge`), yarn (`npmMinimalAgeGate`), or bun (`--minimum-release-age`). Let a version age a few days before adopting it — badi does not reimplement this; point at the native flag.

### Step 7: Weekly Routine

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
