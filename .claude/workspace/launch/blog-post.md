<!--
DRAFT for MANUAL human posting (dev.to / Hashnode). Do NOT auto-publish.
Do NOT paste into Reddit/HN/Discord or the awesome-claude-code repo (AI-authored
promo is a strike there). Rewrite in your own voice before publishing.
Suggested dev.to tags: #claudecode #devtools #opensource #productivity
Hashnode: set canonical URL to the dev.to post (or the repo) for SEO.
Title (dev.to): option 1 below. Canonical/SEO title (Hashnode): option 3.
-->

# I gave Claude Code a daily routine, a hook that won't let it commit to main, and a 5-stage review team. Here's the setup.

*Alt title options — pick one: (2) "Three things I wired into Claude Code that I'd miss if they were gone: a morning ritual, a branch guard, and a virtual eng team" · (3) "Structuring a Claude Code workflow: opinionated rituals + safety hooks + a delegated review pipeline"*

A few months into using Claude Code daily, I noticed the friction wasn't the model — it was everything around it. Every new project started from a blank `.claude/` directory. No opening routine, no closing routine, nothing stopping a confident agent from committing straight to `main`, and no structure for running a real change past more than one perspective. The tool was powerful, but I was re-improvising the same scaffolding every single time, and "improvising scaffolding" is the opposite of what scaffolding is for.

So I built the three pieces I kept wishing were already there, and they turned into a small open-source CLI called badi. This post isn't a feature tour — it's about those three pieces, because they're the ones I'd genuinely miss if they vanished: an opinionated daily ritual (`/start`, `/sync`, `/wrap-up`) that gives a session real bookends; a set of safety hooks that run as actual code on every tool call — including one that refuses to let the agent commit to a protected branch; and a virtual engineering team (`/team`) that runs a change through strategy, planning, build, QA, and release instead of one undifferentiated pass. If you only take the patterns and never install anything, that's a perfectly good outcome — so I've made each one copyable on its own.

## What I actually wanted (not a feature list)

Three things, in plain terms:

1. A way to **open and close** each working session deliberately, instead of an infinite scroll of context that slowly degrades.
2. A way to **stop the agent from doing something irreversible** — not by asking it nicely, but structurally.
3. A way to **run a real change through more than one perspective** before it ships.

That's the lens for the whole post. Everything below maps to one of those three wants.

## Pillar 1 — The daily ritual

The core insight is boring and it works: a session with bookends beats a session without them. badi wires three commands for this.

```
/start      # daily kickoff (or first-run onboarding): pulls context, sets the day
/sync       # mid-session: refresh context so it doesn't drift
/wrap-up    # end of day: summarize, close out, set up tomorrow
```

