#!/usr/bin/env bash
set -euo pipefail

# Badi - Dal Korumasi (PreToolUse - Bash)
# Korunmus dallara dogrudan commit/push islemlerini engeller.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Sadece git commit ve git push komutlarini kontrol et
if ! echo "$COMMAND" | grep -qE 'git\s+(commit|push)'; then
  exit 0
fi

# Mevcut dali oku
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [ -z "$CURRENT_BRANCH" ]; then
  exit 0
fi

# Korunmus dallar listesi
PROTECTED_BRANCHES="main master production release"

for branch in $PROTECTED_BRANCHES; do
  if [ "$CURRENT_BRANCH" = "$branch" ]; then
    LOG_DIR=".claude/logs"
    mkdir -p "$LOG_DIR"
    echo "- \`$(date '+%Y-%m-%d %H:%M:%S')\` | BRANCH-GUARD | BLOCK | '$CURRENT_BRANCH' dalinda dogrudan islem engellendi: $COMMAND" >> "$LOG_DIR/incident-log.md"

    echo "{\"decision\":\"block\",\"reason\":\"'$CURRENT_BRANCH' korunmus bir daldir. Dogrudan commit/push yapilamaz. Bir feature dalina gecin: git checkout -b feature/isim\"}"
    exit 0
  fi
done

# release/* dallarini kontrol et
if echo "$CURRENT_BRANCH" | grep -qE '^release/'; then
  if echo "$COMMAND" | grep -qE 'git\s+push\s+--force'; then
    echo '{"decision":"block","reason":"Release dallarinda force push yapilamaz."}'
    exit 0
  fi
fi

exit 0
