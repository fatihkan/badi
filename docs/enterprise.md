# Badi for Enterprise

Badi is compatible with Anthropic Claude Code's **enterprise managed-settings** features. This page is a guide to configuring Badi in enterprise environments.

## Compatibility with Anthropic Managed-Settings

Claude Code (2.1.126+) offers admin-tier managed settings. The Badi runtime does not touch these settings — it only passes through.

### `forceLoginOrgUUID` / `forceLoginMethod` (2.1.143)

Claude Code 2.1.143 fixed the bug where this enforcement was skipped for 3rd-party provider and API-key sessions.

**Badi impact**: None. Badi does not keep its own auth; it uses the `claude` binary's auth state. If a user is forced into `forceLoginMethod=sso`, the Claude Code login flow runs before Badi executes.

### `allowManagedDomainsOnly` / `allowManagedReadPathsOnly` (2.1.126)

The bug that bypassed enforcement for sandbox-block missing managed-settings sources was fixed in 2.1.126.

**Badi impact**: None. Badi produces static files under `dist/` (Homebrew/Scoop manifests) and `_bootstrap/badi-skills/` (skill bundle); it does not require remote domain access. Managed-settings policy does not restrict Badi's filesystem writes.

### `parentSettingsBehavior` (2.1.133)

New admin-tier key: `'first-wins' | 'merge'`. The SDK `managedSettings` parent-tier policy can opt into merge.

**Badi impact**: Badi writes `.claude/settings.json` project files (CLAUDE.md, hooks registration). Conflict risk with admin managed-settings: in `first-wins` mode, the admin policy can override Badi's local `permissions:` rules. Recommendation: in enterprise environments, use the `badi init --no-settings-write` (v1.31+) flag so it writes only command/agent/hook files and does not touch settings.json.

## `--dangerously-skip-permissions` Warning

Claude Code 2.1.126 widened this flag's scope:

> Now bypasses prompts for writes to `.claude/`, `.git/`, `.vscode/`, shell config files, and other previously-protected paths (catastrophic removal commands still prompt as a safety net)

**DO NOT USE in enterprise environments**. All of Badi's commands (`init`, `update`, `doctor`, `publish`) run without this flag. Only for manual debugging.

## Hook Isolation (2.1.139)

In Claude Code 2.1.139, hooks now run without terminal access (terminal corruption fix). Badi's 14 hooks (verified by `tests/hooks-isolation.test.js`) are **fully compliant** with Anthropic's new isolation rules:

- 13 hooks: JSON output protocol or log-only
- 1 hook (`dependency-audit.mjs`): refactored to the `writeContextInjection()` JSON protocol in v1.31.0
- 1 hook (`post-compact-resume.mjs`): refactored to `writeContextInjection()` in v1.31.0
- 0 hooks: ANSI escape or terminal manipulation

Audit report: [docs/hooks/isolation-audit.md](./hooks/isolation-audit.md).

## Plugin Marketplace (2.1.143-145)

- **2.1.143**: `claude plugin disable` is rejected if a dependent plugin exists (runtime enforcement)
- **2.1.144**: The Browse pane shows the plugin's last update time
- **2.1.145**: The Browse pane shows the plugin's commands/agents/skills/hooks/MCP/LSP list **before** install

**Badi compatibility**:
- `badi plugin doctor` + `badi plugin graph` (v1.30.0+) — pre-flight + planning (complements Anthropic's runtime enforcement)
- `badi release sync-manifest` (v1.30.1+) — automatic sync of `.claude-plugin/{plugin,marketplace}.json`
- `lastUpdated` field (v1.31.0+) — appears in Anthropic's Browse pane

## Telemetry and Data Flow

Badi telemetry (`badi events`, v1.30+) is **entirely local**:
- `~/.claude/projects/<slug>/badi-events.jsonl`
- Whitelist: `badi.*` closed list + `plugin.<owner>.<event>` regex namespace
- Sends no data out. Fully disabled with `BADI_TELEMETRY=off`.

For enterprise compliance: adding these directories to your backup/audit policy is optional.

## SSO / SAML Integration

Badi does not handle its own auth. It uses Claude Code's Anthropic SSO/SAML configuration. For details, see [Claude Code server-managed settings](https://code.claude.com/docs/en/server-managed-settings).

## Audit Log

Badi audit trails:
- `.claude/logs/audit-trail.md` — all file changes (PostToolUse)
- `.claude/logs/incident-log.md` — security events, branch-guard blocks, critical dependency-audit findings
- `.claude/logs/usage.jsonl` — command usage log
- `~/.claude/projects/<slug>/badi-events.jsonl` — telemetry events

All logs are on the local filesystem; nothing is sent to external services.

## Reference

- [Claude Code Changelog](https://code.claude.com/docs/en/changelog)
- [Claude Code Server-Managed Settings](https://code.claude.com/docs/en/server-managed-settings)
- Badi hook audit: [docs/hooks/isolation-audit.md](./hooks/isolation-audit.md)
