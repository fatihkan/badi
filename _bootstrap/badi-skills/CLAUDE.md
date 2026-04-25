# Badi Skills

This repository is a Claude Code-readable bundle of skills generated from
[`@fatihkan/badi`](https://github.com/fatihkan/badi). Each subdirectory under
`skills/` is a portable skill following the Badi skill bundle schema.

## Entry point

Read `skills/badi/SKILL.md` first — it indexes every skill grouped by category.

## Frontmatter contract

Every `SKILL.md` carries:

- `name` — slug
- `description` — trigger-rich activation hint
- `license` — MIT
- `compatibility` — runtime expectations
- `allowed-tools` — space-separated tool list
- `metadata.author`, `homepage`, `badi-version`, `category`

## Source

This repo is **generated**. Edit the source skills in
`fatihkan/badi:.claude/skills/<name>/` and run
`badi publish --skill-bundle --target ./badi-skills` to regenerate.
