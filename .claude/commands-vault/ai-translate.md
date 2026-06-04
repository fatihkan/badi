Markdown file translation. Technical/content translation via the Claude API (without breaking markdown structure).

# Required Tools
- Bash (badi ai translate)

# Prerequisite

ANTHROPIC_API_KEY required.

# Procedure

### Step 1: Source File
A markdown file path (example: `docs/guide.md`, `blog/post-tr.md`).

### Step 2: Translate
```bash
badi ai translate [file.md]                  # Default EN
badi ai translate [file.md] --to en          # English
badi ai translate [file.md] --to de          # German
badi ai translate [file.md] --to fr          # French
badi ai translate [file.md] --to es          # Spanish
```

### Step 3: Output

A new file next to the source with a `-[lang]` suffix:
- `guide.md` -> `guide-en.md`

### Step 4: Use Cases

- **Content marketing**: TR post -> EN, EN post -> TR
- **Technical docs**: README.md -> README-en.md
- **App Store**: release-notes-tr.md -> release-notes-en.md
- **Blog**: multi-language support

### Step 5: Markdown Preservation

The AI preserves:
- Code blocks (```...```)
- Link structure
- Heading hierarchy (##, ###)
- List formatting
- Hashtags (localized)

### Step 6: Relationship to the Content Engine

The content engine (`badi content ...`) produces English-only output (v1.32+).
To publish in another language, generate first and then translate the file
with `ai translate`.

# Cost

- ~5K chars of content: ~$0.003-0.005 per translation

# Example

```
/ai-translate blog/post-tr.md --to en
/ai-translate docs/guide.md --to de
```
