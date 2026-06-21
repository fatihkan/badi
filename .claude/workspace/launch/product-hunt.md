Verified against the repo: v1.35.0, 30 agents (real names confirmed), description matches. Here is the launch-ready copy.

---

# Badi — Product Hunt Launch Copy

*Grounded in repo facts: v1.35.0, 30 agents, 86 commands, 14 hooks, 63 opt-in skill categories, 1321 passing tests, MIT, works with Claude Code / Cursor / Gemini CLI. Honest framing — this is a young project (~5 stars, ~329 weekly npm downloads).*

---

## 1. Tagline options (each < 60 chars)

1. **Stop rebuilding your Claude Code setup every project** *(54)*
2. **30 expert agents + 86 commands for Claude Code, in 1 cmd** *(57)*
3. **A pre-wired .claude/ so you ship on day one** *(44)*

---

## 2. Description (~260 chars)

> Badi pre-wires your `.claude/` directory so you don't rebuild it every project. One install gives you 30 expert agents (code review, security, market/SEO/data), 86 slash commands, 14 automation hooks, and daily rituals. Works with Claude Code, Cursor & Gemini CLI. MIT, 1321 tests.

*(263 chars)*

---

## 3. Maker's first comment

> Hey PH 👋
>
> I'm Fatih, the maker of Badi.
>
> I built this because I kept doing the same thing at the start of every project: copy-pasting the same slash commands, re-writing the same agent prompts, re-wiring the same hooks into a fresh `.claude/` folder. After the third or fourth time, it was obviously a packaging problem, not a Claude Code problem. So I packaged it.
>
> **What it is:** an npm CLI (`@fatihkan/badi`) that drops a structured, opinionated `.claude/` setup into any project in one command. You get 30 agents (an auditor, a security-scanner, a code-generator, plus advisory ones for market research, SEO, and data analysis), 86 slash commands grouped by domain, and 14 automation hooks (branch guard, backups, a session-start briefing). There's also a daily rhythm I actually use — `/start` in the morning, `/sync` midday, `/wrap-up` at night — and a small "virtual eng team" (`/team`, `/eng-review`, `/qa`, `/ship`) that runs a goal through planning → review → sign-off.
>
> **Who it's for:** people who use Claude Code (or Cursor / Gemini CLI) across multiple projects and are tired of bootstrapping the same scaffolding by hand. If you only have one project and five commands you love, you genuinely don't need this — keep your five commands. Badi earns its keep when you start over a lot.
>
> **Honest status:** it's early. Small but real — v1.35.0 shipped today, 1321 tests pass, MIT-licensed, and I've cut 35 releases so it's not abandonware. But the audience is small right now, so I'd rather have your sharp feedback than your upvote. Everything is opt-in: the 63 skill categories and most commands are filtered by profile, so it's not 86 commands screaming at you on install.
>
> Try it read-only first: `npx @fatihkan/badi init && badi doctor`. Tear it apart in the comments — what's missing, what's bloat, what you'd cut. That's the most useful thing you can give me today.
>
> — Fatih

---

## 4. Five likely FAQ Q&As

**Q: Why not just roll my own slash commands?**
A: You should, if you only need a handful — that's the right call and Badi doesn't beat it. Badi pays off when you're repeating the *setup* across projects: 30 agent prompts, 86 commands, 14 hooks, and the wiring between them, maintained in one place with tests instead of re-pasted by hand each time. It's a packaging-and-maintenance win, not a "this can do something you can't" claim. Everything it installs is plain files you can read, edit, or delete.

**Q: Isn't 86 commands way too much? I'll never use most of them.**
A: Almost certainly, and that's expected. Commands are filtered by profile (core / dev / content / pentest) via `badi commands profile`, so you don't load all 86 at once. The 63 skill categories are opt-in and not loaded by default. Think of it as a catalog you pull from, not a wall you install. Start on the `core` profile and add what you actually reach for.

