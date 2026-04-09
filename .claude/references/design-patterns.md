# Design Patterns Reference

When generating IMPLEMENTATION.md, consult this catalog to recommend patterns that fit the
project's specific needs. Don't recommend patterns for their own sake — each recommendation
must solve a concrete problem in THIS project.

## How to Use This Reference

1. Identify the project's architectural challenges from the specification
2. Find matching patterns in the relevant category below
3. Recommend 3-8 patterns total (more for complex projects)
4. For each recommendation, include: pattern name, why it fits, and a brief code sketch
   showing the pattern applied to the project's domain

---

## Architecture Patterns

### Layered Architecture
**When:** Most applications with clear separation between presentation, business logic, and data.
**Structure:** Handler/Controller → Service/UseCase → Repository/DataAccess → Database
**Trade-off:** Clear separation vs. potential over-abstraction for simple apps.
**Skip when:** Project is a simple CRUD with no business logic beyond validation.

### Clean Architecture / Hexagonal (Ports & Adapters)
**When:** Business logic must be testable independently of frameworks, databases, and external
services. Domain rules are complex and central.
**Structure:** Domain (entities + interfaces) → UseCases → Adapters (DB, HTTP, external APIs)
**Trade-off:** Maximum testability and flexibility vs. more boilerplate and indirection.
**Skip when:** Project is framework-centric (e.g., Next.js full-stack where framework IS the architecture).

### Modular Monolith
**When:** Project needs clear module boundaries but microservices are premature. Good middle
ground for growing projects.
**Structure:** Single deployable with internal module boundaries, each module owns its data.
**Trade-off:** Organized monolith vs. discipline required to maintain boundaries.

### Microservices
**When:** Independent deployment needed, different scaling per service, polyglot requirements,
large team with clear domain boundaries.
**Trade-off:** Independent scaling vs. distributed system complexity (networking, consistency, debugging).
**Skip when:** Solo developer, early-stage product, team <5 people.

### Event-Driven Architecture
**When:** Loose coupling between components, async processing, audit trails, eventual consistency
is acceptable.
**Structure:** Events → Event Bus → Handlers. Commands trigger events, events trigger side effects.
**Trade-off:** Loose coupling and auditability vs. eventual consistency and debugging complexity.

### CQRS (Command Query Responsibility Segregation)
**When:** Read and write patterns are very different (e.g., complex writes, simple reads from
denormalized views). High read-to-write ratio.
**Trade-off:** Optimized read/write paths vs. complexity of maintaining separate models.
**Skip when:** Simple CRUD where read and write shapes are similar.

---

## Structural Patterns

### Repository Pattern
**When:** Data access needs abstraction for testability, or multiple storage backends.
**How:** Interface defines data operations, concrete implementation handles DB specifics.
```
interface UserRepository {
  findById(id: string): Promise<User | null>
  save(user: User): Promise<User>
  delete(id: string): Promise<void>
}
```
**Skip when:** Using an ORM that already provides this abstraction (Prisma, Django ORM).

### Service Layer
**When:** Business logic spans multiple entities or requires orchestration beyond simple CRUD.
**How:** Services encapsulate business operations, called by handlers/controllers.
```
class OrderService {
  constructor(private orders: OrderRepo, private inventory: InventoryRepo, private payments: PaymentGateway) {}
  
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    // Validate inventory, charge payment, create order — orchestration logic
  }
}
```

### Factory Pattern
**When:** Object creation is complex, has variants, or needs to be centralized.
**How:** Factory function/class encapsulates creation logic.
**Common use:** Creating database connections, HTTP clients, logger instances with config.

### Strategy Pattern
**When:** Algorithm or behavior needs to be swappable at runtime.
**How:** Define interface, implement variants, inject the desired strategy.
**Common use:** Different auth strategies, payment processors, notification channels,
storage backends, sorting/filtering algorithms.

### Adapter Pattern
**When:** Integrating with external APIs or services that might change.
**How:** Wrap external interfaces behind your own interface.
**Common use:** Payment gateways, email services, cloud storage, third-party APIs.

