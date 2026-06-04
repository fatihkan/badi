Configuration drift detection command. Finds inconsistencies, orphaned components, and stale content in the Badi system.

# Gerekli Araclar
- Read (konfigurasyon dosyalari)
- Grep (referans taramasi)
- Glob (dosya varlik kontrolu)
- Bash (dosya bilgileri, JSON dogrulama)

# Denetlenecek Dosyalar
- `CLAUDE.md` (ana talimatlar)
- `.claude/memory.md` (bellek katmani)
- `.claude/knowledge-base.md` (bilgi tabani)
- `.claude/settings.json` (ayarlar)
- `.claude/commands/` (tum komut dosyalari)
- `.claude/command-index.md` (komut dizini)
- `.claude/agents/` (ajan dosyalari, varsa)

# Prosedur (5 Kontrol)

### Kontrol 1: Celiski Tespiti
Dosyalar arasi tutarsizliklari ara:

**CLAUDE.md Celiskileri:**
- Birbiriyle celisen talimatlar var mi?
- Ayni konu hakkinda farkli yonlendirmeler var mi?
- Eski ve yeni talimatlar arasinda catisma var mi?

**memory.md - Gerceklik Uyumu:**
- Bellekteki proje durumu gercegi yansitiyor mu?
- Artik gecerli olmayan bilgiler var mi?
- Teknoloji yigini bilgisi guncel mi?
- Dosya yollari hala dogru mu?

**knowledge-base.md Tutarliligi:**
- Ic celiskiler var mi?
- memory.md ile catisan bilgiler var mi?
- CLAUDE.md ile uyumsuz icgörüler var mi?

**settings.json Dogrulamasi:**
- JSON formati gecerli mi?
- Referans edilen dosya yollari mevcut mu?
- Hook tanimlamalari dogru formatli mi?

### Kontrol 2: Yetim Bilesen Tespiti
Baglantisiz bilesenleri bul:

- **Cagrilmayan Komutlar:** `commands/` dizininde olup hicbir yerde referans edilmeyen dosyalar
- **Kullanilmayan Ajanlar:** `agents/` dizininde olup hicbir yerde cagrilmayan ajanlar
- **Kirik Referanslar:** Mevcut olmayan dosyalara yapilan atiflar
- **Baglantisiz Hooklar:** settings.json'da tanimli ama dosyasi olmayan hooklar
- **Indekste Olmayan Komutlar:** `command-index.md` ile `commands/` dizini uyumsuzlugu
- **Gereksiz Dosyalar:** Eski, artik kullanilmayan konfigurasyon dosyalari

### Kontrol 3: Eskime Kontrolleri
Icerik tazeligi degerlendir:

- **memory.md Girdileri:** 3 gunden eski girdileri isaretle
- **Gunluk Notlar:** 7 gunden eski islenMEmis notlar
- **Devir Notlari:** 14 gunden eski devir notlari
- **Gorev Panosu:** 30 gunden eski acik gorevler
- **knowledge-base.md:** Dogrulanmasi gereken eski bilgiler
- **Arac Referanslari:** Artik mevcut olmayan araclara atiflar
- **Arsiv Notlari:** 30 gunden eski arsiv dosyalari (temizlik adayi)
- **Takilan Gorevler:** Ilerleme kaydetmeyen gorevler

### Kontrol 4: Konfigurasyon Sagligi
Teknik saglik kontrolleri:

- **JSON Dogrulama:** Tum JSON dosyalarinin gecerliligi
- **Dosya Boyutu Esikleri:**
  - memory.md: 500 satirdan fazla mi? (UYARI)
  - knowledge-base.md: 1000 satirdan fazla mi? (UYARI)
  - Gunluk notlar: 200 satirdan fazla mi? (BILGI)
- **Hook Calistirilabilirlik:** Hook dosyalari icin izin kontrolu
- **Markdown Formati:** Kirik baslantsilar, kapanmamis kod bloklari
- **Karakter Kodlamasi:** UTF-8 uyumluluk kontrolu

### Kontrol 5: Capraz Tutarlilik
Tum sistem genelinde tutarlilik:

- CLAUDE.md'deki kurallar settings.json ile uyumlu mu?
- Komut dosyalarindaki arac referanslari geerli mi?
- Ajan tanimlarindaki bagimlliklar karsilaniyor mu?
- Tum dosya referanslari cift yonlu mu? (A -> B ise B -> A da var mi?)

# Cikti Formati
```
=== BADI SAPMA TESPITI ===
Tarih: [tarih]
Durum: TEMIZ | UYARI | SORUN

## Celiski Bulgulari
- Bulunan: [sayi]
[varsa detaylar]

## Yetim Bilesenler
- Bulunan: [sayi]
[varsa detaylar]

## Eskilesmis Icerik
- Bulunan: [sayi]
[varsa detaylar]

## Konfigurasyon Sagligi
- JSON: GECERLI / HATALI
- Boyutlar: NORMAL / ASIRI
- Izinler: DOGRU / HATALI

## Capraz Tutarlilik
- Durum: TUTARLI / UYUMSUZ
[varsa detaylar]

## Duzeltme Onerileri
1. [ACIL] [oneri]
2. [ONEMLI] [oneri]
3. [ONERILEN] [oneri]

## Sonraki Tarama
Onerilen: [tarih]
============================
```

# Tetikleyici
- Ayda bir rutin tarama
- Sistem davranisi anormal gorundigunde
- Buyuk konfigur asyon degisikligi sonrasinda
- Yeni komut veya ajan eklenmesinden sonra
