Derin altyapi denetimi komutu. Badi sisteminin tum bilesenlerini 9 kontrol noktasiyla kapsamli olarak denetler.

# Gerekli Araclar
- Read (tum konfig dosyalari) -- Grep (referans/kalip taramasi) -- Glob (dosya varlik) -- Bash (izin, JSON dogrulama, dosya bilgisi) -- Write (rapor)

# Prosedur (9 Kontrol)

## Kontrol 1: Ajan Sagligi
- `.claude/agents/` dosyalarini listele
- Her ajan: YAML frontmatter formati -- gerekli alanlar (isim, aciklama, araclar) -- referans araclar gecerli mi -- cozulmemis `{{...}}` -- talimat tutarliligi
- Ajan sayisi ve durum ozeti

## Kontrol 2: Komut Sagligi
- `.claude/commands/` dosyalarini listele
- Her komut: aciklama satiri -- arac gereksinimi -- prosedur adimlari -- cikti formati -- markdown gecerli
- `command-index.md` capraz referans: indekste olup dosyasi olmayan -- dosyasi olup indekste olmayan -- aciklama uyumsuzlugu

## Kontrol 3: Hook Sagligi
- `settings.json` JSON dogrula
- Her hook: dosya mevcut mu -- calistirilabilir izin -- kuru calistirma (syntax) -- tetikleyici dogru
- Calisma sirasi/oncelik -- carpisan/celisen hooklar

## Kontrol 4: Bellek Katmani
- `memory.md`: boyut (500 satir limiti) -- tazelik (son guncelleme) -- ic tutarlilik (celisen bilgi) -- kaynak atfisi
- `knowledge-base.md`: boyut (1000 satir limiti) -- kategorizasyon -- dogrulanmamis bilgi -- atif/referans

## Kontrol 5: Gunluk Sagligi
- Dizinler: `daily-notes/`, `handoffs/` boyut/sayi -- denetim iz dosyalari (audit-trail.md, incident-log.md, failure-log.md)
- Her gunluk: boyut siniri -- format tutarliligi -- tarih dogrulugu
- JSONL (verdicts.jsonl): her satir gecerli JSON -- sema tutarliligi

## Kontrol 6: Izin/Konfigurasyon
- Hook dosya izinleri -- settings.json icindeki referanslar mevcut mu -- ortam degiskeni bagimliliklari (kullanilan ama tanimsiz) -- dizin yapisi -- `.gitignore` ile hassas dosya kontrolu

## Kontrol 7: Capraz Tutarlilik
- A → B atif yapiyorsa B mevcut mu -- dongusel bagimlilik -- yetim referans (baglanmayan dosya) -- CLAUDE.md ↔ komut/ajan davranis uyumu -- isimlendirme konvansiyonu

## Kontrol 8: Yedekleme/Depolama
- Toplam `.claude/` boyutu -- en buyuk 5 dosya -- 30 gunden eski (arsiv adayi) -- otomatik temizlik mekanizmasi -- gecici dosyalar -- yedekleme stratejisi guncel mi

## Kontrol 9: Via Negativa
Gereksiz karmasik tespit: kullanilmayan bilesen (komut/ajan/hook) -- tekrarlayan/carpisan islev -- gereksiz bagimlilik zinciri -- asiri karmasik konfig -- olmeyen workaround -- kaldirildiginda sistemi iyilestirecek ogeler

# Derecelendirme
- **A:** Tum alt kontroller gecti, iyilestirme gerektirmiyor
- **B:** Kucuk uyarilar, acil mudahale yok
- **C:** Duzeltilmesi gereken sorunlar, planli sprintte
- **D:** Ciddi sorunlar, hemen ele alinmali
- **F:** Kritik basarisizlik, acil mudahale

**Genel Derece:** en dusuk bireysel veya agirlikli ortalama.

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