**Q: Does this lock me in or do something magic behind the scenes?**
A: No. Badi writes standard `.claude/` files — agents, commands, hooks — into your repo. You can read every one, modify them, or remove the whole thing. There's no runtime dependency on Badi after install; the CLI is for bootstrapping and updates. If you uninstall, your edited files stay.

**Q: The security scanning sounds aggressive — is it going to spam me with false positives?**
A: It's advisory-only and built to manage exactly that. The pipeline separates raw findings (no confidence asserted) from a triage pass that labels each one TRUE_POSITIVE / FALSE_POSITIVE / CANNOT_VERIFY with a 0–100 score, written to a `TRIAGE.json`. It does not autonomously run payloads or take write actions — it surfaces things for a human to judge.

**Q: It says it works with Cursor and Gemini CLI too — is that real or aspirational?**
A: Real, with a caveat on scope. The npm CLI generates config for multiple harnesses from one source, so agents and commands carry over. Hooks and the local transcript analytics are most complete on Claude Code. If you're on Cursor or Gemini, you get the agents and commands; the deep automation is Claude-Code-first today, and I'm honest that the others are lighter.

---

## 5. Gallery shot-list (in order)

1. **Hero card (static, 1270×760).** Big text: "Stop rebuilding your `.claude/` every project." Sub-line: "30 agents · 86 commands · 14 hooks · one install." One terminal line visible: `npx @fatihkan/badi init`. Clean, no feature dump.

2. **The "one command" GIF.** Terminal recording of `badi init` running to completion, then `badi doctor` showing a green/passing diagnostic. Caption overlay: "Setup to verified install in ~2 minutes." (Reproducible via the existing `vhs` tape.)

3. **"What you get" overview (static).** A clean labeled grid: 30 agents / 86 commands / 14 hooks / 63 opt-in skills / 1321 tests / MIT. Group agents by purpose (Software · Content · Strategy · Ops) with a few real names (auditor, security-scanner, market-researcher, release-manager) so it's verifiable at a glance.

4. **Daily rhythm GIF.** Inside Claude Code: run `/start` and show the morning briefing output, then a quick cut to `/wrap-up`. Caption: "A workflow, not just a CLI." Shows the rituals doing something concrete.

5. **`/team` orchestrator (static or short GIF).** A simple flow diagram or transcript snippet: a goal entering `/team` and moving through plan → review → QA → ship, naming the agents involved. Caption: "One goal, run through a virtual eng team." Removes the "is this automation or manual?" doubt.

6. **Security triage (static).** A trimmed `TRIAGE.json` view showing a finding labeled TRUE_POSITIVE / FALSE_POSITIVE with a confidence score. Caption: "Advisory-only. Every finding triaged, nothing executed." Builds trust through transparency.

7. **Profiles / it's-not-overwhelming (static).** Show `badi commands profile` switching from a full catalog to a focused `core` set. Caption: "86 commands available, only what you need loaded." Directly answers the "too much" objection.

8. **Honest status card (static, closer).** Plain text: "v1.35.0 · 35 releases · 1321 tests · MIT · early-stage, feedback wanted." A small note: "Try it read-only: `npx @fatihkan/badi init`." Reframes low traction as scrappy-but-real and invites contribution.

---

### Notes for the maker (not for paste)

- **Read-only only.** Nothing above has been posted, filed, or submitted anywhere. All external repos/sites were treated read-only.
- **awesome-claude-code:** AI/bot comments are explicitly banned there. None of this copy is for that repo. If you reuse any of it for community channels (Reddit, HN, Discord), treat it as **human-only — rewrite in your own words and post manually**; do not paste AI-generated text into those threads.
- **No competitor names** appear in the copy.
- **Facts verified against the repo:** v1.35.0, 30 agents (real names), 86 commands, 14 hooks, 63 skill categories, 1321 tests, MIT, multi-harness. Keep the "Cursor/Gemini are lighter" caveat honest — don't let marketing inflate it.
- Per the brief, Product Hunt is **P3 / premature** at current traction (no ~400-person pre-list). This copy is launch-ready for when you choose to go; consider a low-competition weekend day and lead with feedback, not upvotes.
