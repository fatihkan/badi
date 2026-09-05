Virtual eng team orchestrator. Runs a goal end-to-end through the whole team — strategy → plan → build → QA → ship — conducted by the engineering-manager, delegating to every specialist. One entry point that connects /ceo-review, /eng-review, /qa, and /ship.

# Required Tools
- Read (goal, specs, memory, task board)
- Grep / Glob (map the affected surface)
- Bash (git, tests, build)
- Agent (delegate to the managerial roles + specialists — held by the main thread only)
- AskUserQuestion (the ship gate in Step 5; scope choices)
- Write / Edit (the main thread implements increments and records to the daily note / task board)

# When to Use
When you want the full virtual engineering team on a feature or goal, not just one role. `/team "<goal>"` runs the entire pipeline. For a single stage, call the role command directly (`/ceo-review`, `/eng-review`, `/qa`, `/ship`).

# The Team
| Stage | Role / Agent | Command it mirrors |
|-------|--------------|--------------------|
| Conductor (all stages) | **the main thread** — holds the Agent tool; performs every delegation and executes the delegation map | this command |
| Strategy gate | product-strategist | `/ceo-review` |
| Plan & sequence | engineering-manager — authors the plan and the delegation map | `/eng-review` |
| Build | **implementer**: the main thread (default) or a write-capable agent named in the map; **advisory reviewers** (read-only): architecture-advisor, security-scanner, test-strategist, refactoring-advisor, performance-profiler, … | — |
| Quality gate | qa-lead | `/qa` |
| Ship gate | the user, via AskUserQuestion | — |
| Release | release-manager | `/ship` |

**Who conducts.** The summary line above says the run is "conducted by the engineering-manager"; read that as: the engineering-manager writes the score — the locked approach, the increments, and the delegation map — but it has no Agent tool and cannot launch anyone. The main thread conducts: it holds the Agent tool, launches every brief in Steps 1–4 and 6 (Step 5 is a question to the user, not a brief), and executes the map the engineering-manager produced.

**Who writes code.** The review specialists (architecture-advisor, security-scanner, test-strategist, refactoring-advisor, performance-profiler, …) have Write/Edit disallowed: they review and advise, they never return a diff. Implementation therefore belongs to the **implementer** named per increment in the delegation map — the main thread by default. A write-capable agent may be named instead only where its limits fit the increment (code-generator can create new files but never overwrites existing ones, so it suits greenfield scaffolds only).

# Procedure

### Step 0: Intake
- Read the goal from the argument (or ask for it).
- Pull context: `memory.md`, relevant specs, recent commits, and the task board.
- Decide the entry stage: a raw idea starts at Strategy; an already green-lit goal can start at Plan (say which and why).

### Step 1: Strategy Gate — product-strategist
The main thread delegates to **product-strategist** (the `/ceo-review` lens). Get a verdict:
- **KILL / DEFER** → stop the pipeline, record it (below), report back. Do not build.
- **BUILD NOW / SHRINK & BUILD** → carry the bet + smallest-valuable-version forward.
- **Record** (every verdict, not only KILL/DEFER): append the verdict, the bet, and the success metrics to the daily note (`daily-notes/DDMMYY.md`) — the same destination `/ceo-review` Step 4 uses. For KILL/DEFER, also append the reasoning and the trigger to revisit.

### Step 2: Plan & Sequence — engineering-manager
The main thread delegates to **engineering-manager** (the `/eng-review` lens). Require:
- the locked architecture (+ rejected alternatives),
- ordered, independently-shippable increments, riskiest first,
- a **delegation map** that names, per increment, two separate roles:
  - **Implementer** — who writes the code: the main thread by default, or a write-capable agent (only where its limits fit; see "Who writes code"). Never a review specialist.
  - **Reviewer(s)** — the advisory specialist(s) that review the implementer's diff (architecture-advisor, security-scanner, test-strategist, …).
- the definition of done per increment (checkable acceptance criteria).

The engineering-manager produces this map; it does not (and cannot) delegate. The main thread executes the map in Step 3. Validate the map before recording it: if it names a read-only specialist as implementer, or an increment lacks a done-criterion, re-brief the engineering-manager with the defect — at most **two re-briefs** (the same cap as `/eng-review` Step 3). If it still fails, report **BLOCKED** with the defects and stop.
- **Record**: append the locked approach, the increment list, and the delegation map (implementer + reviewer per increment) to the daily note — the same destination `/eng-review` Step 4 uses.

