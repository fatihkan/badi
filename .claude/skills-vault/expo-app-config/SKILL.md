---
name: expo-app-config
description: app.json vs app.config.ts vs app.config.js secimi, environment variables, variants, extra fields, plugin chain ve slug/scheme/bundle/version disiplini. Triggers on app.json, app.config.ts, app.config.js, expo config, environment variable, .env, eas secret, variant, extra field, slug, scheme, bundle identifier, package name, version, build number, version code.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-app-config

`app.json`, `app.config.ts`, `app.config.js` arasinda secim, environment variables, variants (dev/staging/prod) ve identifier disiplini. Plugin chain `expo-config-plugin`'dedir.

## Ne Yapar

- `app.json` vs `app.config.ts` vs `app.config.js` karari
- Environment variables (`.env`, `EXPO_PUBLIC_*`, EAS Secrets)
- Multi-variant (dev/staging/production) yapilandirma
- `extra` field disiplini ve runtime erisim
- Slug, scheme, bundleIdentifier, package, version, buildNumber yonetimi
- Plugin chain sirasi

## Hangi Format?

| Format | Avantaj | Sinir | Ne zaman? |
|--------|---------|-------|-----------|
| `app.json` | Statik, basit | JS yok, env yok | Tek variant, simple |
| `app.config.js` | Dynamic, env | TypeScript yok | Eski tercih |
| `app.config.ts` | Dynamic + tipli | Compile step | **Onerilen** |

> Cogu projede `app.config.ts` kullan. `app.json`'i statik fallback olarak birak veya tamamen kaldir.

## `app.config.ts` Sablonu

```ts
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT ?? "development";
  const isProduction = variant === "production";

  return {
    ...config,
    name: variantName(variant),
    slug: "myapp",
    scheme: "myapp",
    version: "1.2.0",
    orientation: "portrait",
    icon: `./assets/icon-${variant}.png`,
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: bundleId(variant),
      buildNumber: "1",
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Kamera erisimi gerekli",
      },
    },
    android: {
      package: bundleId(variant),
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: `./assets/icon-fg-${variant}.png`,
        backgroundColor: "#ffffff",
      },
    },
    plugins: [
      "expo-router",
      "expo-dev-client",
      ["expo-notifications", { icon: "./assets/notif-icon.png" }],
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      sentryDsn: process.env.SENTRY_DSN,
      eas: { projectId: "your-eas-project-id" },
      variant,
    },
    runtimeVersion: { policy: "fingerprint" },
    updates: {
      url: "https://u.expo.dev/your-project-id",
    },
  };
};

function variantName(v: string): string {
  switch (v) {
    case "production": return "MyApp";
    case "staging": return "MyApp (Staging)";
    default: return "MyApp (Dev)";
  }
}

function bundleId(v: string): string {
  const base = "com.example.myapp";
  if (v === "production") return base;
  return `${base}.${v}`;
}
```

## Variant Calistirma

```bash
APP_VARIANT=development npx expo start
APP_VARIANT=staging eas build --profile preview
APP_VARIANT=production eas build --profile production
```

`eas.json`:
```json
{
  "build": {
    "development": { "env": { "APP_VARIANT": "development" } },
    "preview":     { "env": { "APP_VARIANT": "staging" } },
    "production":  { "env": { "APP_VARIANT": "production" } }
  }
}
```

## Environment Variables

| Tip | Erisim | Build-time | Runtime |
|-----|--------|------------|---------|
| `EXPO_PUBLIC_*` (`.env`) | JS: `process.env.EXPO_PUBLIC_X` | Evet | Evet (gomulu) |
| `process.env.X` (`app.config.ts`) | Sadece config'te | Evet | Hayir |
| EAS Secret | EAS build sirasinda | Evet | Hayir (gomulmez) |
| `extra` field | `Constants.expoConfig.extra.X` | Evet | Evet |

> **KRITIK**: API anahtarlari `EXPO_PUBLIC_*` ile **ASLA** prefix etme — istemciye gomulur, herkes okur. Gercek secret'lar backend'de.

## `.env` Dosyalari

