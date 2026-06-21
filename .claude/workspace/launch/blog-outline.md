I now have everything verified against the real codebase. Here is the deliverable.

---

# Blog Post Outline: badi launch/credibility post (dev.to / Hashnode)

> All facts below are verified against the badi v1.35.0 repo. No write actions taken anywhere. This is a draft for **manual human posting** — do not auto-publish, and do not adapt any of it for the awesome-claude-code repo (AI/bot comments are banned there).

---

## 1. THREE TITLE OPTIONS

1. **"I gave Claude Code a daily routine, a hook that won't let it commit to main, and a 5-stage review team. Here's the setup."**
   *(Specific, concrete, useful-first; names the three real pillars.)*

2. **"Three things I wired into Claude Code that I'd miss if they were gone: a morning ritual, a branch guard, and a virtual eng team"**
   *(Personal, low-hype, signals lived experience over a product pitch.)*

3. **"Structuring a Claude Code workflow: opinionated rituals + safety hooks + a delegated review pipeline"**
   *(Plain, SEO-friendly — indexes well for "Claude Code workflow"; good Hashnode canonical title.)*

> Recommendation: Title 1 for dev.to (concrete hooks the reader); Title 3 as the canonical/SEO title on Hashnode.

---

## 2. SECTION-BY-SECTION OUTLINE

1. **The problem: a blank `.claude/` and no muscle memory.** Every new project starts Claude Code from zero — no shared rituals, no guardrails, no division of labor. The default experience is powerful but unstructured, and structure is exactly what repeated work needs.

2. **What I actually wanted (not a feature list).** Three things: a way to *open and close* each working session deliberately, a way to stop the agent from doing something irreversible, and a way to run a real change through more than one perspective. State this is the lens for the whole post.

3. **Pillar 1 — The daily ritual (`/start`, `/sync`, `/wrap-up`).** Walk through opening a session with `/start` (onboarding or daily kickoff), keeping context fresh mid-session with `/sync`, and closing with `/wrap-up`. Emphasize the behavioral win: bookends beat an infinite scroll of context.

