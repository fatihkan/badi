#!/usr/bin/env bash
set -euo pipefail

# Badi - Bash Guvenlik Korumasi (PreToolUse)
# Tehlikeli komutlari uc katmanli izin sistemiyle denetler.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")

if [ -z "$COMMAND" ]; then
  exit 0
fi

LOG_DIR=".claude/logs"
LOG_FILE="$LOG_DIR/incident-log.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$LOG_DIR"

log_incident() {
  local severity="$1"
  local message="$2"
  echo "- \`$TIMESTAMP\` | GUARD-BASH | $severity | $message" >> "$LOG_FILE"
}

# ─── SERT ENGELLER (kesinlikle izin verilmez) ───

HARD_BLOCKS=(
  'rm\s+-rf\s+/'
  'rm\s+-rf\s+\*'
  'git\s+push\s+--force\s+origin\s+(main|master)'
  'git\s+reset\s+--hard\s+origin/'
  'chmod\s+777'
  'curl.*\|\s*(bash|sh|zsh)'
  'wget.*\|\s*(bash|sh|zsh)'
  '>\s*/etc/'
  'mkfs\.'
  'dd\s+if=.*of=/dev/'
  'cat\s+.*\.(env|pem|key|secret).*\|\s*(curl|nc|wget)'
  'echo\s+.*\$(.*password|.*secret|.*token|.*key).*\|\s*(curl|nc|wget)'
)

for pattern in "${HARD_BLOCKS[@]}"; do
  if echo "$COMMAND" | grep -qEi "$pattern"; then
    log_incident "CRITICAL" "ENGELLENDI: $COMMAND"
    echo '{"decision":"block","reason":"Tehlikeli komut engellendi. Bu islem sisteme zarar verebilir."}'
    exit 0
  fi
done

# ─── YUMUSAK ENGELLER (uyari ile engel) ───

SOFT_BLOCKS=(
  'rm\s+.*-[rR].*-[fF]'
  'rm\s+.*-[fF].*-[rR]'
  'rm\s+-rf\s+'
  'git\s+push\s+--force'
  'git\s+reset\s+--hard'
  'git\s+clean\s+-fd'
  '>\s*/usr/'
  '>\s*/opt/'
  'sudo\s+rm'
  'sudo\s+chmod'
  'sudo\s+chown'
  'npx\s+.*--yes.*rm'
)

for pattern in "${SOFT_BLOCKS[@]}"; do
  if echo "$COMMAND" | grep -qEi "$pattern"; then
    log_incident "WARN" "YUMUSAK ENGEL: $COMMAND"
    echo '{"decision":"block","reason":"Bu komut potansiyel olarak tehlikeli. Daha guvenli bir alternatif kullanin."}'
    exit 0
  fi
done

# ─── KAYIT UYARILARI (engellenmez ama kaydedilir) ───

LOG_WARNINGS=(
  '^rm\s+'
  '^mv\s+'
  'git\s+checkout\s+--'
  'git\s+stash\s+drop'
  'chmod\s+'
  'chown\s+'
  'npm\s+publish'
)

for pattern in "${LOG_WARNINGS[@]}"; do
  if echo "$COMMAND" | grep -qEi "$pattern"; then
    log_incident "INFO" "KAYIT: $COMMAND"
    break
  fi
done

# Proje disi yazma tespiti
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
if echo "$COMMAND" | grep -qE '>\s*/' | grep -qvE ">\s*$PROJECT_ROOT"; then
  log_incident "WARN" "PROJE DISI YAZMA: $COMMAND"
fi

exit 0
