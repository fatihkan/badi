# Branding Guide

How to write BRANDING.md — the identity document for a project's public face.
Optional but valuable for any project with users, contributors, or a public presence.

## Principles

1. **Serve the product.** Every visual choice makes the project clearer and more memorable.
2. **Consistency over perfection.** Simple rules, consistently applied.
3. **Match the audience.** Developer tools ≠ consumer apps ≠ enterprise products.
4. **Less is more.** 2-3 colors, 1-2 fonts, one strong logo concept.

---

## Template

```markdown
# [Project Name] — Branding Guide

## 1. Name & Identity

### 1.1 Project Name
- **Name**: [name]
- **Pronunciation**: [if not obvious]
- **Etymology**: [meaning, reference, metaphor behind the name]
- **In code**: `[lowercase-kebab-case]`
- **In prose**: [Capitalization rules]

### 1.2 Tagline
- **Primary**: [5-10 words capturing the essence]
- **Technical**: [more specific variant for developer audiences]
- **Marketing**: [benefit-focused variant for general audiences]

### 1.3 Elevator Pitch
[3-4 sentences. Goes on homepage hero, GitHub description, conference abstract.]

## 2. Logo

### 2.1 Concept
[Visual metaphor, what it represents, connection to the project's purpose.]

### 2.2 Specifications
- **Primary mark**: [full logo description]
- **Icon mark**: [simplified for small sizes — favicon, app icon]
- **Wordmark**: [text-only variant]
- **Minimum size**: [smallest display size]
- **Clear space**: [breathing room around logo]

### 2.3 AI Generation Prompt
[Detailed prompt for AI image generation tools. Include:]
- Visual style (flat, 3D, minimal, detailed)
- Color constraints (use palette from §3)
- Composition (centered, asymmetric, contained in shape)
- Format (1:1 for icons, 16:9 for banners)
- What to avoid (no text in logo, no gradients, etc.)

## 3. Color Palette

### 3.1 Brand Colors

| Role | Name | Hex | RGB | Usage |
|------|------|-----|-----|-------|
| Primary | [name] | #[hex] | rgb(r,g,b) | Main buttons, headers, links |
| Secondary | [name] | #[hex] | rgb(r,g,b) | Accents, hover states |
| Accent | [name] | #[hex] | rgb(r,g,b) | Highlights, badges, alerts |

### 3.2 Neutrals

| Role | Hex | Usage |
|------|-----|-------|
| Text Primary | #[hex] | Body text, headings |
| Text Secondary | #[hex] | Captions, placeholders |
| Background | #[hex] | Page background |
| Surface | #[hex] | Cards, panels |
| Border | #[hex] | Dividers, input borders |

### 3.3 Semantic Colors

| Role | Hex | Usage |
|------|-----|-------|
| Success | #[hex] | Confirmations, positive states |
| Error | #[hex] | Errors, destructive actions |
| Warning | #[hex] | Cautions, important notices |
| Info | #[hex] | Informational, neutral highlights |

### 3.4 Dark Mode
[Adjusted palette for dark backgrounds. Swap surface/background, adjust text contrast.]

### 3.5 CSS Variables
```css
:root {
  --color-primary: #[hex];
  --color-secondary: #[hex];
  --color-accent: #[hex];
  --color-bg: #[hex];
  --color-surface: #[hex];
  --color-text: #[hex];
  --color-text-secondary: #[hex];
  --color-border: #[hex];
  --color-success: #[hex];
  --color-error: #[hex];
  --color-warning: #[hex];
  --color-info: #[hex];
}
```

## 4. Typography

### 4.1 Font Stack

| Role | Font | Weights | Fallback |
|------|------|---------|----------|
| Headings | [font] | 600, 700 | [system fallback] |
| Body | [font] | 400, 500 | [system fallback] |
| Code | [font] | 400 | monospace |

### 4.2 Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 2.5rem | 700 | 1.2 |
| H2 | 2rem | 600 | 1.3 |
| H3 | 1.5rem | 600 | 1.4 |
| Body | 1rem | 400 | 1.6 |
| Small | 0.875rem | 400 | 1.5 |
| Code | 0.9rem | 400 | 1.5 |

## 5. Voice & Tone

### 5.1 Personality
[3-5 adjectives with behavioral descriptions]
- **[Adjective]**: [What this means in writing — example sentence]

### 5.2 Writing Rules
- Headlines: [Style guidance]
- Documentation: [Technical level, jargon policy]
- Error messages: [Helpful, specific, actionable]
- Marketing: [Benefit-focused, avoid hype]

### 5.3 Vocabulary

| Prefer | Avoid |
|--------|-------|
| [term] | [term] |

## 6. Visual Language

### 6.1 Border Radius
[Consistent radius values: 4px, 8px, 12px, or full-round]

### 6.2 Shadows
[Shadow style if any. Elevation levels.]

### 6.3 Spacing
[Base unit: 4px or 8px. Scale: 4, 8, 12, 16, 24, 32, 48, 64]

### 6.4 Icons
[Icon library recommendation: Lucide, Heroicons, Phosphor, Tabler, etc.]
[Style: outline, filled, duotone. Stroke width. Size.]

## 7. Assets Checklist

| Asset | Format | Size | Status |
|-------|--------|------|--------|
| Logo (full) | SVG + PNG | vector / 1024px | [TBD] |
| Icon | SVG + PNG | 512px, 192px, 64px | [TBD] |
| Favicon | .ico + .png | 32px, 16px | [TBD] |
| OG Image | PNG | 1200×630 | [TBD] |
| Social Banner | PNG | 1500×500 | [TBD] |
| README Header | SVG or PNG | 800×200 | [TBD] |
```

---

## Branding Depth by Project Type

| Project Type | Sections to Include | Depth |
|-------------|-------------------|-------|
| CLI / System Tool | Name, Logo/Icon, Color (terminal), Voice | Light |
| Library / SDK | Name, Logo, README aesthetics, Docs style | Light |
| Open Source Tool | Name, Logo, Color, Voice, Social, README | Medium |
| SaaS / Web App | All sections | Full |
| Internal Tool | Name, Color, Typography | Minimal |

---

## Quality Checklist

- [ ] Name is memorable and searchable
- [ ] Tagline is under 10 words
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Fonts are free/open-source or budget-appropriate
- [ ] CSS variables are provided for easy implementation
- [ ] Asset checklist covers launch requirements
- [ ] Branding depth matches project scope
