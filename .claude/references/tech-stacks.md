# Tech Stack Advisor

Interactive technology selection guide. When the user needs help choosing a stack, walk them
through decisions using `AskUserQuestion` with clear trade-offs for each option.

**Important:** Always verify the LATEST stable versions of recommended technologies via web
search before including them in documents. Frameworks and libraries evolve rapidly — don't
assume version numbers from training data are current.

---

## Decision 1: Programming Language

Present based on project type:

### Web Application / API Service
```
Question: "Primary language for the backend?"
Options: [
  "TypeScript / JavaScript (Node.js)",
  "Go",
  "Python",
  "Rust"
]
```

| Language | Best For | Trade-off |
|----------|----------|-----------|
| TypeScript | Full-stack with shared types, rapid prototyping, large ecosystem | Runtime overhead, single-threaded without workers |
| Go | High-performance APIs, microservices, CLI tools, infrastructure | Verbose error handling, smaller web ecosystem |
| Python | Data-heavy apps, ML integration, scripting, rapid prototyping | Slower runtime, GIL limitations for concurrency |
| Rust | Maximum performance, system-level control, safety-critical | Steep learning curve, slower development velocity |

### CLI Tool / System Utility
```
Options: ["Go", "Rust", "TypeScript (Node.js/Bun)", "Python"]
```

| Language | Best For | Trade-off |
|----------|----------|-----------|
| Go | Fast compilation, single binary, cross-platform, great stdlib | Less expressive type system |
| Rust | Maximum performance, zero-cost abstractions, no GC | Longer compile times, steeper learning curve |
| TypeScript | Rapid development, npm ecosystem, Bun for speed | Requires runtime (Node/Bun), larger binary with bundling |
| Python | Scripting, automation, data processing, rapid prototyping | Requires Python runtime on target machine |

### Library / SDK
```
Options: ["TypeScript", "Go", "Python", "Rust", "Multi-language"]
```

---

## Decision 2: Web Framework

### TypeScript / Node.js
```
Question: "Backend framework style?"
Options: [
  "Full-stack (Next.js / Nuxt)",
  "API-first (Fastify / Hono)",
  "Minimal (Express / Koa)",
  "Batteries-included (NestJS / AdonisJS)"
]
```

| Framework | Best For | Trade-off |
|-----------|----------|-----------|
| Next.js | Full-stack React apps, SSR/SSG, Vercel ecosystem | React-locked, complex mental model, opinionated |
| Fastify | High-performance APIs, schema validation, plugin system | API-only, no built-in frontend |
| Hono | Edge-first, ultra-lightweight, multi-runtime (Node/Bun/Deno/CF Workers) | Newer, smaller ecosystem |
| Express | Maximum flexibility, largest ecosystem, well-understood | Minimal built-in features, callback patterns |
| NestJS | Enterprise patterns, dependency injection, TypeScript-first | Heavy abstraction, Angular-inspired opinions |
| AdonisJS | Laravel-like full-stack, ORM included, MVC | Smaller community, opinionated |

### Go
```
Question: "Go web framework approach?"
Options: [
  "Standard library (net/http)",
  "Lightweight router (Chi / Echo / Fiber)",
  "Full framework (Gin / Buffalo)"
]
```

| Approach | Best For | Trade-off |
|----------|----------|-----------|
| net/http (stdlib) | Maximum control, zero dependencies, learning Go idioms | More boilerplate, build your own middleware stack |
| Chi | Idiomatic Go, stdlib-compatible, lightweight middleware | Minimal features beyond routing |
| Echo | Balance of features and performance, good docs | Slightly opinionated |
| Fiber | Express-like API, extreme performance (fasthttp) | Non-stdlib compatible, fasthttp limitations |
| Gin | Most popular, large community, middleware ecosystem | Some magic, less idiomatic |

### Python
```
Options: ["FastAPI", "Django", "Flask", "Litestar"]
```

| Framework | Best For | Trade-off |
|-----------|----------|-----------|
| FastAPI | Modern APIs, automatic OpenAPI docs, async, type hints | API-focused, no built-in admin/ORM |
| Django | Full-stack, admin panel, ORM, batteries included | Monolithic, heavier, Django ORM opinions |
| Flask | Minimal, flexible, large extension ecosystem | Assemble everything yourself |
| Litestar | FastAPI alternative with more built-in features | Newer, smaller community |

---

## Decision 3: Database

```
Question: "What best describes your data needs?"
Options: [
  "Structured data with relationships",
  "Flexible documents / JSON",
  "Both relational and document",
  "Embedded / no separate server"
]
```

### Relational (SQL)
```
Options: ["PostgreSQL", "MySQL / MariaDB", "SQLite"]
```

| Database | Best For | Trade-off |
|----------|----------|-----------|
| PostgreSQL | Complex queries, JSONB support, extensions, full-text search | Heavier for simple use cases |
| MySQL/MariaDB | Proven at scale, wide hosting support, replication | Fewer advanced features than Postgres |
| SQLite | Embedded, zero-config, single-file, edge/mobile | Single-writer limitation, no built-in replication |

