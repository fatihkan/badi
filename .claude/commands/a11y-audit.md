Web accessibility (WCAG 2.1) audit command. axe-core-based checks via PageSpeed Insights.

# Required Tools
- Bash (badi a11y command invocation)

# Procedure

### Step 1: Get the URL
Take the URL to test from the user.

### Step 2: Run the Badi CLI

```bash
badi a11y [url]              # Mobile audit
badi a11y [url] --desktop    # Desktop audit
```

### Step 3: Interpret the Results

Score bands:
- **90-100**: Excellent
- **70-89**: Good but improvable
- **< 70**: Serious problems

### Step 4: Common Failures and Fixes

Give concrete fixes per failed audit:

- **color-contrast**: "Foreground/background contrast ratio must be 4.5:1 (AA), 7:1 (AAA)"
- **image-alt**: "Add meaningful `alt` to every `<img>`; `alt=\"\"` when decorative"
- **label**: "Pair form inputs with `<label for=\"\">`"
- **link-name**: "Link texts must be descriptive — the real action instead of 'click here'"
- **button-name**: "Buttons need accessible names (aria-label or text content)"
- **heading-order**: "Heading hierarchy h1->h2->h3 (no skips)"
- **landmark-one-main**: "Every page needs one `<main>` landmark"
- **html-has-lang**: "Define `<html lang=\"en\">` (or the page language)"

### Step 5: Manual Testing Reminder

Axe-core tests what can be automated. Areas needing manual tests:
- Keyboard navigation (Tab, Enter, Space, Arrow keys)
- Screen reader testing (VoiceOver, NVDA)
- 200% zoom readability
- Video/audio captioning

### Step 6: Comprehensive Audit

- Full Lighthouse report with `/lighthouse [url]` (performance + SEO + a11y)
- Provide the WCAG quickref link

# Example
```
/a11y-audit https://example.com
```
