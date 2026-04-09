# Tasks Guide

How to write TASKS.md — ordered, actionable work items that a developer or **Claude Code**
can execute sequentially to build the entire project.

## Principles

1. **Each task is a Claude Code session.** A task should be completable in a single focused
   session. Self-contained context, clear deliverables, verifiable outcome.
2. **Dependency order is the build order.** No task references work from a later task.
3. **2-8 hours per task.** Smaller → merge. Larger → split.
4. **Every task names its files.** List exactly which files to create or modify.
5. **Acceptance criteria are tests.** Each criterion should be machine-verifiable where possible.
6. **Front-load foundation.** Setup, types, data layer first. Features after.

---

## Template

```markdown
# [Project Name] — Tasks

> Ordered work breakdown derived from IMPLEMENTATION.md.
> Execute sequentially. Each task is completable in a single session.

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | [N] |
| Phases | [N] |
| Estimated Effort | [X-Y hours/days] |
| Foundation Complete | After Task [N] |
| MVP Complete | After Task [N] |
| Full Release | After Task [N] |

---

## Phase 1: Project Foundation

> Establishes project structure, core types, and infrastructure.
> After this phase: project compiles/runs, nothing functional yet.

### Task 1: Project Scaffolding

**Create the project skeleton with all config files and directory structure.**

**Files to create:**
- `package.json` / `go.mod` / `Cargo.toml` — with all dependencies from IMPLEMENTATION.md §1.3
- `.gitignore` — language-appropriate
- `tsconfig.json` / equivalent — strict mode
- `.eslintrc` / linting config
- `.prettierrc` / formatting config
- `Makefile` / `justfile` / npm scripts — dev, build, test, lint commands
- `docker-compose.yml` — dev environment (database, cache if needed)
- `README.md` — minimal with project name and setup instructions
- All directories from IMPLEMENTATION.md §3.1 (empty with `.gitkeep` if needed)

**Commands to run:**
```bash
[exact init commands: npm init, go mod init, etc.]
[exact dependency install commands]
```

**Acceptance Criteria:**
- [ ] `[build command]` completes without errors
- [ ] `[lint command]` passes
- [ ] `[test command]` runs (0 tests, 0 failures)
- [ ] All directories from IMPLEMENTATION.md §3.1 exist
- [ ] `.gitignore` covers build artifacts, env files, node_modules/vendor

**Dependencies:** None
**Effort:** 1-2 hours
**Refs:** IMPLEMENTATION.md §1, §3.1

---

### Task 2: Core Domain Types

**Define all domain entities, interfaces, and shared types.**

**Files to create:**
- `[path]/types.ts` or `[path]/domain/` — all entity types from SPECIFICATION.md §5.1
- `[path]/errors.ts` or `[path]/errors/` — custom error types from IMPLEMENTATION.md §7.1
- `[path]/interfaces.ts` or `[path]/ports/` — repository/service interfaces

**Code requirements:**
- Every entity from the data model must have a corresponding type
- Interfaces for all repository operations (CRUD + custom queries)
- Custom error types for each error category
- Validation schemas for API input (if using schema validation)

**Acceptance Criteria:**
- [ ] All entity types compile with no `any` / `interface{}` types
- [ ] Repository interfaces cover all operations needed by features
- [ ] Error types cover all categories from IMPLEMENTATION.md §7.1
- [ ] Types are exported and importable by other modules

**Dependencies:** Task 1
**Effort:** 2-3 hours
**Refs:** SPECIFICATION.md §2, §5; IMPLEMENTATION.md §2, §7

---

### Task N: [Title]

**[One-sentence summary of what this task delivers.]**

**Files to create/modify:**
- `[exact/path/file.ext]` — [purpose]
- `[exact/path/file.ext]` — [purpose]

**Description:**
[Detailed instructions. What to implement, which patterns to use (reference
IMPLEMENTATION.md §2 patterns), what behavior to achieve.]

**Code requirements:**
- [Specific implementation detail]
- [Pattern to follow: "Use the repository pattern from IMPLEMENTATION.md §2.1"]
- [Error handling: "Return domain errors, not raw DB errors"]

**Test requirements:**
- [Unit tests for: ...]
- [Integration tests for: ...]

**Acceptance Criteria:**
- [ ] [Specific, verifiable criterion]
- [ ] [Specific, verifiable criterion]
- [ ] [All tests pass]

**Dependencies:** Task [N-1], Task [X]
**Effort:** [X] hours
**Refs:** SPECIFICATION.md §[X]; IMPLEMENTATION.md §[X]

---

## Phase 2: [Phase Name]

> [What this phase delivers. After this phase: X is functional.]

### Task N: [Title]
...

---

## Phase N: Release Preparation

> Documentation, CI/CD, containerization, final polish.

### Task N: [Final task]
...

---

## Milestones

| Milestone | After Task | What's Achieved | Demo-able? |
|-----------|-----------|-----------------|------------|
| Foundation | Task [N] | Project builds and runs | Smoke test |
| Data Layer | Task [N] | CRUD operations work | API calls |
| Core Features | Task [N] | Primary use cases work | User workflow |
| MVP | Task [N] | Minimum viable product | Full demo |
| Release | Task [N] | Production-ready | Ship it |

---

## Dependency Graph

```
[T1] → [T2] → [T3] → [T4]
              ↘
        [T5] → [T6] → [T7]
                      ↘
                [T8] → [T9]
