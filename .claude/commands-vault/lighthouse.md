Lighthouse audit command. Performance, Accessibility, Best Practices, SEO scores and Core Web Vitals via the Google PageSpeed Insights API.

# Required Tools
- Bash (badi lighthouse command invocation)

# Procedure

### Step 1: Get the URL
Take a full URL from the user. Mind the http/https prefix. Ask if invoked without an argument.

### Step 2: Strategy Selection

Mobile or desktop? **Mobile** is usually the default since Google does mobile-first indexing.

```bash
badi lighthouse [url]              # Mobile (default)
badi lighthouse [url] --desktop    # Desktop
```

### Step 3: Interpret the Result

Scores in 4 categories:
- **Performance** - speed metrics
- **Accessibility** - axe-core based
- **Best Practices** - HTTPS, console errors
- **SEO** - meta tags, crawlability

Core Web Vitals:
- **FCP** < 1.8s (good), < 3.0s (fair)
- **LCP** < 2.5s (good), < 4.0s (fair)
- **TBT** < 200ms (good), < 600ms (fair)
- **CLS** < 0.1 (good), < 0.25 (fair)

### Step 4: Improvement Suggestions

For categories under 90, give the user concrete suggestions:
- Low Performance: "Image optimization, code splitting, caching"
- Low A11y: "Get detail with `/a11y-audit [url]`"
- Low SEO: "Detailed report via `badi seo audit [url]`"

# Example
```
/lighthouse https://example.com
/lighthouse https://example.com --desktop
```
