---
layout: home

hero:
  name: "Badi"
  text: "Workflow management CLI"
  tagline: "26 AI agents · 82 commands · 12 safety hooks · 23 opt-in skills — for Claude Code, Cursor, and Gemini CLI"
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/fatihkan/badi

features:
  - icon: 🤖
    title: 21 specialized agents
    details: From auditor to security-scanner to performance-profiler. Each agent declares an explicit permissionMode and disallowedTools whitelist.
  - icon: ⚡
    title: 77 slash commands
    details: Daily flow built in — /start, /sync, /wrap-up, /audit, /review, /unstick. Plus content/SEO/mobile/release toolchains.
  - icon: 🛡️
    title: 12 safety hooks
    details: guard-bash blocks destructive shell patterns. backup-before-write, branch-guard, completeness-gate, dependency-audit ship by default.
  - icon: 🎯
    title: Opt-in skills (v1.17+)
    details: 23 skill categories live in a vault and load zero tokens by default. `badi skills add seo` opts into exactly what you need.
  - icon: 🔁
    title: Multi-harness compile
    details: Same `.claude/` source compiles into Cursor (`.cursor/rules/`) and Gemini CLI (`GEMINI.md`) layouts.
  - icon: 🔍
    title: Built-in OWASP scan
    details: `/audit` runs OWASP Top-10 + secret scan against your repo before each release.
---

## Install

```bash
# As an npm CLI (full feature set)
npx @fatihkan/badi init

# As a Claude Code plugin (no Node.js)
/plugin marketplace add fatihkan/badi
/plugin install badi@badi-marketplace
```

## What's new in v1.17.0

Skills moved to opt-in. Auto-loading 23 skill categories used to cost ~10–15k tokens per turn even when none were used. Now every skill lives in `.claude/skills-vault/` (which Claude Code does NOT scan), and you opt in to only the ones you want via `badi skills add <name>`.

[Read the v1.17 release notes →](https://github.com/fatihkan/badi/releases/tag/v1.17.0)
