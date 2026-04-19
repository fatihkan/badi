Kullanim analitikleri komutu. Badi arac kullanim istatistikleri, bar chart, gunluk trend, aliskanlik serisi.

# Gerekli Araclar
- Bash (badi stats)

# Prosedur

### Adim 1: Donem Belirle

```bash
badi stats                    # Son 7 gun (varsayilan)
badi stats --week             # Son 7 gun
badi stats --month            # Son 30 gun
badi stats --all              # Tum zamanlar
```

### Adim 2: Filtre ve Detay

```bash
badi stats --command Bash     # Sadece Bash kullanimi
badi stats --habits           # Aliskanlik serisi (streak)
badi stats --export csv       # CSV olarak disa aktar
```

### Adim 3: Yorumla

Ciktiya gore kullaniciya:
- **Yuksek Bash kullanimi**: Komut kisayollari onerilebilir
- **Streak kirildi**: Haftalik/gunluk rutin hatirlaticisi
- **Az kullanilan arac**: Rehberlik teklif

### Adim 4: Gorsel Rapor

Bar chart, gunluk trend ve habit streak'lari ozetle.

# Ornek
```
/stats --habits
/stats --month --command Bash
/stats --export csv > usage-rapor.csv
```
