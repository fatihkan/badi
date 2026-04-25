# Knowledge-base source requirement (principle 7)

A knowledge-base is only useful if its claims can be checked. Without
sources, it decays into folklore.

## Required source format

Every entry ends with a source line:

```
[Source: <url | file:path | conversation-with-user-2026-04-15 | empirical-test>]
```

## Hierarchy of source quality

1. **User intervention** — explicit user statement, dated.
   `[Source: User said on 2026-04-15: "we don't use Babel anymore"]`

2. **Empirical** — a test or observation that anyone can re-run.
   `[Source: empirical — `npm test` passes on Node 20 but fails on Node 18]`

3. **Documentation** — official docs, RFCs, schemas.
   `[Source: https://docs.npmjs.com/cli/v10/commands/npm-publish]`

4. **Inferred from code** — agent observation that auditor confirmed.
   `[Source: lib/commands/agent.js:217-224 — confirmation prompt was fake]`

## What's not a valid source

- "I think so" — guesses.
- "GPT-4 said" — hearsay.
- "We've always done it this way" — folklore.

## Forbidden in knowledge-base

- TBD / TODO / FIXME — knowledge-base is for verified facts, not work
  items. Move those to a task list.
- "Probably" / "I think" / "It seems" — uncertainty marker. If you're
  not sure, don't write it down.

## Decisions need *why*, not just *what*

❌ "We use 4-space indent."
✅ "We use 4-space indent. Reason: existing codebase convention since
    2023; switching would touch every file."

The *why* is what tells future-you whether the rule still applies. The
*what* alone is an arbitrary command that erodes the moment context
shifts.

## Memory decays

A snapshot from 6 months ago might not match today's code. Before acting
on a recalled fact, **check it against current state**. If it's stale,
update or remove the entry rather than acting on it.
