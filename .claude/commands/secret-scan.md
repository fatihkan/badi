Proje genelinde sir/credential taramasi komutu. AWS/GCP/GitHub/npm/Stripe/OpenAI/Anthropic anahtarlari, JWT, database URI'leri, private key'ler.

> **Daha genis kapsam icin**: `badi security baseline` (secret-scan + npm audit), `/security-review` (Anthropic native AI semantic — Claude Code 2.1.140+).

# Gerekli Araclar
- Bash (badi secret-scan komutu cagirisi)

# Prosedur

### Adim 1: Kapsam Belirle

Kullaniciya sor:
- Sadece working tree mi? (hizli)
- Git history de dahil mi? (default 100 commit; --max-commits ile arttirilabilir)
- CI/pipeline icin mi? (--exit-code strict + --format json)

### Adim 2: Tarama Calistir

```bash
badi secret-scan                                       # Working tree
badi secret-scan --git                                 # + git history
badi secret-scan --format json                         # JSON cikti
badi secret-scan --exit-code strict                    # her bulguda exit 1
badi secret-scan --max-commits 500 --git               # daha derin tarihce
badi secret-scan --ignore jwt,github-pat-fine          # belirli pattern'leri yoksay
badi secret-scan --ignore-file .secretignore           # dosyadan oku
badi secret-scan --patterns custom-org-patterns.json   # ek pattern yukle
```

**CI cikis kodlari:**
- `0`  Bulgu yok (veya `--exit-code never`; veya yalniz ORTA/DUSUK varsayilanda)
- `1`  KRITIK veya YUKSEK bulgu

**Kapsam disi:** symlink'ler atlanir; `git stash`/`reflog`/packed-refs taranmaz.

### Adim 3: Sonuclari Yorumla

Severity bazli:
- **KRITIK**: AWS Access/Secret, GCP, GitHub PAT (classic + fine-grained), Slack, Stripe, OpenAI, Anthropic, RSA/EC private keys
- **YUKSEK**: npm token, SendGrid, Twilio, MongoDB/Postgres URI
- **ORTA**: JWT token
- **DUSUK**: Generic secret variable'lar (false positive riski yuksek — `--ignore generic-secret` yararli)

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
