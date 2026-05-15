Proje genelinde sir/credential taramasi komutu. AWS/GCP/GitHub/npm/Stripe/OpenAI anahtarlari, JWT, database URI'leri, private key'ler.

# Gerekli Araclar
- Bash (badi secret-scan komutu cagirisi)

# Prosedur

### Adim 1: Kapsam Belirle

Kullaniciya sor:
- Sadece working tree mi? (hizli)
- Git history de dahil mi? (100 son commit, yavas)

### Adim 2: Tarama Calistir

```bash
badi secret-scan                    # Working tree
badi secret-scan --git              # + git history
badi secret-scan --format json      # JSON cikti
```

### Adim 3: Sonuclari Yorumla

Severity bazli:
- **KRITIK**: AWS, GCP, GitHub PAT, Stripe, OpenAI, Anthropic, private keys
- **YUKSEK**: npm token, SendGrid, Twilio, MongoDB/Postgres URI
- **ORTA**: JWT token
- **DUSUK**: Generic secret variable'lar (false positive olabilir)

### Adim 4: Aksiyon Plani

Her finding icin:

1. **Rotate** — Siri hemen gecersiz kil (git log'da bile kalmis olabilir)
2. **Gitignore** — `.env` veya sir dosyasini `.gitignore`'a ekle
3. **Environment variables** — Sabit degerler yerine `process.env.X` kullan
4. **Git history temizlik** — `git filter-repo` veya `BFG` kullan

### Adim 5: On-gelecek Koruma

- `.gitignore` kontrol: `.env`, `.env.*`, `secrets.json`, `*.pem`
- Pre-commit hook: secret-scan otomatik calistir
- `/secret-scan --git` haftalik cronjob oneri

# Ornek
```
/secret-scan
/secret-scan --git   # git history de dahil
```
