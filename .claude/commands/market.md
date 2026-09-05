Market & demand research command. Discovers niches, sizes opportunity, and reads competitor/demand signals BEFORE you build — via the market-researcher agent, with the `badi market` CLI for App Store data.

# Required Tools
- Read (context, memory, prior research)
- Grep / Glob (find related notes and prior decisions)
- Bash (`badi market` for App Store discover/reviews/difficulty)
- Agent (delegate to market-researcher)

# When to Use
Before committing to a product, feature, or niche — when the question is "is there demand, who is it for, and is the space winnable?". Pairs with `/ceo-review` (should we build it) and `/aso` + `/seo` (once you're in-market). For pure App Store metrics, `badi market` alone is enough; use `/market` when you want a synthesized opportunity read.

# Procedure

### Step 1: Frame the Question
- State the niche/keyword/category and the decision it informs in one sentence.
- Read `memory.md` / prior research notes for what's already known.

### Step 2: Pull Hard Data (optional, App Store)
- Run `badi market discover <keyword>`, `badi market reviews <appId>`, and/or `badi market difficulty <keyword>` for concrete App Store signals (ratings, review themes, ranking difficulty, wishlist/gaps).
- Capture the raw numbers so the agent reasons from data, not vibes.

### Step 3: Delegate to Market Researcher
Launch the **market-researcher** agent (read-only; WebSearch/WebFetch + the data from Step 2). Ask it to:
- Size the opportunity — read search/category volume as a FLOOR (2026 zero-click + AI query fan-out undercount latent demand), triangulated with TikTok trend velocity, community pain-points, and marketplace purchase-intent search; note the trend direction.
- Identify the target user and the job-to-be-done.
- Map competitors and find the gap (under-served segment, weak incumbents, unmet need) — and check AI-answer citation presence (ChatGPT/Gemini/Perplexity), not just SERP rank: the two diverge in 2026.
- Surface the risks and what would tell us to walk away.

### Step 4: Synthesize the Read
Produce a decision-grade brief:
- **Opportunity** — demand + size + trend.
- **Who** — target user and their job.
- **Gap** — the under-served angle to win on.
- **Verdict** — pursue / shrink / pass, with the signal that would change it.

### Step 5: Record
- **Primary destination — the daily note** (`daily-notes/DDMMYY.md`): append the read + verdict (opportunity, who, gap, verdict + the kill/go signal) so it informs `/ceo-review`.
- **`memory.md` is optional and capped at 100 lines.** Write to it only when the verdict must survive across sessions (e.g., a PASS on a niche that must not be re-researched). Then:
  1. Run `wc -l .claude/memory.md` first.
  2. If adding one line would push the file past 100, consolidate existing entries first so the result stays at or under 100 lines.
  3. Add at most **one** line (niche + verdict). Never append the full read there.

# Output Format
- **Opportunity** (demand, size, trend)
- **Target user + job-to-be-done**
- **Competitive gap**
- **Verdict** + the kill/go signal
- (If App Store) the `badi market` data the read is grounded in
