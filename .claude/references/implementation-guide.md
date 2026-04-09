# Implementation Guide

How to write IMPLEMENTATION.md — the technical blueprint that translates the specification
into **how** the project will be built. This document makes all architecture decisions,
recommends design patterns, defines concrete structures, and includes code sketches.

**Before generating:** Also read `${CLAUDE_PLUGIN_ROOT}/references/design-patterns.md` to select patterns.

## Principles

1. **Justify every choice.** "Use PostgreSQL because: relational data with complex joins,
   strong JSONB support for flexible fields, and team familiarity" — not just "use PostgreSQL."
2. **Be concrete.** Show directory trees, file names, module boundaries, interface signatures.
3. **Recommend patterns with code sketches.** Don't just name-drop patterns — show a 5-15 line
   example of how the pattern applies to THIS project.
4. **Reference the specification.** Every decision traces to a requirement.
5. **Verify versions.** Use web search to confirm latest stable versions before recommending.

---

## Template

```markdown
# [Project Name] — Implementation Plan

> Technical blueprint derived from SPECIFICATION.md.

## 1. Tech Stack

### 1.1 Stack Summary

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Language | [lang] | [ver] | [Why — specific to this project's needs] |
| Runtime | [runtime] | [ver] | [If applicable] |
| Framework | [fw] | [ver] | [Why this over alternatives] |
| Database | [db] | [ver] | [Why — match to data model needs] |
| ORM / Data | [orm] | [ver] | [Why this approach] |
| Frontend | [fw] | [ver] | [If applicable] |
| CSS | [approach] | [ver] | [If applicable] |
| Testing | [tool] | [ver] | [Why this test framework] |
| Linting | [tool] | [ver] | [Tool + config] |
| Build | [tool] | [ver] | [If applicable] |
| CI/CD | [platform] | — | [Why this platform] |
| Container | [tool] | [ver] | [If applicable] |

### 1.2 Key Technical Decisions

[For each significant decision, use this ADR-lite format:]

#### Decision: [Title]
- **Context**: [What requirement or problem drives this decision. Reference SPECIFICATION.md §X.]
- **Options Considered**:
  1. **[Option A]**: [Pros] / [Cons]
  2. **[Option B]**: [Pros] / [Cons]
  3. **[Option C]**: [Pros] / [Cons]
- **Choice**: [Selected option]
- **Rationale**: [Why this wins for THIS project, referencing specific requirements]
- **Consequences**: [Trade-offs accepted, future implications]

[Include 3-8 decisions depending on project complexity. Common decisions:
database choice, auth approach, API style, state management, deployment strategy,
monolith vs services, dependency philosophy.]

### 1.3 Dependency Inventory

| Package | Purpose | License | Justification |
|---------|---------|---------|---------------|
| [name] | [What it does] | [MIT/Apache/etc] | [Why not build it / why this specific package] |

[If the project has a dependency philosophy, state it:
"Stdlib-first: external deps only when stdlib alternative is significantly worse."
"Ecosystem standard: use the framework's recommended packages."
"Curated minimal: fewer than 15 direct dependencies."]

## 2. Design Patterns

[Consult ${CLAUDE_PLUGIN_ROOT}/references/design-patterns.md. For each recommended pattern, show how it applies.]

### 2.1 Architectural Pattern: [Pattern Name]

**Why:** [Which specification requirement this addresses]

**Application:**
[Describe how this pattern structures the project's codebase]

**Code Sketch:**
```[language]
// Show the pattern applied to this project's domain
// 5-15 lines — interfaces, type signatures, structural example
```

### 2.2 [Pattern Name]

**Why:** [Reason]
**Code Sketch:**
```[language]
// Pattern applied to this project
```

[Repeat for each recommended pattern. Typically 3-8 patterns.]

## 3. Project Structure

### 3.1 Directory Layout

```
[project-name]/
├── cmd/                    # [Entry points / CLI commands]
│   └── server/
│       └── main.go         # [HTTP server entry point]
├── internal/               # [Private application code]
│   ├── domain/             # [Core domain types and interfaces]
│   │   ├── user.go         # [User entity + UserRepository interface]
│   │   └── errors.go       # [Domain error types]
│   ├── service/            # [Business logic / use cases]
│   │   └── user_service.go # [UserService implementation]
│   ├── handler/            # [HTTP handlers / controllers]
│   │   └── user_handler.go # [User API endpoints]
│   ├── repository/         # [Data access implementations]
│   │   └── postgres/
│   │       └── user.go     # [PostgreSQL UserRepository]
│   └── middleware/         # [HTTP middleware]
├── migrations/             # [Database migrations]
├── config/                 # [Configuration loading]
├── docker/                 # [Dockerfiles, compose]
├── docs/                   # [Documentation]
├── tests/                  # [Integration / E2E tests]
├── .github/
│   └── workflows/          # [CI/CD pipelines]
├── go.mod
├── Makefile
├── Dockerfile
└── README.md
```

[Adapt this to the project's language and framework. The example above is Go-style.
For TypeScript/Next.js it would be `src/app/`, `src/components/`, `src/lib/`, etc.
The key is: EVERY file that will be created should be represented or implied.]

**Structural Philosophy:** [Explain the organizing principle]
- Feature-based vs layer-based grouping
- Public vs private boundaries
- Where tests live (co-located vs separate)
- Where configs and static assets go

### 3.2 Module Breakdown

#### Module: [Name]
- **Path**: `[directory path]`
- **Responsibility**: [Single clear sentence]
- **Exports**: [What this module exposes — functions, types, interfaces]
- **Imports**: [What it depends on from other modules]
- **Key Files**:
  - `[file.ext]` — [purpose]
  - `[file.ext]` — [purpose]

[Repeat for each module. Every feature from the specification should map to a module.]

### 3.3 Module Dependency Graph

```
[handler] → [service] → [repository] → [database]
    ↓            ↓
