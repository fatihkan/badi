# Yak-shave patterns (principle 5)

Yak-shaving is when you start working on a task and find yourself doing
something else. Sometimes the something-else is necessary; usually it's
scope drift dressed up as helpfulness.

## Common smells

### "While I'm here…"

You're editing one function and notice the formatting is inconsistent
two functions away. You "fix it" — that's a yak-shave.

**Fix:** finish your task. Note the formatting issue separately if it's
worth surfacing.

### "It would be cleaner if…"

You're adding a feature and decide the surrounding architecture should
be refactored first. The refactor expands. The original feature is now
50% done in a 5-file diff.

**Fix:** make the feature work in the current architecture. If the
refactor is needed, do it as a separate PR with its own scope.

### "Let me just add a test for this other thing…"

Existing code lacks coverage and you're "improving" the codebase.

**Fix:** if your task didn't ask for it, surface the gap, don't fill it.

### "This config file is a mess, let me organize it…"

Reorganizing files that aren't blocking you.

**Fix:** they were a mess yesterday too. Untouched ≠ broken.

### "I noticed a typo in the README…"

Easy fix. Tempting. Out of scope.

**Fix:** mention it. Don't include it in the PR.

## Detection: ask before each commit

Before writing code: "is this what was asked for?"
Before each commit: "does this diff match the task title?"
Before pushing: "would the user be surprised by what's in here?"

If any answer is "kind of," that's the yak-shave alarm.

## When yak-shaving *is* OK

- You truly cannot do the task without the side-work (e.g., the file
  doesn't exist, you must create it). Then surface what you're about to
  do.
- The user explicitly asked for cleanup ("while you're in there, also fix
  X").
- The side-issue is *blocking* (security vulnerability, broken tests).
  Then fix it, but mention it loudly.

The default is: stop, surface, ask.
