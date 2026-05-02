#!/usr/bin/env bash
set -euo pipefail

# Badi - UserPromptSubmit Auto-Router
#
# Kullanicinin yazdigi prompt'u okur, vault'taki SKILL.md aciklamalarina karsi
# keyword match yapar, eslesen skill'lerin SKILL.md govdesini context olarak
# Claude'a verir. Filesystem'e yazma yok — per-turn injection.
#
# Aktif etmek icin: badi skills auto on
# Kapatmak icin:    badi skills auto off

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty' 2>/dev/null || echo "")

if [ -z "$PROMPT" ]; then
  exit 0
fi

# Cok kisa prompt'lari atla (ornek: tek kelimelik komutlar)
WORDS=$(echo "$PROMPT" | wc -w | tr -d ' ')
if [ "$WORDS" -lt 3 ]; then
  exit 0
fi

# badi binary'sini bul (npm-link, npm-global, npx fallback)
if command -v badi >/dev/null 2>&1; then
  BADI="badi"
elif [ -f "node_modules/.bin/badi" ]; then
  BADI="node_modules/.bin/badi"
else
  exit 0
fi

# Vault yoksa cikma
if [ ! -d ".claude/skills-vault" ]; then
  exit 0
fi

# Match'lenen skill'lerin govdesini al (top 3, esik 2)
INJECTION=$($BADI skills route --inject --top 3 "$PROMPT" 2>/dev/null || echo "")

if [ -z "$INJECTION" ]; then
  exit 0
fi

# UserPromptSubmit hook output: additionalContext olarak inject
jq -n --arg ctx "$INJECTION" '{
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext: $ctx
  }
}'
