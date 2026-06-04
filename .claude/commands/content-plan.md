Weekly content planning session command. Sets next week's content strategy, themes, and production targets.

# Gerekli Araclar
- Read (marka sesi, gecmis takvim, performans)
- Write (yeni takvim dosyasi)
- Grep (gecmis icerik analizi)
- Glob (dosya arama)
- Bash (tarih hesaplama)

# Prosedur (6 Adim)

### Adim 1: Gecen Hafta Degerlendirmesi
Son 7 gunun uretim ciktisini analiz et:
- Kac icerik uretildi? (platform bazli)
- Hangileri planlanmisti, hangileri spontane?
- Tamamlanmayan planli icerik var mi?
- En cok hangi formati uretiyorsun? (post, karousel, video)

Soru sor:
- **En iyi 3 icerigin neydi?** (etkilesim veya tatmin bazli)
- **En zor olani hangisiydi?** (neden zorlandin?)

### Adim 2: Gelecek Hafta Temalari
Haftaya ait tema haritasi olustur:

**Veri kaynaklari:**
- Ozel gunler ve etkinlikler (takvime bak)
- Mevsimsel firsatlar
- Gundem konulari (marka uyumlu)
- Devam eden kampanyalar
- Musteri sorulari / SSS

Her gun icin 1 ana tema belirle:
```
Pazartesi: [tema] — [neden]
Sali: [tema]
...
```

### Adim 3: Platform Dagilimi
Her platform icin haftalik hedef belirle:

| Platform | Format | Hedef Sayi | Tema Baglantisi |
|----------|--------|-----------|-----------------|
| Instagram Post | ... | ... | ... |
| Instagram Reel | ... | ... | ... |
| Twitter/X | ... | ... | ... |
| LinkedIn | ... | ... | ... |
| TikTok | ... | ... | ... |

Not: Platform basina 3-5 icerik yeterli (kalite > kantite).

### Adim 4: Icerik Matrisini Olustur
Her gun ve platform icin net planlama:

```
Pazartesi:
  - IG Post: "[konu]" (tema: [tema])
  - Twitter: thread "[konu]"

Sali:
  - IG Reel: 30s "[konu]"
  - LinkedIn: "[konu]"

...
```

### Adim 5: Uretim Baseceli
Icerikleri ne zaman uretecegini planla:
- Batch uretim gunu (ornek: Pazartesi sabahi tum hafta)
- Gunluk uretim (her gun o gunun icerigi)
- Karma model (onceden hazirlanmis + guncel)

Ipucu: Batch uretim verimlidir, ama guncel icerik dinamik kalir.

### Adim 6: Takvim Dosyasini Kaydet
`/content-calendar` komutu ile detayli dosyayi olustur veya:
`badi content calendar "[hafta-tarihi]"` CLI komutunu oner.

# Cikti Formati
```
=== BADI ICERIK PLANI ===
Hafta: [baslangic] - [bitis]
Tarih: [tarih]

-------------------------------------------
GECEN HAFTA OZETI
-------------------------------------------
Uretilen: [sayi] icerik
Plan uyumu: [yuzde]%
En iyi: [icerik]
En zor: [icerik]

Ogrenilen: [1-2 madde]

-------------------------------------------
GELECEK HAFTA TEMALARI
-------------------------------------------
Pzt: [tema]
Sal: [tema]
Car: [tema]
Per: [tema]
Cum: [tema]
Cts: [tema]
Paz: [tema]

-------------------------------------------
PLATFORM DAGILIMI
-------------------------------------------
Toplam hedef: [sayi] icerik
[tablo]

-------------------------------------------
OZEL GUNLER
-------------------------------------------
[varsa liste, yoksa "yok"]

-------------------------------------------
URETIM PROGRAMI
-------------------------------------------
Batch: [gun/saat]
Gunluk: [gun/saat]

-------------------------------------------
SONRAKI ADIM
-------------------------------------------
  badi content calendar "[hafta-tarihi]"
  veya
  /content-calendar komutu
========================
```

# Ne Zaman Kullanilir
- Pazar aksami veya Pazartesi sabahi (haftalik planlama)
- Yeni kampanya oncesi
- Performans dususlerinden sonra yeniden planlama