[middleware]  [domain]  ← [shared by all layers]
```

[Show which modules depend on which. Flag any concerning coupling.]

## 4. Data Layer

### 4.1 Database Schema

[Complete schema in the project's database syntax.]

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

[Include ALL tables/collections, indexes, and constraints.]

### 4.2 Migration Strategy

[Migration tool, file naming convention, rollback approach.]

### 4.3 Data Access Pattern

[ORM/query builder/raw SQL — with rationale and example.]

```[language]
// Example: How a typical query looks in this project
func (r *UserRepo) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
    // Show the actual pattern, not pseudocode
}
```

### 4.4 Caching Strategy

[If applicable. What's cached, TTL, invalidation approach.]

## 5. API Implementation

### 5.1 Route Structure

[Complete route table with handler mapping.]

| Method | Path | Handler | Middleware | Description |
|--------|------|---------|-----------|-------------|
| POST | /api/v1/auth/register | authHandler.Register | rateLimit | User registration |
| POST | /api/v1/auth/login | authHandler.Login | rateLimit | User login |
| GET | /api/v1/users/me | userHandler.GetProfile | auth | Get own profile |

### 5.2 Request/Response Contract

[Standard shapes with examples from THIS project's domain.]

**Success Response:**
```json
{
  "data": { "id": "uuid", "email": "user@example.com", "display_name": "Alice" },
  "meta": { "request_id": "req_abc123" }
}
```

**Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is already registered",
    "details": { "field": "email" }
  }
}
```

### 5.3 Validation Approach

[Schema validation library/approach with example.]

### 5.4 Authentication Flow

[Step-by-step auth implementation.]

```
1. Client sends credentials → POST /auth/login
2. Server validates → generates JWT (access + refresh)
3. Client stores tokens → sends access token in Authorization header
4. Middleware verifies → extracts user from token
5. Refresh flow → POST /auth/refresh with refresh token
```

## 6. Frontend Implementation

[Only if the project has a UI.]

### 6.1 Component Architecture

[Component hierarchy, naming convention, composition approach.]

### 6.2 State Management

[State library, local vs global state split, data fetching strategy.]

### 6.3 Routing

[Route definitions, layouts, guards.]

### 6.4 Styling

[CSS approach, design tokens, responsive strategy.]

## 7. Error Handling Strategy

### 7.1 Error Classification

| Category | Example | HTTP Code | Logged As | User Sees |
|----------|---------|-----------|-----------|-----------|
| Validation | Bad email format | 400 | Debug | Field error |
| Auth | Invalid token | 401 | Info | "Please sign in" |
| Forbidden | No permission | 403 | Warn | "Not authorized" |
| Not Found | Missing resource | 404 | Debug | "Not found" |
| Business | Quota exceeded | 422 | Info | Specific reason |
| Internal | DB crash | 500 | Error | "Something went wrong" |

### 7.2 Error Propagation

[How errors flow: domain errors → service errors → handler mapping → HTTP response.]

## 8. Configuration

### 8.1 Config Sources

[Hierarchy: defaults → config file → env vars → CLI flags.]

### 8.2 Config Schema

| Key | Type | Default | Env Var | Description |
|-----|------|---------|---------|-------------|
| port | int | 8080 | PORT | HTTP server port |
| db.url | string | — | DATABASE_URL | Database connection string |
| ... | ... | ... | ... | ... |

## 9. Testing Strategy

### 9.1 Test Pyramid

| Level | Tool | Scope | Target |
|-------|------|-------|--------|
| Unit | [tool] | Functions, methods | 80%+ coverage on business logic |
| Integration | [tool] | API endpoints + DB | All endpoints, happy + error paths |
| E2E | [tool] | Full user flows | Critical paths |

### 9.2 Test Patterns

[Factory functions for test data, test database setup/teardown, mocking strategy.]

### 9.3 CI Pipeline

```
Push/PR → Lint → Type Check → Unit Tests → Integration Tests → Build → [Deploy]
```

## 10. Security Implementation

### 10.1 Input Sanitization Points

[Where and how input is validated/sanitized.]

### 10.2 Secret Management

[Dev: .env + dotenv. Prod: env vars or secret manager. Never committed.]

### 10.3 Security Headers

[CSP, CORS policy, HSTS, etc.]

## 11. Deployment

### 11.1 Build Command

```bash
[Exact build commands for production]
```

### 11.2 Dockerfile

```dockerfile
[Complete Dockerfile or description of container strategy]
```

### 11.3 Health Check

[Health check endpoint: what it checks, response format.]

### 11.4 Monitoring

[Logging format (structured JSON), metrics approach, alerting.]

## 12. Development Workflow

### 12.1 Local Setup

```bash
# Step-by-step from fresh clone to running
git clone [repo]
cd [project]
[install commands]
[config setup]
[run command]
```

### 12.2 Code Standards

[Linter config, formatter, pre-commit hooks, commit convention.]

### 12.3 Git Workflow

[Branch naming, PR process, merge strategy.]
```

---

## Quality Checklist

- [ ] Every tech choice has a specific rationale (not "it's popular")
- [ ] Directory structure is file-level complete
- [ ] Module breakdown covers all specification features
- [ ] Design patterns are recommended with code sketches
- [ ] Database schema implements full data model
- [ ] API routes cover all specification endpoints
- [ ] Error handling is defined with classification table
- [ ] Configuration is documented with types and defaults
- [ ] Testing strategy has concrete tool choices
- [ ] Cross-references to SPECIFICATION.md sections are present
- [ ] A developer with this + spec could start coding immediately
