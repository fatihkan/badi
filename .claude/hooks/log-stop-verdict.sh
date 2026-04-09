#!/usr/bin/env bash
set -euo pipefail

# Badi - Durak Karari Kaydi (Stop Hook - Async)
# Oturum sonundaki kararlari ve ogrenimleri kaydeder.

INPUT=$(cat)

LOG_DIR=".claude/logs"
VERDICTS_FILE="$LOG_DIR/verdicts.jsonl"
INCIDENT_LOG="$LOG_DIR/incident-log.md"
NOMINATIONS="$LOG_DIR/../knowledge-nominations.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COUNTER_FILE=".claude/hooks/__counter"

mkdir -p "$LOG_DIR"

# Karar sayacini oku
BLOCK_COUNT=0
if [ -f "$COUNTER_FILE" ]; then
  BLOCK_COUNT=$(cat "$COUNTER_FILE" 2>/dev/null || echo "0")
fi

# JSON girdiyi kaydet
DECISION=$(echo "$INPUT" | jq -r '.decision // "unknown"' 2>/dev/null || echo "unknown")
REASON=$(echo "$INPUT" | jq -r '.reason // ""' 2>/dev/null || echo "")
LEARNING=$(echo "$INPUT" | jq -r '.learning // ""' 2>/dev/null || echo "")

# JSONL formatinda kaydet
echo "{\"timestamp\":\"$TIMESTAMP\",\"decision\":\"$DECISION\",\"reason\":\"$REASON\",\"learning\":\"$LEARNING\"}" >> "$VERDICTS_FILE"

# Engel kararlarini say
if [ "$DECISION" = "block" ]; then
  BLOCK_COUNT=$((BLOCK_COUNT + 1))
  echo "$BLOCK_COUNT" > "$COUNTER_FILE"

  # Olay gunlugune kaydet
  SHORT_REASON=$(echo "$REASON" | head -c 150 | tr '\n' ' ')
  echo "- \`$TIMESTAMP\` | STOP-VERDICT | BLOCK | $SHORT_REASON" >> "$INCIDENT_LOG"
fi

# 2+ engelde kalite kapisi etkinlestir
if [ "$BLOCK_COUNT" -ge 2 ]; then
  touch ".claude/hooks/quality-gate-active"
  echo "- \`$TIMESTAMP\` | QUALITY-GATE | WARN | Kalite kapisi etkinlestirildi ($BLOCK_COUNT engel)" >> "$INCIDENT_LOG"
fi

# Ogrenimleri bilgi adayliklarina ekle
if [ -n "$LEARNING" ] && [ "$LEARNING" != "null" ]; then
  echo "" >> "$NOMINATIONS"
  echo "- \`$TIMESTAMP\` | $LEARNING" >> "$NOMINATIONS"
fi

exit 0
