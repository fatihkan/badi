---
name: expo-eas-build
description: EAS Build ile iOS ve Android build profilleri, credentials yonetimi, build cache, secrets ve monorepo destegi. Triggers on eas build, eas.json, build profile, credentials, provisioning profile, keystore, push certificate, service account, build cache, eas secret, monorepo, development build, preview build, production build.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-eas-build

EAS Build icin profil disiplini, credentials yonetimi ve build sureci rehberi. `eas.json` yapilandirmasi, iOS provisioning + push cert, Android keystore + service account, secrets ve monorepo desteginde sinirli kalir. Store submit DETAYI `expo-eas-submit`'tedir.

## Ne Yapar

- `eas.json` profil mimarisi (development / preview / production)
- iOS credentials: provisioning profile, distribution cert, push cert
- Android credentials: keystore, upload key, FCM service account
- Build cache, environment variables, EAS Secrets
- Build hooks (`eas-build-pre-install`, `eas-build-on-success`)
- Monorepo (`pnpm` / `yarn workspaces` / `turborepo`) destegi

## Kurulum

```bash
npm install -g eas-cli
eas login
eas whoami
eas init                  # project ID atar
eas build:configure       # eas.json baslangic
```

## `eas.json` Sablonu

```json
{
  "cli": { "version": ">= 7.0.0", "appVersionSource": "remote" },
  "build": {
    "base": {
      "node": "20.11.0",
      "env": { "EXPO_PUBLIC_APP_ENV": "base" }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "channel": "development"
    },
    "preview": {
      "extends": "base",
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "channel": "preview",
      "env": { "EXPO_PUBLIC_APP_ENV": "preview" }
    },
    "production": {
      "extends": "base",
      "autoIncrement": true,
      "channel": "production",
      "env": { "EXPO_PUBLIC_APP_ENV": "production" }
    }
  },
  "submit": { "production": {} }
}
```

## Profil Stratejisi

| Profil | Distribution | Amaç | Cihaz |
|--------|--------------|------|-------|
| development | internal | Dev client, JS debug, hot reload | Cihaz/sim |
| preview | internal | QA/stakeholder test (IPA/APK) | Cihaz |
| production | store | App Store / Play Store | Cihaz |

## iOS Credentials

```bash
eas credentials                    # interaktif menu
eas credentials -p ios             # iOS only
```

EAS yonetir:
- Distribution Certificate (.p12)
- Provisioning Profile (.mobileprovision)
- APNs Push Key (.p8)

Apple hesap baglanti:
```bash
eas credentials --platform ios
# Apple ID + app-specific password veya ASC API key
```

ASC API Key (CI icin onerilen):
```bash
# App Store Connect > Users > Keys > Generate
# .p8 dosyasini EAS_APPLE_APP_SPECIFIC_PASSWORD yerine kullan
```

## Android Credentials

```bash
eas credentials -p android
```

EAS yonetir:
- Keystore (build imzasi) — kayip = uygulama yenilenemez
- FCM Service Account (push)
- Google Play Service Account JSON (submit icin)

Keystore yedekleme:
```bash
eas credentials -p android
# Download → Keystore → keystore.jks yedekle (offline + sifreli)
```

## Build Calistirma

```bash
eas build --profile development --platform ios
eas build --profile preview --platform all
eas build --profile production --platform android

# Local build (CI/CD icin)
eas build --local --profile preview --platform android

# Specific commit/branch
eas build --profile production --message "v1.2.0 release"
```

## EAS Secrets & Environment

```bash
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value xxx
eas secret:list
eas secret:delete --id <id>
```

`eas.json` env:
```json
"production": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://api.example.com",
    "SENTRY_DSN": "$SENTRY_DSN"
  }
}
```

> `EXPO_PUBLIC_*` istemciye gomulur. **Secret degerleri ASLA `EXPO_PUBLIC_` ile prefix etme.**

## Build Hooks

`package.json`:
```json
{
  "scripts": {
    "eas-build-pre-install": "echo 'pre-install hook'",
    "eas-build-post-install": "patch-package",
    "eas-build-on-success": "node ./scripts/notify-slack.js"
  }
}
```

## Monorepo

`eas.json`:
```json
{
  "build": {
    "production": {
      "cache": { "key": "mono-v1" },
      "node": "20.11.0"
    }
  }
}
```

`.easignore` (npm publish hari isgali engelle):
```
node_modules/
.git/
apps/web/
packages/web-only/
```

pnpm/yarn workspaces icin `cli.appVersionSource: "remote"` ve `package.json > workspaces` yolu dogru olmali.

## Best Practices

- `appVersionSource: "remote"` — version EAS'te merkezde
- `autoIncrement: true` — buildNumber/versionCode otomatik
- Production profilinde `developmentClient` **olmamali**
- Keystore yedegini offline tut (kayip = yeni paket adi)
- Push cert/key yenileme: production'da test et, sonra dagit

## Sik Hata Kaliplari

- `bundle identifier` degisikligi → provisioning profile geçersiz
- `versionCode` artmamasi → Play Store reddeder
- iOS push cert eksik → notifications calismaz (`expo-notifications`)
- EAS Secret `EXPO_PUBLIC_` prefix'i ile → istemciye sizar
- Monorepo'da `.easignore` eksik → upload sisirir, build yavaslar

## Hard Refusal

- Baska gelistiricinin keystore/provisioning profile'ini izinsiz kullanmak
- Bundle ID hijacking (mevcut bir app'i taklit)
- Yetkisiz Apple ID/Google Play hesabina baglanti
- Sahte sertifika ile imzalama

## Cikti Formati

1. `eas.json` snippet (profil bazli)
2. Credentials akisi (kim yonetiyor, nasil dogrulanir)
3. Build komutu (kopya-yapistir)
4. Riskler: keystore yedek, cert yenileme
5. Sonraki adim: `expo-eas-submit` (store yukleme) veya `expo-eas-update` (OTA)
