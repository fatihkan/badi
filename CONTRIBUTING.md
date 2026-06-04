# Contributing Guide

Thanks for your interest in contributing to Badi!

## Quick Start

```bash
git clone https://github.com/fatihkan/badi.git
cd badi
npm install
npm test        # Verify that all 105 tests pass
npm link        # Test globally
```

## How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/feature-name`
3. Make your changes
4. Run the tests: `npm test`
5. Commit: `git commit -m "feat: description"`
6. Push: `git push origin feature/feature-name`
7. Open a PR

## Project Structure

```
bin/badi.js          Entry point (thin entry point)
lib/                 ESM modules
  cli.js             Shared utilities (chalk, figlet, VERSION)
  helpers.js         Helper functions
  update-check.js    Version check
  icerik-helpers.js  Content helpers
  commands/          Command modules (init, update, doctor, list, plugin, completion, schedule, stats, icerik)
  templates/         TR/EN template generators
.claude/
  agents/            Agent definitions (.md)
  commands/          Slash commands (.md)
  hooks/             Shell hook scripts (.sh)
  skills/            Skills library
tests/               Node.js native test runner
```

## Commit Message Format

```
feat: new feature
fix: bug fix
perf: performance improvement
refactor: code restructuring
docs: documentation
test: adding/updating tests
chore: maintenance work
```

## PR Checklist

- [ ] `npm test` — all 105 tests pass
- [ ] `npm run lint` — Biome reports no errors
- [ ] Test written for new feature
- [ ] Content quality maintained
- [ ] No sensitive data committed (.env, credentials)
- [ ] CHANGELOG.md updated (for feature additions)

## Adding a New Agent

Create a `.claude/agents/agent-name.md` file:

```markdown
---
name: agent-name
description: Short description
model: sonnet
tools: [Read, Grep, Glob, Bash]
---

Detailed agent instructions...
```

## Adding a New Command

Create a `.claude/commands/command-name.md` file. The first line must be the command description.

## Adding a New Hook

1. Create `.claude/hooks/hook-name.sh` (chmod +x)
2. Register it in `.claude/settings.json`
3. Add it to the `expectedHooks` list in `lib/commands/doctor.js`

## Questions?

Open an issue or let's discuss it in a PR.
