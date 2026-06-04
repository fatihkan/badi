Post-incident analysis (post-mortem) command. Documents root-cause analysis of production incidents and major failures.

# Required Tools
- Read (log files, incident records)
- Write (post-mortem report)
- Grep (error pattern search)
- Bash (git log, timestamp analysis)

# Procedure (6 Steps)

### Step 1: Collect the Incident Summary
- When did the incident start? (first detection)
- When was it resolved? (full recovery)
- Blast radius: how many users / which services were affected?
- Severity: CRITICAL / HIGH / MEDIUM / LOW

### Step 2: Build the Timeline
A minute-by-minute incident chronology:
```
[HH:MM] First alarm / detection
[HH:MM] Response started
[HH:MM] Root cause identified
[HH:MM] Fix applied
[HH:MM] Verification complete
[HH:MM] Full recovery
```

### Step 3: Root Cause Analysis
Apply the 5 Whys technique:
1. Why did it happen? -> ...
2. Why did that happen? -> ...
3. Why did that happen? -> ...
4. Why did that happen? -> ...
5. Why did that happen? -> (root cause)

Identify the technical root cause and the organizational root cause separately.

### Step 4: What Went Well / Badly
**Went Well:**
- Things detected quickly
- Effective interventions
- Systems that worked

**Went Badly:**
- Problems noticed late
- Wrong turns
- Missing alarms/monitoring

**Got Lucky:**
- Situations that could have gone worse but didn't

### Step 5: Action Items
For each item: owner, priority, target date
- **Immediate** (this week): Urgent fixes
- **Short Term** (this sprint): Preventive measures
- **Long Term** (this quarter): Structural improvements

### Step 6: Build and Save the Report
Save to `post-mortems/[date]-[incident-name].md`.

# Output Format
```
=== BADI POST-MORTEM ===
Incident: [incident name]
Date: [date]
Severity: [level]
Impact Duration: [minutes/hours]
Root Cause: [one-sentence summary]
Actions: [count] items
File: post-mortems/[date]-[incident-name].md
========================
```

# Notes
- Use blameless, learning-focused language
- Ask "what" and "why", not "who"
- Nominate every post-mortem into knowledge-base.md
