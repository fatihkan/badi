# Security Policy

## Supported Versions

| Version | Support |
|---------|---------|
| 1.37.x | Active |
| < 1.37 | Unsupported |

## Security Features

Badi includes the following security layers:

- **14 Hooks** — guard-bash (dangerous command blocking), branch-guard (branch protection), backup-before-write, completeness-gate (secret detection)
- **63 opt-in skill categories** (incl. 25 advisory `pentest-*`) — OWASP Top 10, language-specific scanners, dependency audit, secret scanning
- **Log Rotation** — Prevents unbounded growth
- **Dependency Audit** — `npm audit` at session start (24h cache; the only automatic network call — opt-out: `BADI_NO_DEP_AUDIT=1`)

## Reporting a Vulnerability

If you have found a security vulnerability:

1. **Use a GitHub Security Advisory** (preferred): [Create a new advisory](https://github.com/fatihkan/badi/security/advisories/new)
2. **Email**: contact details on the GitHub profile

**Please do NOT open a public issue.**

## Required Information

- Affected file/flow
- Technical description
- Steps to reproduce
- Impact assessment (CVSS preferred)

## Response Process

| Stage | Time |
|-------|------|
| Initial acknowledgement | 3 business days |
| Technical assessment | 7 business days |
| Patch release | 14 business days |

## Responsible Disclosure

Please do not disclose publicly until a fix has been released.
