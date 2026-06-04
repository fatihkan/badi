Visual brief command. Detailed design instructions, color palettes, and AI image prompts for social visuals, banners, and video frames.

# Required Tools
- Read (brand guide, previous visuals, project context) -- Write (brief file) -- Grep (brand color/font references) -- ...

# Procedure (6 Steps)

## 1. Define the Visual Need
Get from the user:
- **Use Case:** Post (single frame) / Story / Reel cover / Carousel (how many frames?) / YouTube thumbnail / ...
- **Platform:** Instagram / Twitter / LinkedIn / YouTube / Facebook / Pinterest / Blog / Email / Ads / Other
- **Content:** Main message/headline, product/person/scene/abstract concept, brand elements (logo/slogan), data/statistics (infographic)
- **Style:** Photographic / Minimalist / Illustration / 3D Render / ...
- **Color:** Brand / Specific palette / Free / Seasonal
- **Text:** Will there be copy? (headline, subhead, CTA, statistic)
- **Tone:** Serious / Fun / Luxury / Technical / Warm / Cool

## 2. Load the Brand Guide
- `.claude/workspace/marka-sesi.md` — colors, fonts, style
- `.claude/workspace/gorseller/` — previous briefs
- Brand logo and usage rules

If none: collect the basics from the user (primary color, font) or free-design mode.

## 3. Size and Technical Specs
| Use | Size (px) | Aspect | File Format |
|-----|-----------|--------|-------------|
| Instagram Square | 1080x1080 | 1:1 | PNG/JPG |
| Instagram Portrait | 1080x1350 | 4:5 | PNG/JPG |
| Instagram Story/Reel | 1080x1920 | 9:16 | PNG/JPG |
| Twitter/X Post | 1600x900 | 16:9 | PNG/JPG |
| LinkedIn Post | 1200x627 | 1.91:1 | PNG/JPG |
| LinkedIn Banner | 1584x396 | 4:1 | PNG/JPG |
| Facebook Post | 1200x630 | 1.91:1 | PNG/JPG |
| Facebook Cover | 820x312 | 2.63:1 | PNG/JPG |
| YouTube Thumbnail | 1280x720 | 16:9 | PNG/JPG |
| YouTube Banner | 2560x1440 | 16:9 | PNG |
| Pinterest Pin | 1000x1500 | 2:3 | PNG/JPG |
| Blog Header | 1200x628 | 1.91:1 | PNG/JPG |
| Email Header | 600x200 | 3:1 | PNG/JPG |
| Meta Ads (square) | 1080x1080 | 1:1 | PNG/JPG |
| Meta Ads (portrait) | 1080x1350 | 4:5 | PNG/JPG |
| Google Ads Banner | 1200x628 | 1.91:1 | PNG/JPG |

## 4. Detailed Brief
- **Composition:** main focus (center/rule-of-thirds/top-bottom) -- visual hierarchy -- white-space usage -- ...
- **Color Palette:** primary [#hex] (background/accent) -- secondary [#hex] -- accent [#hex] (CTA, key text) -- ...
- **Typography (if text):** headline [font/size/weight/color] -- subhead [...] -- body [...] -- ...
- **Background:** solid/gradient/photo/texture/abstract + detailed description
- **Objects:** main object (product/person/icon) -- supporting (strips, frames, arrows, badges) -- logo position/size -- ...

## 5. AI Prompts (3 tools)
**Midjourney:** `/imagine [description], [style], [mood], [technique] --ar [ratio] --v 6.1 --style raw`
- English -- `--style raw`, `--stylize 50-200` -- `--ar 1:1/4:5/16:9` -- ...

**DALL-E:** `[Detailed natural-language description including style and mood]`
- Clear descriptive sentences -- style and emotion explicit -- ...

**Flux/Stable Diffusion:** `[positive prompt], [style tags], [technique]` + `Negative: [unwanted]`
- Tag-based (comma-separated) -- Steps: 30-50, CFG: 7-12 -- Sampler: DPM++ 2M Karras

## 6. Canva/Figma Note and Save
- **Canva:** template category -- element types (text/shape/icon) -- layer order (background → objects → text → logo)
- **Figma:** frame size -- auto layout -- component structure

Save: `.claude/workspace/gorseller/[YYYY-MM-DD]-[topic]-brief.md`

# Output Format
```
[abridged]
```

# Style Reference Table
| Style | Example Use | Fit Platforms | Tone |
|-------|-------------|---------------|------|
| Minimalist | Tech products, SaaS | LinkedIn, Twitter | Professional |
| Photographic | Lifestyle, food, travel | Instagram, Pinterest | Warm |
| Illustration | Education, kids, fun | Instagram, Blog | Playful |
| Typographic | Motivation, habits | Instagram, Twitter | Inspirational |
| 3D Render | Technology, gaming | Instagram, YouTube | Modern |
| Gradient | App promos, digital | LinkedIn, Twitter | Modern |
| Flat Design | Infographics, decks | LinkedIn, Blog | Clear |
| Retro | Nostalgia, fashion, music | Instagram, Pinterest | Creative |
| Neon | Nightlife, gaming, music | Instagram, TikTok | Energetic |
| Collage | Fashion, art, events | Instagram, Pinterest | Creative |
