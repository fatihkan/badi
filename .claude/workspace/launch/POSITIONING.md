# badi — Positioning (the standout wedge)

> Decided 2026-06-21 via the `badi-standout-positioning` workflow (3 wedges judged → 1).
> Two independent strategies + the product-strategist judge converged on the same wedge.
> All proof points below were **verified against the live repo** before adoption.

## The wedge
**Agentic safety layer for Claude Code.** Deterministic hooks that run as real code on
every tool call and block irreversible actions *before* they execute — not prompts the
model can reason around.

## Positioning statement
> For developers running Claude Code autonomously, **badi is the agentic safety layer that
> blocks irreversible actions at the tool-call level with real code** — not prompts the model
> can reason around, not config flags, but deterministic hooks that physically intercept every
> tool call before it executes.

**Category to lead with:** *agentic safety layer for Claude Code*
**Beachhead user:** solo devs / small teams running Claude Code in headless or near-autonomous
mode who have felt (or read about) the moment the agent does something they can't undo.

## Proof — verified, shipped today (no new features)
- `guard-bash.mjs` HARD_BLOCKS (lines 36-50): `rm -rf /`, `rm -rf *`, `git push --force origin main|master`, `git reset --hard origin/`, `chmod 777`, `curl|wget … | bash/sh`, `> /etc/`, `mkfs.`, `dd of=/dev/`, `cat *.env|pem|key|secret … | curl|nc|wget`, `echo $…secret/token/key … | curl|nc|wget`. Plus SOFT_BLOCKS + LOG_WARNINGS tiers.
- `branch-guard.mjs`: protected branches `main/master/production` (direct commit blocked); force-push blocked on `main/master/release/*`.
- `completeness-gate.mjs`: scans file writes for live secrets (`sk_live_…`, etc.) and blocks before bytes hit disk.
- `backup-before-write.mjs`: snapshots a file before it's overwritten.
- Fail-safe: every hook catches `uncaughtException`/`unhandledRejection` and exits 0 — a crashing hook never wedges a session.

## Stop saying (the "too general" traps)
- "workflow management system" (sounds like Jira, no urgency)
- leading with "30 agents, 86 commands, 63 skills" (breadth = the generic trap)
- "structured operations management" (abstract, nobody searches it)
- "multi-harness support" as a headline (a distribution fact, not a value prop)

## Messaging by surface
- **README lede:** "Claude Code does what you tell it — until it doesn't." → the hook guarantee, breadth as supporting evidence.
- **awesome-claude-code submission:** name the problems, not the counts — "Pre-packaged, fail-safe hook layer: branch protection, secret blocking, bash guard, daily ritual, /team orchestrator. One npm install."
- **Show HN:** lead with the deterministic-hooks angle (`show-hn.md`).
- **Social:** the hook-vs-prompt contrast (`social.md`).

## Signature assets (in order)
1. **Incident post** (`incident-post.md`) — grounded in badi's **real** blocks (NOT the unverified
   "PocketOS" story the research suggested). Shows the actual HARD_BLOCKS regex + the real block
   message. 100% verifiable, copy-pasteable, useful even without installing badi.
2. **Split-screen demo** (week 3) — left: a `CLAUDE.md` rule ignored mid-session; right: `branch-guard`
   blocking the identical action with the incident-log entry appearing live.
3. **README rewrite** (done in this pivot) — converts existing referral traffic with zero extra distribution.

## Measure / kill
- Leading (wk 1-4): incident post gets ≥3 non-author reactions or 1 real comment, OR any maintainer
  response on awesome-cc #1955.
- Lagging (day 90): GitHub stars cross 15, OR ≥1 external post/repo links badi *for its hook behavior*.
- Kill: 90 days, zero external references / zero outside stars / awesome-cc still silent → the wedge
  isn't pulling; reassess the audience/sub-community (Discord, a specific HN/subreddit), back to /ceo-review.
- **Kill-watch:** Anthropic shipping a first-party "safe mode" hook bundle → moat narrows to the
  daily-ritual + /team combination. Watch the Claude Code changelog.

## Honesty guardrails (do NOT violate)
- The blocking **hooks** enforce; the **pentest/security-scan** family is advisory-only — keep them distinct.
- Do not build the flagship on the unverified "PocketOS" incident. Ground claims in badi's real, readable hooks.
- Distinguish HARD_BLOCKS (always blocked) from SOFT_BLOCKS (blocked with warning) from LOG_WARNINGS (logged only).
