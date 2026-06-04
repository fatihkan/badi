---
name: project-health
description: Main project health watcher (git + test + deps + failure log)
active: true
every: 15m
watch:
  - type: git
    pattern: "merge conflict|fatal|WIP|DEBUG"
    scope: "last-10-commits"
  - type: shell
    command: "npm test --silent"
    alert_on: "exit-nonzero"
    timeout: 90s
  - type: file
    path: "package.json"
    alert_on: "dependency-added"
  - type: log
    path: ".claude/logs/failures.log"
    alert_on: "new-entry"
report_to: .claude/workspace/watcher-reports/project-health.md
---

## Notes

This watcher checks the following every 15 minutes:

- **git** — Scans the last 10 commits for "merge conflict", "fatal", "WIP", "DEBUG" patterns.
  Common bad-commit smells.
- **shell: npm test** — Warns if the test suite is broken. If there are no tests it assumes exit 0 so this check stays quiet.
- **file: package.json** — Notifies when a new dependency is added.
  Catches surprise dependencies coming from outside the team.
- **log: failures.log** — Monitors the error records coming from Badi's own hooks.

To run it in the background:

\`\`\`bash
badi agent install project-health
\`\`\`

When you say \`/start\` in the morning, this watcher's alerts from the last 24 hours are added to the briefing.
