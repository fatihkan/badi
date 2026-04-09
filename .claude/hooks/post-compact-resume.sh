#!/usr/bin/env bash
set -euo pipefail

# Badi - Sikistirma Sonrasi Devam (SessionStart - Resumed)
# Sikistirma sonrasi baglami geri yukler.

MARKER=".claude/.compaction-occurred"

# Sikistirma olmadiysa sessizce cik
if [ ! -f "$MARKER" ]; then
  exit 0
fi

# Zamanlama bilgisini oku
COMPACT_TIME=$(cat "$MARKER" 2>/dev/null || echo "bilinmiyor")

# Oturum sayaclrini sifirla
rm -f ".claude/hooks/__counter" 2>/dev/null || true
rm -f ".claude/hooks/quality-gate-active" 2>/dev/null || true

# Isaretci dosyasini temizle
rm -f "$MARKER" 2>/dev/null || true

# Claude'a devam talimatlari ver
cat << EOF
Sikistirma sonrasi devam ($COMPACT_TIME).

Baglami yeniden yuklemek icin:
1. .claude/memory.md dosyasini oku
2. En son Gunluk Notu oku
3. Devam eden gorev uzerinde calismaya devam et

Oncelik: Yarida kalan islemleri tamamla.
EOF

exit 0
