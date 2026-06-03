Icerik performans takip komutu. Yayinlanan iceriklerin begeni, yorum, erisim, ROI verilerini takip eder.

# Gerekli Araclar
- Bash (badi content perf)

# Prosedur

### Adim 1: Veri Ekleme

Her yayindan sonra metric'leri kaydet:

```bash
badi content perf add --file 2026-04-19-konu.md \
  --platform instagram \
  --likes 150 --comments 12 --shares 5 --saves 20 \
  --reach 2500 \
  --effort 1.5
```

Parametreler:
- `--file` — Icerik dosyasi adi
- `--platform` — instagram/twitter/linkedin/tiktok/facebook
- `--likes/--comments/--shares/--saves/--reach` — Metrikler
- `--effort` — Uretim suresi (saat)

### Adim 2: Raporlar

```bash
badi content perf              # Haftalik ozet (varsayilan)
badi content perf --week
badi content perf --month
badi content perf list         # Tum kayitlar
```

### Adim 3: Trend Analizi

```bash
badi content perf --trend
```

Onceki ve mevcut donem karsilastirmasi:
- Toplam etkilesim degisimi (%)
- Platform bazli trendler

### Adim 4: ROI Analizi

```bash
badi content perf --roi
```

Platform bazli Etkilesim/Efor orani. Hangi platform saatinize en cok degiyor?

### Adim 5: Platform Filtresi

```bash
badi content perf --platform instagram --month
```

### Adim 6: Yorum + Aksiyon

Rapor sonuclarina gore kullaniciya:
- En iyi performans: "Bu formati tekrar deneyelim mi?"
- Dusuk ROI: "Bu platformda vakit ayirma stratejisi?"
- Negatif trend: "Icerik karmasi revize edilsin mi?"

### Adim 7: Haftalik Rutin

Perseembe/Cuma akşami haftalik degerlendirme:
```bash
badi content perf --trend      # Hafta degerlendir
badi content plan              # Onumuzdeki hafta planla
```

# Ornek

```
/icerik-perf                  # Haftalik ozet
/icerik-perf --trend          # Trend karsilastirma
/icerik-perf --roi            # ROI siralama
/icerik-perf add --file ... --platform linkedin --likes 85 ...
```