```bash
# .env (default)
EXPO_PUBLIC_API_URL=https://api.dev.example.com

# .env.production
EXPO_PUBLIC_API_URL=https://api.example.com
```

`.gitignore`:
```
.env.local
.env.*.local
```

> `.env` commit edilir mi? `EXPO_PUBLIC_*` zaten public, sorun yok. Secret degerler `.env.local`'de tutulur, asla commit edilmez.

## `extra` Field Runtime Erisim

```ts
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
const variant = Constants.expoConfig?.extra?.variant;
```

Typed wrapper:
```ts
// src/config.ts
import Constants from "expo-constants";

type AppExtra = {
  apiUrl: string;
  sentryDsn: string;
  variant: "development" | "staging" | "production";
};

export const appConfig = Constants.expoConfig?.extra as AppExtra;
```

## Identifier Disiplini

| Field | Format | Degisirse |
|-------|--------|-----------|
| `slug` | `kebab-case` | EAS project ID degisir |
| `scheme` | `kebab-case` veya tek kelime | Deep link kirildi |
| `ios.bundleIdentifier` | `com.org.app` | Yeni app, sertifika gecersiz |
| `android.package` | `com.org.app` | Yeni app, keystore gecersiz |
| `version` | `1.2.3` (SemVer) | Yeni release |
| `ios.buildNumber` | `string` | Her build artir |
| `android.versionCode` | `integer` | Her build artir |

> `bundleIdentifier` ve `package` degisirse uygulama **yeni bir uygulama** olur. Eski yukleyiciler kaybolur.

## Variant'lar Icin Bundle ID Stratejisi

```
com.example.myapp           # production
com.example.myapp.staging   # staging
com.example.myapp.dev       # development
```

Avantaj: 3 ayri uygulama ayni cihazda yan yana. Production cihazi tehlikeye atmaz.

## Plugin Chain

```ts
plugins: [
  "expo-router",                                    // Once routing
  "expo-dev-client",                                // Dev araclari
  ["expo-build-properties", {                       // Native build ozellikleri
    ios: { deploymentTarget: "15.1" },
    android: { compileSdkVersion: 34 }
  }],
  ["expo-notifications", { icon: "..." }],          // Native modul'ler
  "./plugins/withCustomConfig",                     // Custom plugin'ler
]
```

Sira: routing → dev tools → build props → native modul → custom.

## Best Practices

- **`app.config.ts`** sec — typed + dynamic
- **Variant** bundle ID disiplini ile 3 paralel app
- **EAS Secrets** gercek secret'lar icin (asla `.env` veya `EXPO_PUBLIC_`)
- **`expo-build-properties`** plugin'i ile native versiyon kontrolu
- **`runtimeVersion: fingerprint`** OTA disiplini icin
- **`extra.eas.projectId`** ASLA elden silme
- **SemVer**: major (breaking), minor (feature), patch (fix)

## Sik Hata Kaliplari

- `app.json` + `app.config.ts` ikisi de var → `app.config.ts` kazanir, kafa karistirir
- `EXPO_PUBLIC_API_SECRET` → secret istemciye sizar
- `extra.eas.projectId` silinmis → EAS yeni project olusturmaya calisir
- `bundleIdentifier` degistirilmis → sertifika/keystore yenilemek gerekir
- `versionCode` artmamis → Play Store reddeder
- `.env` degisikligi sonrasi Metro cache → `--clear` gerekir
- `extra` field tipsiz → runtime'da `undefined` patlama

## Hard Refusal

- Baska app'in bundle ID'sini taklit (hijack)
- API secret'i `EXPO_PUBLIC_` prefix ile gomdurmek
- `extra` field icine credit card/PII koymak
- Variant ID disiplini olmadan production verisini staging app'e bagliyor

## Cikti Formati

1. Format secimi (`app.config.ts` rationale)
2. Variant ve bundle ID stratejisi
3. `.env` ve EAS Secret ayrimi
4. Plugin chain sirasi
5. Identifier disiplini ozeti
6. Sonraki adim: `expo-config-plugin` veya `expo-eas-build`
