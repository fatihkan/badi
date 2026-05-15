Staged git diff icin Claude API ile AI kod review.

# Gerekli Araclar
- Bash (badi ai review)

# On Kosul

ANTHROPIC_API_KEY ortam degiskeni tanimli olmali:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```
Kayit: https://console.anthropic.com/settings/keys

# Prosedur

### Adim 1: Degisiklikleri Stage Et
```bash
git add [dosyalar]
```

### Adim 2: AI Review
```bash
badi ai review
```

Claude Haiku 4.5 modeli ile staged diff incelenir. ~1-3 saniye suren hizli cevir.

### Adim 3: Yorumla

Bulgular 5 kategoride:
1. **KRITIK guvenlik** — hemen duzelt
2. **Bug potansiyeli** — test kapsami kontrol
3. **Performans** — hotpath degisiklikleri
4. **Kod kalitesi** — DRY, naming, complexity
5. **Olumlu gozlemler** — iyi yapilmis seyler

### Adim 4: Aksiyon

- Kritik bulgu: Commit etme, once duzelt
- Yuksek: Inceleme notu ekle, ayri commit
- Orta/Dusuk: TODO/issue olustur

### Adim 5: Takip

Her commit oncesi kullanmak icin git hook:
```bash
# .git/hooks/pre-commit
badi ai review || exit 1
```

# Maliyet

- Haiku 4.5: ~$0.25 / 1M input, ~$1.25 / 1M output
- Ortalama review: 2-3K input, 500-1000 output tokens
- **Yaklasik maliyet: $0.001 per review**

# Ornek

```
git add src/auth.js
/ai-review
```
