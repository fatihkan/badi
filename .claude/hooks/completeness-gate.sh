#!/usr/bin/env bash
set -euo pipefail

# Badi - Tamamlanmislik Kapisi (PreToolUse)
# Kritik dosyalara yazma oncesi icerik dogrulamasi yapar.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null || echo "")
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null || echo "")
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty' 2>/dev/null || echo "")

if [ -z "$FILE_PATH" ] || [ -z "$CONTENT" ]; then
  exit 0
fi

# Test ve gecici dosyalari atla
case "$FILE_PATH" in
  *.test-tmp-*) exit 0 ;;
  /tmp/*) exit 0 ;;
esac

BASENAME=$(basename "$FILE_PATH")
LOG_DIR=".claude/logs"
mkdir -p "$LOG_DIR"

# ─── Gizli Bilgi Tespiti (.env haricinde) ───

if [[ "$BASENAME" != ".env"* ]]; then
  # Stripe, GitHub, AWS, generic API key kaliplari
  SECRET_PATTERNS=(
    'sk_live_[a-zA-Z0-9]+'
    'sk_test_[a-zA-Z0-9]+'
    'ghp_[a-zA-Z0-9]+'
    'gho_[a-zA-Z0-9]+'
    'AKIA[A-Z0-9]{16}'
    'xox[bpsar]-[a-zA-Z0-9-]+'
    'eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+'
  )

  for pattern in "${SECRET_PATTERNS[@]}"; do
    if echo "$CONTENT" | grep -qE "$pattern"; then
      echo '{"decision":"block","reason":"Gizli bilgi tespit edildi! API anahtari veya token icermemeli. .env dosyasini kullanin."}'
      exit 0
    fi
  done
fi

# ─── Bilgi Tabani Dogrulamasi ───

if [[ "$FILE_PATH" == *"knowledge-base.md" ]]; then
  # Kaynak etiketi kontrolu
  if echo "$CONTENT" | grep -qE '(TBD|TODO|FIXME|PLACEHOLDER|XXX)'; then
    echo '{"decision":"block","reason":"knowledge-base.md dosyasinda TBD/TODO/FIXME isaretleri olamaz. Tamamlanmis icerik girin."}'
    exit 0
  fi

  # Satir limiti (Write isleminde)
  if [ "$TOOL_NAME" = "Write" ]; then
    LINE_COUNT=$(echo "$CONTENT" | wc -l)
    if [ "$LINE_COUNT" -gt 200 ]; then
      echo "{\"decision\":\"block\",\"reason\":\"knowledge-base.md dosyasi $LINE_COUNT satir. Maksimum 200 satir olmali.\"}"
      exit 0
    fi
  fi
fi

# ─── Bellek Dosyasi Dogrulamasi ───

if [[ "$FILE_PATH" == *"memory.md" ]] && [ "$TOOL_NAME" = "Write" ]; then
  LINE_COUNT=$(echo "$CONTENT" | wc -l)
  if [ "$LINE_COUNT" -gt 100 ]; then
    echo "{\"decision\":\"block\",\"reason\":\"memory.md dosyasi $LINE_COUNT satir. Maksimum 100 satir olmali. /clear ile temizleyin.\"}"
    exit 0
  fi
fi

# ─── Settings JSON Dogrulamasi ───

if [[ "$BASENAME" == "settings.json" ]]; then
  if ! echo "$CONTENT" | jq empty 2>/dev/null; then
    echo '{"decision":"block","reason":"settings.json gecersiz JSON iceriyor. Lutfen JSON soz dizimini duzeltip tekrar deneyin."}'
    exit 0
  fi
fi

# ─── Agent Tanimlari Dogrulamasi ───

if [[ "$FILE_PATH" == *"agents/"* ]] && [[ "$FILE_PATH" == *.md ]]; then
  if echo "$CONTENT" | grep -qE '(\[TAMAMLANACAK\]|\[TODO\]|\[TBD\]|\[PLACEHOLDER\])'; then
    echo '{"decision":"block","reason":"Agent taniminda tamamlanmamis isaretler var. Icerik tamamlanmadan kayit yapilamaz."}'
    exit 0
  fi
fi

exit 0
