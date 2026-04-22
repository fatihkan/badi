---
name: frontend-taste
description: Premium frontend design skills that override LLM defaults. Prevents generic "AI-looking" UI. Enforces deterministic typography, calibrated color, asymmetric layouts, spring physics, hardware-accelerated motion. Triggers: "UI tasarla", "design a UI", "premium landing page", "frontend taste", "anti-slop", "dashboard redesign". Bundles 9 variant styles (default, gpt-taste, minimalist, brutalist, soft, redesign, output, stitch, images-first).
---

# Frontend Taste Skills

Bundled collection of 9 frontend design skills. Each enforces a different visual direction and works with Claude Code / any LLM-based coding agent.

## How to Use

Invoke by describing the visual direction in your prompt. Claude Code auto-routes based on keywords:

- "premium landing page" / "high-agency frontend" -> **default**
- "strict layout, GSAP motion, editorial" -> **gpt-taste**
- "Notion/Linear style, editorial, minimal" -> **minimalist**
- "Swiss typography, raw, brutalist" -> **brutalist**
- "calm, expensive, polished" -> **soft**
- "redesign this existing app" -> **redesign**
- "give me the full code, no placeholders" -> **output**
- "generate a DESIGN.md for Google Stitch" -> **stitch**
- "generate design images first, then implement" -> **images-first**

You can also explicitly load one variant:

```
Use the "frontend-taste/brutalist" skill to redesign the header.
```

## The 9 Variants

| Variant | When to use |
| --- | --- |
| `default/` (design-taste-frontend) | Safest general pick. Premium frontend with controllable DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY dials. |
| `gpt-taste/` | Stricter, more opinionated. Python-driven layout randomization, AIDA page structure, wide editorial typography, mandatory GSAP ScrollTriggers. Best for GPT/Codex models. |
| `minimalist/` (minimalist-ui) | Clean editorial interfaces. Warm monochrome, flat bento grids, muted pastels. No gradients, no heavy shadows. |
| `brutalist/` (industrial-brutalist-ui) | Swiss typographic print + military terminal aesthetics. Rigid grids, extreme type scale contrast, utilitarian color. |
| `soft/` (high-end-visual-design) | High-end agency feel. Exact fonts, spacing, shadows, card structures. Blocks common defaults that make AI designs look cheap. |
| `redesign/` (redesign-existing-projects) | Audits current UI, identifies generic AI patterns, applies high-end standards without breaking functionality. |
| `output/` (full-output-enforcement) | Overrides LLM truncation. Bans placeholder patterns. Handles token-limit splits cleanly. Pair with any visual skill. |
| `stitch/` (stitch-design-taste) | Generates agent-friendly `DESIGN.md` files for Google Stitch. |
| `images-first/` (image-taste-frontend) | Image-first workflow: generate reference images, analyze them deeply, then implement. For visually-led projects. |

## Configuration Dials (default variant)

The `default` variant exposes three 1-10 dials at the top of its SKILL.md:

- **DESIGN_VARIANCE** - 1 (symmetric/centered) to 10 (asymmetric/artsy)
- **MOTION_INTENSITY** - 1 (static) to 10 (cinematic physics)
- **VISUAL_DENSITY** - 1 (gallery / airy) to 10 (cockpit / packed data)

Override dynamically via chat ("make it more minimal" -> lowers all three). Don't edit the file.

## Combining Variants

- `output` stacks with any other skill. Use it when the agent keeps giving you half-finished code.
- `redesign` is exclusive - it assumes an existing project.
- `images-first` works best paired with explicit workflow instructions in the prompt ("generate images, analyze, then code").

## CLI

Run `badi taste` to see the full list and example prompts from the terminal.
