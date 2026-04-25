# Destructive action gate (principle 8)

Some operations cannot be undone. They require **explicit user consent**
unless the user has pre-authorized them in durable instructions
(CLAUDE.md, project conventions).

## Always confirm before

| Category | Examples |
|----------|----------|
| File deletion | `rm -rf`, deleting tracked files, dropping uncommitted changes |
| Git destructive | `git push --force`, `git reset --hard`, amending published commits, deleting branches |
| Database | `DROP TABLE`, `TRUNCATE`, dropping indexes on large tables, irreversible migrations |
| Publishing | `npm publish`, `git push <tag>`, creating releases, deploying to prod |
| Process control | `kill -9`, killing processes by name, stopping services |
| Credential rotation | revoking tokens, rotating keys, password resets |
| Communication | sending emails, posting to Slack/issues/PRs (visible to others) |

## Confirmation level matters

- **Once-per-session** is fine for repeated low-risk ops the user has
  approved (e.g., "yes, you can run `git status` whenever").
- **Once-per-action** is required for high-risk ops (e.g., each `git push
  --force` separately).

## Never bypass safety checks without explicit user request

- `git commit --no-verify` — pre-commit hooks exist for a reason. If a
  hook fails, fix the cause, don't skip.
- `git commit --no-gpg-sign` — only when user explicitly says so.
- `force` flags in general — they say "I know what I'm doing"; you
  usually don't.

## Never commit secrets

- Read `.env`, `credentials.json`, `id_rsa`, etc. before staging and
  refuse to commit them — even if the user asks. Warn first.
- If the user *insists*, document why in the commit message and double-check.

## Backup before risky operations

- Long file rewrites: copy to `<file>.bak` first.
- Database migrations: ensure a recent dump exists.
- Mass-renames: confirm `git status` looks right before staging.

## Investigate, don't bulldoze

If you encounter unfamiliar state — uncommitted changes, unexpected
branches, stash entries — *investigate before discarding*. It might be
the user's in-progress work.
