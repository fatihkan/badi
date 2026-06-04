Project briefing command. Turns raw project ideas into structured, actionable briefs.

# Required Tools
- Read (existing project info)
- Write (brief file)
- Grep (similar project search)
- Glob (resource scan)

# Procedure (7 Steps)

### Step 1: Capture the Idea
Collect from the user (accept it even unstructured):
- **Problem:** What problem are we solving?
- **Solution:** How do we plan to solve it?
- **Users:** Who will use it? (primary and secondary audience)
- **Success Criterion:** How will we measure success?
- **Motivation:** Why now? What triggered it?

However raw the idea, convert it into a structured format.

### Step 2: Define the Scope
Draw clear lines:

**In Scope:**
- Features delivered in phase one
- Core user flows
- Minimum technical requirements

**Out of Scope:**
- Features deliberately excluded
- Work deferred to future phases
- Responsibility boundaries

**Assumptions:**
- Technical assumptions (infrastructure, access, etc.)
- Business assumptions (budget, time, resources)
- User assumptions (skill level, access, etc.)

### Step 3: User Stories (MoSCoW)
Write 5-10 user stories, each with:
- Format: "As a [role], I want [goal], so that [benefit]."
- Acceptance criteria (2-4 items)
- MoSCoW priority:
  - **Must:** The product cannot work without it
  - **Should:** Important but can miss the first release
  - **Could:** Nice to have, not a priority
  - **Won't:** Deliberately not done in this phase

### Step 4: Technical Assessment
- **Tech Stack:** Suggested languages, frameworks, tools
- **Integrations:** Third-party services and APIs
- **Data Requirements:** Database, storage, data flow
- **Infrastructure:** Hosting, CI/CD, monitoring
- **Constraints:** Performance requirements, compliance, scale
- **Technical Debt Risk:** Known shortcuts or workarounds
- **Build vs Buy Analysis:** Which components to build, which to use off the shelf?

### Step 5: Risk Identification
Build a risk matrix:

| Risk | Likelihood (1-5) | Impact (1-5) | Risk Score | Mitigation Strategy |
|------|------------------|--------------|------------|---------------------|
| [risk description] | [value] | [value] | [LxI] | [strategy] |

Risk categories:
- Technical risks (complexity, unknown technology)
- Resource risks (time, budget, talent)
- External dependency risks (third parties, APIs)
- Market risks (demand, competition)

### Step 6: Time Estimate
A phase-based estimate table:

| Phase | Description | Estimated Duration | Prerequisites |
|-------|-------------|--------------------|---------------|
| Research | ... | ... | ... |
| Design | ... | ... | ... |
| Development | ... | ... | ... |
| Test | ... | ... | ... |
| Launch | ... | ... | ... |

Note: add a 20% buffer to estimates.
State the total estimated duration and the end date.

### Step 7: Create the Brief File
Save to `briefs/[project-name]-brief.md`.

# Output Format
```
=== BADI PROJECT BRIEF ===
Project: [project name]
Date: [date]
Status: DRAFT

Summary: [single paragraph]
Priority: [HIGH/MEDIUM/LOW]
Estimated Duration: [duration]
Risk Level: [HIGH/MEDIUM/LOW]

Must Have: [count] stories
Should Have: [count] stories
Could Have: [count] stories
Won't Have: [count] stories

File: briefs/[project-name]-brief.md
============================
```
