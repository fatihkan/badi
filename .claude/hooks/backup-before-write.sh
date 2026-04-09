#!/usr/bin/env bash
set -euo pipefail

# Badi - Yazma Oncesi Yedekleme (PreToolUse - Async)
# Dosya degisikliklerinden once otomatik yedek olusturur.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null || echo "")

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Yedekleme dizininin kendisini yedekleme
if echo "$FILE_PATH" | grep -q ".claude/backups"; then
  exit 0
fi

BACKUP_DIR=".claude/backups/$(date '+%Y-%m-%d')"
mkdir -p "$BACKUP_DIR"

BASENAME=$(basename "$FILE_PATH")
TIMESTAMP=$(date '+%H%M%S')
BACKUP_FILE="$BACKUP_DIR/${BASENAME}.${TIMESTAMP}.bak"

cp "$FILE_PATH" "$BACKUP_FILE" 2>/dev/null || true

# 7 gunlukten eski yedekleri temizle
find .claude/backups -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

exit 0
