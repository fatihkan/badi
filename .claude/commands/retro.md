Sprint retrospective command. Analyzes the past period and identifies improvement areas.

# Gerekli Araclar
- Read (gunluk notlar, gorev panosu, bellek)
- Bash (git istatistikleri)
- Grep (kalip arama)
- Write (rapor yazimi)

# Prosedur (4 Adim)

### Adim 1: Veri Toplama
Retrospektif donemi icin verileri topla:

**Git Verileri:**
- Commit sayisi ve dagilimi (gune gore)
- Degisen dosya sayisi
- Satir ekleme/silme istatistikleri
- Branch ve merge gecmisi
- Revert edilen commitler

**Gorev Verileri:**
- Tamamlanan gorevler ve sureleri
- Ertelenen veya iptal edilen gorevler
- Bloke kalan gorevler ve sureleri
- Kapsam degisiklikleri

**Not Verileri:**
- Gunluk notlardaki kararlar
- Ogrenimler ve icegorular
- Sorunlar ve cozumleri
- Devir notlari

### Adim 2: Kalip Analizi
Toplanan verilerde kaliplari tespit et:

**Uretkenlik Kaliplari:**
- En verimli gunler/saatler
- En cok commit yapilan alanlar
- Tekrarlayan darbogazlar
- Hiz degisimleri (yavaslamalar, hizlanmalar)

**Sorun Kaliplari:**
- Tekrarlayan hatalar
- Sik bloke olan alanlar
- Kapsam kaymasi ornekleri
- Iletisim kopukluklari

**Basari Kaliplari:**
- Iyi sonuclanan yaklasimlar
- Etkili cozum stratejileri
- Basarili isbirligi ornekleri

### Adim 3: Iyilestirme Kategorilendirme
Bulgulari 4 kategoride siniflandir:

**Devam Etmeli (Iyi Giden):**
- Etkili olan pratikler
- Basarili yaklasimlar
- Korunmasi gereken aliskanliklar

**Durdurulmali (Kotu Giden):**
- Zaman kaybettiren pratikler
- Etkisiz yaklasimlar
- Tekrarlayan hatalar

**Baslamali (Yeni Denemeler):**
- Onerilen yeni pratikler
- Denenmesi gereken araclar
- Surec iyilestirmeleri

**Arastirilmali (Belirsiz):**
- Daha fazla veri gerektiren alanlar
- Test edilmesi gereken hipotezler
- Karar bekleyen konular

### Adim 4: Yapilandirilmis Rapor

# Cikti Formati
```
=== BADI RETROSPEKTIF ===
Donem: [baslangic] - [bitis]
Toplam Gun: [sayi]

## Metrikler
- Commitler: [sayi] (gunluk ort: [sayi])
- Tamamlanan Gorevler: [sayi]
- Ertelenen: [sayi]
- Bloke Kalan: [sayi]
- Satir Degisikligi: +[eklenen] / -[silinen]

## Kaliplar
### Uretkenlik
[tespit edilen kaliplar]

### Tekrarlayan Sorunlar
[sorun kaliplari]

### Basarilar
[basari kaliplari]

## Eylem Plani

### Devam Etmeli
- [pratik]

### Durdurulmali
- [pratik]

### Baslamali
- [yeni pratik]

### Arastirilmali
- [konu]

## Sprint Notu
[genel degerllendirme ve motivasyon notu]

## Sonraki Sprint Hedefleri
1. [hedef]
2. [hedef]
3. [hedef]
==========================
```
