Conventional commit yardimi komutu. Staged dosyalari okur, uygun tip/scope/mesaj onerir, dogrulama yapar.

# Gerekli Araclar
- Bash (badi commit komutu cagirisi)
- git

# Prosedur

### Adim 1: Staged Degisiklikleri Oku
```bash
git diff --cached --stat
git diff --cached | head -100
```

### Adim 2: Tip Secimi

Degisiklige gore:
- **feat**: Yeni kullanici ozelligi eklendiyse
- **fix**: Mevcut bir hata duzeltildiyse
- **refactor**: Davranis degismedi, iskelelim (rename, extract)
- **perf**: Performans iyilestirmesi olcumlu
- **docs**: Sadece markdown/yorum degisikligi
- **test**: Sadece test dosyalari
- **chore**: Bakim, config, bagimlilik
- **ci**: `.github/workflows` vb
- **build**: Build sistemi (webpack, tsconfig vb)

### Adim 3: Scope Belirle (opsiyonel)

Etkilenen alan: `auth`, `api`, `ui`, `db`, `config`, modul adi vb.

### Adim 4: Kisa Mesaj Yaz

Kurallar:
- Emir kipi, kucuk harf ile basla
- Nokta koyma
- < 100 karakter (< 70 tercih)
- WHY > WHAT (commit gecmisi okunabilir olmali)

### Adim 5: Badi CLI Ile Kontrol + Commit

```bash
# Sadece rehberlik
badi commit

# Conventional format dogrulamasi + commit
badi commit --message "feat(auth): JWT refresh token eklendi"

# Son commit lint kontrolu
badi commit --check
```

### Adim 6: Body ve Footer (opsiyonel)

Karmasik degisiklikler icin:
```
feat(auth): JWT refresh token eklendi

15 dakikalik expire yerine 1h + refresh paterni.
Mobile clientlar icin offline kullanim destegi.

Closes #123
BREAKING CHANGE: access_token yerine tokens.access kullanilmali
```

# Ornek
```
/conv-commit
```
