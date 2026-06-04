Domain WHOIS command. Checks registration date, expiry, registrar, and transfer lock status.

# Required Tools
- Bash (badi whois command invocation)

# Procedure

### Step 1: Run the Badi CLI
```bash
badi whois [domain]
```

### Step 2: Interpret the Result

Key fields:
- **Registrar**: Domain provider
- **Creation Date**: First registration
- **Expiration Date**: Renewal time
- **Domain Status**: Transfer Lock, Update Lock states
- **Name Servers**: DNS management

### Step 3: Warnings

- **Expiry < 30 days**: "Urgent renewal needed"
- **Expiry 30-90 days**: "Plan the renewal"
- **No Transfer Lock**: "Enable the lock against domain hijacking"
- **No Update Lock**: "I recommend the lock for critical domains"

### Step 4: Full Domain Health Check

Suggest the triple check to the user:
- `/whois [domain]` — already done
- `/dns-audit [domain]` — DNS and email security
- `/ssl-check [domain]` — SSL certificate

Or do it all at once: "I can run the full domain health check — want me to run all 3 commands?"

# Example
```
/whois example.com
```
