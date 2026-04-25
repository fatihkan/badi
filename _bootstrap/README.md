# Bootstrap kits

This directory holds bootstrap files for repositories adjacent to `@fatihkan/badi`
that aren't part of the published npm package but are useful to ship alongside
the source.

## badi-skills

`_bootstrap/badi-skills/` — bare repo skeleton for the
[agentskills.io](https://agentskills.io)-compatible skill bundle that
`badi publish --skill-bundle` writes to. Contains:

- `LICENSE` (MIT)
- `README.md` (install instructions for skills CLI / Claude Code / Cursor / Codex)
- `CLAUDE.md` (Claude Code rule file pointing to `skills/badi/SKILL.md`)
- `AGENTS.md` (agents.md convention for OpenAI Codex)
- `.claude-plugin/plugin.json` + `.cursor-plugin/manifest.json` (harness manifests)
- `.github/workflows/validate.yml` (CI: pulls schema from `fatihkan/badi`'s
  `lib/skills/schema.js` and validates every SKILL.md)
- `.gitignore`

### Initial setup (one-time)

```bash
# 1. Create the new repo on GitHub
gh repo create fatihkan/badi-skills --public --description \
  "Portable skill collection from Badi — agentskills.io-compatible"

# 2. Push the bootstrap files
cd _bootstrap/badi-skills
git init
git add .
git commit -m "chore: initial bootstrap from fatihkan/badi"
git remote add origin git@github.com:fatihkan/badi-skills.git
git push -u origin main

# 3. Generate the actual skills bundle
cd ../..
badi publish --skill-bundle --target /tmp/badi-skills-build

# 4. Copy bundle into the new repo
cp -R /tmp/badi-skills-build/skills _bootstrap/badi-skills/skills
cd _bootstrap/badi-skills
git add skills
git commit -m "feat: initial skill bundle (1.0.0)"
git tag v1.0.0
git push --follow-tags
```

After setup, regenerating skills only needs steps 3–4.
