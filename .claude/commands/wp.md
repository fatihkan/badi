WordPress site management command. Site status, plugin/theme management, security scan, and bulk updates.

# Required Tools
- Bash (badi wp commands)

# Procedure

### Step 1: Check the Site Registry
```bash
badi wp list
```
If the user has registered sites, show them; otherwise suggest adding one:
```bash
badi wp add [alias] [url] --method [wp-cli|rest]
```

### Step 2: Site Status
```bash
badi wp status [alias]
```
Shows:
- WordPress version
- Active theme
- Plugin count + pending updates
- Core update status

### Step 3: Detailed Review (optional)

```bash
badi wp plugins [alias]       # Plugin list
badi wp themes [alias]        # Theme list
```

### Step 4: Security Scan
```bash
badi wp security [alias]
```
6-point check:
- WP Core freshness
- Plugin updates
- Inactive plugins (removable)
- Is WP_DEBUG off
- Is DISALLOW_FILE_EDIT defined
- The `admin` user and the admin count

### Step 5: Bulk Update (Careful!)
```bash
badi wp update [alias] all                  # Core + plugins + themes (120s timeout)
badi wp update [alias] core                 # Core only
badi wp update [alias] plugins              # Plugins only
badi wp update [alias] themes               # Themes only
badi wp update [alias] [plugin-name]        # A specific plugin
```

**Test on staging; take a backup for production.**

### Step 6: Follow-up Actions

If security issues exist:
- `/secret-scan` — also search for secrets on the app side
- `/ssl-check [domain]` — SSL state
- `/dns-audit [domain]` — Email security

# Connection Methods

| Method | Scenario |
|--------|----------|
| `--method wp-cli --path /var/www/` | Local WordPress install |
| `--method wp-cli --ssh user@host` | SSH + remote WP-CLI |
| `--method rest` | REST API (limited with an interactive password) |

For an application password: WP Admin → Users → Profile → Application Passwords

# Example Usage

```
User: /wp
Assistant: Your registered WP sites: [list]
         Which one shall we work on?

User: blog
Assistant: [runs badi wp status blog]
         [Interprets the results, suggests a security scan]
```
