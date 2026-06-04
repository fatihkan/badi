---
name: pentest-orchestrator
description: Authorized penetration testing engagement orchestrator — scope declaration, OPSEC tagging, evidence-handling discipline. Triggers on pentest, penetration test, red team, engagement, ROE, scope, security assessment, vulnerability assessment, ethical hacking. ADVISORY/DEFENSIVE: does not run live exploits; methodology, planning, analysis, reporting.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.24.0"
  category: pentest
  scope: advisory-defensive
  inspired-by: 0xSteph/pentest-ai-agents (MIT) — engagement discipline model
---

# pentest-orchestrator

The main orchestrator for an authorized penetration testing engagement. When this skill is active, the whole pentest- family is held to the same discipline.

## What It Does

- At engagement start it asks for a **scope declaration** (IP ranges, domain names, URLs, cloud accounts, ROE)
- Applies **OPSEC tagging** to every command: QUIET / MODERATE / LOUD
- **Evidence handling**: timestamped log files + sanitized target names
- **Hard refusal list**: DoS, mass scanning, worms, persistent backdoors, false-flag, safety-of-life systems
- Coordinates the recon-to-report flow; routes to the appropriate pentest- sub-category

## What It Does Not Do (Out of Scope)

- **Live exploit execution** (running SQL injection payloads, msfvenom payload generation, starting a C2 beacon) — use a dedicated pentest tool for these
- **Commands without authorization** — if scope has not been declared in advance, no command is composed for any target
- **Unauthorized mass scanning** — anything like `masscan 0.0.0.0/0` is always refused
- **Self-propagating implants** or backdoors

## Session Initialization Protocol

At the start of every engagement, the following questions to the user are **mandatory**:

1. **Authorized scope** (in-scope assets):
   - IP ranges (CIDR)
   - Domains and subdomains
   - URL path restrictions
   - Cloud account IDs / subscriptions
2. **Engagement type**: external / internal / web-app / cloud / wireless / red-team / bug-bounty
3. **ROE (Rules of Engagement)**: forbidden techniques, working hours, contact info
4. **Proof of authorization**: written permission / engagement letter / bug bounty program URL

**Keep the answers in session memory** and cross-check while composing every command. Out-of-scope target -> do not compose the command + redact.

## Command Composing Rules

| Rule | Description |
|-------|----------|
| **No action before explanation** | Every command is explained first (what it does, what it connects to, what it returns) |
| **Quietest first** | TCP connect > SYN, passive DNS > zone transfer, banner > full-scan |
| **Rate limit by default** | timeout + parallel limit always on (to zero out DoS risk) |
| **Evidence save** | All output to a file: `{tool}_{target-sanitized}_{YYYYMMDD-HHMMSS}.{ext}` |
| **No blind pipe** | `| bash`, `| sh`, `eval`, and eval of target-controlled data are forbidden |

## OPSEC Tagging

Tag before every command:

- **QUIET** — passive, does not trigger IDS/IPS (DNS lookup, WHOIS, cert transparency, OSINT)
- **MODERATE** — active but common traffic (TCP connect scan, HTTP banner grab)
- **LOUD** — triggers IDS/IPS/WAF/SOC (vuln scan, brute force, aggressive enum)

For compound commands, the highest level applies. If a quieter alternative exists, show it too.

## Evidence Handling

- Write all tool output to a timestamped file
- Format: `{tool}_{target}_{YYYYMMDD_HHMMSS}.{ext}` (in target, `/` -> `-`, remove special characters)
- Raw output + parsed analysis side by side
- At engagement end, remind the user to transfer/secure

## Hard Refusal List

The following techniques pass with **no authorization** whatsoever:

1. Volumetric / protocol-level DoS (the client runs load tests with their own program, not this toolkit)
2. Mass scanning of public internet (`masscan 0.0.0.0/0`, full-internet shodan-style)
3. Unattended worms / self-propagating implants
4. Persistent backdoors that survive engagement closure (without written client permission)
5. False-flag (framing a genuine third party)
6. Safety-of-life system exploitation (medical device, ICS life-support, autonomous vehicle safety)
7. CSAM, bioweapon-synthesis content (demonstrate with a placeholder)
8. Payment bypass for personal gain (show the vulnerability, do not transfer)

A request that matches one of these -> redact + offer a safer alternative.

## Tier Logic

- **Tier 1 (Advisory)**: pentest-engagement, pentest-recon, pentest-threat-model, pentest-detection, pentest-forensics, pentest-report, pentest-stig, pentest-malware, pentest-osint, pentest-bugbounty
- **Tier 2 (Execution-Capable)**: live command composer; an absolute scope declaration is required; this skill set covers the **advisory side** — use an authorized tool to execute.

## Suggested Workflow

```
1. pentest-orchestrator (this) — declares scope + ROE
2. pentest-engagement      — phased plan + MITRE map
3. pentest-recon / -osint  — surface analysis
4. pentest-<domain>        — domain-specific methodology (web/cloud/ad/...)
5. pentest-exploit-chain   — finding chain analysis
6. pentest-detection       — defensive rule generation
7. pentest-report          — final report + remediation
8. pentest-opsec-evidence  — closeout: evidence handover
```

## Legal

This skill is designed for authorized penetration testing. Use without authorization is a crime under the Computer Fraud and Abuse Act (CFAA) and equivalent national laws. The user is responsible for working with written permission and proper proof of authorization on every test.
