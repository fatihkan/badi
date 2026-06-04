---
name: deploy-watchdog
description: Health + log watcher for the live service
active: false
every: 5m
watch:
  - type: http
    url: "https://example.com/health"
    alert_on: "status-nonok|latency>2s"
  - type: log
    path: ".deploy/error.log"
    alert_on: "pattern-match:ERROR|FATAL|Exception"
report_to: .claude/workspace/watcher-reports/deploy-watchdog.md
---

## Notes

Polls the live service every 5 minutes:

- **http** — The health endpoint must return 200; responses taking longer than 2 seconds raise a warning.
  Composite `alert_on` notation: `status-nonok|latency>2s`.
- **log** — While scanning the local deploy error file for ERROR/FATAL/Exception,
  it flags every new line it sees.

This watcher is **`active: false` by default** — fill in your own URL and log path, set it to
true, then:

\`\`\`bash
badi agent install deploy-watchdog
\`\`\`

### Adding a Slack/Discord webhook (optional)

In the frontmatter:

\`\`\`yaml
notify:
  - slack: https://hooks.slack.com/services/XXX
  - desktop: true
\`\`\`

This MVP has simple report writing; notify providers come in v1.14 phase 2.
