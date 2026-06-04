Performance profiling. Detects hot paths, bottlenecks, and optimization opportunities.

## Badi CLI Commands (v1.6+)
If a production URL exists:
- `badi lighthouse [url]` — Core Web Vitals (FCP, LCP, TBT, CLS, Speed Index)
- `badi lighthouse [url] --desktop` — Separate desktop measurement
- `badi seo speed [url]` — Page speed + resource analysis (v1.4+)

These CLI tools give real-world metrics (PageSpeed Insights). The code-based analyses (steps below) complement them.

# Required Tools
- Bash (build commands, file size calculation)
- Read (source code analysis)
- Grep (pattern search)
- ...

# Agent Delegation
This command delegates the main analysis to the performance-profiler agent.
If the agent is unavailable, apply the steps below directly.

---

## Section 1: Hot Path Detection

### Step 1: Frequently Changed Files
- Find the most-changed files in the last 50 commits with `git log --format=format: --name-only`
- List the 10 most frequently changed files
- Add their complexity and size info
- ...

### Step 2: Complex Function Detection
- Detect long functions (50+ lines)
- Find deeply nested structures (4+ indent levels)
- Flag functions with multiple loops
- ...

### Step 3: Import/Dependency Analysis
- Detect files with too many imports
- Look for circular dependencies
- Find unused imports

---

## Section 2: Database Query Analysis

### Step 4: N+1 Query Pattern Detection
Search the code for these patterns:
- Database calls inside loops
- Missing eager loading on ORM relations
- `await`ed database operations inside `forEach`/`map`
- ...

### Step 5: Query Optimization Suggestions
- Index usage suggestions
- Batch-conversion opportunities
- Needless query repetition
- ...

---

## Section 3: Bundle and Build Sizes

### Step 6: Build Size Analysis
- Report the `package.json` dependency count
- Measure the build output size if present
- Check the total `node_modules` size
- ...

### Step 7: Dependency Weight Analysis
- Rank the largest dependencies by size
- Detect heavy libraries with lighter alternatives
  Example: moment.js -> date-fns, lodash -> lodash-es or native methods
- Check dev dependencies leaking into the production build
- Detect duplicate packages

### Step 8: Asset Sizes
- Check image file sizes
- Detect uncompressed assets
- Evaluate font file sizes
- ...

---

## Section 4: Caching Strategy Review

### Step 9: Current Cache Implementation
- Check for Redis/Memcached usage
- Review HTTP cache headers (Cache-Control, ETag)
- Evaluate the CDN configuration (if present)
- ...

### Step 10: Cache Optimization Suggestions
- Detect cacheable-but-uncached data
- Evaluate the cache invalidation strategy
- Suggest a cache layer based on the read/write ratio
- ...

---

## Section 5: Performance Report

### Step 11: Build the Findings Summary
```
[abridged]
```

### Step 12: Impact Estimate
For each suggestion:
- Estimated improvement percentage or time
- Implementation difficulty: EASY / MEDIUM / HARD
- Priority: ranked by impact/effort ratio
- ...
