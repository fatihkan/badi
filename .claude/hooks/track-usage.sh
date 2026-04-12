#!/usr/bin/env bash
set -euo pipefail

# Badi - Kullanim Takip Hook'u (PostToolUse - Async)
# Her arac kullanimini usage.jsonl'e kaydeder.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"' 2>/dev/null || echo "unknown")

GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
LOG_DIR="$GIT_ROOT/.claude/logs"
LOG_FILE="$LOG_DIR/usage.jsonl"
TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

mkdir -p "$LOG_DIR"

# Badi CLI komutu mu kontrol et
COMMAND=""
SUBCOMMAND=""
if echo "$INPUT" | jq -e '.tool_input.command' >/dev/null 2>&1; then
    FULL_CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null)
    if echo "$FULL_CMD" | grep -q 'badi'; then
        COMMAND="badi"
        SUBCOMMAND=$(echo "$FULL_CMD" | sed -n 's/.*badi[[:space:]]*\([a-z-]*\).*/\1/p')
    fi
fi

echo "{\"timestamp\":\"$TIMESTAMP\",\"tool\":\"$TOOL_NAME\",\"command\":\"$COMMAND\",\"subcommand\":\"$SUBCOMMAND\",\"exit_code\":0}" >> "$LOG_FILE"

exit 0
