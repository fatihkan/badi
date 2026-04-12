#!/usr/bin/env bash
set -euo pipefail

# Badi - Bagimlilik Denetimi (SessionStart - New)
# 24 saat cache ile oturum basinda guvenlik taramasi.

LOG_DIR=".claude/logs"
AUDIT_FILE="$LOG_DIR/dependency-audit.md"
CACHE_DIR="${HOME}/.config/badi"
CACHE_FILE="$CACHE_DIR/dep-audit-cache.json"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$LOG_DIR" "$CACHE_DIR"

# Paket yoneticisini tespit et
MANAGER=""
LOCK_FILE=""
if [ -f "package-lock.json" ]; then
  MANAGER="npm"
  LOCK_FILE="package-lock.json"
elif [ -f "yarn.lock" ]; then
  MANAGER="yarn"
  LOCK_FILE="yarn.lock"
elif [ -f "pnpm-lock.yaml" ]; then
  MANAGER="pnpm"
  LOCK_FILE="pnpm-lock.yaml"
else
  exit 0
fi

# ─── Cache kontrolu (24 saat + lock dosyasi hash) ───

LOCK_HASH=""
if [ -f "$LOCK_FILE" ]; then
  LOCK_HASH=$(md5 -q "$LOCK_FILE" 2>/dev/null || md5sum "$LOCK_FILE" 2>/dev/null | cut -d' ' -f1 || echo "unknown")
fi

if [ -f "$CACHE_FILE" ]; then
  CACHED_TIME=$(jq -r '.lastCheck // ""' "$CACHE_FILE" 2>/dev/null || echo "")
  CACHED_HASH=$(jq -r '.lockHash // ""' "$CACHE_FILE" 2>/dev/null || echo "")

  if [ -n "$CACHED_TIME" ] && [ "$CACHED_HASH" = "$LOCK_HASH" ]; then
    # Hash ayni — 24 saat icinde tekrar tarama
    CACHED_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${CACHED_TIME%Z}" "+%s" 2>/dev/null || date -d "$CACHED_TIME" "+%s" 2>/dev/null || echo "0")
    NOW_EPOCH=$(date "+%s")
    DIFF=$((NOW_EPOCH - CACHED_EPOCH))
    if [ "$DIFF" -lt 86400 ]; then
      # Cache gecerli, atla
      exit 0
    fi
  fi
fi

# ─── Denetim calistir ───

CRITICAL=0
HIGH=0

case "$MANAGER" in
  npm)
    AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || echo '{}')
    CRITICAL=$(echo "$AUDIT_OUTPUT" | jq '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
    HIGH=$(echo "$AUDIT_OUTPUT" | jq '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
    ;;
  yarn)
    AUDIT_OUTPUT=$(yarn audit --json 2>/dev/null | tail -1 || echo '{}')
    CRITICAL=$(echo "$AUDIT_OUTPUT" | jq '.data.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
    HIGH=$(echo "$AUDIT_OUTPUT" | jq '.data.vulnerabilities.high // 0' 2>/dev/null || echo "0")
    ;;
  *)
    exit 0
    ;;
esac

# ─── Cache kaydet ───

cat > "$CACHE_FILE" << CEOF
{"lastCheck":"$(date -u '+%Y-%m-%dT%H:%M:%SZ')","lockHash":"$LOCK_HASH","critical":$CRITICAL,"high":$HIGH,"manager":"$MANAGER"}
CEOF

# Sonuclari kaydet
echo "- \`$TIMESTAMP\` | $MANAGER | Kritik: $CRITICAL | Yuksek: $HIGH" >> "$AUDIT_FILE"

# Kritik acik varsa uyar
if [ "$CRITICAL" -gt 0 ]; then
  echo "UYARI: $CRITICAL kritik guvenlik acigi! Duzelt: $MANAGER audit fix"
  echo "- \`$TIMESTAMP\` | DEPENDENCY-AUDIT | CRITICAL | $CRITICAL kritik guvenlik acigi" >> "$LOG_DIR/incident-log.md"
elif [ "$HIGH" -gt 0 ]; then
  echo "Bilgi: $HIGH yuksek oncelikli guvenlik acigi. Detay: $MANAGER audit"
fi

exit 0
