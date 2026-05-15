Icerik uretim oturumu baslatma komutu. Gunluk icerik oretim seansina yapisal bir baslangic yapar, bekleyen islerti gosterir ve oncelikleri belirler.

# Gerekli Araclar
- Read (marka sesi, takvim, mevcut icerikler)
- Glob (workspace dosyalari)
- Grep (trend ve kalip aramalari)
- Bash (tarih ve dosya tarihi)
- Write (gunluk not)

# Prosedur (7 Adim)

### Adim 1: Baglam Yukle
Su dosyalari oku:
- `.claude/workspace/marka-sesi.md` — Marka tonu ve kurallari
- `.claude/workspace/takvim/` — En son icerik takvimi
- `.claude/workspace/icerikler/` — Son 10 icerik
- `.claude/workspace/senaryolar/` — Son 5 video senaryosu
- `memory.md` — Aktif kampanya veya proje

Bu dosyalar yoksa kullaniciyi yonlendir:
- Marka sesi yoksa: `badi icerik marka` oner
- Takvim yoksa: `badi icerik takvim` oner

### Adim 2: Bugun Ne Var?
Takvimde bugun icin planlanmis icerikleri listele:
- Hangi platformlara post atilacak?
- Hangi temalar planlanmis?
- Bekleyen taslak var mi?

Eger bugun icin planli icerik yoksa, haftanin gunune gore tema oner:
- Pazartesi: Motivasyon / Hafta basligi
- Sali: Egitici / Ipucu
- Carsamba: Perde arkasi / Topluluk
- Persembe: Urun / Hizmet
- Cuma: Eglence / Trend
- Cumartesi: UGC / Sosyal kanit
- Pazar: Ilham / Haftalik ozet

### Adim 3: Bekleyen Taslaklar
`.claude/workspace/icerikler/` ve `.claude/workspace/senaryolar/` icindeki son 7 gunluk dosyalari tara. Her birisi icin:
- Dosya adi ve tarihi
- Doldurulmus mu, yoksa hala placeholder'li mi?
- Hangi platform icin?

Tamamlanmamis (placeholder iceren) taslaklari on plana cikar.

### Adim 4: Son Performans (varsa)
Eger `.claude/workspace/performans.md` veya benzeri bir takip dosyasi varsa:
- Gecen hafta en iyi performans gosteren 3 icerik
- En dusuk performans gosteren 3 icerik
- Trend notu (artis/azalis)

### Adim 5: Fikir Onerileri
Su kaynaklardan fikir uret:
- Bu ayki ozel gunler ve etkinlikler
- Gundem / trend konulari (marka uyumlu olanlar)
- Evergreen icerik sablonlari
- Bekleyen SSS veya musteri sorulari

3-5 somut icerik fikri sun:
```
1. [Platform] — [Format] — [Konu]: [neden onemli]
2. ...
```

### Adim 6: Bugunun Onceligi
Kullaniciya bugun odaklanmasi gereken tek seyi sor veya oner:
- En kritik icerik (yayin tarihi yaklasmis)
- En yuksek etkili firsat (trend, ozel gun)
- En hizli kazanc (hazir taslak tamamlama)

### Adim 7: Seans Notu Baslat
`.claude/workspace/icerik-notlari/` dizini altinda bugunun gunluk not dosyasini olustur:

```
# Icerik Notlari — [tarih]

## Bugunki Oncelik
[secilen oncelik]

## Planli Uretimler
- [ ] [icerik 1]
- [ ] [icerik 2]

## Fikirler / Notlar
- ...

## Tamamlananlar
(gun icinde doldurulacak)
```

# Cikti Formati
```
=== BADI ICERIK SEANSI ===
Tarih: [tarih] ([gun adi])
Marka Sesi: [yuklendi / eksik]

-------------------------------------------
BUGUN TAKVIMDEN
-------------------------------------------
[planli icerikler veya "bugun icin planli icerik yok"]

Haftanin temasi: [gun bazli tema]

-------------------------------------------
BEKLEYEN TASLAKLAR
-------------------------------------------
[tamamlanmamis taslak listesi]
Toplam: [sayi] taslak

-------------------------------------------
SON PERFORMANS
-------------------------------------------
[varsa ozet, yoksa "veri yok"]

-------------------------------------------
FIKIR ONERILERI
-------------------------------------------
1. [Platform] [Format]: [konu]
2. ...

-------------------------------------------
BUGUN ODAKLAN
-------------------------------------------
Tek oncelik: [net oneri]

Baslamak icin:
  badi icerik post "[konu]"
  badi icerik karousel "[konu]"
  badi icerik video "[konu]"
  /icerik-uret
==============================
```

# Ne Zaman Kullanilir
- Her gun icerik uretmeye baslarken (sabah rituelnu)
- Uretim tikanikligi yasarken
- Haftaya baslarken
