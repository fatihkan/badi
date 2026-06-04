---
name: expo-eas-build
description: iOS and Android build profiles with EAS Build, credentials management, build cache, secrets, and monorepo support. Triggers on eas build, eas.json, build profile, credentials, provisioning profile, keystore, push certificate, service account, build cache, eas secret, monorepo, development build, preview build, production build.
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

A guide to profile discipline, credentials management, and the build process for EAS Build. Scoped to `eas.json` configuration, iOS provisioning + push cert, Android keystore + service account, secrets, and monorepo support. Store-submit DETAIL lives in `expo-eas-submit`.

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

| Profile | Distribution | Purpose | Device |
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
# Apple ID + app-specific password or ASC API key
```

ASC API Key (recommended for CI):
```bash
# App Store Connect > Users > Keys > Generate
# Use the .p8 file instead of EAS_APPLE_APP_SPECIFIC_PASSWORD
```

## Android Credentials

```bash
eas credentials -p android
```

EAS yonetir:
- Keystore (build signing) — loss = the app can't be updated
- FCM Service Account (push)
- Google Play Service Account JSON (for submit)

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

# Local build (for CI/CD)
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

> `EXPO_PUBLIC_*` is embedded in the client. **NEVER prefix secret values with `EXPO_PUBLIC_`.**

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

For pnpm/yarn workspaces, `cli.appVersionSource: "remote"` and the `package.json > workspaces` path must be correct.

## Best Practices

- `appVersionSource: "remote"` — version EAS'te merkezde
- `autoIncrement: true` — buildNumber/versionCode otomatik
- The production profile **must not** have `developmentClient`
- Keep the keystore backup offline (loss = a new package name)
- Push cert/key renewal: test in production, then distribute

## Sik Hata Kaliplari

- `bundle identifier` change → provisioning profile invalid
- `versionCode` artmamasi → Play Store reddeder
- iOS push cert eksik → notifications calismaz (`expo-notifications`)
- EAS Secret with the `EXPO_PUBLIC_` prefix → leaks to the client
- Monorepo'da `.easignore` eksik → upload sisirir, build yavaslar

## Hard Refusal

- Baska gelistiricinin keystore/provisioning profile'ini izinsiz kullanmak
- Bundle ID hijacking (mevcut bir app'i taklit)
- Yetkisiz Apple ID/Google Play hesabina baglanti
- Signing with a forged certificate

## Cikti Formati

1. `eas.json` snippet (profil bazli)
2. Credentials flow (who manages it, how it's verified)
3. Build komutu (kopya-yapistir)
4. Risks: keystore backup, cert renewal
5. Next step: `expo-eas-submit` (store upload) or `expo-eas-update` (OTA)