### Middleware / Pipeline Pattern
**When:** Request processing needs composable, ordered transformations.
**How:** Chain of functions that each process and pass to next.
**Common use:** HTTP middleware (auth, logging, CORS, rate limiting), message processing,
validation chains, plugin systems.

### Builder Pattern
**When:** Complex object construction with many optional parameters.
**How:** Fluent interface that builds configuration step by step.
**Common use:** Query builders, configuration objects, HTTP request builders, test fixtures.

---

## Behavioral Patterns

### Observer / Event Emitter
**When:** Components need to react to state changes without tight coupling.
**How:** Subjects emit events, observers subscribe and react.
**Common use:** UI state changes, domain events, webhook triggers, cache invalidation.

### Command Pattern
**When:** Operations need to be queued, logged, undone, or retried.
**How:** Encapsulate operations as objects with execute/undo methods.
**Common use:** Task queues, undo systems, audit logging, CLI command routing.

### State Machine
**When:** Entity has well-defined states with controlled transitions.
**How:** Explicit states + transition rules + guards.
**Common use:** Order status (pending→paid→shipped→delivered), workflow engines,
UI wizards, connection management, game states.

### Chain of Responsibility
**When:** Request handling needs to cascade through multiple handlers until one processes it.
**How:** Linked handlers, each decides to handle or pass along.
**Common use:** Validation chains, error handling, permission checks, content filtering.

---

## Data Patterns

### Unit of Work
**When:** Multiple data operations must succeed or fail together.
**How:** Collect changes, commit/rollback atomically.
**Common use:** Business transactions spanning multiple tables/entities.

### Data Mapper vs Active Record
**Data Mapper:** Entity objects are pure data, separate mapper handles persistence.
Best for complex domains where entities have rich behavior.
**Active Record:** Entity objects include persistence methods (save, delete).
Best for simple CRUD where entities map 1:1 to tables.

### DTO (Data Transfer Object)
**When:** Internal domain models differ from API request/response shapes.
**How:** Separate types for API boundaries, map between domain ↔ DTO.
**Common use:** API responses (hide internal fields), request validation shapes,
inter-service communication.

### Specification Pattern
**When:** Complex query conditions need to be composable and reusable.
**How:** Encapsulate query criteria as objects that can be combined (AND/OR).
**Common use:** Advanced search/filter systems, business rule evaluation.

### Event Sourcing
**When:** Complete audit trail needed, temporal queries, complex domain with undo.
**How:** Store events as source of truth, derive current state by replaying.
**Trade-off:** Perfect audit trail vs. complexity of event replay and projections.
**Skip when:** Simple CRUD, no audit requirements, team unfamiliar with pattern.

---

## API Patterns

### RESTful Resource Design
**When:** Standard CRUD operations on resources with clear naming.
**How:** Nouns as resources, HTTP verbs as operations, HATEOAS optional.
**Key rules:** Plural nouns (`/users`), nested resources (`/users/:id/orders`),
consistent filtering (`?status=active&sort=created_at`).

### API Versioning
**URL-based:** `/api/v1/users` — simple, explicit, easy to route.
**Header-based:** `Accept: application/vnd.api+json;version=1` — cleaner URLs, harder to test.
**Recommendation:** URL-based for simplicity unless there's a specific reason not to.

### Pagination
**Offset-based:** `?page=2&limit=20` — simple, allows jumping to pages.
**Cursor-based:** `?cursor=abc123&limit=20` — better for real-time data, no duplicates.
**Recommendation:** Offset for admin/dashboard views, cursor for feeds/timelines.

### Rate Limiting Patterns
**Token bucket:** Smooth, allows bursts. Best for general API rate limiting.
**Sliding window:** Precise, no burst allowance. Best for strict quotas.
**Implementation:** Track per-key (API key or IP), return `X-RateLimit-*` headers.

