App Store Optimization command. iOS app listing analysis via the iTunes API, keyword optimization, and competitor comparison.

# Gerekli Araclar
- Bash (badi aso komutlari)

# Prosedur

### Adim 1: Hedef Belirle

Kullaniciya sor: "Ne analiz etmek istiyorsunuz?"
- **Kendi app'iniz** — Audit + keyword + review
- **Rakip karsilastirma** — 2 app side-by-side
- **Keyword arastirma** — Pazar kesif
- **Yeni app metadata** — Listing hazirlama

App ID gerekli: `https://apps.apple.com/app/id[APP_ID]` URL'sinden al.

### Adim 2: Temel ASO Audit

```bash
badi aso audit [app-id]
```

Olculen metrikler:
- Title/Subtitle uzunlugu (30/30 karakter limit)
- Description uzunlugu (500+ onerilir)
- Screenshot sayisi (>= 3 zorunlu, >= 6 ideal)
- Supported languages
- Rating count (>= 100 onerilir, >= 4.0 skor)

ASO skoru 0-100 arasi verilir.

### Adim 3: Keyword Analizi

```bash
badi aso keywords [app-id]
```

Gosterir:
- Title keyword'leri
- Subtitle keyword'leri
- Description top 20 keyword
- Frekans bazli siralama

### Adim 4: Rakip Karsilastirma

```bash
badi aso compete [benim-app-id] [rakip-app-id]
```

Yan yana:
- Metadata uzunluklari
- Rating + count
- Screenshot sayisi
- Language count
- Ortak + farkli keywordler (rakipten ogrenmek icin)

### Adim 5: Metadata Limit Rehberi

```bash
badi aso metadata appstore      # iOS karakter limitleri
badi aso metadata playstore     # Android karakter limitleri
```

### Adim 6: Review Yaniti

```bash
badi aso review [app-id]
```
Pozitif/negatif/feature response sablonlari.

### Adim 7: Screenshot Rehberi

```bash
badi aso screenshots
```
iOS 4 zorunlu + 3 opsiyonel boyut, Android 4 kategori.

### Adim 8: Pazar Arastirma

```bash
badi aso search "sorgu" --country tr
```
Rakipleri kesfet, trending app'leri gor.

### Adim 9: Icerik Uretimi Entegrasyonu

Launch icin:
```bash
badi content post "yeni urun lansman" --platform appstore
badi content release-notes --platform ios --version X.Y.Z --lang tr,en
badi content visual "app store screenshot"
```

### Adim 10: Detayli Strateji

Claude Code'da derin analiz icin ajanlari cagir:
- `aso-master` — Full strategy
- `aso-research` — Market research
- `aso-optimizer` — Metadata optimization
- `aso-strategist` — Growth planning

# Ornek Kullanim

```
/aso 284882215              # Facebook app analizi
/aso compete 284882215 310633997   # Facebook vs WhatsApp
/aso search "task manager" --country tr
```
