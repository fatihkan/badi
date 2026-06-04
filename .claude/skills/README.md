# Active Skills (Opt-in)

This directory holds the **user-selected** skills. Claude Code loads only what's here.

## Why empty?

As of v1.17.0, skills moved to an **opt-in** model. All 23 categories are stored under `.claude/skills-vault/`; the user moves the ones they want here.

Token savings: 23 skills auto-loaded → 0 (user selection). Typical gain ~10-15k tokens per turn.

## Usage

```bash
badi skills available           # List all skills in the vault
badi skills add seo marketing   # Activate two skills
badi skills list                # Show active skills
badi skills remove seo          # Remove an active skill
badi skills clear               # Deactivate all
```

Running `badi skills` with no arguments shows a status table.
