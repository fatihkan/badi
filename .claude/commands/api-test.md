HTTP API endpoint testing. Send GET/POST/PUT/DELETE requests, analyze status + response, assertions.

# Required Tools
- Bash (badi dev api-test)

# Procedure

### Step 1: Simple GET
```bash
badi dev api-test https://api.example.com/users
```

### Step 2: Advanced Usage

```bash
# POST with a body
badi dev api-test https://api.example.com/users \
  --method POST \
  --body '{"name":"Ali","email":"a@b.com"}'

# Auth header
badi dev api-test https://api.example.com/me \
  --header "Authorization: Bearer $TOKEN"

# Status assertion
badi dev api-test https://api.example.com/health \
  --expect 200

# Multiple headers
badi dev api-test https://api.example.com/data \
  --header "Authorization: Bearer X" \
  --header "X-Custom: Y"
```

### Step 3: Output

- **Status + Duration** (ms)
- **Size** (KB)
- **Content-Type**
- **All response headers**
- **Body** (JSON pretty print or text)
- **Assertion result** (if --expect was used)

### Step 4: Usage Scenarios

**Health check:**
```bash
badi dev api-test https://app.com/health --expect 200
```

**New endpoint test:**
```bash
badi dev api-test http://localhost:3000/api/users/1
```

**Production smoke test:**
```bash
for endpoint in /health /api/v1/status /api/v1/metrics; do
  badi dev api-test https://app.com$endpoint --expect 200 || exit 1
done
```

**Auth flow test:**
```bash
# Login
badi dev api-test https://api.com/login --method POST --body '{"u":"x","p":"y"}'
# Take the token, use it
badi dev api-test https://api.com/me --header "Authorization: Bearer $TOKEN"
```

### Step 5: CI Integration

```yaml
- name: API Smoke Test
  run: |
    badi dev api-test ${{ env.API_URL }}/health --expect 200
    badi dev api-test ${{ env.API_URL }}/api/v1/version --expect 200
```

# Example

```
/api-test https://api.github.com/users/octocat --expect 200
```
