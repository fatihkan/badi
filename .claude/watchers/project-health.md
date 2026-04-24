---
name: project-health
description: Ana proje saglik takipcisi (git + test + deps + failure log)
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

## Notlar

Bu watcher, her 15 dakikada bir asagidakileri kontrol eder:

- **git** — Son 10 commit'te "merge conflict", "fatal", "WIP", "DEBUG" pattern'larini arar.
  Yaygin kotu-commit kokulari.
- **shell: npm test** — Test suite'i kirildiysa uyarir. Test yoksa exit 0 varsay ki bu kontrol sessiz kalsin.
- **file: package.json** — Yeni bir bagimlilik eklendiginde bildirir.
  Ekip dismindan gelen ani bagimlilik surprizi tutar.
- **log: failures.log** — Badi'nin kendi hook'larindan gelen hata kayitlarini izler.

Arka planda calistirmak icin:

\`\`\`bash
badi agent install project-health
\`\`\`

Sabah \`/start\` dedigin zaman bu watcher'in son 24 saatlik uyarilari briefing'e eklenir.
