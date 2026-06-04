Professional report command. Turns raw data and findings into professional, audience-appropriate reports.

# Required Tools
- Read (data sources)
- Write (report file)
- Grep (data scan)
- Glob (source discovery)
- Bash (data processing)

# Procedure (5 Steps)

### Step 1: Clarify the Inputs
Get from the user:

- **Topic:** What is the report about?
- **Data Sources:** Which data will be used? (files, metrics, analyses)
- **Audience:** Who will read it? (Executive / Technical / Client)
- **Purpose:** What will the report be used for? (decision support, information, persuasion)
- **Format Preference:** Default: professional, clear, jargon-free
- **Length:** Short (1-2 pages) / Standard (3-5 pages) / Detailed (5+ pages)
- **Urgency:** Normal / Urgent (fast draft)

### Step 2: Source Collection
Compile all relevant data:

- **Quantitative Data:** Metrics, statistics, measurements
- **Qualitative Data:** Observations, feedback, assessments
- **Trends:** Time-series data, change rates
- **Comparisons:** Targets vs. actuals, previous period vs. current
- **Anomalies:** Out-of-norm situations and their explanations
- **External Factors:** Outside influences on the results

If data is missing, tell the user and either collect it or state the assumption.

### Step 3: Structure by Audience

**Type A: Executive Report**
- Conclusion first, detail later (pyramid structure)
- Bullets and short paragraphs
- Decision metrics and KPIs up front
- A 2-page main body maximum
- Visual summaries (table and chart descriptions)
- Clear recommendations and next steps
- No jargon, business language

**Type B: Technical Report**
- Methodology and data sources in detail
- Technical terminology allowed
- Data tables and detailed analyses
- A caveats-and-limitations section
- Source references and citations
- Reproducibility information
- Appendix sections

**Type C: Client Report**
- Results and ROI emphasis
- Contextualized numbers (percentages, comparatives)
- Visual formats (tables, lists, highlighted metrics)
- Wins and value demonstration
- Plain language, minimal technical detail
- Next steps and expectations
- A professional, confidence-inspiring tone

### Step 4: Write the Report
Build the report for the chosen type:

```markdown
# [Report Title]
**Date:** [date]
**Prepared by:** [name]
**Period:** [scope]
**Confidentiality:** [level]

## Executive Summary
[2-3 paragraphs: key findings, conclusions, recommendations]

## Key Findings
### Finding 1: [title]
[detail, data support, impact]

### Finding 2: [title]
[detail, data support, impact]

### Finding 3: [title]
[detail, data support, impact]

## Detailed Analysis
[in-depth review by topic]

## Data and Metrics
| Metric | Previous | Current | Change | Target |
|--------|----------|---------|--------|--------|
| ... | ... | ... | ... | ... |

## Recommendations
### Short Term
1. [recommendation and expected impact]

### Mid Term
1. [recommendation and expected impact]

### Long Term
1. [recommendation and expected impact]

## Next Steps
1. [step, owner, date]
2. [step, owner, date]

## Appendices
[extra tables, raw data, methodology details]
```

### Step 5: Quality Control
Evaluate the report against these criteria:

**Content Check:**
- [ ] Is every claim backed by data?
- [ ] Are the assumptions stated explicitly?
- [ ] Are the limitations noted?
- [ ] Are the recommendations actionable and concrete?

**Format Check:**
- [ ] Is the language right for the audience?
- [ ] Does the structure flow logically?
- [ ] Are tables and lists formatted correctly?
- [ ] Is the heading hierarchy consistent?

**Consistency Check:**
- [ ] Are the numbers consistent? (percentages, totals, detail)
- [ ] Do the summary and detail agree?
- [ ] Are the recommendations backed by the findings?
- [ ] Does it contradict previous reports?

**Final Check:**
- [ ] Spelling and grammar checked?
- [ ] Sensitive information marked appropriately?
- [ ] Dates and period info correct?

# Output Format
```
=== BADI REPORT ===
Title: [report title]
Type: [Executive/Technical/Client]
Length: [page count]
Date: [date]

Key Findings: [count]
Recommendations: [count]
Quality Score: [percent]%

File: [file path]
==================
```
