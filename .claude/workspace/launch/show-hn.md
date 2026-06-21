I have everything I need. The release gate is a real ordered set of checks (git-clean, branch, package-json, changelog-en, changelog-tr, test, lint, gh-cli, marketplace-manifest, scoop-manifest, npm-pack, docs-sync) that run as a pre-publish pipeline — including a docs-sync check that verifies the README's claimed counts match reality. That last one is genuinely the most interesting/honest detail.

Here is the deliverable.

---

# Show HN submission — badi

> All numbers below are verified against the repo at v1.35.0: 30 agents, 86 commands, 15 hook scripts, 63 opt-in skill categories, 1321 passing tests (`node scripts/run-tests.mjs tests` → pass 1321 / fail 0). Use these, not the older figures floating around in marketing copy.

---

## 1. Three "Show HN:" title options

1. **Show HN: badi – a workflow layer for Claude Code (hooks, release gates, agent orchestration)**
2. **Show HN: badi – I wrapped my Claude Code setup in a CLI with git hooks and a release gate**
3. **Show HN: badi – structured agents, hooks and slash commands for Claude Code**

*(Title 1 is the recommended primary — it names the concrete technical surface without adjectives. Title 2 is a stronger fit if you want the honest "this started as my own config" framing, which HN tends to reward. Avoid exclamation points, "powerful," "ultimate," etc.)*

---

## 2. Body text

```
Show HN: badi – a workflow layer for Claude Code (hooks, release gates, agent orchestration)

badi is an npm CLI that scaffolds and manages a .claude/ workspace for Claude
Code. It installs a set of subagents, slash commands, lifecycle hooks, and an
opt-in skills vault, plus daily-ritual commands (/start, /sync, /wrap-up). It
also targets Cursor and Gemini CLI from the same source.

  npm install -g @fatihkan/badi && badi init && badi doctor

It started as my own .claude/ directory that I kept copy-pasting between
projects. The CLI is the part that turned that copy-paste into something
versioned, tested, and reproducible. I want to be upfront that a large part of
badi is, in fact, structured prompts and markdown — the interesting question
(which I answer to the skeptical comment below) is what the surrounding tooling
buys you over a folder of files.

What I think is actually worth looking at:

1) Lifecycle hooks wired to Claude Code's hook events, not just prompts.
   These are Node scripts triggered by PreToolUse / PostToolUse / Stop /
   PreCompact / SessionStart / UserPromptSubmit. Examples:
   - branch-guard: a PreToolUse(Bash) hook that parses the bash command Claude
     is about to run, resolves the repo it actually targets (handles `cd` and
     `git -C`), strips heredoc bodies so it doesn't false-match, and blocks
     `git commit` / force-push on protected branches (main/master/production).
     It accounts for a `git switch -c` earlier in the same compound command, so
     it blocks based on the branch the commit would *land on*, not the current
     one. A push is treated as a post-merge publish and is allowed.
   - completeness-gate: a PreToolUse(Write) hook that scans file content for
     secret patterns (Stripe/GitHub/AWS/Slack/JWT/GitLab tokens) before the
     write lands.
   - Every hook has a fail-safe: any uncaught error exits 0, so a buggy hook
     can never wedge your session. (Set BADI_HOOK_DEBUG=1 to see why one bailed.)

2) A release gate that runs as an ordered pipeline before publish.
   `badi release` runs a fixed set of checks — git-clean, branch, package-json,
   changelog-en, changelog-tr, test, lint, gh-cli, marketplace-manifest,
   scoop-manifest, npm-pack — and a docs-sync check. The docs-sync check is the
   one I'm most attached to: it parses the README's own claimed counts (agents,
   commands, hooks, tests) and fails the release if they don't match what's
   actually in the repo. It's the mechanism that keeps the numbers in this very
   post honest, and it caught real drift (a Scoop manifest URL lagging the
   version) that shipped before I added it.

3) Multi-agent orchestration as explicit, inspectable stages — not a black box.
   /team runs a goal through strategy -> plan -> build -> QA -> ship, with an
   engineering-manager agent as conductor delegating to specialists, and gates
   between stages (a strategy "KILL/DEFER" verdict stops the pipeline before any
   code is written). Each stage maps to a standalone command (/ceo-review,
   /eng-review, /qa, /ship) you can run on its own. It's prompt-orchestration,
   but the sequencing and the gates are the product, and you can read every step.

4) An opt-in skills vault. 63 skill categories ship but are NOT loaded by
   default — they sit in a vault and you add only what you want
   (`badi skills add ...`). There's an optional prompt-aware router
   (UserPromptSubmit hook) that injects relevant skill/command context based on
   your prompt. Opt-in is deliberate: loading everything would just burn context.

What's genuinely novel vs. just convention-packaging — honestly:
- Mostly convention-packaging. The agents, commands, and skills are well-organized
  prompts. I'm not going to pretend otherwise.
- The parts I'd call novel-for-this-niche are the engineering around the prompts:
  the branch-guard's command-parsing (target-repo resolution + heredoc stripping +
  effective-branch detection), the release gate's self-verifying docs-sync check,
  and treating the multi-agent pipeline as gated, inspectable stages with a real
  stop condition. Those are software, and they're tested.

Honest limitations:
- Low traction. ~5 GitHub stars, ~329 weekly npm downloads. This is early.
- The 1321 tests cover the CLI/harness/hooks (the deterministic parts). They do
  NOT test prompt quality — there's no way to unit-test whether an agent gives
  good advice, and I won't claim there is.
- Security/pentest skills are advisory-only: threat-model -> raw findings -> triage
  with explicit verdicts. No autonomous payload execution. Expect findings that
  need human triage, not a clean automated report.
- Surface area is large (86 commands). Most people will use ~5. Profiles
  (core/dev/content/pentest) exist to filter, but the breadth can read as bloat.
- Cursor/Gemini support is real but less battle-tested than the Claude Code path.
- It's opinionated. The daily-ritual and branch-protection conventions are mine;
  if they don't match how you work, the value drops.

Feedback I'm specifically looking for:
- Are the hooks the right primitive, or is a PreToolUse bash-parser too fragile a
  place to enforce branch protection? Edge cases I'm missing in the command parsing?
- Is a self-verifying docs-sync release check useful to you, or over-engineering?
- For people who run multi-agent setups: do gated, inspectable stages beat a single
  orchestrator agent, or is the indirection not worth it?
- Where's the line between "useful starter kit" and "too much surface area"? What
  would you cut?

Repo + source for everything above: https://github.com/fatihkan/badi
```

