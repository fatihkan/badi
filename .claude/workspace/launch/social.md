# Social launch copy — SAFETY WEDGE (agentic safety layer for Claude Code)

> Repositioned 2026-06-21 to lead with the verified safety hooks (see POSITIONING.md).
> All claims grounded in badi's real hooks. **Human-only posting** — rewrite in your own
> voice; never auto-post; never into the awesome-claude-code repo.

# 1. X/Twitter Launch Thread (5 tweets)

**Tweet 1 — Hook**
> Claude Code can run `git push --force origin main`, `rm -rf` the wrong folder, or pipe your `.env` into curl.
>
> You can tell it not to in CLAUDE.md. But that's advice — and a model can reason its way around advice.

**Tweet 2 — The shift**
> A prompt is a suggestion. A hook is enforcement.
>
> badi is the agentic safety layer for Claude Code: 14 deterministic hooks that run as real code on every tool call and block the irreversible actions before they execute.

**Tweet 3 — The proof**
> The bash guard hard-blocks `rm -rf /`, `curl | bash`, and `.env` exfiltration. branch-guard blocks commits + force-push to main. A completeness gate blocks writes containing live secrets.
>
> All fail-safe: a crashing hook never wedges your session.

**Tweet 4 — Before / after**
> Before: "don't commit to main" in CLAUDE.md → ignored mid-session.
> After: the commit hits the hook and stops, with an incident-log entry.
>
> npx @fatihkan/badi init && badi doctor

**Tweet 5 — CTA (honest)**
> Early days (~5 stars). I'd rather have 10 users who file real issues than a vanity number.
>
> Every hook is readable in .claude/hooks/. Try it, break it, tell me what's too aggressive:
> npm i -g @fatihkan/badi · github.com/fatihkan/badi
>
> (It's a full workflow layer too — 30 agents, a daily ritual, /team — but the hooks are why I'd install it.)

---

# 2. LinkedIn Post

> Claude Code is an autonomous agent with access to your terminal. Most of the time that's the point — until it force-pushes to main, removes the wrong directory, or pastes a live API key into a committed file.
>
> You can write "don't do that" in a CLAUDE.md file. But that's a suggestion, and a model can reason its way past a suggestion. The only thing that reliably stops an irreversible action is code that runs *before* the action executes.
>
> So I built **badi** (v1.35, on npm) around that idea: the agentic safety layer for Claude Code.
>
> It ships 14 deterministic hooks that fire on every tool call:
> - a bash guard that hard-blocks destructive commands (rm -rf /, curl | bash, .env exfiltration),
> - a branch guard that blocks direct commits and force-pushes to protected branches,
> - a completeness gate that blocks file writes containing live secrets.
>
> Two things I'd call out honestly:
>
> **Enforcement, not advice.** These are hooks, not prompts — the model cannot talk its way past a block. And they're fail-safe: if a hook ever errors, it exits cleanly so it can never wedge your session.
>
> **It's early.** A handful of GitHub stars, low download numbers. I'm not dressing that up. But the hooks are real, readable, and tested (1321 passing tests on the deterministic parts), and badi is also a full workflow layer — daily ritual, code review, a virtual eng team — once you're past the guardrails.
>
> If you run Claude Code anywhere near autonomously, I'd genuinely value your feedback on whether the hooks are the right primitive.
>
> Repo + install: github.com/fatihkan/badi

---

# 3. r/ClaudeAI Note

> **HUMAN-ONLY: post manually. Follow r/ClaudeAI's self-promo rules — disclose "I built this," lead with the workflow/problem not the product, and don't auto-post. Reddit flags AI-written promo aggressively; rewrite this in your own voice before posting. Do NOT have any bot or automation submit it.**

**Suggested title:**
I made Claude Code physically unable to force-push to main (and a few other things) — here's the hook pattern

**Suggested body (rewrite in your own words):**

> Disclosure up front: I built the tool I'll mention, so treat this as a workflow writeup with a bias.
>
> The thing that finally bugged me enough to fix: a CLAUDE.md rule is just advice the model can ignore. "Don't commit to main," "don't run destructive commands" — useful until the agent decides otherwise mid-session.
>
> What actually worked was Claude Code's hook system. A PreToolUse hook runs code before a tool call executes, reads the command from stdin, and can return a hard block. I wired up a branch guard (blocks commits/force-push to protected branches), a bash guard (hard-blocks rm -rf /, curl | bash, .env exfiltration), and a completeness gate (blocks writes with live secrets). All fail-safe — a broken hook exits 0 so it never wedges the session.
>
> I packaged mine as a CLI (badi) so `init` lays them all down at once, but honestly the pattern is the valuable part — a dozen lines of regex + a block decision turns "please don't" into "can't." Happy to share the exact hook source.
>
> How does everyone else here handle guardrails for near-autonomous Claude Code sessions — hooks, sandboxing, manual approval, or just trust?

---

**Notes on constraints honored:** All copy is read-only — nothing posted/commented/filed; no repo files changed by writing this. Reddit note flagged human-only per the AI/bot ban risk. No competitor projects named. Traction stated plainly (early, low stars) — for a tool at this stage, candor is the credibility lever. Claims grounded in the real `.claude/hooks/` (guard-bash, branch-guard, completeness-gate); verify wording before posting.
