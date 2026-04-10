#!/usr/bin/env bash
set -euo pipefail

# Badi - Dal Korumasi (PreToolUse - Bash)
# Korunmus dallara dogrudan commit islemlerini engeller.
# Push islemi merge sonrasi yayim olarak kabul edilir, engellenmez.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")

if [ -z "$COMMAND" ]; then
  exit 0
fi

LOG_DIR=".claude/logs"

# Force push her dalda engellenir (sadece release ve main icin)
if echo "$COMMAND" | grep -qE 'git\s+push.*--force\b'; then
  CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
  if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ] || echo "$CURRENT_BRANCH" | grep -qE '^release/'; then
    mkdir -p "$LOG_DIR"
    echo "- \`$(date '+%Y-%m-%d %H:%M:%S')\` | BRANCH-GUARD | BLOCK | '$CURRENT_BRANCH' dalinda force push engellendi" >> "$LOG_DIR/incident-log.md"
    echo "{\"decision\":\"block\",\"reason\":\"'$CURRENT_BRANCH' korunmus bir daldir, force push yapilamaz.\"}"
    exit 0
  fi
fi

# Sadece git commit komutunu korunmus dallarda engelle
# Push engellenmez — merge sonrasi yayim icin gereklidir
if ! echo "$COMMAND" | grep -qE 'git\s+commit\b'; then
  exit 0
fi

# Merge commit'leri engelleme — git merge zaten otomatik commit olusturur
if echo "$COMMAND" | grep -qE 'git\s+merge\b'; then
  exit 0
fi

# Mevcut dali oku
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [ -z "$CURRENT_BRANCH" ]; then
  exit 0
fi

# Korunmus dallar listesi
PROTECTED_BRANCHES="main master production"

for branch in $PROTECTED_BRANCHES; do
  if [ "$CURRENT_BRANCH" = "$branch" ]; then
    mkdir -p "$LOG_DIR"
    echo "- \`$(date '+%Y-%m-%d %H:%M:%S')\` | BRANCH-GUARD | BLOCK | '$CURRENT_BRANCH' dalinda dogrudan commit engellendi: $COMMAND" >> "$LOG_DIR/incident-log.md"

    echo "{\"decision\":\"block\",\"reason\":\"'$CURRENT_BRANCH' korunmus bir daldir. Dogrudan commit yapilamaz. Bir feature dalina gecin: git checkout -b feature/isim\"}"
    exit 0
  fi
done

exit 0
