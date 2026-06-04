SEO audit command. Website SEO analysis, meta tag checks, sitemap validation, and speed assessment.

# Gerekli Araclar
- Bash (badi seo komutlari)

# Prosedur

### Adim 1: Kapsam Belirle

Kullaniciya sor: "Hangi analizi yapalim?"
- **Tam audit** — 20+ kontrol (tavsiye edilen baslangic)
- **Meta taglar** — OG, Twitter Card detayi
- **Sitemap + robots.txt** — Crawlability
- **Hiz + kaynaklar** — Performance baslangici

### Adim 2: SEO Audit (Varsayilan)
```bash
badi seo audit [url]
```

Kontrol edilenler:
- Title, Description, OG tags, Twitter Card
- H1 yapisi (tek olmali)
- Gorsel alt taglari
- Canonical URL, Viewport, lang, charset
- HTTPS, Schema.org, robots meta
- Kelime sayisi, link analizi

SEO skoru 0-100 arasi verilir.

### Adim 3: Detayli Analizler

```bash
badi seo meta [url]        # Meta tag analizi (eksik tespit)
badi seo sitemap [url]     # robots.txt + sitemap.xml
badi seo speed [url]       # TTFB + HTML boyutu + compression
```

### Adim 4: Iyilestirme Onerileri

Skor < 80 ise bulgulara gore:
- **Title eksik/uzun**: 30-60 karakter onerisi
- **Description yok**: 120-160 karakter ornek
- **H1 sorunu**: Sayfa yapisi onerisi
- **Gorsel alt eksik**: WCAG + SEO birlesik fayda
- **Canonical yok**: Duplicate content riski
- **Schema.org yok**: Structured data firsati

### Adim 5: Lighthouse Derin Analiz

Daha derin metrikler icin:
```bash
badi lighthouse [url]
```
Core Web Vitals + Performance + Accessibility + Best Practices + SEO skoru.

### Adim 6: AI Search Optimizasyonu

Modern SEO'da GEO (Generative Engine Optimization) onemli:
- ChatGPT/Perplexity tarafindan alintılanma
- Schema.org structured data
- llms.txt dosyasi (opsiyonel)

Claude Code'da `ai-seo` veya `seo-geo` skill'ini cagirin (ileri seviye).

# Ornek Kullanim

```
/seo https://example.com
```

```
Kullanici: /seo blog.com
Asistan: [badi seo audit calistirir]
         SEO skoru: 72/100
         Kritik sorunlar: 
           - Meta description eksik
           - 3 gorselde alt tag yok
         Detay icin: /seo-audit ile devam edelim mi?
```
