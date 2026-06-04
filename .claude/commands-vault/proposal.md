Client proposal command. Builds a professional client proposal from project summaries. Valid for 30 days.

# Required Tools
- Read (project data, existing brief)
- Write (proposal file)
- Grep (similar proposal search)

# Procedure (6 Steps)

### Step 1: Overview
Get from the user:
- **Client Name:** Company or person
- **Needs:** The problems and requests the client stated
- **Desired Outcomes:** Success criteria and expectations
- **Constraints:** Budget range, time limits, technical boundaries
- **Decision Maker:** Who approves? Technical or business?
- **Competition:** Are other proposals being evaluated?

If an existing brief exists (in `briefs/`), build on it.

### Step 2: Define the Scope
Split the deliverables into phases:

**Phase 1: [name]**
- Deliverables: [detailed list]
- Expected outputs: [concrete results]
- Duration: [estimate]
- Dependencies: [prerequisites]

**Phase 2: [name]**
- ...

For each phase:
- Assumptions (what will be provided, what is expected)
- Out-of-scope items (state explicitly)
- Acceptance criteria

### Step 3: Timeline
Map the phases to calendar weeks:

| Week | Phase | Deliverables | Milestone |
|------|-------|--------------|-----------|
| 1-2 | Research & Design | ... | Design Approval |
| 3-5 | Development | ... | MVP Demo |
| 6 | Test & Polish | ... | QA Approval |
| 7 | Launch & Support | ... | Go-Live |

- Leave a 2-3 day review buffer between phases
- Mark milestones explicitly
- Note the critical path

### Step 4: Pricing (2 Options)

**Option A: Full Scope (Recommended)**
| Item | Unit | Quantity | Unit Price | Total |
|------|------|----------|------------|-------|
| ... | ... | ... | ... | ... |
- Subtotal: [amount]
- VAT: [amount]
- **Grand Total: [amount]**

**Option B: MVP / Reduced Scope**
| Item | Unit | Quantity | Unit Price | Total |
|------|------|----------|------------|-------|
| ... | ... | ... | ... | ... |
- **Grand Total: [amount]**

**Optional Add-on Services:**
- [service]: [price]
- [service]: [price]

### Step 5: Terms and Conditions
State the proposal terms:

- **Validity:** This proposal is valid until [date] (30 days).
- **Payment Schedule:**
  - 30% at contract signature (start)
  - 40% at MVP delivery (interim)
  - 30% at final delivery and acceptance
- **Revision Policy:**
  - [count] revision rounds included per phase
  - Extra revisions billed hourly
- **Intellectual Property:**
  - All custom code and designs transfer to the client at final payment
  - Third-party licenses disclosed to the client
- **Confidentiality:** A mutual NDA applies
- **Cancellation:**
  - Either party may cancel with [count] days notice
  - Completed work is paid for
- **Communication:** Weekly progress report + meetings at [interval]
- **Change Requests:** Out-of-scope requests are priced separately

### Step 6: Create the Proposal File
Save to `proposals/[client-name]-proposal.md`.

# Output Structure
```markdown
# Project Proposal: [Project Name]
**Prepared by:** [name]
**Client:** [client name]
**Date:** [date]
**Validity:** [end date] (30 days)

## 1. Executive Summary
[2-3 paragraphs: problem, solution, value]

## 2. Understanding the Problem
[the client's situation and needs]

## 3. Proposed Approach
[phased solution plan]

## 4. Scope and Deliverables
[detailed scope table]

## 5. Timeline
[weekly plan table]

## 6. Investment
[2-option pricing]

## 7. Terms and Conditions
[the terms above]

## 8. Next Steps
1. Proposal review
2. Q&A meeting
3. Contract signature
4. Kickoff meeting
```

# Output Format
```
=== BADI CLIENT PROPOSAL ===
Client: [client name]
Date: [date]
Validity: 30 days ([end date])

Phase Count: [count]
Option A: [total]
Option B: [total]
Estimated Duration: [weeks] weeks

File: proposals/[client-name]-proposal.md
=============================
```
