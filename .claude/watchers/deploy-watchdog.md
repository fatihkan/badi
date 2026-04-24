---
name: deploy-watchdog
description: Yayindaki servisin saglik + log takipcisi
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

## Notlar

Yayindaki servisi 5 dakikada bir sorgular:

- **http** — Health endpoint'i 200 donmeli, 2 saniyeden uzun suren cevaplar uyari verir.
  Kompozit `alert_on` notasyonu: `status-nonok|latency>2s`.
- **log** — Lokal deploy error dosyasinda ERROR/FATAL/Exception ararken
  gordugu her yeni satirla dertlenir.

Bu watcher **varsayilanda `active: false`** — ozel URL ve log yolu ile doldurup
true yaptiktan sonra:

\`\`\`bash
badi agent install deploy-watchdog
\`\`\`

### Slack/Discord webhook eklemek (opsiyonel)

Frontmatter'a:

\`\`\`yaml
notify:
  - slack: https://hooks.slack.com/services/XXX
  - desktop: true
\`\`\`

Bu MVP'de basit rapor yazimi var; notify provider'lari v1.14 faz 2'de.
