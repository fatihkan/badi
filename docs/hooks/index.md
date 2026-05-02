# Hooks

12 safety hooks under `.claude/hooks/`. Run automatically at PreToolUse / PostToolUse / Stop / Compact events.

## Universal safety (npm + plugin)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `guard-bash.sh` | PreToolUse(Bash) | Blocks destructive shell patterns: `rm -rf /`, force-push to main/master, `chmod 777`, `curl \| bash`, secret exfiltration, `dd of=/dev/`, etc. Three tiers: hard-block, prompt, allow. |
| `branch-guard.sh` | PreToolUse(Bash) | Refuses direct `git commit` on `main`/`master`/`production`, and `git push --force` on `main`/`master`/`release/*`. |

Both ship in the Claude Code plugin path (v1.16.5+) so plugin users get the same Bash-level protections as npm users.

## Project-state hooks (npm only)

These need a writable project-local `.claude/` tree:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `backup-before-write.sh` | PreToolUse(Write/Edit) | Snapshots files before modifications. |
| `completeness-gate.sh` | Stop | Validates outputs before session end. |
| `log-changes.sh` | PostToolUse(Write/Edit) | Records what changed. |
| `log-failures.sh` | PostToolUse | Records tool errors. |
| `log-stop-verdict.sh` | Stop | Records why a session ended. |
| `pre-compact-handoff.sh` | PreCompact | Saves state before context compaction. |
| `post-compact-resume.sh` | PostCompact | Restores state after compaction. |
| `session-reset.sh` | Stop | Cleans up ephemeral state. |
| `dependency-audit.sh` | PreToolUse(Bash) | Audits npm/pip/cargo installs. |
| `track-usage.sh` | Stop | Records session usage stats. |

Plugin users who want the full hook suite still get it via `npx @fatihkan/badi init`.
