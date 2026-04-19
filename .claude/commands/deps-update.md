Guvenli bagimlilik guncelleme analizi. Patch/minor/major kategorizasyonu, opsiyonel otomatik patch uygulama.

# Gerekli Araclar
- Bash (badi dev deps)

# Prosedur

### Adim 1: Tarama
```bash
badi dev deps
```

Paket yoneticisi (npm/yarn/pnpm) otomatik tespit edilir.

### Adim 2: Kategoriler

Her guncelleme su kategorilerde:
- **Patch** (1.2.X) — Guvenli, auto-apply edilebilir
- **Minor** (1.X.0) — Yeni ozellik, test gerekli
- **Major** (X.0.0) — Break change potansiyeli, manuel inceleme

### Adim 3: Patch Otomatik Uygula
```bash
badi dev deps --apply-patch
```

Sadece patch seviyesini uygular (en guvenli).

### Adim 4: Minor/Major Strateji

**Minor:**
```bash
npm update [paket]
npm test
```

**Major:**
1. Changelog oku (npmjs.com/package/X)
2. Break change notlari kontrol
3. Tek tek guncelle: `npm install paket@latest`
4. Tam test suite

### Adim 5: Guvenlik Onceligi

Kritik CVE varsa:
```bash
npm audit
npm audit fix              # Patch + minor auto
npm audit fix --force      # Major dahil (riskli)
```

### Adim 6: Haftalik Rutin

```bash
# Pazartesi sabahi
badi dev deps
badi dev deps --apply-patch   # Patch'leri uygula
npm test                       # Testler gecti mi
git add package-lock.json
git commit -m "chore(deps): patch updates"
```

# Ornek

```
/deps-update
/deps-update --apply
```
