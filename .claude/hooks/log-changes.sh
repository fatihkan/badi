#!/usr/bin/env bash
set -euo pipefail

# Badi - Degisiklik Kaydi (PostToolUse - Async)
# Tum dosya degisikliklerini denetim izine kaydeder.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"' 2>/dev/null || echo "unknown")
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // "unknown"' 2>/dev/null || echo "unknown")

LOG_DIR=".claude/logs"
LOG_FILE="$LOG_DIR/audit-trail.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$LOG_DIR"

# Goreli yol hesapla
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
REL_PATH="${FILE_PATH#$PROJECT_ROOT/}"

echo "- \`$TIMESTAMP\` | $TOOL_NAME | $REL_PATH" >> "$LOG_FILE"

exit 0
