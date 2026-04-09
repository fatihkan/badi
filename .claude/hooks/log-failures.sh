#!/usr/bin/env bash
set -euo pipefail

# Badi - Hata Kaydi (PostToolUseFailure - Async)
# Arac hatalarini kategorize edip kaydeder.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"' 2>/dev/null || echo "unknown")
ERROR=$(echo "$INPUT" | jq -r '.error // "unknown error"' 2>/dev/null || echo "unknown error")

LOG_DIR=".claude/logs"
FAILURE_LOG="$LOG_DIR/failure-log.md"
INCIDENT_LOG="$LOG_DIR/incident-log.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$LOG_DIR"

# Hata kategorizasyonu
CATEGORY="OTHER"
SEVERITY="WARN"

if echo "$ERROR" | grep -qi "ENOENT\|not found\|no such file"; then
  CATEGORY="FILESYSTEM"
  SEVERITY="WARN"
elif echo "$ERROR" | grep -qi "ECONNREFUSED\|ETIMEDOUT\|network\|fetch"; then
  CATEGORY="NETWORK"
  SEVERITY="ERROR"
elif echo "$ERROR" | grep -qi "EACCES\|permission\|denied\|forbidden"; then
  CATEGORY="PERMISSION"
  SEVERITY="ERROR"
elif echo "$ERROR" | grep -qi "build\|compile\|syntax\|parse"; then
  CATEGORY="BUILD"
  SEVERITY="ERROR"
elif echo "$ERROR" | grep -qi "api\|rate.limit\|401\|403\|429\|500"; then
  CATEGORY="API"
  SEVERITY="ERROR"
fi

# Hata mesajini kisalt
SHORT_ERROR=$(echo "$ERROR" | head -c 200 | tr '\n' ' ')

# Hata gunlugune kaydet
echo "- \`$TIMESTAMP\` | $SEVERITY | $CATEGORY | $TOOL_NAME | $SHORT_ERROR" >> "$FAILURE_LOG"

# Ciddi hatalari olay gunlugune de kaydet
if [ "$SEVERITY" = "ERROR" ] || [ "$SEVERITY" = "CRITICAL" ]; then
  echo "- \`$TIMESTAMP\` | FAILURE | $SEVERITY | $CATEGORY: $TOOL_NAME - $SHORT_ERROR" >> "$INCIDENT_LOG"
fi

exit 0
