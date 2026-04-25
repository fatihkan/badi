# Task discipline (principle 6)

When work has more than ~3 steps, the cost of a structured task list is
lower than the cost of carrying the plan in your head and forgetting a
piece.

## When to start a task list

- Three or more distinct actions.
- Work that spans multiple files or commits.
- Anything you'd describe as "first, then, then."
- User says "and also" twice — the second "and also" is the signal.

## When *not* to bother

- One-shot edits.
- A question that doesn't require code.
- A trivial fix that fits in one tool call.

## Mark in-progress *before* starting

The task list is a real-time signal to the user, not a post-hoc receipt.
If you start work without marking the task `in_progress`, the user can't
see what you're on.

## Mark completed *as soon as* it's done

Don't batch updates at the end. The user reads task state as it changes.
Five tasks suddenly flipping to "completed" is less useful than each one
flipping when it actually finishes.

## Discoveries change the list

When implementation reveals a new sub-task, *add it*. When a planned task
turns out to be wrong, *delete it* (don't mark it complete-with-noise).
The task list is the working plan; keep it accurate.

## Stale tasks lie

If a task has been `in_progress` for a long time, either:
- You're stuck (say so, ask for help).
- You've moved on without updating the list (clean it up).

A stale `in_progress` task is worse than no task at all — it tells the
user something is happening when nothing is.
