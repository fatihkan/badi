Coaching analysis command. Performs data-driven work-pattern analysis and offers personal improvement suggestions.

# Gerekli Araclar
- Read (bellek, gorevler, notlar, onceki kocluk raporlari)
- Write (kocluk raporu)
- Grep (kalip taramasi)
- Glob (veri kaynaklari bulma)
- Bash (git istatistikleri)

# Opsiyonel Zaman Dilimi
Kullaniciya sor: "Hangi doenemi analiz edelim?"
- **Haftalik:** Son 7 gun
- **Aylik:** Son 30 gun
- **Tum Veri:** Mevcut tum kayitlar

# Prosedur (4 Bolum)

### Bolum 0: Veri Toplama
Analiz icin veri kaynaklarini topla:
- `memory.md` dosyasini oku
- Gorev panosunu incele (tamamlanan, devam eden, ertelenen)
- Gunluk notlari tara (belirtilen donem icin)
- Git istatistiklerini topla (commit sikligi, degisiklik hacmi)
- Onceki kocluk gozlemlerini oku (varsa)
- Devir notlarini incele
- Retrospektif raporlarini kontrol et

### Bolum 1: Uretkenlik Analizi

**Metrikler:**
- Gorev tamamlama orani (tamamlanan / planlanan)
- Gunluk ortalama commit sayisi
- Uretken gun sayisi ve oruntuleri
- Gorev basina harcanan ortalama sure
- Zaman dagilimi analizi (gelistirme / toplanti / yonetim / arastirma)
- En verimli saat ve gun analizi
- Darbogazlar ve bekleme sureleri

**Degerllendirme:**
- Ust duzey performans alanlari
- Iyilestirme gerektiren alanlar
- Verimlilik trendi (artis/azalis/sabit)

### Bolum 2: Buyume Analizi

**Metrikler:**
- Yeni ogrenilen teknoloji ve araclar
- Icerik uretim sikligi (blog, dokumantasyon, vb.)
- Karmasiklik seviyesi artan gorevler (zorluk ilerlesmesi)
- Problem cozme hizi degisimi
- Kanal cesitliligi (gelistirme, tasarim, is gelistirme, vb.)
- Teknik derinlik gostergesi

**Degerllendirme:**
- Beceri gelistirme alanlari
- Konfor bolgesinden cikmis mi?
- Yeni zorluklar aranmis mi?

### Bolum 3: Surdurulebilirlik Analizi

**Sinyaller:**
- Tukenmislik belirtileri:
  - Hafta sonu calisma sikligi
  - Asiri uzun oturumlar (4+ saat arasiiz)
  - Gece gelistirme aktivitesi
  - Artan hata orani
- Engel yogunlugu (ne siklikta bloke olunuyor?)
- Tekrarlayan sorunlar (ayni sey kac kez sorun oldu?)
- Mola kalipleri (yeterli ara veriliyor mu?)
- Is/yasam dengesi gostergeleri

**Degerllendirme:**
- Mevcut tempo surdurulebilir mi?
- Risk sinyalleri var mi?
- Iyilestirme onerileri

### Bolum 4: Firsat Analizi

**Kacirilmis Firsatlar:**
- Tamamlanmamis ama degerli isler
- Tekrarlayan manuel islemler (otomasyon adayi)
- Kullanilmayan arac veya skill'ler
- Delegasyon firsatlari
- Paralellestirilebilir is akislari

**Yeni Firsatlar:**
- Trend olan teknolojiler ve araclar
- Mevcut becerileri genisletme alanlari
- Verimlilik kazanimi potansiyeli
- Strateji degisikligi firsatlari

### Takip Kontrolu
- Onceki kocluk onerilerinin uygulanma durumunu kontrol et
- Uygulanan onerilerin etkisini degerlendir
- 3 haftadan eski uygulanmamis onerileri gozden gecir:
  - Hala gecerli mi? Yeniden onceliklendirdir
  - Artik gecerli degil mi? Kaldir ve nedenini not et

# Cikti Formati
```
=== BADI KOCLUK RAPORU ===
Donem: [baslangic] - [bitis]
Tarih: [tarih]

## Veri Ozeti
- Analiz Edilen Gun: [sayi]
- Toplam Commit: [sayi]
- Tamamlanan Gorev: [sayi]
- Gorev Tamamlama Orani: [yuzde]%

## Guclu Yonler (2-3 Madde)
1. [guclu yon ve kanit]
2. [guclu yon ve kanit]
3. [guclu yon ve kanit]

## Uyarilar
- [dikkat gerektiren alan ve neden]

## Firsatlar
- [firsat ve nasil degererlendirileegi]

## Surdurulebilirlik Notu
[tukenmislik riski degerllendirmesi]

## Tek Oncelik
> Bu hafta odaklanilmasi gereken tek sey:
> [net, uygulanabilir oneri]

## Onceki Onerilerin Takibi
| Oneri | Durum | Etki |
|-------|-------|------|
| [oneri] | Uygulandi/Bekliyor/Iptal | [degerllendirme] |

## Motivasyon Notu
[kisisel, ozgun bir motivasyon mesaji]
=============================
```

# Not
- Kocluk raporu `memory.md` dosyasina kaydedilir
- Haftalik kocluk wrap-up komutu ile entegre calisir (Cuma analizi)
- Ton: destekleyici, veri odakli, motivasyon verici
