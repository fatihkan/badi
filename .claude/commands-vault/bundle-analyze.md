Bundle size + framework detection + largest assets + heavy-dependency warnings.

# Required Tools
- Bash (badi dev bundle)

# Procedure

### Step 1: Build
```bash
npm run build
```

### Step 2: Analyze
```bash
badi dev bundle
```

### Step 3: What Is Shown

- **Framework detection**: Next.js, Vite, Webpack, Expo
- **Build output**: dist/, build/, .next/, out/, web-build/
- **Total size**: in MB
- **10 largest assets**: JS, MJS, CSS
- **Heavy dependencies**: moment, lodash, axios, jquery — alternative suggestions

### Step 4: Alert Thresholds

- **Asset > 500KB**: CRITICAL — apply code splitting
- **Asset > 200KB**: Attention — consider lazy loading
- **Total > 5MB**: Affects web vitals

### Step 5: Deep Analysis

Framework-specific tools:
- **Webpack**: `npx webpack-bundle-analyzer`
- **Vite**: `npx vite-bundle-visualizer`
- **Next.js**: `npx @next/bundle-analyzer`

### Step 6: Common Fixes

- **Code splitting**: `import()` dynamic imports
- **Tree shaking**: ESM + sideEffects: false
- **Lazy load**: React.lazy, Vue defineAsyncComponent
- **CDN externals**: React/Vue from a CDN
- **Minification**: production mode
- **Compression**: gzip/brotli

# Example

```
npm run build
/bundle-analyze
```