---

## 3. Prepared answer to the toughest skeptical comment

> **"This is just a pile of prompts/markdown. Why is it a project?"**

```
Fair, and a lot of it genuinely is markdown — I said as much in the post. Here's
the honest line I'd draw.

The prompts aren't the project; the tooling around them is. Three concrete things
are real software, with tests, that a folder of .md files can't do:

1. The hooks run code on Claude Code's lifecycle events. branch-guard isn't a
   prompt asking the model to be careful — it's a PreToolUse hook that parses the
   bash command about to execute, resolves which repo it targets (cd / git -C),
   strips heredocs to avoid false matches, computes the branch the commit would
   actually land on, and blocks it deterministically. A prompt can be ignored by
   the model; an exit-2 from a hook cannot. That distinction is the whole point.

2. The release gate self-verifies. `badi release` parses the README's own claimed
   counts and fails if they drift from the repo. A markdown pile can't keep itself
   honest; this is the mechanism that does. It has caught real drift.

3. It's versioned, tested, and reproducible across machines and harnesses. 1321
   tests cover the deterministic parts; `badi init` reproduces the exact setup on a
   new project; the same source targets Claude Code, Cursor, and Gemini. That's the
   difference between "my config" and "a thing other people can install."

If you only want five slash commands, you genuinely don't need this — copy the five
files, that's a legitimate choice and I'd encourage it. What badi sells is the
boring engineering: the hooks that enforce instead of suggest, the gate that won't
let me ship inconsistent claims, and reproducibility. If none of that matters to
your workflow, it's fair to say it's not for you.
```

---

### Notes / constraints honored

- **Read-only everywhere.** Nothing posted, commented, filed, or PR'd. No external write actions taken. The above is draft copy for you to post manually.
- **awesome-claude-code AI/bot ban:** not applicable here (this is Show HN copy), but flagging the rule that applies to *all* community channels — **any text in this deliverable that gets posted (HN title, body, the skeptic reply) must be posted by you as a human, lightly edited in your own voice. Do not paste it verbatim as obviously-AI text.** HN flags canned/AI replies fast; the value of the skeptic answer depends on you being present and sounding like yourself.
- **No competitor names** in the copy.
- **No code changes** — distribution/content only.
- **Honesty over hype:** traction numbers, the "this is mostly markdown" admission, the "tests don't cover prompt quality" caveat, and the "you may not need this" line are all deliberate. For a 5-star project, that candor is the credibility lever.
- **Relevant source files referenced** (absolute paths, for your verification before posting): `/Volumes/Backup/cloud/git/badi/.claude/hooks/branch-guard.mjs`, `/Volumes/Backup/cloud/git/badi/.claude/hooks/completeness-gate.mjs`, `/Volumes/Backup/cloud/git/badi/.claude/hooks/skill-router.mjs`, `/Volumes/Backup/cloud/git/badi/lib/commands/release.js` (the `checkDocsSync` / `checkScoopManifest` gates), `/Volumes/Backup/cloud/git/badi/.claude/commands/team.md`, and `/Volumes/Backup/cloud/git/badi/tests/release-checks.test.js`.
