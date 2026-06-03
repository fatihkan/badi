Engineering review command. Turns a green-lit goal into a locked architecture and a sequenced, shippable increment plan via the engineering-manager agent.

# Required Tools
- Read (context, specs, existing code)
- Grep / Glob (map the affected surface)
- Bash (git status / structure inspection)
- Agent (delegate to engineering-manager; optionally architecture-advisor)

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
- Assign each increment to the right specialist agent.
- State the definition of done per increment.

For deep design questions, the engineering-manager may further delegate to **architecture-advisor**.

### Step 3: Validate the Plan
Sanity-check the returned plan:
- Is each increment shippable in a single PR?
- Is the riskiest work first?
- Are dependencies explicit and acyclic?
- Does each increment have a clear acceptance bar?

### Step 4: Record the Plan
- Write the locked approach and increment list to the daily note / task board.
- Capture the delegation map so each specialist knows its slice.

# Output Format
- **Locked Approach** (+ rejected alternatives)
- **Increment Plan** (ordered: goal / approach / owner / depends-on / risk / done-when)
- **Critical Path & Risks**
- **Delegation Map**
