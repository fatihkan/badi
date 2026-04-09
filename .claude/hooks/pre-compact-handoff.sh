#!/usr/bin/env bash
set -euo pipefail

# Badi - Sikistirma Oncesi Durum Kaydi (PreCompact)
# Otomatik sikistirma oncesi durumu kaydeder.

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_DIR=".claude/logs"

mkdir -p "$LOG_DIR"

# Sikistirma isaretcisi dosyasi olustur
echo "$TIMESTAMP" > ".claude/.compaction-occurred"

# Olay gunlugune kaydet
echo "- \`$TIMESTAMP\` | COMPACTION | INFO | Otomatik sikistirma tetiklendi — durum kaydedildi" >> "$LOG_DIR/incident-log.md"

exit 0
