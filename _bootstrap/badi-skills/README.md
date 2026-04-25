# badi-skills

Portable skill collection from [Badi](https://github.com/fatihkan/badi),
formatted as a Badi skill bundle. Install on Claude Code, Cursor, Codex,
Windsurf, or any compatible AI coding agent.

> This repo is generated from `@fatihkan/badi`'s `.claude/skills/` tree by
> `badi publish --skill-bundle`. See the source repo for skill development.

## Install

### Claude Code marketplace

```
/plugin marketplace add fatihkan/badi-skills
```

### Cursor

Settings → Rules → Add Rule → Remote Rule → `fatihkan/badi-skills`

### Manual

Clone or download this repo, then point your AI coding agent at the
`skills/` directory.

## Skill catalog

Skills are organized by category. See `skills/badi/SKILL.md` for the full
router. Highlights:

- **Design** — `design`, `frontend-taste`
- **Security** — `security`, `security-check` (48 OWASP scanners)
- **Behavioral** — `badi-discipline` (8 coding-discipline principles)
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
