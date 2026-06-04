# Hooks

14 safety hooks under `.claude/hooks/`. Run automatically at PreToolUse / PostToolUse / Stop / Compact events.

## Universal safety (npm + plugin)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `guard-bash.mjs` | PreToolUse(Bash) | Blocks destructive shell patterns: `rm -rf /`, force-push to main/master, `chmod 777`, `curl \| bash`, secret exfiltration, `dd of=/dev/`, etc. Three tiers: hard-block, prompt, allow. |
| `branch-guard.mjs` | PreToolUse(Bash) | Refuses direct `git commit` on `main`/`master`/`production`, and `git push --force` on `main`/`master`/`release/*`. |

Both ship in the Claude Code plugin path (v1.16.5+) so plugin users get the same Bash-level protections as npm users.

## Project-state hooks (npm only)

These need a writable project-local `.claude/` tree:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `backup-before-write.mjs` | PreToolUse(Write/Edit) | Snapshots files before modifications. |
| `completeness-gate.mjs` | Stop | Validates outputs before session end. |
| `log-changes.mjs` | PostToolUse(Write/Edit) | Records what changed. |
| `log-failures.mjs` | PostToolUse | Records tool errors. |
| `log-stop-verdict.mjs` | Stop | Records why a session ended. |
| `pre-compact-handoff.mjs` | PreCompact | Saves state before context compaction. |
| `post-compact-resume.mjs` | PostCompact (SessionStart-resumed) | Restores state after compaction (additionalContext). |
| `session-reset.mjs` | Stop | Cleans up ephemeral state. |
| `dependency-audit.mjs` | SessionStart | Audits npm/pip/cargo dependencies and injects findings as additionalContext. |
| `track-usage.mjs` | Stop | Records session usage stats. |
| `inject-active-plan.mjs` | UserPromptSubmit | Injects the active plan into context. |
| `skill-router.mjs` | UserPromptSubmit (opt-in via `badi skills auto on`) | Scores the prompt against the skill vault and injects matching SKILL.md bodies per turn. |

Plugin users who want the full hook suite still get it via `npx @fatihkan/badi init`.
