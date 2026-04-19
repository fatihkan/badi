.env dosyasi dogrulama. Eksik, fazla, bos ve placeholder degerleri tespit + .gitignore kontrolu.

# Gerekli Araclar
- Bash (badi dev env-check)

# Prosedur

### Adim 1: Kontrol
```bash
badi dev env-check
```

Referans dosya tespiti: `.env.example`, `.env.template`, `.env.sample`

### Adim 2: Bulgular

**Eksik (KRITIK):**
- .env.example'da var, .env'de yok
- Kullanici eklenmeli

**Fazladan (UYARI):**
- .env'de var, .env.example'da yok
- Dokumantasyon eksik — .env.example'a ekle

**Bos deger (UYARI):**
- `KEY=` veya `KEY=""` formati
- Degeri doldur

**Placeholder (KRITIK):**
- `your_api_key`, `xxx`, `changeme`, `todo`, `<...>`
- Gercek degerlerle guncellenmemis

**gitignore (KRITIK):**
- .env dosyasi .gitignore'da yoksa ACIL ekle

### Adim 3: Yaygin Pattern

```bash
# .env.example (commit edilir, yer tutucularla)
DATABASE_URL=postgresql://user:password@localhost/dbname
API_KEY=your_api_key_here
NODE_ENV=development

# .env (commit edilmez, gercek degerlerle)
DATABASE_URL=postgresql://prod_user:real_password@prod.host/prod_db
API_KEY=sk-abc123...
NODE_ENV=production
```

### Adim 4: Otomasyon

Pre-commit hook:
```bash
#!/bin/sh
badi dev env-check || exit 1
```

CI pipeline:
```yaml
- name: Validate .env
  run: badi dev env-check
```

### Adim 5: Secret Scanner ile Birlestir

Kapsamli guvenlik:
```bash
badi dev env-check     # .env dogrulama
badi secret-scan       # Kod icinde sir tarama
```

# Ornek

```
/env-check
```
