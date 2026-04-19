Bundle size + framework tespit + en buyuk asset'ler + agir bagimlilik uyarisi.

# Gerekli Araclar
- Bash (badi dev bundle)

# Prosedur

### Adim 1: Build Al
```bash
npm run build
```

### Adim 2: Analiz
```bash
badi dev bundle
```

### Adim 3: Gosterilenler

- **Framework tespit**: Next.js, Vite, Webpack, Expo
- **Build ciktisi**: dist/, build/, .next/, out/, web-build/
- **Toplam boyut**: MB cinsinden
- **En buyuk 10 asset**: JS, MJS, CSS
- **Agir bagimliliklar**: moment, lodash, axios, jquery — alternatif onerisi

### Adim 4: Alarm Esikleri

- **Asset > 500KB**: KRITIK — code splitting yap
- **Asset > 200KB**: Dikkat — lazy load dusun
- **Toplam > 5MB**: Web vitals etkiler

### Adim 5: Derin Analiz

Framework ozel araclar:
- **Webpack**: `npx webpack-bundle-analyzer`
- **Vite**: `npx vite-bundle-visualizer`
- **Next.js**: `npx @next/bundle-analyzer`

### Adim 6: Yaygin Cozumler

- **Code splitting**: `import()` dynamic imports
- **Tree shaking**: ESM + sideEffects: false
- **Lazy load**: React.lazy, Vue defineAsyncComponent
- **CDN externals**: React/Vue CDN'den
- **Minification**: production mode
- **Compression**: gzip/brotli

# Ornek

```
npm run build
/bundle-analyze
```
