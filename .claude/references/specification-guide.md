# Specification Guide

How to write SPECIFICATION.md — the foundational document that captures **what** the project
is and **what** it does. This document is technology-aware but implementation-agnostic.

## Principles

1. **Behavior over implementation.** Describe what happens, not how it's coded.
2. **Specific boundaries.** Every feature has clear scope, quantified where possible.
3. **Include non-goals.** What the project does NOT do is equally important.
4. **Write for the implementer.** Someone with only this document should understand full scope.
5. **Mark unknowns.** Use `[TBD: reason]` for undecided aspects — never guess.

---

## Template

The following template uses section numbers for cross-referencing from IMPLEMENTATION.md
and TASKS.md. Remove sections that don't apply to the project.

```markdown
# [Project Name] — Specification

> [One-line tagline or description]

## 1. Overview

### 1.1 What Is [Project Name]?

[2-3 paragraphs: what it is, what problem it solves, who it's for, high-level approach.
This is the elevator pitch expanded.]

### 1.2 Target Audience

[Specific audience segments. Not "developers" — be precise:
"Backend developers building microservices who need X without Y's complexity."]

### 1.3 Key Differentiators

[3-5 bullet points: what makes this different from existing alternatives.
Each differentiator should be concrete, not vague ("fast" → "sub-10ms p99 latency").]

### 1.4 Competitive Landscape

[What exists today. Brief comparison showing where this project fits.
Table format works well:]

| Feature | This Project | Alternative A | Alternative B |
|---------|-------------|---------------|---------------|
| [feature] | ✅ | ✅ | ❌ |

## 2. Core Concepts

[Domain vocabulary. Every important term used in this document should be defined here.
This prevents ambiguity in all downstream documents.]

| Concept | Definition |
|---------|-----------|
| [Term] | [Definition in context of this project] |

## 3. Functional Requirements

[Organized by feature groups. Each feature includes user story, acceptance criteria,
edge cases, and constraints.]

### 3.1 [Feature Group Name]

#### 3.1.1 [Feature Name]

**User Story:** As a [role], I want to [action] so that [benefit].

**Description:** [Detailed behavior description from the user's perspective.]

**Acceptance Criteria:**
- [ ] [Testable criterion — something a test could verify]
- [ ] [Testable criterion]
- [ ] [Testable criterion]

**Edge Cases:**
- [What happens when X is empty?]
- [What happens when Y exceeds limit?]
- [What happens during concurrent access?]

**Constraints:**
- [Size limits, rate limits, format restrictions]

[Repeat for each feature. Group related features together.]

## 4. Architecture Overview

[Conceptual view — NOT the implementation plan. Describe the major components and how
they interact at a high level.]

### 4.1 System Components

[Name and briefly describe each major component/module. This becomes the input for
the module breakdown in IMPLEMENTATION.md.]

### 4.2 Component Interactions

[How components communicate. Data flow direction. Sync vs async. This informs pattern
selection in the implementation phase.]

### 4.3 External Integrations

[Third-party services, APIs, or systems. For each: what it does, why it's needed,
and what the fallback is if it's unavailable.]

## 5. Data Model

### 5.1 Core Entities

[Define each entity with fields, types, constraints, and relationships.]

#### [Entity Name]

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| id | UUID | Yes | Unique identifier | Auto-generated |
| ... | ... | ... | ... | ... |

### 5.2 Relationships

[How entities reference each other. One-to-many, many-to-many, etc.
Use clear notation:]

- User → has many → Projects (one-to-many)
- Project → has many → Members (many-to-many via ProjectMember)

### 5.3 Data Lifecycle

[How data is created, updated, archived, and deleted. Soft delete vs hard delete.
Data retention policies if any.]

## 6. API Surface

[Only if the project exposes a programmatic interface.]

### 6.1 API Style

[REST / GraphQL / gRPC / WebSocket / mixed — state the choice and brief reasoning.]

### 6.2 Endpoint Overview

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/v1/auth/login | Authenticate user | Public |
| GET | /api/v1/users/:id | Get user profile | Required |
| ... | ... | ... | ... |

### 6.3 Authentication & Authorization

[How API access is controlled. Token type, header format, permission model.]

### 6.4 Rate Limiting

[Limits per endpoint or globally. Format of rate limit headers.]

### 6.5 Error Format

[Standard error response structure used across all endpoints.]

```json
{
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable explanation"
  }
}
```

## 7. User Interface

[Only if the project has a visual interface.]

### 7.1 Interface Type

[Web UI / CLI / TUI / Desktop / Mobile / Embedded dashboard]

### 7.2 Key Screens

[List and describe each major screen or view. Include:]
- Purpose
- Key elements/components
- Primary user actions on this screen
- Navigation to/from this screen

### 7.3 Responsive Requirements

[Screen sizes, breakpoints, mobile behavior, accessibility level (WCAG)]

## 8. Security Model

### 8.1 Authentication

[Method, token format, session management, password policy if applicable]

### 8.2 Authorization

[Permission model: RBAC, ABAC, resource-level. Define roles and their permissions.]

### 8.3 Data Protection

[Encryption at rest/in transit, PII handling, data masking]

### 8.4 Input Validation

[Validation strategy at API boundaries]

## 9. Deployment Model

### 9.1 Target Environments

[Production, staging, development. Cloud provider if decided.]

### 9.2 Distribution Method

[Docker, binary, package manager, SaaS. How users get and run the software.]

### 9.3 Configuration

[How the system is configured: env vars, config files, CLI flags, admin UI.]

### 9.4 System Requirements

[Minimum hardware, OS, runtime requirements for production deployment.]

## 10. Performance Requirements

### 10.1 Response Time Targets

[Latency targets for key operations. Use p50/p95/p99 format when possible.]

### 10.2 Throughput Targets

[Concurrent users, requests per second, data volume.]

### 10.3 Resource Limits

[Memory ceiling, CPU budget, storage growth rate.]

## 11. Constraints & Non-Goals

### 11.1 Technical Constraints

[Hard limitations. OS requirements, language version, network constraints.]

### 11.2 Non-Goals

[Features explicitly NOT in scope. Be generous here — 5+ non-goals prevent scope creep.]

- **[Non-goal]**: [Why it's excluded and when it might be reconsidered]

### 11.3 Assumptions

[Things assumed to be true. Each is a risk if the assumption breaks.]

### 11.4 Open Questions

[Undecided aspects. Each marked with context and options being considered.]

- **[TBD: Question]**: [Options: A, B, C. Leaning toward: X because Y.]

## 12. Future Considerations

[Capabilities planned for later versions. Helps the implementer design for extensibility.]

- **v1.1**: [Feature] — [Brief description]
- **v2.0**: [Feature] — [Brief description]
```

---

## Section Selection

| Section | Include When |
|---------|-------------|
| Competitive Landscape | Project has identifiable alternatives |
| API Surface | Any programmatic interface |
| User Interface | Any visual interface |
| Security Model | Handles user data, auth, or is network-facing |
| Performance Requirements | Has measurable performance needs |
| Data Model | Persists or processes structured data |
| Deployment Model | Always |
| Future Considerations | Project has a roadmap beyond initial release |

**Remove empty sections.** 8 substantive sections > 12 sections with "N/A".

---

## Quality Checklist

- [ ] Every feature has testable acceptance criteria
- [ ] Data model covers all entities mentioned in features
- [ ] API endpoints cover all features needing programmatic access
- [ ] Non-goals list has 5+ items
- [ ] No implementation details in functional requirements
- [ ] No vague language without quantification
- [ ] Open questions flagged with [TBD]
- [ ] Core concepts table defines all domain-specific terms
- [ ] A developer could understand full scope from this document alone
