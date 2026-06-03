Icerik uretim durumu paneli. Mevcut uretim hacmini, bekleyenleri, takvim uyumunu ve trend verilerini gosterir.

# Gerekli Araclar
- Read (workspace dosyalari)
- Glob (tum icerik dizinleri)
- Grep (placeholder ve durum tespiti)
- Bash (dosya tarihi, sayma)

# Prosedur (5 Adim)

### Adim 1: Envanter Topla
`.claude/workspace/` altindaki tum icerik dosyalarini tara:
- `icerikler/` — Post ve karousel sayisi
- `senaryolar/` — Video senaryo sayisi
- `gorseller/` — Gorsel brief sayisi
- `takvim/` — Takvim dosyalari
- `marka-sesi.md` varsa

Dosya basina metadata cikar:
- Olusturma tarihi
- Son degisiklik tarihi
- Dosya boyutu (doluluk gostergesi)
- Placeholder sayisi

### Adim 2: Zaman Bazli Gruplama

**Bugun:** Bugun olusturulan/duzenlenen
**Bu hafta:** Son 7 gun
**Bu ay:** Son 30 gun
**Eski:** 30+ gun

Her grup icin:
- Toplam sayi
- Tamamlanmislik orani

### Adim 3: Tamamlanmislik Analizi
Her icerigin durumunu belirle:

**TAMAMLANAN (yayina hazir):**
- Placeholder yok
- Tum bolumler dolu
- Gorsel notu var

**KISMI (duzenleme gerekli):**
- Bazi yerler dolu
- Ana mesaj belirli ama detaylar eksik

**TASLAK (yeni olusturulmus):**
- Cogunlukla placeholder
- Temel yapi var

**OLMUS (arsiv adayi):**
- 30+ gundur dokunulmamis
- Hala placeholder

### Adim 4: Takvim Uyum Kontrolu
Eger takvim dosyasi varsa:
- Planli icerikler kac tane?
- Kac tanesi uretilmis?
- Kac tanesi yayinlanmis?
- Gecikme var mi?

```
Plan uyum orani: [yuzde]%
```

### Adim 5: Trend ve Oneriler
Son 2 haftanin trendlerini hesapla:
- Uretim hizi (gun basina ortalama)
- En cok uretilen format
- En az uretilen format (kapali kanal uyarisi)
- Duraksamalar (0 uretim gunleri)

Oneriler uret:
- Ihmal edilen platformlar
- Eskimeye baslayan taslaklar
- Bitmemis isler

# Cikti Formati
```
=== BADI ICERIK DURUMU ===
Tarih: [tarih] [saat]

-------------------------------------------
ENVANTER
-------------------------------------------
Toplam Dosya: [sayi]

Postlar/Karouseller: [sayi]
Video Senaryolari:   [sayi]
Gorsel Brifler:      [sayi]
Takvimler:           [sayi]

Marka Sesi: [VAR / YOK]

-------------------------------------------
ZAMAN DAGILIMI
-------------------------------------------
Bugun:     [sayi]  [======    ]
Bu Hafta:  [sayi]  [========  ]
Bu Ay:     [sayi]  [==========]
Eski:      [sayi]

-------------------------------------------
TAMAMLANMISLIK
-------------------------------------------
Tamamlanan:  [sayi] (%[oran])
Kismi:       [sayi]
Taslak:      [sayi]
Olmus:       [sayi]

-------------------------------------------
TAKVIM UYUMU
-------------------------------------------
Planli:      [sayi]
Uretilmis:   [sayi]
Yayinlanmis: [sayi]
Uyum:        [yuzde]%

-------------------------------------------
TREND (Son 2 Hafta)
-------------------------------------------
Gunluk Ortalama: [sayi] icerik
En Populer: [format] ([sayi])
En Az: [format] ([sayi])
Duraksamalar: [gun sayisi]

-------------------------------------------
UYARILAR
-------------------------------------------
- [eskime uyarisi]
- [kapali kanal]
- [gecikmis icerik]

-------------------------------------------
ONERILER
-------------------------------------------
1. [somut oneri]
2. [somut oneri]
3. [somut oneri]

-------------------------------------------
HIZLI AKSIYONLAR
-------------------------------------------
Eksik taslak bitir:   [dosya]
Yeni icerik uret:     badi content [tur] "[konu]"
Takvim olustur:       badi content calendar "[donem]"
Fikir uret:           /content-idea
==========================
```

# Ne Zaman Kullanilir
- Gunluk durum kontrolu
- Haftalik retro oncesi
- Tikanma anlarinda ("ne yapmaliyim?")
- Plan vs gerceklik karsilastirmasi
