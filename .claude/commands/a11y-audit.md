Web accessibility (WCAG 2.1) denetim komutu. PageSpeed Insights uzerinden axe-core tabanli kontrol.

# Gerekli Araclar
- Bash (badi a11y komutu cagirisi)

# Prosedur

### Adim 1: URL Al
Kullanicidan test edilecek URL al.

### Adim 2: Badi CLI Calistir

```bash
badi a11y [url]              # Mobile audit
badi a11y [url] --desktop    # Desktop audit
```

### Adim 3: Sonuclari Yorumla

Skor bandlari:
- **90-100**: Mukemmel, coq iyi
- **70-89**: Iyi ama iyilestirilebilir
- **< 70**: Ciddi sorunlar var

### Adim 4: Yaygin Hatalar ve Cozumleri

Basarisiz auditlere gore somut duzeltme oneri ver:

- **color-contrast**: "Foreground/background kontrast orani 4.5:1 olmali (AA), 7:1 (AAA)"
- **image-alt**: "Tum `<img>` elemanlarina anlamli `alt` ekle, decorative ise `alt=\"\"`"
- **label**: "Form input'lari `<label for=\"\">` ile eslestir"
- **link-name**: "Link metinleri aciklayici olmali, \"tikla\" yerine gercek eylem"
- **button-name**: "Butonlarin erisilebilir isimi olmali (aria-label veya text icerik)"
- **heading-order**: "Baslik hiyerarsisi h1->h2->h3 (atlama yok)"
- **landmark-one-main**: "Her sayfada bir `<main>` landmark olmali"
- **html-has-lang**: "`<html lang=\"tr\">` veya `<html lang=\"en\">` tanimla"

### Adim 5: Manuel Test Hatirlatmasi

Axe-core otomatiklastirilamaz test eder. Manuel test gereken alanlar:
- Keyboard navigation (Tab, Enter, Space, Arrow keys)
- Screen reader testi (VoiceOver, NVDA)
- 200% zoom okunabilirlik
- Video/audio captioning

### Adim 6: Kapsamli Denetim

- `/lighthouse [url]` ile full Lighthouse raporu (performance + SEO + a11y)
- WCAG quickref linkini ver

# Ornek
```
/a11y-audit https://example.com
```
