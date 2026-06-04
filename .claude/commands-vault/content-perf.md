Content performance tracking command. Tracks likes, comments, reach, and ROI for published content.

# Required Tools
- Bash (badi content perf)

# Procedure

### Step 1: Add Data

Record the metrics after every publish:

```bash
badi content perf add --file 2026-04-19-topic.md \
  --platform instagram \
  --likes 150 --comments 12 --shares 5 --saves 20 \
  --reach 2500 \
  --effort 1.5
```

Parameters:
- `--file` — Content file name
- `--platform` — instagram/twitter/linkedin/tiktok/facebook
- `--likes/--comments/--shares/--saves/--reach` — Metrics
- `--effort` — Production time (hours)

### Step 2: Reports

```bash
badi content perf              # Weekly summary (default)
badi content perf --week
badi content perf --month
badi content perf list         # All records
```

### Step 3: Trend Analysis

```bash
badi content perf --trend
```

Previous vs. current period comparison:
- Total engagement change (%)
- Platform-level trends

### Step 4: ROI Analysis

```bash
badi content perf --roi
```

Engagement/effort ratio per platform. Which platform pays the most for your hour?

### Step 5: Platform Filter

```bash
badi content perf --platform instagram --month
```

### Step 6: Interpretation + Action

Based on the report, tell the user:
- Best performer: "Shall we repeat this format?"
- Low ROI: "Rethink the time investment on this platform?"
- Negative trend: "Should the content mix be revised?"

### Step 7: Weekly Routine

Thursday/Friday evening weekly evaluation:
```bash
badi content perf --trend      # Evaluate the week
badi content plan              # Plan next week
```

# Example

```
/content-perf                  # Weekly summary
/content-perf --trend          # Trend comparison
/content-perf --roi            # ROI ranking
/content-perf add --file ... --platform linkedin --likes 85 ...
```
