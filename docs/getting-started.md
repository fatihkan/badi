# Getting Started

Two install paths depending on whether you want the full toolchain (npm) or just agents/commands/skills (Claude Code plugin).

## npm path (full feature set)

```bash
# Install globally
npm install -g @fatihkan/badi

# Or run without install
npx @fatihkan/badi init

# Verify
badi doctor
```

`badi init` interactively prompts for which harness to write files for (Claude Code, Cursor, Gemini CLI, or all). Non-interactive use:

```bash
badi init --harness claude     # Claude Code only
badi init --harness cursor     # Cursor only
badi init --harness gemini     # Gemini CLI only
badi init --harness all        # All three
```

## Claude Code plugin path (no Node.js)

```bash
# Inside a Claude Code session
/plugin marketplace add fatihkan/badi
/plugin install badi@badi-marketplace
```

The plugin path ships agents, slash commands, and the two universal safety hooks (`guard-bash`, `branch-guard`). For the full hook suite plus the multi-harness compiler and the `badi` CLI toolchain, use the npm path.

## First steps

```bash
# List the 21 agents
badi list --agents

# Browse the 82 commands
badi list --commands

# See what skills are available
badi skills available

# Opt into the ones you want (no skills are auto-loaded since v1.17)
badi skills add seo marketing security
```

## Daily workflow

```bash
/start              # Morning session — load context
/sync               # Mid-day — refresh state
/wrap-up            # End of day — generate summary
/audit              # On-demand — quality + OWASP scan
/review             # On-demand — code review pass
/unstick            # When stuck — root-cause analysis
```

See the [Agents](/agents/), [Commands](/commands/), and [Skills](/skills/) references for the full catalog.
