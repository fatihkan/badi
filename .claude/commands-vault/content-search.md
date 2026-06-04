Content archive search command. Keyword search, similarity detection, and filtering across all generated content.

# Required Tools
- Bash (badi content search)

# Procedure

### Step 1: Get the Search Query

The user provides the query (topic, word, hashtag). With no query, show the most recent content.

### Step 2: Run the Search

```bash
badi content search "productivity"
```

Fields to search:
- `.claude/workspace/icerikler/` (posts, carousels)
- `.claude/workspace/senaryolar/` (videos)
- `.claude/workspace/gorseller/` (visual briefs)
- `.claude/workspace/takvim/` (calendars)
- `.claude/workspace/sablonlar/` (custom templates)
- `marka-sesi.md` (brand voice)

### Step 3: Filters

```bash
badi content search [query] --platform instagram   # Platform filter
badi content search [query] --type post            # Type filter
badi content search [query] --last 30              # Last 30 days
badi content search [query] --hashtag productivity # Hashtag
badi content search [query] --format json          # JSON output
```

### Step 4: Interpret the Results

For each result:
- Score (keyword frequency + recency bonus)
- Directory (icerikler, senaryolar, etc.)
- Snippet (short form of the matching line)

### Step 5: Similarity Warning

If the user is about to create new content and 60%+ similarity exists on the same topic, warn. Skippable with `--force`.

### Step 6: Follow-up Actions

- Recurring topic detected: "Shall we suggest a different angle?"
- Nothing found: "Shall we create something new with `/content-generate`?"
- Old content could be refreshed: "Would you like to update this topic?"

# Example

```
/content-search "productivity"
/content-search "AI" --platform linkedin --last 7
/content-search "tutorial" --type video
```