### Step 3: Build Loop — implementer + reviewers (conducted by the main thread)
For each increment in order:
- The **implementer** named in the map writes the code (the main thread itself, unless a write-capable agent was named). Keep the change to one shippable unit.
- The main thread then briefs the increment's **reviewer(s)** with the diff, the increment goal, the locked approach, and the done-criteria. They review and advise (read-only); the implementer folds their findings in.
- Do not start the next increment until the current one meets its done-criteria.
Front-load the riskiest increment per the engineering-manager's sequencing.

### Step 4: Quality Gate — qa-lead
The main thread delegates to **qa-lead** (the `/qa` lens). Require an evidence-backed verdict:
- **SHIP / SHIP WITH RISK** → proceed to Step 5.
- **NO-SHIP** → a bounded retry, never an open loop:
  1. Route the blocking defects to the **implementer** (not the reviewer): return to Step 3 for the affected increment(s) only, then re-run qa-lead.
  2. At most **two fix rounds**. If the verdict is still NO-SHIP after the second round, stop: report **BLOCKED** with the failing acceptance criteria and the evidence, and do not proceed to Step 5.
- **Record** (every verdict): add the verdict and the blocking issues to the task board (`TaskBoard.md`) — the same destination `/qa` Step 5 uses. A BLOCKED exit records the failing criteria there as open items.

### Step 5: Ship Gate — AskUserQuestion
Runs only on SHIP / SHIP WITH RISK. Ask the user via **AskUserQuestion**: "Ship now?" with the options **yes** / **hold**. Authorization is never inferred from the goal text or from the QA verdict.
- **yes** → the user authorizes branch, commit, push, and PR for this run.
- **hold** (or the question cannot be asked, e.g., a non-interactive run) → nothing is committed, pushed, or opened; the release ends in the state **held for authorization**.

### Step 6: Release — release-manager
The main thread delegates to **release-manager** (the `/ship` lens): pre-flight gate, version, changelog, PR body, post-release checklist, rollback plan. The brief MUST carry an authorization line that matches the Step 5 answer:
- After **yes**: "Authorization: granted by the user at the ship gate — branch, commit, push, and open the PR."
- After **hold**: "Authorization: NOT granted — output the exact commands only; do not run git or gh to branch, commit, push, or open a PR."
Never ship on a failing pre-flight gate, whatever the answer: a failed gate item ends the release as **blocked**, with the failing check and its output.

### Step 7: Team Board
Close with a standup-style board so the run is legible in the transcript. It is a **summary of what Steps 1, 2 and 4 already recorded** — the daily note and the task board are the durable record; this board is not:
```
=== TEAM RUN: <goal> ===
Strategy  : <verdict>                       (product-strategist)   → daily note
Plan      : <N increments>                  (engineering-manager)  → daily note
Build     : <done/total>                    (implementer + reviewers used)
QA        : <verdict + evidence | BLOCKED>  (qa-lead)              → task board
Ship gate : <yes / hold / not reached>
Release   : <PR opened / held for authorization / blocked / not reached> (release-manager)
Next      : <what remains>
========================
```

# Rules
- The **main thread is the conductor**: it alone holds the Agent tool, so it performs every delegation and executes the delegation map. The engineering-manager authors the plan and the map; it cannot delegate to anyone.
- The delegation map names an **implementer** separately from **advisory reviewers**. Review specialists cannot write code (Write/Edit disallowed); the implementer — the main thread by default — writes it; the managerial roles decide, verify, and ship.
- The pipeline is a **gate chain**: a KILL/DEFER (Step 1), a BLOCKED map (Step 2), a BLOCKED after the QA fix-round cap (Step 4), or a failing pre-flight gate (Step 6) stops forward motion — report honestly, do not push past a closed gate.
- Every retry is **bounded**: at most two engineering-manager re-briefs (Step 2) and at most two QA fix rounds (Step 4). Hitting a cap ends in BLOCKED, never in another lap.
- Nothing is committed, pushed, or opened as a PR without an explicit **yes** at the ship gate (Step 5). A **hold** ends the run as "held for authorization" with the exact commands output.
- **Durable record**: verdicts and the locked plan/map go to the daily note (Steps 1, 2); the QA verdict + blockers go to the task board (Step 4). The Team Board summarizes them and survives compaction only because they were recorded first.
- Respect project constraints in `memory.md` / `knowledge-base.md`.
- Start mid-pipeline when appropriate, but say which gates were skipped and why.

# Output Format
- Per-stage result as each gate completes (verdict + evidence), each stating where it was recorded.
- Final **Team Board** summarizing the full run, the ship-gate answer, and what remains.
