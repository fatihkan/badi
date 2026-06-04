Lighthouse audit command. Performance, Accessibility, Best Practices, SEO scores and Core Web Vitals via the Google PageSpeed Insights API.

# Gerekli Araclar
- Bash (badi lighthouse komutu cagirisi)

# Prosedur

### Adim 1: URL Al
Kullanicidan tam URL al. http/https onekine dikkat. Argumansiz cagirildiysa sor.

### Adim 2: Strateji Secimi

Mobile mi desktop mi? Genelde **mobile** varsayilan cunku Google mobile-first indexing yapiyor.

```bash
badi lighthouse [url]              # Mobile (varsayilan)
badi lighthouse [url] --desktop    # Desktop
```

### Adim 3: Sonucu Yorumla

Skorlar 4 kategoride:
- **Performance** - hiz metrikleri
- **Accessibility** - axe-core tabanli
- **Best Practices** - HTTPS, console errors
- **SEO** - meta tags, crawlability

Core Web Vitals:
- **FCP** < 1.8s (iyi), < 3.0s (orta)
- **LCP** < 2.5s (iyi), < 4.0s (orta)
- **TBT** < 200ms (iyi), < 600ms (orta)
- **CLS** < 0.1 (iyi), < 0.25 (orta)

### Adim 4: Iyilestirme Onerileri

Skor < 90 kategorilerde kullaniciya somut oneriler ver:
- Performance dusuk: "Image optimization, code splitting, caching"
- A11y dusuk: "`/a11y-audit [url]` ile detay al"
- SEO dusuk: "`badi seo audit [url]` ile detayli rapor"

# Ornek
```
/lighthouse https://example.com
/lighthouse https://example.com --desktop
```
