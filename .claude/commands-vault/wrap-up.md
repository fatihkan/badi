End-of-day ritual command. Prepares the day for closure and sets the stage for tomorrow.

# Gerekli Araclar
- Read (bellek, notlar, gunlukler)
- Write (guncelleme ve rapor yazimi)
- Bash (git durumu, gorev kontrolu)
- Grep (olay taramasi)

# Prosedur (11 Adim)

### Adim 1: Durum Oku
- `memory.md` dosyasini oku
- Gunluk notu (`daily-notes/GGAAYY.md`) oku
- Gorev panosunu kontrol et
- Git durumunu incele (commit edilmemis degisiklikler)

### Adim 2: Defteri Isle
Gunun olaylarini derle:
- Yapilan commitler ve degisiklikler
- Alinan kararlar ve gerekceleri
- Karsilasilan sorunlar ve cozumleri
- Kullanicinin verdigi yonlendirmeler

### Adim 3: Bellegi Senkronize Et
`memory.md` dosyasini guncelle:
- Yeni ogrenimleri ekle
- Eskimis bilgileri kaldir
- Proje durumunu guncelle
- Onemli kararlari kaydet

### Adim 4: Tamamlanan Gorevleri Tasi
- Biten gorevleri "tamamlandi" olarak isaretle
- Tamamlanma tarihini ekle
- Kismen biten gorevlerin durumunu guncelle
- Bloke olan gorevleri ve nedenlerini belirt

### Adim 5: Ogrenimleri Disariya Aktar
Bugunden cikarilan dersleri kaydet:
- Teknik ogrenimler (yeni API, kalip, arac)
- Surec ogrenimleri (neyin ise yaradigi/yaramadigi)
- Proje icegoruleri
- `knowledge-base.md` dosyasina ekle

### Adim 6: Denetci Calistir
Hizli bir T1 denetim yap:
- Commit edilmemis degisiklik var mi?
- Kirik test var mi?
- Gecici dosya veya debug kodu kalmis mi?
- Guvenlik riski tasiyan bir sey var mi?

### Adim 7: Olay Gunlugu Incele
- Gunun onemli olaylarini kronolojik sirala
- Anormal veya dikkat gerektiren durumlar var mi?
- Takip gerektiren konulari isaretle

### Adim 8: Yarini Onizle
- Yarin icin oncelikli gorevleri belirle
- Bagimliliklari kontrol et (baskasini bekleyen isler)
- Takvim etkinlikleri veya son tarihler var mi?
- Onerilen odak alanlarini listele

### Adim 9: Gunluk Notlari Guncelle
`daily-notes/GGAAYY.md` dosyasini tamamla:
```markdown
## Gun Sonu Ozeti
- Tamamlanan: [liste]
- Devam Eden: [liste]
- Ertelenen: [liste]
- Yarinki Oncelik: [liste]

## Ogrenimler
- [ogrenimler]

## Kararlar
- [kararlar ve gerekceleri]
```

### Adim 10: Koc Analizi (Cumalari)
Eger gun Cuma ise, haftalik kocluk analizi yap:
- Haftalik uretkenlik ozeti
- Hedeflere ilerleme durumu
- Enerji ve odak kaliplari
- Gelecek hafta icin oneriler
- Kutlanacak basarilar

### Adim 11: Cikis Ozeti
```
=== BADI GUN SONU ===
Tarih: [tarih]
Oturum Suresi: [tahmini]

Tamamlanan Gorevler: [sayi]
Commitler: [sayi]
Satir Degisikligi: +[eklenen] / -[silinen]

Devam Eden: [sayi] gorev
Bloke: [sayi] gorev

Yarinki Oncelikler:
1. [oncelik]
2. [oncelik]
3. [oncelik]

Denetim Durumu: TEMIZ / [sorun sayisi] UYARI
Bellek: SENKRONIZE

[Cuma ise: Haftalik Koc Notu]
=========================
```

# Cikti Formati
- Guncellenmis `memory.md`
- Tamamlanmis gunluk not
- `knowledge-base.md` guncellemesi
- Gun sonu ozet raporu
- (Cumalari) Haftalik kocluk raporu
