Virtual eng team orchestrator. Runs a goal end-to-end through the whole team — strategy → plan → build → QA → ship — conducted by the engineering-manager, delegating to every specialist. One entry point that connects /ceo-review, /eng-review, /qa, and /ship.

# Required Tools
- Read (goal, specs, memory, task board)
- Grep / Glob (map the affected surface)
- Bash (git, tests, build)
- Agent (delegate to the managerial roles + specialists)
- AskUserQuestion (gate confirmations, scope choices)

# When to Use
When you want the full virtual engineering team on a feature or goal, not just one role. `/team "<goal>"` conducts the entire pipeline. For a single stage, call the role command directly (`/ceo-review`, `/eng-review`, `/qa`, `/ship`).

# The Team
| Stage | Role / Agent | Command it mirrors |
|-------|--------------|--------------------|
| Strategy gate | product-strategist | `/ceo-review` |
| Plan & sequence | engineering-manager (conductor) | `/eng-review` |
| Build | specialist agents (architecture-advisor, security-scanner, test-strategist, refactoring-advisor, performance-profiler, code-generator, …) | — |
| Quality gate | qa-lead | `/qa` |
| Release | release-manager | `/ship` |

# Procedure

### Step 0: Intake
- Read the goal from the argument (or ask for it).
- Pull context: `memory.md`, relevant specs, recent commits, and the task board.
- Decide the entry stage: a raw idea starts at Strategy; an already green-lit goal can start at Plan (say which and why).

### Step 1: Strategy Gate — product-strategist
Delegate to **product-strategist** (the `/ceo-review` lens). Get a verdict:
- **KILL / DEFER** → stop the pipeline, record the reasoning, report back. Do not build.
- **BUILD NOW / SHRINK & BUILD** → carry the bet + smallest-valuable-version forward.

### Step 2: Plan & Sequence — engineering-manager (conductor)
Delegate to **engineering-manager** (the `/eng-review` lens). Produce:
- the locked architecture (+ rejected alternatives),
- ordered, independently-shippable increments,
- a **delegation map**: which specialist owns each increment,
- the definition of done per increment.
The engineering-manager is the conductor for the rest of the run.

### Step 3: Build Loop — specialists
For each increment in order:
- Brief the assigned specialist agent with the increment goal, locked approach, and done-criteria.
- Implement the change (the specialist or the main thread writes the code).
- Keep increments to one shippable unit each; do not start the next until the current meets its done-criteria.
Front-load the riskiest increment per the engineering-manager's sequencing.

### Step 4: Quality Gate — qa-lead
Delegate to **qa-lead** (the `/qa` lens). Require an evidence-backed verdict:
- **NO-SHIP** → route blocking defects back to the owning specialist (return to Step 3).
- **SHIP / SHIP WITH RISK** → proceed.

### Step 5: Release — release-manager
Delegate to **release-manager** (the `/ship` lens): pre-flight gate, version, changelog, PR, rollback plan. **Commit/push/PR only when the user authorizes it** (or output the exact commands). Never ship on a failing gate.

### Step 6: Team Board
Close with a standup-style board so the run is legible:
```
=== TEAM RUN: <goal> ===
Strategy  : <verdict>            (product-strategist)
Plan      : <N increments>       (engineering-manager)
Build     : <done/total>         (<specialists used>)
QA        : <verdict + evidence> (qa-lead)
Release   : <PR / blocked / held for authorization> (release-manager)
Next      : <what remains>
========================
```

# Rules
- The pipeline is a **gate chain**: a KILL/DEFER (Step 1) or NO-SHIP (Step 4) stops forward motion — report honestly, do not push past a closed gate.
- The engineering-manager owns sequencing and delegation once the bet is green.
- Specialists do the building; the managerial roles decide, verify, and ship.
- Respect project constraints in `memory.md` / `knowledge-base.md`.
- Start mid-pipeline when appropriate, but say which gates were skipped and why.

# Output Format
- Per-stage result as each gate completes (verdict + evidence).
- Final **Team Board** summarizing the full run and what remains.
