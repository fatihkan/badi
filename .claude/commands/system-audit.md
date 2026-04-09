Derin altyapi denetimi komutu. Badi sisteminin tum bilesenlerini 9 kontrol noktasiyla kapsamli olarak denetler.

# Gerekli Araclar
- Read (tum konfigurasyon dosyalari)
- Grep (referans ve kalip taramasi)
- Glob (dosya varlik kontrolu)
- Bash (izin kontrolu, JSON dogrulama, dosya bilgileri)
- Write (denetim raporu)

# Prosedur (9 Kontrol)

### Kontrol 1: Ajan Sagligi
- `.claude/agents/` dizinindeki tum dosyalari listele
- Her ajan dosyasi icin:
  - YAML frontmatter dogru formatli mi?
  - Gerekli alanlar mevcut mu? (isim, aciklama, araclar)
  - Referans edilen araclar gecerli mi?
  - Cozulmemis yer tutucu (`{{...}}`) yok mu?
  - Talimatlar acik ve tutarli mi?
- Ajan sayisi ve durum ozeti

### Kontrol 2: Komut Sagligi
- `.claude/commands/` dizinindeki tum dosyalari listele
- Her komut dosyasi icin:
  - Aciklama satiri mevcut mu?
  - Arac gereksinimleri tanimli mi?
  - Prosedur adimlari var mi?
  - Cikti formati belirtilmis mi?
  - Markdown formati gecerli mi?
- `command-index.md` ile capraz referans kontrolu:
  - Indekste olan ama dosyasi olmayan komutlar
  - Dosyasi olan ama indekste olmayan komutlar
  - Aciklama uyumsuzluklari

### Kontrol 3: Hook Sagligi
- `settings.json` dosyasini oku ve JSON dogrula
- Tanimli her hook icin:
  - Hook dosyasi mevcut mu?
  - Dosya calistirilabilir izne sahip mi?
  - Kuru calistirma testi (syntax hatasi var mi?)
  - Tetikleyici olay dogru tanimli mi?
- Hook calisma sirasi ve oncelik kontrolu
- Carpisan veya celisen hooklar var mi?

### Kontrol 4: Bellek Katmani Sagligi
- `memory.md` dosyasi:
  - Boyut kontrolu (500 satir limiti)
  - Tazelik kontrolu (son guncelleme tarihi)
  - Ic tutarlilik (celisen bilgi var mi?)
  - Kaynak atfisi dogru mu?
- `knowledge-base.md` dosyasi:
  - Boyut kontrolu (1000 satir limiti)
  - Bilgi categorileri duzgun mi?
  - Dogrulanmamis bilgi var mi?
  - Atif ve referanslar gecerli mi?

### Kontrol 5: Gunluk Sagligi
- Gunluk dosyalarini kontrol et:
  - `daily-notes/` dizin boyutu ve dosya sayisi
  - `handoffs/` dizin boyutu ve dosya sayisi
  - Denetim iz dosyalari (audit-trail.md, incident-log.md, failure-log.md)
- Her gunluk dosyasi icin:
  - Boyut siniri icinde mi?
  - Format tutarli mi?
  - Tarih bilgisi dogru mu?
- JSONL dosyalari (verdicts.jsonl vb.):
  - Her satir gecerli JSON mi?
  - Sema tutarli mi?

### Kontrol 6: Izin ve Konfigurasyon Tutarliligi
- Hook dosyalari icin dosya izin kontrolleri
- settings.json icindeki tum dosya referanslarinin varligi
- Ortam degiskeni bagimliliklari (kullanilan ama tanimlanmayan)
- Dizin yapisi beklentilere uygun mu?
- `.gitignore` ile hassas dosya kontrolu

### Kontrol 7: Capraz Dosya Tutarliligi
- Tum dosyalar arasi referans dogrulamasi:
  - A dosyasi B'ye atif yapiyorsa, B mevcut mu?
  - Dongusel bagimlilik var mi?
  - Yetim referanslar (hicbir yerden baglanmayan dosyalar)
- CLAUDE.md talimatlari ile komut/ajan davranislari uyumlu mu?
- Isimlendirme konvansiyonlari tutarli mi?

### Kontrol 8: Yedekleme ve Depolama
- Toplam `.claude/` dizin boyutu
- En buyuk 5 dosya (boyut sirali)
- 30 gunden eski dosyalar (arsiv/temizlik adayi)
- Otomatik temizlik mekanizmasi calisiyor mu?
- Gecici dosyalar kalmis mi?
- Yedekleme stratejisi mevcut ve guncel mi?

### Kontrol 9: Via Negativa Taramasi
Gereksiz karmasikligi tespit et:
- Kullanilmayan bilesenler (komut, ajan, hook)
- Tekrarlayan veya carpisan islevsellik
- Gereksiz bagimlilik zincirleri
- Asiri karmasik konfigurasyonlar (basitlestirilebilir mi?)
- Olmeyen gecici cozumler (workaround)
- Kaldirildliginda sistemi iyilestirecek ögeler

# Derecelendirme Sistemi

Her kontrol icin ayri derece ver:
- **A (Mukemmel):** Tum alt kontroller gecti, iyilestirme gerektirmiyor
- **B (Iyi):** Kucuk uyarilar, acil mudahale gerektirmiyor
- **C (Orta):** Duzeltilmesi gereken sorunlar var, planlanan sprintte ele alinmali
- **D (Zayif):** Ciddi sorunlar, hemen ele alinmali
- **F (Basarisiz):** Kritik basarisizlik, acil mudahale gerekli

**Genel Derece:** En dusuk bireysel derece veya agirlıkli ortalama.

# Cikti Formati
```
=== BADI SISTEM DENETIMI ===
Tarih: [tarih]
Genel Derece: [A-F]

## Kontrol Sonuclari
| # | Kontrol | Derece | Bulgu |
|---|---------|--------|-------|
| 1 | Ajan Sagligi | [A-F] | [ozet] |
| 2 | Komut Sagligi | [A-F] | [ozet] |
| 3 | Hook Sagligi | [A-F] | [ozet] |
| 4 | Bellek Katmani | [A-F] | [ozet] |
| 5 | Gunluk Sagligi | [A-F] | [ozet] |
| 6 | Izin/Konfigurasyon | [A-F] | [ozet] |
| 7 | Capraz Tutarlilik | [A-F] | [ozet] |
| 8 | Yedekleme/Depolama | [A-F] | [ozet] |
| 9 | Via Negativa | [A-F] | [ozet] |

## Kritik Bulgular (D ve F)
[detaylar ve acil aksiyonlar]

## Uyarilar (C)
[detaylar ve planlanmis aksiyonlar]

## Iyilestirme Onerileri (A ve B)
[opsiyonel iyilestirmeler]

## Duzeltme Plani
1. [ACIL] [aksiyon] - Hedef: [tarih]
2. [PLANLI] [aksiyon] - Hedef: [tarih]
3. [ONERILEN] [aksiyon] - Hedef: [tarih]

## Sonraki Denetim
Onerilen: [tarih] (aylik veya buyuk degisiklik sonrasi)
==============================
```
