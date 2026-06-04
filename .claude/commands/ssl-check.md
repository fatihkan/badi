SSL certificate analysis command. Checks certificate validity, TLS version, and cipher strength for a domain.

# Required Tools
- Bash (badi ssl command invocation)

# Procedure

### Step 1: Domain Check
Take the domain from the user. If invoked without an argument, ask which domain to test.

### Step 2: Run the Badi CLI
```bash
badi ssl [domain]
```

Example:
```bash
badi ssl example.com
badi ssl github.com
```

### Step 3: Interpret the Result
Points to watch while relaying the output:

- **Expiry < 30 days**: Warn the user, suggest renewal planning
- **TLS < 1.2**: Security hole, upgrade mandatory
- **Weak ciphers (RC4, 3DES, MD5)**: Suggest an update
- **SAN check**: Show the user the domain list

### Step 4: Suggest Follow-ups

Depending on the situation:
- Expiry near: "Shall we write a Let's Encrypt auto-renew script?"
- Weak ciphers: "Need an Nginx/Apache config example?"
- All OK: "Want a DNS check with `badi dns [domain]`?"

# Example Usage

```
User: /ssl-check example.com
Assistant: [runs badi ssl example.com, summarizes the output]
```
