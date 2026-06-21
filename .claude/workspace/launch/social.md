I have everything I need from the diagnosis brief. This is a content-only task with no need to touch the repo or any external site. Here is the launch copy, grounded in the brief and honest about traction.

---

# 1. X/Twitter Launch Thread (5 tweets)

**Tweet 1 — Hook**
> Every new Claude Code project, I'd rebuild the same .claude/ setup from scratch: agents, slash commands, hooks. Copy-paste, tweak, forget what I changed last time.
>
> So I packaged mine into a CLI. It's called badi. v1.35 is on npm.

*(238 chars)*

**Tweet 2 — The problem**
> The real cost isn't the first setup. It's drift.
>
> Six projects in, every .claude/ is slightly different. No two have the same review command, the same security pass, the same daily ritual. You stop trusting your own config.

*(244 chars)*

**Tweet 3 — What badi does**
> badi pre-wires .claude/ from one source:
> - 30 agents (code review, security, market/SEO research)
> - 86 commands across dev, content, mobile, infra
> - 14 hooks (branch guard, backups, session briefing)
>
> One install, same setup everywhere.

*(255 chars)*

**Tweet 4 — Before / after**
> Before: new repo, hand-roll a /review command, wire a backup hook, hope I matched last project.
>
> After:
> npx @fatihkan/badi init
> badi doctor
>
> /review, /security-scan, /start all there. Security stays advisory-only — findings get triaged, never auto-run.

*(279 chars)*

**Tweet 5 — CTA (honest)**
> Early days, low traction, and I'd rather have 10 users who file real issues than a vanity number.
>
> Try it, break it, tell me what's missing:
> npm i -g @fatihkan/badi
> github.com/fatihkan/badi
>
> Works with Claude Code; Cursor/Gemini export too.

*(263 chars)*

---

# 2. LinkedIn Post

> I kept rebuilding the same Claude Code setup for every project, and I kept getting it slightly wrong.
>
> The pattern was always the same: a fresh repo, then an hour wiring up the .claude/ directory — a code-review command here, a backup hook there, a security pass I'd written for the last project but couldn't quite remember. Multiply that across half a dozen repos and you get configuration drift: six setups that are all almost the same, and none you fully trust.
>
> So I turned my own setup into a CLI: **badi** (v1.35, on npm).
>
> One install wires .claude/ from a single source:
> - 30 agents — code review, security scanning, plus advisory research roles (market, SEO, data)
> - 86 slash commands spanning dev, content, mobile, and infrastructure work
> - 14 automation hooks — a branch guard, file backups, a session-start briefing
> - Profile-based filtering so a content project doesn't carry pentest commands it'll never use
>
> Two design choices I'd call out honestly:
>
> **Security is advisory, not autonomous.** Scans produce findings that go through a triage step (true positive / false positive / can't verify). Nothing executes a payload on its own. If you've ever inherited a scanner that dumped 200 low-confidence "criticals" on you, that distinction matters.
>
> **It's early.** Around 1,600 monthly npm downloads and a handful of GitHub stars. I'm not going to dress that up. What I can say is it's shipped consistently through 35 releases with a real test suite behind it, and it does the one job I built it for: I stop re-deriving my setup.
>
> If you work in Claude Code daily and you're tired of copy-pasting your config, I'd genuinely value your feedback — especially the "this is missing X" kind.
>
> Repo and install instructions: github.com/fatihkan/badi

---

# 3. r/ClaudeAI Note

> **HUMAN-ONLY: post manually. Follow r/ClaudeAI's self-promo rules — disclose "I built this," lead with the workflow not the product, and don't auto-post. Reddit flags AI-written promo aggressively; rewrite this in your own voice before posting. Do NOT have any bot or automation submit it.**

**Suggested title:**
How I stopped my Claude Code `.claude/` configs from drifting across projects

**Suggested body (rewrite in your own words):**

> Disclosure up front: I built the tool I'm about to mention, so take this as a workflow writeup with a bias, not a neutral review.
>
> The problem I kept hitting: every new project meant rebuilding my .claude/ directory — review commands, hooks, the daily-start ritual. After a few repos they'd all drifted apart and I couldn't remember which one had the config I actually liked.
>
> What worked for me was treating the whole setup as one installable source instead of per-project copy-paste. I ended up packaging it as a CLI (badi) so `init` lays down the same agents, commands, and hooks everywhere, and a profile filter keeps each project from carrying commands it doesn't need.
>
> Two things I'd flag honestly if you try it:
> - The security agents are advisory-only — findings go through a triage step rather than auto-running anything. I went that route after getting burned by noisy scanners.
> - It's low-traction and early, so expect rough edges. I'm mostly looking for "this is broken / this is missing" feedback.
>
> More interested in how others here handle config reuse across Claude Code projects — do you template it, script it, or just re-do it each time? Happy to share the specific hook/command setup if it's useful.

---

**Notes on constraints honored:** All copy is read-only — nothing was posted, commented, or filed anywhere, and no repo files were changed. The awesome-claude-code listing is deliberately not referenced as a posting target; the Reddit note is flagged human-only at the top per the AI/bot ban risk. No competitor projects are named in the badi-facing copy. Traction is stated plainly (early, low downloads/stars) rather than hyped, since credibility is the priority for a tool at this stage.
