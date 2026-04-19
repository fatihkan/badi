Performans profilleme. Sicak yollari, darbogazlari ve optimizasyon firsatlarini tespit eder.

## Badi CLI Komutlari (v1.6+)
Production URL varsa:
- `badi lighthouse [url]` — Core Web Vitals (FCP, LCP, TBT, CLS, Speed Index)
- `badi lighthouse [url] --desktop` — Desktop ayri olcum
- `badi seo speed [url]` — Sayfa hizi + kaynak analizi (v1.4+)

Bu CLI araclari gercek-dunya metrikler verir (PageSpeed Insights). Kod bazli analizler (asagidaki adimlar) bunu tamamlar.

# Gerekli Araclar
- Bash (build komutlari, dosya boyut hesaplama)
- Read (kaynak kod analizi)
- Grep (kalip arama)
- ...

# Ajan Delegasyonu
Bu komut ana analiz isini performance-profiler ajanina devreder.
Ajan bulunamazsa, asagidaki adimlari dogrudan uygula.

---

## Bolum 1: Sicak Yol Tespiti

### Adim 1: Sik Degistirilen Dosyalar
- `git log --format=format: --name-only` ile son 50 commit'te en cok degisen dosyalari bul
- En sik degisen 10 dosyayi listele
- Bu dosyalarin karmasiklik ve boyut bilgisini ekle
- ...

### Adim 2: Karmasik Fonksiyon Tespiti
- Uzun fonksiyonlari tespit et (50+ satir)
- Derin ic ice gecmis yapilari bul (4+ seviye girinti)
- Coklu dongu iceren fonksiyonlari isaretl
- ...

### Adim 3: Import/Bagimlilik Analizi
- Cok fazla import iceren dosyalari tespit et
- Dairesel bagimliliklari ara
- Kullanilmayan import'lari bul

---

## Bolum 2: Veritabani Sorgu Analizi

### Adim 4: N+1 Sorgu Kalip Tespiti
Asagidaki kaliplari kodda ara:
- Dongu icindeki veritabani cagrilari
- ORM iliskilerinde eager loading eksikligi
- `forEach`/`map` icindeki `await` veritabani islemleri
- ...

### Adim 5: Sorgu Optimizasyon Onerileri
- Index kullanimi onerileri
- Toplu islem (batch) donusum firsatlari
- Gereksiz sorgu tekrarlari
- ...

---

## Bolum 3: Paket ve Build Boyutlari

### Adim 6: Build Boyut Analizi
- `package.json` bagimlilik sayisini raporla
- Varsa build ciktisinin boyutunu olc
- `node_modules` toplam boyutunu kontrol et
- ...

### Adim 7: Bagimlilik Agirlik Analizi
- En buyuk bagimliliklari boyutlarina gore sirala
- Alternatifi olan agir kutuphaneleri tespit et
  Ornek: moment.js -> date-fns, lodash -> lodash-es veya natif yontemler
- Dev dependency'lerin production build'e sizmasini kontrol et
- Duplicate paketleri tespit et

### Adim 8: Asset Boyutlari
- Resim dosyalarinin boyutlarini kontrol et
- Sıkistırılmamis assetleri tespit et
- Font dosya boyutlarini degerlendir
- ...

---

## Bolum 4: Onbellek Strateji Incelemesi

### Adim 9: Mevcut Onbellek Uygulamasi
- Redis/Memcached kullanimi var mi kontrol et
- HTTP onbellek basliklarini incele (Cache-Control, ETag)
- CDN konfigurasyonunu degerlendir (mevcutsa)
- ...

### Adim 10: Onbellek Optimizasyon Onerileri
- Onbelleklenebilecek ama onbelleklenmeyen verileri tespit et
- Onbellek gecersiz kilma (invalidation) stratejisini degerlendir
- Yazma-okuma oranina gore onbellek katmani oner
- ...

---

## Bolum 5: Performans Raporu

### Adim 11: Bulgu Ozeti Olustur
```
[kisaltildi]
```

### Adim 12: Etki Tahmini
Her oneri icin:
- Tahmini iyilesme yuzdesi veya suresi
- Uygulama zorlugu: KOLAY / ORTA / ZOR
- Oncelik: Etki/Efor oranina gore siralama
- ...
