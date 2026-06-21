<!--
DRAFT for MANUAL human posting (dev.to / Hashnode). Do NOT auto-publish.
Do NOT paste into Reddit/HN/Discord or the awesome-claude-code repo (AI-authored promo is a strike).
Rewrite in your own voice before publishing. Tags: #claudecode #claudecodehooks #guardrails
EVERY claim below is grounded in the real .claude/hooks/guard-bash.mjs, branch-guard.mjs, and
completeness-gate.mjs in this repo — open them and confirm the wording matches what you ship.
This deliberately does NOT cite the unverified "PocketOS" incident; it uses badi's own verifiable behavior.
-->

# Your AI agent has a shell. Here are the commands it should never run — and the hooks that stop them.

Claude Code is an autonomous agent with access to your terminal. Most of the time that's the point. But "most of the time" is doing a lot of work in that sentence — because the same agent that writes your migration can also run `git push --force origin main`, `rm -rf` the wrong directory, or pipe your `.env` straight into `curl`. You can *ask* it not to, in `CLAUDE.md`. But a rule in `CLAUDE.md` is advice the model can reason its way around. It is not a guarantee.

The fix isn't a better prompt. It's a hook — code that runs deterministically on every tool call, before the call executes, and returns a hard "no" that the model cannot talk itself past. That's the idea behind badi's hook layer, and this post walks through three real blocks, with the actual matching rules and the real output. You can copy the patterns whether or not you ever install badi.

## 1. The force-push to `main`

The classic. The agent decides the cleanest way out of a messy rebase is to force the branch. `branch-guard` intercepts every Bash call and checks the git operation against a protected-branch list (`main`, `master`, `production` for commits; `main`/`master`/`release/*` for force-push):

```js
// .claude/hooks/branch-guard.mjs (paraphrased)
if (/git\s+push.*(--force\b|\s-f\b)/.test(command)) {
  if (base === "main" || base === "master" || /^release\//.test(base)) {
    // → block decision
    "'main' is a protected branch; force push is not allowed."
  }
}
```

The agent gets a block, not a force-push. It has to switch to a feature branch like everyone else.

## 2. `rm -rf /`, `curl | bash`, and friends

`guard-bash.mjs` runs on every Bash tool call and matches the command against a tier of patterns. The top tier is **HARD_BLOCKS** — never allowed, no warning, no override:

```js
// .claude/hooks/guard-bash.mjs — HARD_BLOCKS (verbatim)
const HARD_BLOCKS = [
  /rm\s+-rf\s+\//i,
  /rm\s+-rf\s+\*/i,
  /git\s+push\s+--force\s+origin\s+(main|master)/i,
  /git\s+reset\s+--hard\s+origin\//i,
  /chmod\s+777/i,
  /curl.*\|\s*(bash|sh|zsh)/i,
  /wget.*\|\s*(bash|sh|zsh)/i,
  />\s*\/etc\//i,
  /mkfs\./i,
  /dd\s+if=.*of=\/dev\//i,
  /cat\s+.*\.(env|pem|key|secret).*\|\s*(curl|nc|wget)/i,
  /echo\s+.*\$(.*password|.*secret|.*token|.*key).*\|\s*(curl|nc|wget)/i,
];
```

Match any of these and the call is blocked with a logged incident:

```
Dangerous command blocked. This operation could harm the system.
```

Note the last two patterns specifically: they target **credential exfiltration** — `cat .env | curl …`, `echo $SECRET | nc …`. That's not a hypothetical; piping secrets to a remote host is exactly the kind of thing a confused (or compromised) agent does, and it's blocked at the tool-call layer, not the prompt layer.

Below HARD_BLOCKS there's a **SOFT_BLOCKS** tier (blocked, but with a "use a safer alternative" message — e.g. any `rm -rf`, any `git push --force`, `git reset --hard`, `sudo rm`) and a **LOG_WARNINGS** tier that records `rm`/`mv`/`chmod`/`npm publish` without blocking, so you have an audit trail.

## 3. The secret that almost got committed

`completeness-gate.mjs` runs before file writes and scans the content for live-secret patterns (`sk_live_…` and friends). If it finds one, the write is blocked before the bytes hit disk:

```js
// .claude/hooks/completeness-gate.mjs (paraphrased)
const secretPatterns = [ /sk_live_[a-zA-Z0-9]+/, /* … */ ];
// match → block decision, the file is never written
```

The agent helpfully pasting a real API key into a committed config file is a quiet, common failure. This turns it into a hard stop.

## The one design detail that makes it usable

A guardrail you have to disable isn't a guardrail. Every one of these hooks is **fail-safe**: it catches `uncaughtException` and `unhandledRejection` and exits `0`. If the hook itself ever breaks, your session keeps moving — safety never becomes the thing that wedges your work:

```js
const _failSafe = (e) => { /* optional debug log */ process.exit(0); };
process.on("uncaughtException", _failSafe);
process.on("unhandledRejection", _failSafe);
```

## Steal the pattern

You don't need my CLI to get this. The whole idea is small:

1. Register a `PreToolUse` hook on `Bash` (and `Write|Edit`).
2. Read the command/content from stdin, test it against a list of regexes.
3. Return a block decision for the dangerous ones. Catch errors and exit 0.

That's the highest-leverage safety code you can write for an autonomous agent — a dozen lines that turn "please don't" into "can't."

If you'd rather not maintain your own, badi ships 14 of these wired together, fail-safe, as one install:

```bash
npm install -g @fatihkan/badi
badi init      # wires up .claude/ (agents, commands, hooks)
badi doctor    # validates the install and reports what's active
```

It's open source (MIT), early-stage, and the hooks are all readable in `.claude/hooks/`. If you try it and a block is too aggressive or not aggressive enough, that's the most useful thing you can tell me.

---

### Notes for the human posting this (delete before publishing)
- **Verify before publishing:** open `.claude/hooks/guard-bash.mjs` / `branch-guard.mjs` / `completeness-gate.mjs` and confirm the regexes + block messages match the version you ship. The HARD_BLOCKS block above is verbatim from the current repo.
- **Do NOT** reference the "PocketOS" incident (or any specific company outage) unless you have independently verified it — the credibility of a safety post dies the moment one claim is wrong.
- Keep HARD_BLOCKS vs SOFT_BLOCKS vs LOG_WARNINGS distinct; don't claim something is hard-blocked when it's a soft block.
- Post manually, in your own voice. Never auto-post; never into awesome-claude-code.