`/start` either onboards a brand-new project (scans the stack, asks a few framing questions, writes a memory file) or runs a daily kickoff (reads yesterday's notes, lists open tasks, surfaces anything a background watcher flagged). `/sync` is the midday reset — it re-reads the working context and reconciles what's changed so the agent isn't operating on a stale mental model. `/wrap-up` closes the loop: it summarizes what happened, moves finished tasks, records decisions, and leaves tomorrow a clean runway.

The behavioral win isn't any single command — it's that the day has a shape. You start on purpose and you stop on purpose, and the agent's context is refreshed at known points instead of drifting until it quietly gets worse.

## Pillar 2 — Safety hooks (the part I'd miss most)

This is the piece I'd fight to keep. Claude Code lets you register hooks — commands that run deterministically around tool calls — and that's a fundamentally different thing from a system prompt. A prompt is advice the model can talk itself out of. A hook is code that runs every time.

The one I rely on most is a branch guard. It runs on **every** Bash call, before the call executes:

```jsonc
// .claude/settings.json — runs on EVERY Bash tool call, before it executes
"PreToolUse": [
  { "matcher": "Bash", "hooks": [
    { "type": "command",
      "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/branch-guard.mjs\"",
      "timeout": 3000 }
  ]}
]
```

If the command is a direct commit to a protected branch (`main`), the hook returns a block decision and the commit never happens:

```
'main' is a protected branch. Direct commits are not allowed.
Switch to a feature branch: git checkout -b feature/name
```

Force-pushes to protected branches are blocked the same way. The agent cannot persuade itself past this, because it isn't being asked — the hook simply returns "no."

Two design details that matter more than they sound:

- **It anchors to `$CLAUDE_PROJECT_DIR`, not the current directory.** Early on, hooks broke the moment I launched Claude Code from a subdirectory, because relative paths resolved against the wrong root. Anchoring to the project dir fixed it for good.
- **It fails safe.** If the hook itself throws for any reason, it exits 0 — it never wedges your session. A guardrail that can brick your workflow is a guardrail you'll disable, so it's built to get out of the way when it breaks.

There are two more write-time hooks in the same spirit — a snapshot before edits and a validator on writes to critical files:

```jsonc
"matcher": "Write|Edit|NotebookEdit",
"hooks": [
  { "command": "... backup-before-write.mjs ..." },  // snapshot before edits
  { "command": "... completeness-gate.mjs ..." }      // validate critical writes
]
```

Defense in depth, but the branch guard is the one that's saved me from myself.

## Pillar 3 — The virtual eng team

The third want — running a change past more than one perspective — became a single command:

```
/team "Add rate limiting to the public API"
```

It runs a five-stage pipeline, with one agent conducting and delegating to specialists:

```
Strategy gate   → product-strategist   (can KILL/DEFER before any code)
Plan & sequence → engineering-manager  (locks architecture, owns the run)
Build loop      → specialist agents    (one shippable increment at a time)
Quality gate    → qa-lead              (NO-SHIP routes defects back to build)
Release         → release-manager      (commit/push/PR only on your authorization)
```

The honest framing: this is orchestrated delegation, not magic. But two things make it genuinely useful. First, the strategy gate can **kill a feature before a single line is written** — the most valuable code is often the code you talk yourself out of. Second, the release step won't commit, push, or open a PR without explicit authorization. The pipeline can stop the line at strategy or at QA, and it can't ship behind your back.

## How it fits together in one session

The rhythm, not the brochure:

1. `/start` — open the day, pull context, see what's open.
2. Do the work with the guardrails on — the branch guard and write-time hooks run on every call, invisibly, until the moment they're needed.
3. `/team "…"` for anything meaty enough to deserve a strategy gate and a QA gate.
4. `/wrap-up` — close out, record decisions, set up tomorrow.

That's it. The point of structure is that you stop thinking about the structure.

## Honest limitations & where it is today

badi is early-stage. The download numbers are small and I'm not going to dress that up. The security scanning is **advisory-only** — it surfaces findings, it does not autonomously execute anything. It's stable and shipping (v1.35.0, 1321 passing tests, MIT-licensed, releases gated on a docs/security sync check), but it's young, and feedback and contributions are what shape it from here.

I'd rather say that plainly than oversell it. If you try it and something is awkward, that's the most useful thing you can tell me.

## Try it, or steal the patterns

Two equally good outcomes.

**Install and try it** — it's tryable in about two minutes, no paywall, no email gate:

```bash
npm install -g @fatihkan/badi
badi init      # wires up .claude/ (agents, commands, hooks)
badi doctor    # validates the install and reports what's active
```

**Or take the ideas and build your own.** You don't need my CLI to get the value of these three patterns:

- Give your sessions **bookends** — even two shell aliases that print yesterday's notes and today's tasks will change how a day feels.
- Add a **branch-guard hook** — a dozen lines that block a direct commit to `main` is the highest-leverage safety code you can write for an autonomous agent.
- **Delegate in stages** — even a single prompt that forces "should we even build this?" before "how do we build it?" catches bad work early.

If you copy nothing but the branch-guard idea, this post did its job.

---

*badi is open source (MIT) and built for Claude Code, with adapters for Cursor, Gemini CLI, Windsurf, and AGENTS.md. Repo and docs: github.com/fatihkan/badi.*

---

### Notes for the human posting this (delete before publishing)
- **Post manually, in your own voice.** Do not let any agent publish this or paste it into Reddit/HN/Discord — and never into the awesome-claude-code repo (AI-authored promo is a strike there).
- **First-person claims:** keep "I built" / "I rely on" honest — they're true for you as the author; don't claim usage you don't have.
- **Verify before publishing:** the branch-guard message and the exact protected-branch list are paraphrased from `.claude/hooks/branch-guard.mjs` / `settings.json` — open the source and confirm the wording matches the current version you ship.
- **Do not name competing projects** — the "steal the patterns or install badi" framing carries the value without comparison.
- **Tags:** `#claudecode #devtools #opensource #productivity`. Hashnode canonical → the dev.to URL.