4. **Pillar 2 — Safety hooks (the part I'd miss most).** Show the deterministic guardrails that run as Claude Code hooks, not as polite suggestions: `branch-guard` blocks direct commits and force-pushes to protected branches, `backup-before-write` snapshots files before edits, `completeness-gate` validates writes to critical files. Stress these are code that runs every time, not a prompt the model can talk itself out of.

5. **Pillar 3 — The virtual eng team (`/team`).** Explain the 5-stage pipeline — strategy gate → plan → build → quality gate → release — conducted by an engineering-manager that delegates to specialist agents. The honest framing: it's orchestrated delegation through one entry point, and the strategy gate can *kill* a feature before any code is written.

6. **How it fits together in one session.** A short narrative: `/start` to open, do the work with the guardrails on, `/team` for a meaty change, `/wrap-up` to close. Show the rhythm, not the brochure.

7. **Honest limitations & where it is today.** State traction plainly: early-stage, low download numbers, advisory-only security (no autonomous execution). Frame the invitation: it's stable and shipping (v1.35.0, 1321 passing tests), but young, and feedback/contributions shape it.

8. **Try it / build your own.** Two paths: install and try badi, or steal the *ideas* (rituals + a branch-guard hook + a delegation command) and wire your own. Useful-first close: even readers who never install should leave with a hook pattern they can copy.

---

## 3. OPENING TWO PARAGRAPHS (full text)

> A few months into using Claude Code daily, I noticed the friction wasn't the model — it was everything around it. Every new project started from a blank `.claude/` directory. No opening routine, no closing routine, nothing stopping a confident agent from committing straight to `main`, and no structure for running a real change past more than one perspective. The tool was powerful, but I was re-improvising the same scaffolding every single time, and "improvising scaffolding" is the opposite of what scaffolding is for.

> So I built the three pieces I kept wishing were already there, and they turned into a small open-source CLI called badi. This post isn't a feature tour — it's about those three pieces, because they're the ones I'd genuinely miss if they vanished: an opinionated daily ritual (`/start`, `/sync`, `/wrap-up`) that gives a session real bookends; a set of safety hooks that run as actual code on every tool call — including one that refuses to let the agent commit to a protected branch; and a virtual engineering team (`/team`) that runs a change through strategy, planning, build, QA, and release instead of one undifferentiated pass. If you only take the patterns and never install anything, that's a perfectly good outcome — so I've made each one copyable on its own.

---

## 4. KEY CLI / CODE SNIPPETS TO INCLUDE

All snippets below are accurate to the v1.35.0 repo. Each is labelled with what it demonstrates.

**A. Install + verify (demonstrates: tryable in two minutes, no paywall).**
```bash
npm install -g @fatihkan/badi
badi init      # wires up .claude/ (agents, commands, hooks)
badi doctor    # validates the install and reports what's active
```

**B. The daily ritual (demonstrates: the session bookends — the behavioral core).**
```
/start      # daily kickoff (or first-run onboarding): pulls context, sets the day
/sync       # mid-session: refresh context so it doesn't drift
/wrap-up    # end of day: summarize, close out, set up tomorrow
```

**C. The branch-guard hook (demonstrates: deterministic safety — code, not a suggestion).**
Show the real wiring from `settings.json`, then the decision it enforces:
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
Then the actual behavior (paraphrase, point readers at the source):
```js
// branch-guard.mjs — protected branches: main, master, production
// A direct `git commit` on one of these is blocked with:
"'main' is a protected branch. Direct commits are not allowed.
 Switch to a feature branch: git checkout -b feature/name"
// Force-push (--force / -f) to main/master/release/* is blocked too.
```
*What it demonstrates:* the guardrail is a real PreToolUse hook that returns a `block` decision — the model cannot persuade itself past it. Worth noting the fail-safe design too: any runtime error in the hook exits 0 (never wedges your session).

**D. The other two write-time hooks (demonstrates: defense in depth, briefly).**
```jsonc
"matcher": "Write|Edit|NotebookEdit",
"hooks": [
  { "command": "... backup-before-write.mjs ..." },  // snapshot before edits
  { "command": "... completeness-gate.mjs ..." }      // validate critical writes
]
```

**E. The virtual eng team (demonstrates: orchestrated delegation, with a real kill-switch).**
```
/team "Add rate limiting to the public API"
```
Pipeline it runs (from the actual command spec):
```
Strategy gate   → product-strategist   (can KILL/DEFER before any code)
Plan & sequence → engineering-manager  (locks architecture, owns the run)
Build loop      → specialist agents    (one shippable increment at a time)
Quality gate    → qa-lead              (NO-SHIP routes defects back to build)
Release         → release-manager      (commit/push/PR only on your authorization)
```
*What it demonstrates:* it's not one agent doing everything — it's a conductor delegating to specialists, with two gates (strategy and QA) that can stop the line, and a release step that won't act without explicit user authorization.

**F. (Optional) The honesty snippet (demonstrates: credibility over hype).**
```
v1.35.0 · 1321 passing tests · MIT · advisory-only security (no autonomous execution)
Early-stage and shipping — feedback and contributions shape what's next.
```

---

### Notes for the human posting this
- **Read-only confirmed:** no files changed, nothing posted, no issues/PRs/comments created. Every claim above was verified against the live repo (`branch-guard.mjs`, `settings.json`, `team.md`, `package.json`).
- **Post manually as a human.** Do not let any agent publish this or paste it into Reddit/HN/Discord — those channels (and especially the awesome-claude-code repo) treat AI-authored promo posts as a strike. Rewrite in your own voice before publishing.
- **Suggested tags (dev.to):** `#claudecode`, `#devtools`, `#opensource`, `#productivity`. Set the Hashnode canonical URL to the dev.to post (or the repo) for SEO.
- **Do not name competing projects** in the post — the framing ("steal the patterns or install badi") carries the value without comparison.
- One factual caveat to keep honest: the post says "I built" — true for badi as the author's project; keep first-person claims to things the author personally did.
