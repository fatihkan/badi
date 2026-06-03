CEO/product review command. Challenges a feature or roadmap from the top — should we build it, for whom, what does success look like — via the product-strategist agent.

# Required Tools
- Read (context, memory, specs)
- Grep / Glob (find related code and docs)
- Bash (git log / status for recent direction)
- Agent (delegate to product-strategist)

# When to Use
Before committing engineering time to a feature, epic, or roadmap item. Run this when the question is "should we build this?" — not "how do we build it?". Pair with `/eng-review` once the bet is green-lit.

# Procedure

### Step 1: Gather Context
- Read `memory.md` and any spec/brief for the proposed work.
- Skim related code and prior decisions (`knowledge-base.md`, recent commits) to understand what already exists.
- Identify the user-stated goal in one sentence.

### Step 2: Delegate to Product Strategist
Launch the **product-strategist** agent with the goal and context. Ask it to apply the CEO lens:
- Is this the highest-leverage thing to build now?
- Who is the user and what job does this do for them?
- What is the smallest valuable version?
- How will we measure success, and what would tell us to kill it?

### Step 3: Synthesize the Verdict
From the agent's output, produce a clear decision:
- **BUILD NOW** — proceed; hand the bet to `/eng-review`.
- **SHRINK & BUILD** — proceed with the reduced scope named by the strategist.
- **DEFER** — not now; record why and the trigger to revisit.
- **KILL** — do not build; record the reasoning.

### Step 4: Record the Decision
- Add the verdict, the bet, and success metrics to the daily note / `memory.md`.
- If BUILD/SHRINK, capture the smallest-valuable-version scope for the engineering-manager.

# Output Format
- **Verdict** + one-line rationale
- **The Bet** (hypothesis under test)
- **Smallest Valuable Version**
- **Success Metrics**
- **Cuts & Risks**
