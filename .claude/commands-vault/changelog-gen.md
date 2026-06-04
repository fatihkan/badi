CHANGELOG.md update command. Generates a changelog from git history grouped by conventional commit types.

# Required Tools
- Bash (badi changelog command invocation)
- git

# Procedure

### Step 1: Find the Latest Tag
```bash
git describe --tags --abbrev=0
```

### Step 2: Decide the Version Number

Ask the user for the new version:
- If there are breaking changes: major (2.0.0)
- If there are new features (feat): minor (1.5.0)
- If only fixes: patch (1.4.3)

### Step 3: Generate the Changelog with the Badi CLI

Preview (does not write):
```bash
badi changelog                              # From the latest tag to HEAD
badi changelog --from v1.0.0                # From a specific tag
badi changelog --from v1.0.0 --to v2.0.0    # Between two
```

Write to CHANGELOG.md:
```bash
badi changelog --write --version 1.5.0
```

### Step 4: Manual Touch-up

After auto-generating:
- Edit for reader clarity where needed
- Surface the breaking changes to the top
- Drop commit hashes (meaningless to users)
- Reorder the categories (Added -> Fixed -> Other)

### Step 5: Tag + Release

Once the changelog is ready:
```bash
git add CHANGELOG.md package.json
git commit -m "chore: vX.Y.Z release"
git tag vX.Y.Z
git push origin main --tags
gh release create vX.Y.Z --title "vX.Y.Z - Title" --notes-file RELEASE_NOTES.md
```

### Step 6: npm Publish (if applicable)

```bash
npm publish --access public
```

# Example
```
/changelog-gen              # preview
/changelog-gen 1.5.0        # write to file as v1.5.0
```
