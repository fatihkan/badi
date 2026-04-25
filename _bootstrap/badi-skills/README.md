# badi-skills

Portable skill collection from [Badi](https://github.com/fatihkan/badi),
formatted to the [agentskills.io](https://agentskills.io) standard. Install
on Claude Code, Cursor, Codex, Windsurf, or any
[skills.sh](https://skills.sh)-compatible agent.

> This repo is generated from `@fatihkan/badi`'s `.claude/skills/` tree by
> `badi publish --skill-bundle`. See the source repo for skill development.

## Install

### Universal (skills CLI)

```bash
# Whole bundle
npx skills add fatihkan/badi-skills

# One skill
npx skills add fatihkan/badi-skills --skill frontend-taste
```

### Claude Code marketplace

```
/plugin marketplace add fatihkan/badi-skills
```

### Cursor

Settings → Rules → Add Rule → Remote Rule → `fatihkan/badi-skills`

### OpenAI Codex

```bash
npx skills add fatihkan/badi-skills
# AGENTS.md is auto-detected
```

## Skill catalog

Skills are organized by category. See `skills/badi/SKILL.md` for the full
router. Highlights:

- **Design** — `design`, `frontend-taste`
- **Security** — `security`, `security-check` (48 OWASP scanners)
- **Behavioral** — `badi-discipline` (Karpathy-pattern coding rules)
- **Mobile** — `mobile`
- **Content & SEO** — `content`, `seo`, `marketing`, `social-media`, `email`
- **Engineering** — `development`, `devops`, `testing`, `data-analytics`
- **Business** — `consulting`, `finance`, `sales`, `customer-success`,
  `product`, `productivity`, `startup`, `ecommerce`, `ai-automation`

## License

MIT — see [LICENSE](./LICENSE). Skills bias toward caution over speed.

## Source

Generated from [`fatihkan/badi`](https://github.com/fatihkan/badi). To
regenerate: `badi publish --skill-bundle --target ./badi-skills`.
