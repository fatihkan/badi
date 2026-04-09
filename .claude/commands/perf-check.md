Performans profilleme. Sicak yollari, darbogazlari ve optimizasyon firsatlarini tespit eder.

# Gerekli Araclar
- Bash (build komutlari, dosya boyut hesaplama)
- Read (kaynak kod analizi)
- Grep (kalip arama)
- Glob (dosya taramasi)
- Agent (performance-profiler: detayli performans analizi)

# Ajan Delegasyonu
Bu komut ana analiz isini performance-profiler ajanina devreder.
Ajan bulunamazsa, asagidaki adimlari dogrudan uygula.

---

## Bolum 1: Sicak Yol Tespiti

### Adim 1: Sik Degistirilen Dosyalar
- `git log --format=format: --name-only` ile son 50 commit'te en cok degisen dosyalari bul
- En sik degisen 10 dosyayi listele
- Bu dosyalarin karmasiklik ve boyut bilgisini ekle
- Sik degisen dosyalar genellikle hata ve performans sorunlarinin kaynagini gosterir

### Adim 2: Karmasik Fonksiyon Tespiti
- Uzun fonksiyonlari tespit et (50+ satir)
- Derin ic ice gecmis yapilari bul (4+ seviye girinti)
- Coklu dongu iceren fonksiyonlari isaretl
- Yuksek siklomatik karmasikliga sahip modulleri belirle

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
- Tekrarlayan sorgu kaliplari

### Adim 5: Sorgu Optimizasyon Onerileri
- Index kullanimi onerileri
- Toplu islem (batch) donusum firsatlari
- Gereksiz sorgu tekrarlari
- Baglanti havuzu konfigurasyonu kontrolu

---

## Bolum 3: Paket ve Build Boyutlari

### Adim 6: Build Boyut Analizi
- `package.json` bagimlilik sayisini raporla
- Varsa build ciktisinin boyutunu olc
- `node_modules` toplam boyutunu kontrol et
- Tree-shaking uyumlulugunu degerlendir

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
- Kaynak haritalari (source maps) production'da dahil mi kontrol et

---

## Bolum 4: Onbellek Strateji Incelemesi

### Adim 9: Mevcut Onbellek Uygulamasi
- Redis/Memcached kullanimi var mi kontrol et
- HTTP onbellek basliklarini incele (Cache-Control, ETag)
- CDN konfigurasyonunu degerlendir (mevcutsa)
- Tarayici onbellekl me stratejisini kontrol et

### Adim 10: Onbellek Optimizasyon Onerileri
- Onbelleklenebilecek ama onbelleklenmeyen verileri tespit et
- Onbellek gecersiz kilma (invalidation) stratejisini degerlendir
- Yazma-okuma oranina gore onbellek katmani oner
- Statik asset versiyonlama stratejisini kontrol et (content hash)

---

## Bolum 5: Performans Raporu

### Adim 11: Bulgu Ozeti Olustur
```
╔════════════════════════════════════════════════╗
║         PERFORMANS PROFILLEME RAPORU           ║
║         Tarih: [GG.AA.YYYY]                   ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Sicak Yollar:                                 ║
║  - [dosya1]: [neden sicak]                     ║
║  - [dosya2]: [neden sicak]                     ║
║                                                ║
║  Veritabani:                                   ║
║  - N+1 Kalip: [sayi] adet tespit edildi        ║
║  - Optimizasyon Firsati: [aciklama]            ║
║                                                ║
║  Build/Paket:                                  ║
║  - Toplam Bagimlilik: [sayi]                   ║
║  - Build Boyutu: [boyut]                       ║
║  - Agir Paketler: [liste]                      ║
║                                                ║
║  Onbellek:                                     ║
║  - Mevcut Strateji: [aciklama]                 ║
║  - Iyilestirme Firsati: [aciklama]             ║
║                                                ║
╠════════════════════════════════════════════════╣
║  UYGULANABILIR ONERILER (Oncelik Sirasinda):   ║
║                                                ║
║  1. [YUKSEK] [oneri + beklenen etki]           ║
║  2. [ORTA]   [oneri + beklenen etki]           ║
║  3. [DUSUK]  [oneri + beklenen etki]           ║
╚════════════════════════════════════════════════╝
```

### Adim 12: Etki Tahmini
Her oneri icin:
- Tahmini iyilesme yuzdesi veya suresi
- Uygulama zorlugu: KOLAY / ORTA / ZOR
- Oncelik: Etki/Efor oranina gore siralama
- Bagimlilklar: Baska degisiklik gerektiren oneriler icin not