```
```

---

## Phase Structure Guide

Adapt phases to the project. Common patterns:

### Standard Backend
1. Foundation (scaffolding, types, config)
2. Data Layer (DB setup, migrations, repositories)
3. Core Business Logic (services, use cases)
4. API Layer (handlers, routing, middleware, validation)
5. Auth & Security (authentication, authorization, rate limiting)
6. Testing & Quality (integration tests, e2e, CI)
7. Deployment & Docs (Docker, CI/CD, README, API docs)

### Full-Stack Web App
1. Foundation (scaffolding, types, config, DB)
2. Backend Core (data layer, services, API)
3. Auth & Security
4. Frontend Foundation (scaffolding, routing, state, layout)
5. Frontend Features (pages, components, API integration)
6. Integration (frontend↔backend, e2e tests)
7. Polish & Release (responsive, a11y, performance, deployment)

### CLI Tool
1. Foundation (scaffolding, types, config)
2. Core Logic (primary commands, algorithms)
3. CLI Interface (argument parsing, output formatting, help text)
4. Advanced Features (config files, plugins, shell completion)
5. Distribution (build scripts, packaging, installation docs)

### Library / SDK
1. Foundation (scaffolding, types, build system)
2. Core API (primary functions/classes, error handling)
3. Advanced Features (edge cases, performance, extensions)
4. Documentation (API docs, examples, README)
5. Distribution (npm publish/go module/crate, CI, versioning)

---

## Task Granularity

### Too Small (merge)
- "Create the users table" → merge into "Data Layer Setup"
- "Add email validation" → include in the feature's task
- "Write one test" → include tests with the feature

### Right-Sized
- "Data layer: migrations, User + Project repositories, unit tests for all CRUD operations"
- "Auth endpoints: register + login + refresh + logout, JWT generation, password hashing, endpoint tests"
- "Dashboard page: layout, data fetching, 3 widget components, loading/error states"

### Too Large (split)
- "Implement the entire API" → split by resource or feature group
- "Build the frontend" → split by page/feature
- "Set up infrastructure" → split: CI, Docker, deployment, monitoring

---

## Acceptance Criteria Rules

Each task needs 3-6 criteria. Each must be:

**Verifiable** — can be checked true/false
**Specific** — no ambiguous language
**Machine-testable preferred** — can be automated as a test

### Strong Examples
- "`npm test` passes with 0 failures"
- "POST /api/v1/users with valid data returns 201 with user JSON"
- "POST /api/v1/users with duplicate email returns 409 with error code `EMAIL_EXISTS`"
- "Database migration creates `users` table with all columns from schema"
- "Config loads from `./config.yaml`, overridden by env vars prefixed with `APP_`"
- "Docker build completes in under 60 seconds, image under 100MB"

### Weak Examples (rewrite these)
- "It works" → what works? be specific
- "Code is clean" → subjective, not testable
- "Handles edge cases" → which ones?
- "Performance is good" → quantify it

---

## Claude Code Optimization

Tasks should be written so Claude Code can execute them efficiently:

1. **List every file** to create or modify — Claude Code works best with explicit targets
2. **Include the pattern** to follow — reference IMPLEMENTATION.md section for the code pattern
3. **State the test command** — Claude Code should run tests after implementation
4. **Reference dependencies** — Claude Code needs to know what's already built
5. **Keep context self-contained** — don't say "as discussed above", repeat key context

### Example: Claude Code-Optimized Task

```markdown
### Task 7: User Registration Endpoint

**Implement user registration with email/password.**

**Files to create:**
- `src/handlers/auth.ts` — register handler function
- `src/services/auth-service.ts` — registration business logic
- `src/validators/auth.ts` — Zod schemas for register input
- `tests/handlers/auth.test.ts` — handler tests
- `tests/services/auth-service.test.ts` — service tests

**Implementation:**
1. Create Zod schema: `{ email: z.string().email(), password: z.string().min(8), name: z.string().min(1) }`
2. AuthService.register(): validate input → check email uniqueness → hash password (bcrypt, 12 rounds) → insert user → return user without password
3. POST /api/v1/auth/register handler: parse body → call service → return 201 with user data
4. Error cases: duplicate email → 409, validation failure → 400, server error → 500

**Pattern:** Service Layer pattern from IMPLEMENTATION.md §2.2 — handler calls service, service calls repository.

**Tests:**
- Unit: AuthService.register with valid/invalid/duplicate data (mock repository)
- Integration: POST /api/v1/auth/register with valid/invalid/duplicate data

**Acceptance Criteria:**
- [ ] POST with valid data returns 201 + user JSON (no password field)
- [ ] POST with duplicate email returns 409 + EMAIL_EXISTS error
- [ ] POST with invalid email returns 400 + VALIDATION_ERROR
- [ ] Password stored as bcrypt hash, never plaintext
- [ ] `npm test` passes
```

---

## Quality Checklist

- [ ] Task 1 starts from blank project
- [ ] Tasks are in executable order — no forward dependencies
- [ ] Every specification feature appears in at least one task
- [ ] Every implementation module is covered
- [ ] Acceptance criteria are verifiable in every task
- [ ] Files to create/modify are listed in every task
- [ ] Effort estimates total to reasonable timeline
- [ ] Milestones are demo-able (not just "phase complete")
- [ ] Final task produces a releasable artifact
- [ ] No task exceeds 8 hours without subtask breakdown
