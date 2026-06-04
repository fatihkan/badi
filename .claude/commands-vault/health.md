System health check. Audits dependencies, security, performance, and (if present) the production domain with a triple scan.

## Badi CLI Commands
These checks use the following CLI commands (v1.6+):
- `badi doctor` — Badi installation validation
- `badi secret-scan` — Secret/credential scan (17 patterns)
- `badi ssl [domain]` — Production SSL certificate (if any)
- `badi dns [domain]` — Email security (SPF/DMARC/CAA)
- `badi lighthouse [url]` — Core Web Vitals
- `badi a11y [url]` — WCAG 2.1 compliance

# Required Tools
- Bash (npm audit, system commands)
- Read (configuration files)
- Glob (project file scan)
- Grep (pattern search)
- Agent (security-scanner: security scan, performance-profiler: performance analysis)

# Scheduling
Running this command is especially recommended after `/start` on Monday mornings.
A weekly health-check routine keeps the project healthy.

---

## Check 1: Dependency Audit

### Step 1: Detect the Package Manager
- If `package.json` exists, use npm/yarn/pnpm
- If `Cargo.toml` exists, use cargo
- If `pyproject.toml` or `requirements.txt` exists, use pip

### Step 2: Run the Audit Scan
- Run `npm audit --json` on npm projects
- Additionally run `badi secret-scan` — 17-pattern secret scan (working tree)
- Classify results by severity (critical, high, moderate, low)
- List packages that need updating

### Step 3: Dependency Status Assessment
- GREEN: No critical or high severity issues
- YELLOW: Only moderate severity issues
- RED: Critical or high severity issues present

---

## Check 2: Security Scan

### Step 4: Invoke the Security-Scanner Agent
Run the security-scanner agent via the Agent tool:
- Scan code for hardcoded secrets (.env, API keys, tokens)
- Check security headers (CORS, CSP, X-Frame-Options)
- Review the auth configuration
- Look for known vulnerability patterns (SQL injection, XSS vectors)

### Step 5: Security Status Assessment
- GREEN: No known security issues
- YELLOW: Low-risk findings or improvement suggestions
- RED: Critical vulnerability detected

---

## Check 3: Performance Analysis

### Step 6: Invoke the Performance-Profiler Agent
Run the performance-profiler agent via the Agent tool:
- Measure build/bundle sizes
- Detect complex functions (high cyclomatic complexity)
- Find unnecessary dependencies
- Evaluate caching strategies

**Extra checks when a production URL exists:**
- `badi lighthouse [url]` — Core Web Vitals (FCP, LCP, TBT, CLS)
- `badi a11y [url]` — Accessibility score
Ask the user: "Do you have a production URL? If so I can also run lighthouse + a11y."

### Step 7: Performance Status Assessment
- GREEN: Performance metrics within acceptable bounds
- YELLOW: Improvement opportunities exist but not critical
- RED: Serious performance problems detected

---

## Combined Health Report Card

### Step 8: Build the Report
Present the combined report in this format:

```
╔══════════════════════════════════════════╗
║        BADI SYSTEM HEALTH REPORT          ║
║        Date: [DD.MM.YYYY]                ║
╠══════════════════════════════════════════╣
║                                          ║
║  Dependency Audit:     [GREEN/YEL/RED]  ║
║  > [short note]                          ║
║                                          ║
║  Security Scan:        [GREEN/YEL/RED]  ║
║  > [short note]                          ║
║                                          ║
║  Performance Analysis: [GREEN/YEL/RED]  ║
║  > [short note]                          ║
║                                          ║
╠══════════════════════════════════════════╣
║  Overall: [HEALTHY / ATTENTION / URGENT]║
║                                          ║
║  Suggested Actions:                      ║
║  1. [most important action, if any]      ║
║  2. [second action, if any]              ║
║  3. [third action, if any]               ║
╚══════════════════════════════════════════╝
```

### Step 9: Determine the Overall State
- HEALTHY: All categories GREEN
- ATTENTION: At least one category YELLOW, none RED
- URGENT: At least one category RED

### Step 10: Follow-up Suggestions
- Suggest creating urgent tasks for RED states
- Suggest adding YELLOW states to the weekly plan
- Remind about the next health-check date
