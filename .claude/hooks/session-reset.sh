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

# ─── Log dosyalari boyut kontrolu ve rotasyon ───

truncate_log() {
  local file="$1"
  local max_lines="$2"
  local keep_lines="$3"
  if [ -f "$file" ]; then
    local line_count
    line_count=$(wc -l < "$file")
    if [ "$line_count" -gt "$max_lines" ]; then
      tail -"$keep_lines" "$file" > "$file.tmp"
      mv "$file.tmp" "$file"
      echo "- \`$(date '+%Y-%m-%d %H:%M:%S')\` | SESSION-RESET | INFO | Log budandi: $(basename "$file") $line_count -> $keep_lines satir" >> "$LOG_DIR/incident-log.md"
    fi
  fi
}

truncate_log "$LOG_DIR/audit-trail.md" 5000 2000
truncate_log "$LOG_DIR/usage.jsonl" 1000 500
truncate_log "$LOG_DIR/incident-log.md" 500 250
truncate_log "$LOG_DIR/failure-log.md" 500 250

# ─── Eski yedekleri temizle (son 50 tut) ───

BACKUP_DIR=".claude/backups"
if [ -d "$BACKUP_DIR" ]; then
  BACKUP_COUNT=$(find "$BACKUP_DIR" -type f | wc -l)
  if [ "$BACKUP_COUNT" -gt 50 ]; then
    find "$BACKUP_DIR" -type f -exec stat -f '%m %N' {} \; 2>/dev/null | sort -n | head -n "$((BACKUP_COUNT - 50))" | cut -d' ' -f2- | xargs rm -f 2>/dev/null || true
  fi
fi

exit 0
