Dependency-aware task sequencing command. Turns a plan or spec into an ordered, parallel-executable `tasks.md` — then runs it, fanning out independent (`[P]`) tasks concurrently and respecting dependencies. The execution layer between `/eng-review` (the plan) and the actual work.

# Required Tools
- Read (the plan/spec, affected files)
- Grep / Glob (map files each task touches, to decide what is parallel-safe)
- Write (the tasks.md artifact)
- Workflow / Agent (execute `[P]` tasks concurrently; sequential ones in order)

# When to Use
After a plan exists (`/eng-review`, a spec, or a clear goal) and the work splits into many concrete steps. Use `/tasks` to make the dependency structure explicit and to actually parallelize the independent parts instead of doing everything sequentially. Not for a single-step change — that's just doing it.

# Task Format (the artifact)
Write `tasks.md` (or `.claude/workspace/tasks-<feature>.md`) with one line per task:

```
- [ ] T001 [P] Create the data model in src/models/user.js
- [ ] T002 [P] Add the config schema in src/config/schema.js
- [ ] T003 Wire the service in src/services/user.js   (depends on T001)
```

Rules:
- **`T001`, `T002`, …** — sequential ids in execution order.
- **`[P]`** — parallel-safe: touches *different files* and has *no dependency on an
  incomplete task*. Tasks WITHOUT `[P]` run sequentially (they share a file or
  depend on an earlier task).
- **Explicit file path** in every task — it's how you decide what is parallel-safe
  (two `[P]` tasks must not write the same file).
- **Phases** when useful: Setup → Foundational (blocking) → per-feature → Polish.

# Procedure

### Step 1: Derive the task list
- Read the plan/spec. Break it into the smallest independently-verifiable tasks.
- For each task, name the exact file(s) it creates/edits and its dependencies.

### Step 2: Mark parallelism
- Tag a task `[P]` only if it touches files no other in-flight task touches AND all
  its dependencies are already complete. When unsure, leave `[P]` off (sequential is
  the safe default).

### Step 3: Write tasks.md
- Emit the artifact in the format above so the structure is reviewable before any
  code is written.

### Step 4: Execute
- Run `[P]` tasks of the same phase concurrently (Workflow `parallel()` / parallel
  subagents); run non-`[P]` tasks sequentially in id order.
- A task that depends on an incomplete one waits; a failed task drops its dependents
  (report them, don't silently skip).
- Tick each task `[x]` as it completes.

### Step 5: Report
- Summarize: completed / skipped (with the blocking failure) / remaining, and the
  wall-clock saved by the parallel fan-out.

# Output Format
- The `tasks.md` artifact (numbered, `[P]`-marked, file-pathed)
- Execution summary: done / blocked / remaining + what ran in parallel

# Notes
- This is badi-native: the `[P]` markers map directly onto the Workflow engine's
  `parallel()` — independent tasks fan out, dependent tasks pipeline.
- Pairs with `/eng-review` (produces the plan) and `/qa` (verifies the result).