### Document (NoSQL)
```
Options: ["MongoDB", "DynamoDB", "CouchDB", "Embedded alternative"]
```

### Embedded
```
Options: ["SQLite", "BoltDB/bbolt (Go)", "LevelDB / RocksDB", "Custom file-based"]
```

---

## Decision 4: Frontend

```
Question: "Frontend framework?"
Options: [
  "React ecosystem",
  "Vue ecosystem",
  "Svelte / SvelteKit",
  "Server-rendered (HTMX / Alpine / Templ)",
  "No frontend (API only)"
]
```

### React Ecosystem
```
Question: "React meta-framework?"
Options: [
  "Next.js (SSR/SSG + API routes)",
  "Vite + React (SPA)",
  "Remix (web standards, loaders)",
  "TanStack Start"
]
```

### CSS / Styling
```
Question: "Styling approach?"
Options: [
  "Tailwind CSS",
  "CSS Modules",
  "Styled Components / Emotion",
  "Vanilla CSS / native nesting"
]
```

### Component Library
```
Question: "UI component library?"
Options: [
  "shadcn/ui (copy-paste, Radix + Tailwind)",
  "MUI / Material UI",
  "Ant Design",
  "None (custom components)"
]
```

---

## Decision 5: Authentication

```
Question: "Auth implementation approach?"
Options: [
  "Auth library (NextAuth / Lucia / Passport)",
  "Auth service (Clerk / Auth0 / Supabase Auth)",
  "Custom implementation",
  "No auth needed"
]
```

| Approach | Best For | Trade-off |
|----------|----------|-----------|
| Auth library | Control + convenience, self-hosted, framework integration | More setup than a service |
| Auth service | Fastest to implement, managed, social login | Vendor lock-in, cost at scale |
| Custom | Full control, no dependencies, learning | Security risk if done wrong, more work |

---

## Decision 6: ORM / Data Access

### TypeScript
```
Options: ["Prisma", "Drizzle ORM", "TypeORM", "Knex (query builder)", "Raw SQL"]
```

| ORM | Best For | Trade-off |
|-----|----------|-----------|
| Prisma | Schema-first, excellent DX, migrations, type safety | Generated client size, some query limitations |
| Drizzle | SQL-like syntax, lightweight, type-safe, edge-compatible | Newer, some features still maturing |
| TypeORM | Decorator-based, Active Record or Data Mapper | Complex, heavier, maintenance concerns |
| Knex | Query builder (not ORM), flexible, close to SQL | No entity mapping, manual type definitions |

### Go
```
Options: ["sqlc", "GORM", "Ent", "sqlx", "Raw database/sql"]
```

### Python
```
Options: ["SQLAlchemy", "Django ORM", "Tortoise ORM", "Raw SQL"]
```

---

## Decision 7: Testing

```
Question: "Testing philosophy?"
Options: [
  "Comprehensive (unit + integration + e2e)",
  "Pragmatic (key paths + integration)",
  "Minimal (critical paths only)",
  "TDD from the start"
]
```

### TypeScript Testing
```
Options: ["Vitest", "Jest", "Bun test"]
```

### E2E Testing
```
Options: ["Playwright", "Cypress", "None for now"]
```

---

## Decision 8: Deployment & Infrastructure

```
Question: "Deployment target?"
Options: [
  "Container (Docker / Podman)",
  "Serverless (Vercel / Cloudflare / AWS Lambda)",
  "Traditional server (VPS / bare metal)",
  "Platform-as-a-Service (Railway / Render / Fly.io)"
]
```

```
Question: "CI/CD platform?"
Options: ["GitHub Actions", "GitLab CI", "Self-hosted (Jenkins / Drone)", "None yet"]
```

---

## Stack Templates

For common project types, suggest complete stack templates as starting points:

### Modern Full-Stack Web App
TypeScript + Next.js + PostgreSQL + Prisma/Drizzle + Tailwind + shadcn/ui + NextAuth +
Vitest + Playwright + Docker + GitHub Actions

### High-Performance API Service
Go + Chi/Echo + PostgreSQL + sqlc + Docker + GitHub Actions

### Developer CLI Tool
Go + Cobra + SQLite (if storage needed) + goreleaser

### Real-time Application
TypeScript + Fastify + PostgreSQL + Redis + WebSocket + React + Vite

### Lightweight Self-Hosted Tool
Go + net/http + SQLite + embedded HTML templates + single binary

Present these as starting points that the user can customize. Always verify latest
versions via web search before finalizing.

---

## Version Verification Protocol

Before including any technology in IMPLEMENTATION.md:

1. **Web search** for "[technology] latest stable version [current year]"
2. Use the LATEST stable version, not the one from training data
3. Note the version explicitly in the tech stack table
4. If a major version change happened recently, mention migration considerations

This prevents recommending outdated versions and ensures the generated prompt
produces a project with current dependencies.
