# Claude Code Prompt Guide

How to write PROMPT.md — a **single-shot prompt** that Claude Code can execute to build the
entire project from scratch. This is the most important output of the Project Architect skill.

## What Makes a Great Claude Code Prompt

A great prompt eliminates all ambiguity. Claude Code should never have to guess, infer,
or make creative decisions. Every file, every dependency, every pattern, every edge case
is spelled out. The prompt IS the source of truth.

## Principles

1. **Self-contained.** The prompt includes everything needed. No "see SPECIFICATION.md" — 
   inline the relevant parts.
2. **Ordered by build sequence.** Follow the task order from TASKS.md. Foundation first,
   features next, polish last.
3. **Explicit about files.** Name every file to create. Include the path.
4. **Include code for patterns.** For complex patterns (auth flow, middleware stack, state
   machine), include 10-30 line code sketches. Not full implementations — structural examples
   that show the pattern's shape.
5. **Specify versions.** Every dependency with exact version number.
6. **Include test expectations.** What tests to write, what they should verify.
7. **One prompt, one project.** The entire project from `git init` to deployable artifact.

---

## Prompt Structure

```markdown
# [Project Name] — Claude Code Implementation Prompt

## Project Overview

[3-5 sentences from SPECIFICATION.md §1.1. Elevator pitch + key differentiators.
Just enough context for Claude Code to understand what it's building.]

## Tech Stack

[Direct from IMPLEMENTATION.md §1.1. Table format with exact versions.]

| Layer | Technology | Version |
|-------|-----------|---------|
| ... | ... | ... |

## Project Structure

[Complete directory tree from IMPLEMENTATION.md §3.1. Every file and directory.]

```
project-name/
├── [full tree]
```

## Dependencies

[Exact install command with all packages:]

```bash
# Example for Node.js
npm init -y
npm install [package@version] [package@version] ...
npm install -D [package@version] [package@version] ...
```

```bash
# Example for Go
go mod init [module-path]
go get [package@version]
```

## Configuration Files

[Content for every config file. Exact JSON/YAML/TOML content.]

### tsconfig.json
```json
{ exact content }
```

### .eslintrc.js
```javascript
// exact content
```

[Repeat for every config file: Dockerfile, docker-compose.yml, .env.example, etc.]

## Implementation Order

Execute these tasks in sequence. Each task builds on the previous.

### Step 1: [Task Title from TASKS.md]

**Files:** `path/file.ext`, `path/file.ext`

[What to implement. Reference the design pattern. Include code sketch if the pattern
is non-trivial.]

**Pattern:**
```[language]
// Structural example — show the shape, not full implementation
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}
```

**Tests:** [What to test, expected behavior]

---

### Step 2: [Task Title]

**Files:** `path/file.ext`

[Implementation details...]

---

[Continue for ALL tasks from TASKS.md]

## Data Model

[Complete database schema from IMPLEMENTATION.md §4.1]

```sql
-- Full schema, ready to copy into a migration file
```

## API Reference

[Route table from IMPLEMENTATION.md §5.1]

| Method | Path | Handler | Auth | Description |
|--------|------|---------|------|-------------|
| ... | ... | ... | ... | ... |

**Standard Response Format:**
```json
{ success response shape }
```

**Standard Error Format:**
```json
{ error response shape }
```

## Error Handling

[Error classification table from IMPLEMENTATION.md §7.1]

## Auth Flow

[Step-by-step auth implementation from IMPLEMENTATION.md §5.4]

## Environment Variables

[From IMPLEMENTATION.md §8.2]

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| ... | ... | ... | ... |

## Testing Requirements

- Unit tests for all service/business logic
- Integration tests for all API endpoints (happy + error paths)
- Test database setup/teardown between test suites
- Run with: `[test command]`

## Quality Checks

After implementation, verify:
- [ ] `[lint command]` passes with 0 warnings
- [ ] `[test command]` passes with 0 failures
- [ ] `[build command]` produces production artifact
- [ ] All API endpoints respond correctly (test with curl/httpie examples)
- [ ] Database migrations run clean on fresh database
- [ ] Docker build succeeds (if applicable)
- [ ] README has: setup instructions, env vars, API overview
```

---

## Prompt Optimization Rules

### 1. Inline Everything Needed
Don't reference other documents. If Claude Code needs to know the database schema, put the
schema in the prompt. If it needs to know the auth flow, describe the auth flow.

### 2. Code Sketches for Complex Patterns
Include structural code examples for:
- Authentication flow (token generation, middleware, refresh)
- Complex data access patterns (transactions, joins, aggregations)
- State machines (order status, workflow states)
- Middleware chains (auth, logging, CORS, rate limiting)
- Plugin systems (if applicable)
- Event systems (if applicable)

Keep sketches to 10-30 lines. Show interfaces, type signatures, and structure — not
full implementations.

### 3. Be Explicit About Edge Cases
For each feature, state:
- What happens with invalid input
- What happens with missing/null data
- What happens with duplicate data
- What HTTP status codes to return for each error case

### 4. Version Lock Everything
```bash
# Good: exact versions
npm install next@15.1.0 react@19.0.0 prisma@6.1.0

# Bad: no versions
npm install next react prisma
```

### 5. Include the Complete Config
Don't say "configure ESLint for TypeScript". Include the actual config file content.
Don't say "add a Dockerfile". Include the actual Dockerfile.

### 6. Test-Driven Hints
For each feature, suggest the test FIRST:
"Write a test that POST /api/users with valid data returns 201. Then implement the handler
to make it pass."

### 7. Checkpoint Markers
Include verification points throughout:
```markdown
**🔍 Checkpoint:** At this point, `npm run build` should succeed and `npm test` should
pass with [N] tests. If not, fix before proceeding.
```

---

## Prompt Size Guidelines

| Project Size | Prompt Length | Task Count |
|-------------|-------------|-----------|
| Small (weekend hack) | 2,000-5,000 words | 10-20 tasks |
| Medium (side project) | 5,000-15,000 words | 20-50 tasks |
| Large (full product) | 15,000-40,000 words | 50-100+ tasks |
| Enterprise | 40,000+ words (consider splitting) | 100+ tasks |

For prompts over 30,000 words, consider splitting into multiple prompts:
- PROMPT-foundation.md (phases 1-2)
- PROMPT-features.md (phases 3-5)
- PROMPT-release.md (phases 6-7)

Each sub-prompt should be self-contained with all necessary context repeated.

---

## Quality Checklist

- [ ] Prompt is self-contained — no external document references needed
- [ ] Every file to create is listed with its path
- [ ] Every dependency is listed with its exact version
- [ ] Every config file has its complete content
- [ ] Complex patterns have code sketches (10-30 lines)
- [ ] Edge cases and error handling are explicit for every feature
- [ ] Verification checkpoints appear every 3-5 tasks
- [ ] Database schema is complete and ready to copy into migration
- [ ] API routes are fully documented with request/response shapes
- [ ] Test expectations are stated for every feature
- [ ] Build/lint/test commands are specified
- [ ] Prompt follows the build order from TASKS.md exactly
