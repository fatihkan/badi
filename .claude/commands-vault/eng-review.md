Engineering review command. Turns a green-lit goal into a locked architecture and a sequenced, shippable increment plan via the engineering-manager agent.

# Required Tools
- Read (context, specs, existing code)
- Grep / Glob (map the affected surface)
- Bash (git status / structure inspection)
- Agent (delegate to engineering-manager; optionally architecture-advisor — both launched by the main thread)

# When to Use
After `/ceo-review` green-lights a bet, before writing code. Run this to lock the approach and break the work into independently mergeable increments. The output feeds implementation and, later, `/qa` and `/ship`.

# Procedure

### Step 1: Frame the Goal
- Read the green-lit scope (from `/ceo-review`, a spec, or the user).
- Map the affected files, modules, and external dependencies.
- Note constraints from `memory.md` / `knowledge-base.md`.

### Step 2: Delegate to Engineering Manager
Launch the **engineering-manager** agent. Ask it to:
- Lock one architectural approach (and name the rejected alternatives).
- Break the goal into increments that each ship value and merge independently.
- Sequence by dependency and risk; front-load unknowns.
- Name, per increment, an **implementer** (who writes the code: the main thread by default, or a write-capable agent) separately from the **advisory reviewer(s)** — the read-only specialists (architecture-advisor, security-scanner, test-strategist, refactoring-advisor, performance-profiler, …) that review the implementer's diff. Review specialists cannot write code, so they are never the implementer.
- State the definition of done per increment.

The engineering-manager has no Agent tool and cannot delegate. If it flags a deep design question it cannot settle, the main thread launches **architecture-advisor** with that question and passes the answer into the engineering-manager's brief (or its re-brief in Step 3).

### Step 3: Validate the Plan
Check the returned plan against all four:
- Is each increment shippable in a single PR?
- Is the riskiest work first?
- Are dependencies explicit and acyclic?
- Does each increment have a clear acceptance bar?

On any failed check: re-brief the **engineering-manager** with the failing item(s) and the concrete reason (e.g., the cycle `A → B → A`, or the increment without a done-criterion) and ask for a revised plan; re-run all four checks on the revision. At most **two re-briefs**. Only a plan that passes all four checks proceeds to Step 4. If the plan still fails after the second re-brief, stop: do not lock anything; report **BLOCKED** with the failing checks and the last draft, for the user to resolve.

### Step 4: Record the Plan
Only for a plan that passed all four checks in Step 3:
- Write the locked approach and increment list to the daily note (`daily-notes/DDMMYY.md`); add the increments to the task board.
- Capture the delegation map (implementer + reviewer(s) per increment) alongside it so each party knows its slice.

# Output Format
- **Locked Approach** (+ rejected alternatives)
- **Increment Plan** (ordered: goal / approach / implementer / reviewer(s) / depends-on / risk / done-when)
- **Critical Path & Risks**
- **Delegation Map**
- **BLOCKED** (only if Step 3 failed after two re-briefs): the failing checks + the last draft, nothing locked
