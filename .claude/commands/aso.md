App Store Optimization command. iOS app listing analysis via the iTunes API, keyword optimization, and competitor comparison.

# Required Tools
- Bash (badi aso commands)

# Procedure

### Step 1: Set the Target

Ask the user: "What do you want to analyze?"
- **Your own app** — Audit + keywords + reviews
- **Competitor comparison** — 2 apps side-by-side
- **Keyword research** — Market discovery
- **New app metadata** — Listing preparation

The App ID is required: take it from the `https://apps.apple.com/app/id[APP_ID]` URL.

### Step 2: Basic ASO Audit

```bash
badi aso audit [app-id]
```

Measured metrics:
- Title/Subtitle length (30/30 character limits)
- Description length (500+ recommended)
- Screenshot count (>= 3 mandatory, >= 6 ideal)
- Supported languages
- Rating count (>= 100 recommended, >= 4.0 score)

An ASO score of 0-100 is given.

### Step 3: Keyword Analysis

```bash
badi aso keywords [app-id]
```

Shows:
- Title keywords
- Subtitle keywords
- Description top-20 keywords
- Frequency-based ranking

### Step 4: Competitor Comparison

```bash
badi aso compete [my-app-id] [competitor-app-id]
```

Side by side:
- Metadata lengths
- Rating + count
- Screenshot count
- Language count
- Shared + differing keywords (to learn from the competitor)

### Step 5: Metadata Limit Guide

```bash
badi aso metadata appstore      # iOS character limits
badi aso metadata playstore     # Android character limits
```

### Step 6: Review Responses

```bash
badi aso review [app-id]
```
Positive/negative/feature response templates.

### Step 7: Screenshot Guide

```bash
badi aso screenshots
```
iOS 4 mandatory + 3 optional sizes, Android 4 categories.

### Step 8: Market Research

```bash
badi aso search "query" --country us
```
Discover competitors, see trending apps.

### Step 9: Content Production Integration

For launch:
```bash
badi content post "new product launch" --platform appstore
badi content release-notes --platform ios --version X.Y.Z
badi content visual "app store screenshot"
```

### Step 10: Detailed Strategy

In Claude Code, invoke the agents for deep analysis:
- `aso-master` — Full strategy
- `aso-research` — Market research
- `aso-optimizer` — Metadata optimization
- `aso-strategist` — Growth planning

# Example Usage

```
/aso 284882215              # Facebook app analysis
/aso compete 284882215 310633997   # Facebook vs WhatsApp
/aso search "task manager" --country us
```
