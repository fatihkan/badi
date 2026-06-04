Content template inheritance command. Custom template creation and inheritance-chain management for recurring content types.

# Required Tools
- Bash (badi content template)

# Procedure

### Step 1: Existing Templates

```bash
badi content template list
```

Built-in templates (standard): post, carousel, video, visual, calendar, brand.
Custom templates live under `.claude/workspace/sablonlar/`.

### Step 2: Create a Custom Template

```bash
badi content template create saas-launch --extends post --description "SaaS product launch"
```

Parameters:
- `name` — Template name (slug)
- `--extends` — Built-in base (post/carousel/video/visual/calendar)
- `--description` — Short description (optional)

The created file is `.claude/workspace/sablonlar/[name].md` — frontmatter + custom sections.

### Step 3: Edit the Template

Open the created file and add custom sections:
```markdown
---
name: saas-launch
extends: post
description: SaaS product launch
---

## Custom: Preview Link
[Free trial URL]

## Custom: Technical Detail
[Stack, integrations, pricing]
```

### Step 4: Use the Template

```bash
badi content post "New CRM Launch" --template saas-launch
```

The built-in template and the custom template are merged (by H2 heading matching).

### Step 5: Delete a Template

```bash
badi content template delete saas-launch
```

### Step 6: Usage Scenarios

- **Brand categories**: Product launch, event announcement, case study, customer story
- **Content series**: Monday motivation, Thursday tutorial
- **Platform specials**: LinkedIn vs Twitter in different tones
- **Client templates**: A separate tone/style per client

# Example

```
/content-template list
/content-template create linkedin-insight --extends post
/content-generate "AI trend" --template linkedin-insight
```
