---
name: design-tokens
description: Project-level DESIGN.md tokens reference. When the project has a DESIGN.md file, agents producing UI / components / visuals must consult this skill to use canonical color/typography/spacing tokens rather than inventing new ones. Triggers on: UI generation, component creation, design brief, visual asset, tailwind config, CSS variables.
license: MIT
compatibility: Works with Claude Code, Cursor, or any compatible AI coding agent.
allowed-tools: Read Grep Glob
metadata:
  author: fatihkan
  homepage: https://github.com/fatihkan/badi/tree/main/.claude/skills-vault/design-tokens
  badi-version: ">=1.17.0"
  category: design
---

# Design Tokens Reference

When this skill is active, agents producing UI / visuals / components must:

1. **Check for DESIGN.md** at the project root
2. **Read the frontmatter** for canonical tokens (colors, typography, spacing, radius, elevation)
3. **Use only those tokens** — do not invent ad-hoc colors, font sizes, or spacing values
4. **Cite the token** when generating code: `bg-[var(--color-primary)]` or `theme.colors.primary` rather than raw hex

## Token contract

The expected DESIGN.md frontmatter shape (produced by `tasarim-kurator` agent):

```yaml
---
colors:
  primary: "#0a84ff"
  secondary: "#7c3aed"
  surface: "#0a0e1a"
  text: "#e2e8f0"
  muted: "#94a3b8"
typography:
  display: "Inter"
  body: "Inter"
  mono: "JetBrains Mono"
  scale: 1.25
spacing:
  unit: 8           # base unit in px
radius:
  sm: 4
  md: 8
  lg: 16
elevation:
  card: "0 1px 3px rgba(0,0,0,0.1)"
  modal: "0 12px 40px rgba(0,0,0,0.4)"
---
```

## When to apply

- Generating React/Vue components → use the colors/typography from DESIGN.md
- Producing Tailwind config → mirror tokens via `theme.extend`
- Writing CSS / Sass → emit `--color-*`, `--font-*`, `--spacing-*` variables
- Visual brief (visual-director) → reference colors as palette, not hex
- Mobile UI (RN/Flutter) → emit theme constants from tokens

## When DESIGN.md is missing

Skill becomes a no-op. Agents fall back to project conventions or invent reasonable defaults — but at the next opportunity, suggest running `badi tasarim init --interactive` to capture decisions.

## Validation

The skill loader cross-checks:
- DESIGN.md frontmatter parses as YAML
- Required keys: `colors.primary`, `typography.body`, `spacing.unit`
- WCAG AA contrast for `colors.text` against `colors.surface` (warns if < 4.5:1)

## References

- DESIGN.md spec: `lib/commands/tasarim.js`
- `tasarim-kurator` agent for interactive token generation
- `visual-director` delegates here when DESIGN.md exists
