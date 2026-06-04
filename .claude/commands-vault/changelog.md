Automatic changelog generation. Produces a structured changelog from commit history.

## Badi CLI Command (v1.6+)
For quick generation:
```bash
badi changelog                    # Preview from the latest tag to HEAD
badi changelog --from v1.0.0      # From a specific tag
badi changelog --write --version 1.6.0  # Write to CHANGELOG.md
```

The CLI groups automatically by conventional commit types. The manual steps below are for complex cases (non-conventional commits, breaking-change marking, etc.).

# Required Tools
- Bash (git log, git tag, git diff)
- Read (the existing CHANGELOG.md)
- Write (creating/updating the changelog file)
- Grep (commit message search)

# Format Standard
This command uses the Keep-a-Changelog (keepachangelog.com) format.
Conventional Commits messages (feat:, fix:, breaking:, etc.) are categorized automatically.

---

## Step 1: Define the Version Range

### 1a: Find the Latest Tag
- Find the latest tag with `git tag --sort=-version:refname`
- If no tag exists, use the first commit as the starting point
- Ask the user for a custom range (optional)

### 1b: Range Validation
- Start point: [last tag] or [given commit]
- End point: HEAD (or a given commit)
- Show the total commit count in the range
- Offer a preview with `git log [start]..HEAD --oneline`

---

## Step 2: Parse the Commit Messages

### 2a: Get the Commit List
- Run `git log [range] --format="%H|%s|%an|%ad" --date=short`
- Per commit collect: hash, message, author, date
- Separate merge commits (include or exclude on request)

### 2b: Conventional Commits Parsing
Recognize these prefixes:
- `feat:` or `feature:` -> Features
- `fix:` or `bugfix:` -> Fixes
- `breaking:` or `BREAKING CHANGE:` -> Breaking Changes
- `refactor:` -> Refactoring
- `docs:` -> Documentation
- `perf:` -> Performance
- `test:` -> Tests
- `chore:` or `ci:` -> Maintenance

### 2c: Non-Conventional Messages
- Classify unprefixed commits by their content
- If unclassifiable, add to the "Other" category
- Offer to ask the user about ambiguous commits

---

## Step 3: Categorize

### 3a: Main Categories
Group the findings in this order:
1. **Breaking Changes** - At the top, prominent
2. **Features** - New functionality
3. **Bug Fixes** - Error remediation
4. **Performance** - Performance improvements
5. **Refactoring** - Code structure changes
6. **Documentation** - Doc changes
7. **Tests** - Test changes
8. **Chores** - Auxiliary changes

### 3b: Scope Info
- If the commit message has a scope (example: `feat(auth):`), group by it
- Show the scope inside the changelog entry

---

## Step 4: Build the Markdown

### 4a: Changelog Format
Produce in Keep-a-Changelog format:

```markdown
# Changelog

## [Unreleased] - YYYY-MM-DD

### Breaking Changes
- **[scope]** Change description ([hash])

### Features
- **[scope]** New feature description ([hash])

### Fixes
- Bug fix description ([hash])

### Refactoring
- Refactoring description ([hash])

### Documentation
- Documentation change ([hash])
```

### 4b: Extra Info
- List the contributors (authors)
- Add the total commit count
- Add a compare link: `[Unreleased]: [repo-url]/compare/[tag]...HEAD`

---

## Step 5: Update CHANGELOG.md (Optional)

### 5a: Existing File Check
- Check whether `CHANGELOG.md` exists
- If it does, read the content and verify format compatibility

### 5b: User Approval
- Show the generated changelog content as a preview
- Ask the user: "Shall I update CHANGELOG.md?"
- On approval, prepend the new entries (preserve the existing content)

### 5c: File Write
- Prepend the new section above the existing content
- Preserve the heading format
- Add the date and version in the correct format

---

## Output Format

### Step 6: Summary Report
```
=== CHANGELOG SUMMARY ===
Range: [start] -> [end]
Total Commits: [count]
Categories:
  Features:          [count]
  Fixes:             [count]
  Breaking Changes:  [count]
  Refactoring:       [count]
  Documentation:     [count]
  Other:             [count]
Contributors: [author list]
CHANGELOG.md: [UPDATED / NOT UPDATED]
========================
```
