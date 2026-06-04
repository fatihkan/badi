Plugin management command. Installs, removes, and lists plugins in the Badi system.

# Required Tools
- Bash (git clone, npm install, file copy)
- Read (manifest files, current configuration)
- Write (configuration updates, file creation)
- ...

# Subcommands
This command has three subcommands:
- `install <source>` - Install a new plugin
- `remove <name>` - Remove a plugin
- `list` - List installed plugins

If the user did not specify a subcommand, ask which one they want.

---

## Subcommand: install <source>

### Step 1: Source Type Detection
- If a git URL (ends with `.git` or contains `github.com`): git source
- If an npm package name: npm source
- If a local directory path: local source
- ...

### Step 2: Download the Plugin
**For a git source:**
- `git clone [URL]` into a temporary directory
- Check the `badi-plugin.json` manifest file
- If there is no manifest, ERROR and stop

**For an npm source:**
- Download the package with `npm pack [package]`
- Extract into a temporary directory
- Check the `badi-plugin.json` manifest file

**For a local source:**
- Verify `badi-plugin.json` exists in the given directory

### Step 3: Read and Validate the Manifest
Read and validate `badi-plugin.json`:
```
[abridged]
```
Required fields: `name`, `version`
ERROR and stop on an invalid manifest.

### Step 4: Conflict Check
- Check whether a plugin with the same name is installed
- Verify added commands do not collide with existing commands
- Check agent name collisions
- ...

### Step 5: Copy the Files
- Create the `.claude/plugins/[plugin-name]/` directory
- Copy the manifest file
- Copy agent files under `.claude/agents/`
- ...

### Step 6: Index Update
- Add the new commands to `command-index.md` with a `[Plugin]` tag
- Example format: `| /plugin-command | Description [Plugin: plugin-name] |`
- Add new hook references to settings.json (if needed)

### Step 7: Install Verification
- Verify all files copied successfully
- Suggest running `/doctor`
- Show an install summary

---

## Subcommand: remove <name>

### Step 8: Plugin Detection
- Verify the `.claude/plugins/[name]/` directory exists
- Read the `badi-plugin.json` manifest
- ERROR if the plugin does not exist

### Step 9: Determine Files to Remove
- From the manifest, identify which files the plugin added
- PROTECT files shared with other plugins (do not remove)
- Show the user the removal list and ask for confirmation

### Step 10: Remove the Files
- Delete the plugin agent files
- Delete the plugin command files
- Delete the plugin skill files
- ...

### Step 11: Removal Verification
- Verify all files were deleted successfully
- Check no broken references remain
- Show a removal summary

---

## Subcommand: list

### Step 12: Scan Installed Plugins
- Scan the `.claude/plugins/` directory
- Read `badi-plugin.json` in each subdirectory

### Step 13: Build the Plugin List
```
[abridged]
```

### Step 14: When There Are No Plugins
- Inform the user if `.claude/plugins/` is missing or empty
- Show an install example:
  ```
  /plugin install https://github.com/user/badi-plugin-example.git
  /plugin install badi-plugin-example
  ```
