#!/usr/bin/env bash
set -euo pipefail

# Badi - Oturum Sifirlama (SessionStart - New)
# Yeni oturum baslatildiginda durum temizligi ve butunluk kontrolu yapar.

LOG_DIR=".claude/logs"
HOOKS_DIR=".claude/hooks"
AGENTS_DIR=".claude/agents"

mkdir -p "$LOG_DIR" ".claude/agent-memory" ".claude/backups" ".claude/skills" ".claude/workspace" ".claude/plugins"

# ─── Eski oturum kalintilarini temizle ───

rm -f "$HOOKS_DIR/__counter" 2>/dev/null || true
rm -f "$HOOKS_DIR/quality-gate-active" 2>/dev/null || true
rm -f ".claude/.compaction-occurred" 2>/dev/null || true

# ─── Hook scriptlerini dogrula ───

if [ -d "$HOOKS_DIR" ]; then
  for hook in "$HOOKS_DIR"/*.sh; do
    [ -f "$hook" ] || continue
    if [ ! -x "$hook" ]; then
      chmod +x "$hook"
      echo "- \`$(date '+%Y-%m-%d %H:%M:%S')\` | SESSION-RESET | INFO | Hook izni duzeltildi: $(basename "$hook")" >> "$LOG_DIR/incident-log.md"
    fi
  done
fi

# ─── Agent tanimlarini dogrula ───

if [ -d "$AGENTS_DIR" ]; then
  for agent in "$AGENTS_DIR"/*.md; do
    [ -f "$agent" ] || continue
    if ! head -1 "$agent" | grep -q "^---"; then
      echo "- \`$(date '+%Y-%m-%d %H:%M:%S')\` | SESSION-RESET | WARN | Agent frontmatter eksik: $(basename "$agent")" >> "$LOG_DIR/incident-log.md"
    fi
  done
fi

# ─── Denetim izini boyut kontrolu ───

AUDIT_TRAIL="$LOG_DIR/audit-trail.md"
if [ -f "$AUDIT_TRAIL" ]; then
  LINE_COUNT=$(wc -l < "$AUDIT_TRAIL")
  if [ "$LINE_COUNT" -gt 5000 ]; then
    # Son 2000 satiri koru
    tail -2000 "$AUDIT_TRAIL" > "$AUDIT_TRAIL.tmp"
    mv "$AUDIT_TRAIL.tmp" "$AUDIT_TRAIL"
    echo "- \`$(date '+%Y-%m-%d %H:%M:%S')\` | SESSION-RESET | INFO | Denetim izi budandi: $LINE_COUNT -> 2000 satir" >> "$LOG_DIR/incident-log.md"
  fi
fi

exit 0
