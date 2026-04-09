#!/usr/bin/env bash
set -euo pipefail

# Badi - Bagimlilik Denetimi (SessionStart - New)
# Oturum basinda guvenlik acigi olan bagimliliklari tespit eder.

LOG_DIR=".claude/logs"
AUDIT_FILE="$LOG_DIR/dependency-audit.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$LOG_DIR"

# Paket yoneticisini tespit et
MANAGER=""
if [ -f "package-lock.json" ] || [ -f "package.json" ]; then
  MANAGER="npm"
elif [ -f "yarn.lock" ]; then
  MANAGER="yarn"
elif [ -f "pnpm-lock.yaml" ]; then
  MANAGER="pnpm"
elif [ -f "bun.lockb" ] || [ -f "bun.lock" ]; then
  MANAGER="bun"
fi

if [ -z "$MANAGER" ]; then
  exit 0
fi

# Denetim calistir
AUDIT_OUTPUT=""
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
    # pnpm ve bun icin sessizce cik
    exit 0
    ;;
esac

# Sonuclari kaydet
echo "- \`$TIMESTAMP\` | $MANAGER | Kritik: $CRITICAL | Yuksek: $HIGH" >> "$AUDIT_FILE"

# Kritik acik varsa uyar
if [ "$CRITICAL" -gt 0 ]; then
  cat << EOF
UYARI: $CRITICAL kritik guvenlik acigi tespit edildi!
Detaylar icin: $MANAGER audit
Duzeltmek icin: $MANAGER audit fix
EOF
  echo "- \`$TIMESTAMP\` | DEPENDENCY-AUDIT | CRITICAL | $CRITICAL kritik guvenlik acigi" >> "$LOG_DIR/incident-log.md"
elif [ "$HIGH" -gt 0 ]; then
  cat << EOF
Bilgi: $HIGH yuksek oncelikli guvenlik acigi mevcut.
Detaylar icin: $MANAGER audit
EOF
fi

exit 0
