Release notes command. Compiles changes into formats for 3 different audiences.

## Badi CLI Workflow (v1.6+)
Pre-release order:
```bash
badi secret-scan --git                   # Verify no critical secrets
badi changelog --write --version X.Y.Z   # Update CHANGELOG.md
badi commit --check                      # Is the last commit conventional
git tag vX.Y.Z && git push origin vX.Y.Z
gh release create vX.Y.Z --notes-file release-notes.md
```

This command compiles release notes tailored to 3 audiences (technical/marketing/executive).

# Required Tools
- Bash (git log, git tag, diff)
- Read (commit messages, PR descriptions)
- Grep (change scan)
- Write (release note files)

# Procedure (5 Steps)

### Step 1: Define the Range
- Find the latest release tag: `git describe --tags --abbrev=0`
- Compute the diff against the current HEAD
- Define the commit range: `git log [last-tag]..HEAD`
- List the affected files and modules

### Step 2: Gather Data
Compile per commit:
- Commit message and description
- Related PR numbers
- Changed files and lines
- Author info
- Related issue or task numbers

### Step 3: Classify the Changes
Categorize by Conventional Commits or the project's convention:

**New Features (feat):**
- Newly added functionality
- New API endpoints
- New UI components

**Bug Fixes (fix):**
- Resolved bugs
- Performance fixes
- Security patches

**Breaking Changes (BREAKING):**
- API changes
- Database schema changes
- Configuration changes
- Removed features

**Improvements (improve):**
- Performance improvements
- UX improvements
- Code quality improvements

**Infrastructure (infra):**
- CI/CD changes
- Dependency updates
- Documentation

### Step 4: Write 3 Versions

**Version A: Technical Release Notes**
- The full change list by category
- Breaking changes and migration instructions
- API change details
- Known issues
- Commit hashes and PR references

**Version B: Marketing Release Notes**
- New features in user-focused language
- Benefit and value emphasis
- Placeholders for screenshots or visuals
- A call to action

**Version C: Executive Summary**
- A 3-5 item high-level summary
- Business impact emphasis
- Risks and items needing attention
- A look at the next release plan

### Step 5: Save the Files
Save under `releases/`:
- `releases/v[VERSION]-technical.md`
- `releases/v[VERSION]-marketing.md`
- `releases/v[VERSION]-executive.md`

# Output Format
```
=== BADI RELEASE NOTES ===
Version: v[VERSION]
Previous: v[PREVIOUS]
Range: [commit count] commits

Change Summary:
- New Features: [count]
- Bug Fixes: [count]
- Breaking Changes: [count]
- Improvements: [count]
- Infrastructure: [count]

Created Files:
1. releases/v[VERSION]-technical.md
2. releases/v[VERSION]-marketing.md
3. releases/v[VERSION]-executive.md
============================
```