### Error Response Pattern
**Always include:** HTTP status, error code (machine-readable), message (human-readable).
**Optional:** Details object, request ID for debugging, documentation link.
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email format is invalid",
    "details": { "field": "email", "value": "not-an-email" },
    "request_id": "req_abc123"
  }
}
```

---

## Concurrency Patterns

### Worker Pool
**When:** Processing many independent tasks with controlled parallelism.
**How:** Fixed number of workers consuming from a task queue/channel.
**Common use:** Background job processing, batch operations, file processing.

### Fan-out / Fan-in
**When:** A task can be split into parallel sub-tasks and results merged.
**How:** Distribute work to multiple goroutines/workers, collect results.
**Common use:** Parallel API calls, map-reduce operations, concurrent data loading.

### Circuit Breaker
**When:** Calling unreliable external services that might be down or slow.
**How:** Track failures, open circuit after threshold, periodically retry.
**States:** Closed (normal) → Open (failing, reject immediately) → Half-Open (test one request).
**Common use:** External API calls, database connections, microservice communication.

### Retry with Backoff
**When:** Transient failures that succeed on retry (network, rate limits).
**How:** Retry N times with exponential delay + jitter.
**Common use:** HTTP client calls, message queue publish, database connections.

---

## Security Patterns

### Input Validation Pipeline
**When:** Always. Every project that accepts external input.
**How:** Validate at the boundary (API handler), never trust downstream.
Schema validation (Zod/Joi/JSON Schema) → business rule validation → sanitization.

### Least Privilege Access
**When:** Multi-user systems with different permission levels.
**How:** Default deny, grant specific permissions, check at every access point.
**Implementation:** RBAC (Role-Based) for most apps, ABAC (Attribute-Based) for complex rules.

### Secret Management
**Development:** `.env` files (gitignored), dotenv loading.
**Production:** Environment variables, vault services (HashiCorp Vault, cloud secret managers).
**Never:** Hardcoded secrets, secrets in config files committed to git.

---

## Frontend Patterns

### Container / Presentational Components
**When:** Separating data logic from visual rendering in component-based UIs.
**How:** Containers fetch data and manage state, presentationals receive props and render.
**Modern variant:** Custom hooks replace containers — hook handles logic, component renders.

### Compound Components
**When:** Complex UI components with multiple configurable sub-parts.
**How:** Parent component provides context, children consume it.
**Common use:** Tabs, Accordions, Dropdowns, Form systems.

### Optimistic Updates
**When:** UI should feel instant even though server operations take time.
**How:** Update UI immediately, revert on server failure.
**Common use:** Likes, toggles, inline edits, drag-and-drop reordering.

### Render-as-you-fetch
**When:** Performance-critical pages with multiple data dependencies.
**How:** Start fetching data before the component mounts (Suspense, React Query prefetch).

---

## Testing Patterns

### Arrange-Act-Assert (AAA)
**Always use.** Structure every test: set up state → perform action → verify result.

### Test Fixtures / Factories
**When:** Tests need realistic data without manual construction.
**How:** Factory functions that create valid entities with sensible defaults + overrides.

### Integration Test Containers
**When:** Testing against real database/service behavior matters.
**How:** Spin up containers (testcontainers) for database, cache, etc. during test runs.

### Contract Testing
**When:** API consumers and providers need to stay in sync.
**How:** Define API contracts, verify both sides independently.

---

## Pattern Selection Guide

Given a project's characteristics, recommend patterns from this priority:

| Project Characteristic | Recommended Patterns |
|-----------------------|---------------------|
| Simple CRUD API | Layered Architecture, Service Layer, DTO, RESTful Resources |
| Complex business logic | Clean Architecture, Repository, Service Layer, State Machine |
| Multiple external APIs | Adapter, Circuit Breaker, Retry with Backoff, Strategy |
| Real-time features | Observer/Event Emitter, Worker Pool, WebSocket handler pattern |
| Multi-user with roles | RBAC, Middleware pipeline, Least Privilege |
| High-traffic API | Rate Limiting, Caching, Pagination, Worker Pool |
| Plugin/extension system | Strategy, Middleware pipeline, Factory, Event-driven |
| CLI tool | Command pattern, Builder (for config), Chain of Responsibility |
| Full-stack web app | Container/Presentational, Optimistic Updates, Service Layer |
| Data-intensive | Repository, Unit of Work, CQRS (if read/write differ), Event Sourcing |

When recommending, always include:
1. The pattern name
2. Which specific project problem it solves
3. A 5-15 line code sketch showing the pattern in the project's language and domain
