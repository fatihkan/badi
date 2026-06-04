Daily standup command. Produces a quick status summary in under 30 seconds.

# Gerekli Araclar
- Bash (git log)
- Read (gorev panosu, notlar)
- Grep (aktivite taramasi)

# Prosedur (Hedef: 30 saniye)

### Adim 1: Git Aktivitesi (Paralel)
- Son is gununun commitlerini al: `git log --oneline --since="yesterday"`
- Degisen dosya sayisini hesapla
- Branch durumunu kontrol et

### Adim 2: Gorev Panosu (Paralel)
- Aktif gorevleri oku
- Tamamlananlari say
- Bloke olanlari tespit et
- Yeni eklenen gorevleri belirle

### Adim 3: Onceki Notlar (Paralel)
- Son gunluk notu oku
- Devir notu varsa kontrol et
- "Yarinki isler" bolumunu bul

### Adim 4: Mevcut Odak
- Bugunun onceliklerini belirle
- Bagimliliklari kontrol et
- Risk veya engel var mi?

# Cikti Formati
```
=== BADI STANDUP ===
Tarih: [tarih]

DUN:
- [yapilan isler - git commitlerden ve notlardan]
- [tamamlanan gorevler]

BUGUN:
- [planlanmis isler - oncelik sirasina gore]
- [devam eden gorevler]

ENGELLEYICILER:
- [varsa engeller ve beklentiler]
- [yoksa: "Engel yok, yol acik."]

METRIKLER:
- Commitler (dun): [sayi]
- Acik Gorevler: [sayi]
- Tamamlanan (dun): [sayi]
====================
```

# Kurallar
- Kisa ve oz tut, maksimum 15 satir cikti
- Her madde bir satirda
- Engelleyicileri vurgula (varsa)
- Metrikleri her zaman ekle
- 30 saniyeyi gecme
