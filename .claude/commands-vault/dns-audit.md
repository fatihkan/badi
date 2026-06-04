DNS record audit command. Checks A/AAAA/MX/TXT/SPF/DMARC/CAA records and scores email security.

# Required Tools
- Bash (badi dns command invocation)

# Procedure

### Step 1: Get the Domain
Take the domain from the user. If invoked without an argument, ask for it.

### Step 2: Run the Badi CLI
```bash
badi dns [domain]
```

### Step 3: Interpret the Result

The output covers:
- **A/AAAA**: IPv4/IPv6 records
- **MX**: Mail servers (by priority)
- **NS**: Name servers
- **TXT/SPF/DMARC**: Email security
- **CAA**: Cert authority restriction
- **SOA**: Zone authority info

### Step 4: Email Security Suggestions

Based on missing records:
- **No SPF**: "Shall we add an SPF record? Example: `v=spf1 include:_spf.google.com ~all`"
- **No DMARC**: "I suggest a DMARC policy: `v=DMARC1; p=quarantine; rua=mailto:dmarc@...`"
- **No CAA**: "A CAA record protects against mis-issuance. For Let's Encrypt: `0 issue \"letsencrypt.org\"`"

### Step 5: Follow-up Commands

- If security gaps exist: suggest `/ssl-check [domain]`
- For WHOIS info: suggest `/whois [domain]`

# Example
```
/dns-audit example.com
```
