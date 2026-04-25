# AGENTS.md

> Convention: [agents.md](https://agents.md) — discoverable instructions for
> AI coding agents that visit this repository.

## What this repo is

A bundle of portable skills following the [agentskills.io](https://agentskills.io)
standard. Generated from [`@fatihkan/badi`](https://github.com/fatihkan/badi).

## How to use it

If you are an AI coding agent reading this:

1. Start with `skills/badi/SKILL.md` — auto-generated router that lists every
   skill grouped by category.
2. Each `skills/<name>/SKILL.md` is self-contained: frontmatter declares the
   activation triggers and tools the skill expects, body is the procedure.
3. Some skills have a `references/` subdirectory for progressive disclosure —
   load only when needed.

## Schema

See `skills/badi/SKILL.md` or the source repo's `lib/skills/schema.js` for
the canonical schema.

## License

MIT — remix freely with attribution.
