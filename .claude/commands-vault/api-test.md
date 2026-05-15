HTTP API endpoint test. GET/POST/PUT/DELETE istek gonder, status + response analiz, assertion.

# Gerekli Araclar
- Bash (badi dev api-test)

# Prosedur

### Adim 1: Basit GET
```bash
badi dev api-test https://api.example.com/users
```

### Adim 2: Gelismis Kullanim

```bash
# POST body ile
badi dev api-test https://api.example.com/users \
  --method POST \
  --body '{"name":"Ali","email":"a@b.com"}'

# Auth header
badi dev api-test https://api.example.com/me \
  --header "Authorization: Bearer $TOKEN"

# Status assertion
badi dev api-test https://api.example.com/health \
  --expect 200

# Coklu header
badi dev api-test https://api.example.com/data \
  --header "Authorization: Bearer X" \
  --header "X-Custom: Y"
```

### Adim 3: Cikti

- **Status + Sure** (ms)
- **Boyut** (KB)
- **Content-Type**
- **Tum response headers**
- **Body** (JSON pretty print veya text)
- **Assertion sonucu** (--expect kullanildiysa)

### Adim 4: Kullanim Senaryolari

**Saglik kontrolu:**
```bash
badi dev api-test https://app.com/health --expect 200
```

**Yeni endpoint test:**
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
# Token'i al, kullan
badi dev api-test https://api.com/me --header "Authorization: Bearer $TOKEN"
```

### Adim 5: CI Entegrasyonu

```yaml
- name: API Smoke Test
  run: |
    badi dev api-test ${{ env.API_URL }}/health --expect 200
    badi dev api-test ${{ env.API_URL }}/api/v1/version --expect 200
```

# Ornek

```
/api-test https://api.github.com/users/octocat --expect 200
```
