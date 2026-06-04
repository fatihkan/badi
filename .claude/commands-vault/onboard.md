Project onboarding command. For adapting to a new project quickly and thoroughly.

# Required Tools
- Glob (file structure scan)
- Read (file reading)
- Grep (code search)
- Bash (git history, dependencies)
- Write (onboarding report)

# Procedure (6 Steps)

### Step 1: Project Verification
- Verify the project root directory
- Check for `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`
- Check the license file
- Review `.gitignore` and `.editorconfig`

### Step 2: 3 Parallel Scans

**Scan A: Structure Analysis**
- Extract the directory tree (2 levels deep)
- Identify the source directories (src, lib, app, etc.)
- Find the test directories (test, __tests__, spec, etc.)
- List the configuration files
- Find CI/CD files (.github, .gitlab-ci, Jenkinsfile, etc.)
- Detect Docker files

**Scan B: Technology Detection**
- Read the manifest files (package.json, Cargo.toml, pyproject.toml, go.mod, etc.)
- List frameworks and libraries
- Collect version information
- Identify the dev tooling (linter, formatter, bundler)
- Detect the database technology (migration files, ORM configuration)

**Scan C: Documentation Scan**
- Find all markdown files
- Look for API documentation (OpenAPI, Swagger, etc.)
- Comment density analysis (JSDoc, docstrings, etc.)
- Environment variable documentation (.env.example)
- Are there Architecture Decision Records (ADRs)?

### Step 3: Dependency Analysis
- List direct dependencies
- Separate the dev dependencies
- Detect outdated dependencies
- Check security advisories (npm audit, cargo audit, etc.)
- Sketch the dependency graph (relationships between main modules)

### Step 4: Code Patterns
Detect the patterns in use:
- Architectural pattern (MVC, MVVM, Clean Architecture, Hexagonal, etc.)
- Error-handling approaches (try-catch patterns, Result types, etc.)
- Logging strategy
- Test strategy (unit, integration, e2e ratios)
- Naming conventions
- Import/export patterns
- State-management approaches

### Step 5: Git Archaeology
- Find the most-changed files (last 3 months)
- Identify the main contributors
- Analyze the branch strategy (main, develop, feature, etc.)
- Detect the commit message format (conventional commits, etc.)
- Find the last release date and version
- Determine the merge/rebase strategy

### Step 6: Create ONBOARDING.md
```markdown
# Project Onboarding Guide

## Project Summary
[what the project does, 2-3 sentences]

## Tech Stack
| Category | Technology | Version |
|----------|------------|---------|
| Language | ... | ... |
| Framework | ... | ... |
| Database | ... | ... |
| Test | ... | ... |

## Directory Structure
```
[tree view]
```

## Getting Started
```bash
# Install
[install commands]

# Run
[run commands]

# Test
[test commands]
```

## Important Files
- [file]: [description]
- [file]: [description]

## Architecture Notes
[architectural patterns and decisions]

## Code Conventions
[naming, format, commit message rules]

## Known Issues / Technical Debt
[detected problems]

## Dependency Notes
[dependencies that need attention]
```

# Output Format
- The `ONBOARDING.md` file (detailed onboarding guide)
- Updated `memory.md` (project information)
- Terminal summary (key findings)
