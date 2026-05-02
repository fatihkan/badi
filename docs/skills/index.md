# Skills

23 skill categories live in `.claude/skills-vault/`. Since v1.17, **none are auto-loaded** — opt in to only the ones you need.

## Quick start

```bash
# What's available?
badi skills available

# Opt in
badi skills add seo marketing security

# Opt out
badi skills remove marketing

# What's active?
badi skills list

# Reset
badi skills clear
```

## Why opt-in?

Auto-loading 23 skill categories used to cost ~10–15k tokens per turn even when no skill was triggered. v1.17 moved them to a vault that Claude Code does **not** scan, then exposed an explicit picker.

After opting in, the active set lives in `.claude/skills/` (only the ones you picked) and Claude Code loads them as before.

## Categories

`ai-automation`, `consulting`, `content`, `customer-success`, `data-analytics`, `design`, `development`, `devops`, `ecommerce`, `email`, `finance`, `frontend-taste`, `marketing`, `mobile`, `product`, `productivity`, `sales`, `security`, `security-check`, `seo`, `social-media`, `startup`, `testing`

Each category contains one or more `SKILL.md` files. Browse the [vault on GitHub](https://github.com/fatihkan/badi/tree/main/.claude/skills-vault) to see what's inside.
