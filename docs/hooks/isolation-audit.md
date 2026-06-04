# Hook Isolation Audit (v1.31.0)

With Anthropic Claude Code **2.1.139** (11 May 2026), hooks started running **without terminal access**. This change was made to fix the interactive prompt corruption caused by hooks writing plain text to the terminal.

This audit categorizes Badi's 15 hooks (14 hooks + the shared `_util.mjs`) for compliance with Anthropic's new isolation rules.

## Categories

| Category | Description | Impact |
|----------|-------------|--------|
| **1 — JSON Protocol** | Writes only a single-line JSON to stdout that conforms to the Claude Code hook protocol. `writeDecision()` or `writeContextInjection()`. | ✅ Safe |
| **2 — Plain Text Stdout** | Writes plain text to stdout. It appeared in the terminal on old Claude Code; on 2.1.139+ it is lost. | ⚠️ Protocol violation — fix needed |
| **3 — Terminal Manipulation** | ANSI escapes, cursor moves, raw bytes. Terminal corruption risk. | ❌ DANGER — fix immediately |
| **Log-only** | Writes only to `.claude/logs/` files. No stdout/stderr use (except the defensive fail-safe). | ✅ Safe |

## Result (before vs after v1.31.0)

### BEFORE v1.31.0 (snapshot)

| Hook | Category | Detail |
|------|----------|--------|
| `_util.mjs` | Helper | Not a hook, a utility |
| `backup-before-write.mjs` | Log-only | Filesystem + log |
| `branch-guard.mjs` | 1 | `writeDecision()` |
| `completeness-gate.mjs` | 1 | `writeDecision()` |
| `dependency-audit.mjs` | **2** | `process.stdout.write("WARNING:...")` plain text |
| `guard-bash.mjs` | 1 | `writeDecision()` + log |
| `inject-active-plan.mjs` | 1 | `writeContextInjection()` |
| `log-changes.mjs` | Log-only | `appendLog()` |
| `log-failures.mjs` | Log-only | `appendLog()` |
| `log-stop-verdict.mjs` | Log-only | `appendLog()` |
| `post-compact-resume.mjs` | **2** | `process.stdout.write()` multi-line plain text |
| `pre-compact-handoff.mjs` | Log-only | Filesystem + log |
| `session-reset.mjs` | Log-only | Filesystem + log |
| `skill-router.mjs` | 1 | `writeContextInjection()` |
| `track-usage.mjs` | Log-only | `appendLog()` JSONL |

**Total Category 2**: 2 hooks → **fix applied**.

### AFTER v1.31.0 (target state)

The Category 2 hooks were refactored:

#### `dependency-audit.mjs`
- **Old**: On SessionStart, if there was a finding, `process.stdout.write("WARNING: ...")` plain text write.
- **New**: Injected to Claude as additionalContext via the `writeContextInjection()` JSON protocol.
- **Result**: Previously it did not reach Claude's context (lost or dropped to the terminal); now it actually shows up.

#### `post-compact-resume.mjs`
- **Old**: On SessionStart-resumed, the compact message was `process.stdout.write()` multi-line plain text.
- **New**: additionalContext via `writeContextInjection()`.
- **Result**: The post-compact resume message is now actually delivered to Claude.

## Stderr Usage

All hooks use **opt-in stderr** gated by the `BADI_HOOK_DEBUG` env var (defensive fail-safe):
```javascript
const _badiFailSafe = (e) => {
  if (process.env.BADI_HOOK_DEBUG) {
    try { process.stderr.write(`[badi-hook] ${e?.message || e}\n`); } catch {}
  }
  process.exit(0);
};
```

This is **safe** — it writes to stderr only in debug mode, and since Claude Code does not set `BADI_HOOK_DEBUG` by default, it stays silent. Stderr does not carry the terminal corruption risk Claude faces (Claude Code logs or swallows stderr; it does not bypass to the terminal).

## Test Strategy

`tests/hooks-isolation.test.js` (new, v1.31.0):
- For each hook: SIMULATE stdin → check stdout output format
- If there is stdout output → it must be valid one-line JSON (parse + assertion)
- Stderr must be empty by default (no BADI_HOOK_DEBUG)
- Check for absence of ANSI escape sequences (regex)

## References
- [Claude Code Changelog 2.1.139 (11 May 2026)](https://code.claude.com/docs/en/changelog) — hook terminal-isolation
- [Hook output protocol](https://docs.claude.com/en/docs/claude-code/hooks)
- Existing tests: `tests/hooks-failsafe.test.js`, `tests/cli.hooks-node.test.js`
