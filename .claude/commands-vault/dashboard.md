Daily statistics panel. Presents task, audit, event, and performance data as a unified table.

# Gerekli Araclar
- Bash (tarih hesaplama, dosya istatistikleri)
- Read (TaskBoard.md, audit-trail.md, incident-log.md, failure-log.md, gunluk notlar)
- Grep (veri cikartma ve sayma)
- ...

# Veri Kaynaklari
Bu komut asagidaki dosyalardan veri toplar:
- `TaskBoard.md` - Gorev durumu bilgileri
- `audit-trail.md` - Denetim izi kayitlari
- `incident-log.md` - Olay kayitlari
- ...

---

## Bolum 1: Gorev Istatistikleri

### Adim 1: TaskBoard Verilerini Oku
- `TaskBoard.md` dosyasini oku
- Gorev durumlarini say:
  - Tamamlandi (DONE/BITTI)
  - Devam Ediyor (IN_PROGRESS/DEVAM)
  - Bekliyor (TODO/BEKLIYOR)
  - Engelli (BLOCKED/ENGELLI)

### Adim 2: Bugunun Gorev Hareketi
- Bugun tamamlanan gorevleri filtrele
- Bugun olusturulan yeni gorevleri tespit et
- Durumu degisen gorevleri listele
- ...

---

## Bolum 2: Degisiklik Istatistikleri

### Adim 3: Audit Trail Analizi
- `audit-trail.md` dosyasini oku
- Bugunun tarihiyle eslesen girisleri filtrele
- Degisen dosya sayisini cikar
- ...

### Adim 4: Git Istatistikleri
- `git log --since="today" --format="%H" | wc -l` ile bugunun commit sayisini al
- `git diff --stat HEAD~[sayi]` ile degisiklik boyutunu hesapla
- Eklenen ve silinen satir sayisini raporla

---

## Bolum 3: Olay ve Hata Istatistikleri

### Adim 5: Olay Kayitlarini Incele
- `incident-log.md` dosyasini oku (mevcutsa)
- Bugunun olaylarini filtrele
- Ciddiyet dagilimini cikar:
  - KRITIK: Produksiyon etkileyen
  - YUKSEK: Onemli islevsellik etkileyen
  - ORTA: Sinirli etki
  - DUSUK: Kozmetik veya kucuk sorunlar

### Adim 6: Hata Kayitlarini Incele
- `failure-log.md` dosyasini oku (mevcutsa)
- Bugunun hatalarini filtrele
- Tekrarlayan hata kaliplarini tespit et
- ...

---

## Bolum 4: Oturum Suresi Tahmini

### Adim 7: Sure Hesaplama
- audit-trail.md veya gunluk notlardan ilk girisi bul (oturum baslangici)
- Son girisi bul (simdiki zaman veya son aktivite)
- Aradaki farki hesapla
- ...

---

## Bolum 5: Haftalik Karsilastirma

### Adim 8: Gecen Hafta Verilerini Topla
- Gecen haftanin ayni gunundeki istatistikleri bul (mevcutsa)
- Karsilastirma metrikleri:
  - Tamamlanan gorev sayisi
  - Commit sayisi
  - Olay/hata sayisi
  - Calisma suresi

### Adim 9: Trend Hesaplama
- Her metrik icin degisim yuzdesi hesapla
- Trend yonu belirle:
  - YUKARI (artis, pozitif metrikler icin iyi)
  - ASAGI (azalis)
  - AYNI (+-5% icinde sabit)
- Gorev tamamlama icin YUKARI iyi, olay sayisi icin ASAGI iyi

---

## Cikti: Turkce Formatli Tablo

### Adim 10: Dashboard Olustur
```
[kisaltildi]
```

### Trend Ok Aciklamalari
- Yukari ok: Deger artmis (gorevler icin olumlu, hatalar icin olumsuz)
- Asagi ok: Deger azalmis
- Yatay ok: Deger sabit (+-%5 icinde)
- ...

### Adim 11: Gunluk Ozet Yorumu
- Genel uretkenlik degerlendirmesi (1 cumle)
- En dikkat cekici metrik veya trend
- Yarni icin oneri (eger belirgin bir kalip varsa)
