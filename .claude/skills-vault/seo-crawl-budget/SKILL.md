---
name: seo-crawl-budget
description: Dusuk rekabetli long-tail keyword'ler icin 6-24 saatte indexlenme metodolojisi. 20 makalelik kampanya, dongusel ic-link matrisi, Search Console manuel tetikleme. Triggers on: crawl budget, crawl butcesi, long-tail, long tail, indexleme, search console, internal linking, ic linkleme, sitemap, hizli index, fast indexing, SEO kampanya, kampanya plani.
license: MIT
compatibility: Works with Claude Code, Cursor, or any compatible AI coding agent.
allowed-tools: Read Write Edit Grep
metadata:
  author: fatihkan
  homepage: https://github.com/fatihkan/badi/tree/main/.claude/skills-vault/seo-crawl-budget
  badi-version: ">=1.20.0"
  category: seo
  upstream: https://github.com/moneyvadi-prog/crawl-budget-manipulation
  upstream-license: MIT
---

# SEO Crawl Budget Manipulation

Dusuk rekabetli long-tail keyword'lerde 6-24 saat icinde indexlenme ve ilk sayfa siralamasi hedefleyen sistematik SEO kampanya metodolojisi.

> **Atif:** Bu skill, [moneyvadi-prog/crawl-budget-manipulation](https://github.com/moneyvadi-prog/crawl-budget-manipulation) (MIT) reposundaki metodolojiden adapte edilmistir. Orijinal yazari Gulsah Arslan / [seodanismanlikhizmeti.com.tr](https://www.seodanismanlikhizmeti.com.tr/crawl-budget-manipulation-deneyi-gulsah-arslan/).

## Ne Zaman Kullanilir

**Uygun:**
- KD (keyword difficulty) < 20 olan long-tail sorgular
- Soru bazli, bilgi amacli veya yumusak ticari niyet
- Yeni ya da orta otorite domain'ler
- Hizli indexlenme test edilmek isteniyor

**Uygun degil:**
- Yuksek rekabetli ticari kelimeler
- Yuksek hacimli marka aramalari
- Domain otoritesi gerektiren kisa-tail sorgular

## Calisma Prensibi

Uc esgudumlu sinyal ile crawl butcesi yonlendirilir:

1. **Manuel crawl tetikleme** — Search Console "Indexle iste" + guncel sitemap
2. **Dongusel ic linkleme** — her makale 3 baska makaleye link verir
3. **Dusuk rekabetli niyet net keyword'ler** — KD < 20

Bu kombinasyon Google'a sitenin **aktif ve degerli** oldugu sinyalini verir, crawl frekansini artirir.

## 6 Fazli Kampanya Yapisi

### Faz 1 — Keyword Uretimi (Gun 0)
- 20 long-tail keyword: 10 esit yayin (Group A) + 10 zaman serpiştirilmis (Group B)
- Her keyword icin: arama hacmi (tahmini), KD, niyet (informational/commercial), SERP yapisi
- Ciktilar: `keywords-A.json`, `keywords-B.json`

### Faz 2 — Icerik Brief'leri (Gun 0-1)
- Tum 20 makale icin standart sablon
- Hedef: 800-900 kelime, ayni H2 yapisi
- Brief alanlari: title, slug, primary keyword, secondary keywords (2-3), H2 listesi (4-6), TLDR, FAQ (3-5 soru), iç-link hedefleri (3 makale)

### Faz 3 — Ic Link Matrisi (Gun 1)
- 20 makale icin dongusel link grafi (her dugum cikis derecesi = 3, gelis derecesi = 3)
- Group A icindeki 10 makale kendi arasinda + Group B'ye 1 link
- CSV/Markdown matris ciktisi: `linking-matrix.md`

### Faz 4 — Yayin Takvimi (Gun 1-6)
- **Group A**: tek gun icinde 2-3 saat penceresinde 10 makale yayinlanir
- **Group B**: 5 gune yayilmis, gunde 2 makale
- Yayin saati onerisi: hedef pazarin pik saatlerine yakin (TR icin 10:00-12:00, 19:00-21:00)

### Faz 5 — Search Console Aksiyonlari (Yayin gunu)
- XML sitemap guncellenir + Search Console'a tekrar gonderilir
- Her URL icin "URL incele" → "Indexle iste" (gunluk kota: ~10-12)
- robots.txt + canonical tag dogrulamasi

### Faz 6 — Takip Metrikleri (14-28 gun)
- Crawl frekansi (Search Console > Settings > Crawl stats)
- Indexlenme hizi (yayindan kac saat sonra indexlendi?)
- Coverage durumu (Indexed / Discovered-not-indexed)
- Anahtar kelime siralama trendi (manuel veya rank-tracker)
- Hedef: %70-90 makale 6-24 saatte indexli; %40-60 long-tail keyword ilk sayfada

## Veri Kontaminasyon Riskleri

Deney suresince **degistirme**:
- Yeni backlink kampanyasi
- Site mimarisi degisiklikleri
- Mevcut iceriklerin guncellenmesi
- Robot/canonical/redirect kurallari

Bu risk faktorleri kontrol grubu temizligini bozar.

## Cikti Sablonu

Bu skill aktifken ajan asagidaki dosyalari uretir/onerir:

```
seo-campaign-<slug>/
├── keywords-A.json          # 10 esit yayin
├── keywords-B.json          # 10 zamanlanmis
├── briefs/                  # 20 makale brief'i
├── linking-matrix.md        # Dongusel grafik
├── publication-schedule.csv # Tarih + saat
├── search-console-checklist.md
└── tracking-template.md     # 14-28 gun metrik
```

## Sinirlilik

- **Kara sapka degil** — sadece kalite-iceriksel + teknik tetikleme. Spam, gizleme, link agi yok.
- **Uzun vadeli degil** — kampanya bitiminde (28 gun) icerik ekosistemi normal SEO kurallarina doner.
- **Domain hassasiyeti** — yeni domain'lerde sandbox etkisi gorulebilir.
