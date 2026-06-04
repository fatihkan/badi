---
name: expo-orchestrator
description: Expo + React Native cross-platform mobile app development orchestrator — workflow selection (managed/bare/dev-client), project setup, eas profile discipline, release strategy. Triggers on expo, react native, eas, mobil, app store, play store, ios, android, app.json, eas.json, prebuild, expo-router, expo-modules.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-orchestrator

The main orchestrator for Expo CLI + EAS-based React Native projects. Guides workflow selection, project setup, package selection, and release strategy. Routes to the other `expo-*` skills.

## Ne Yapar

- **Workflow selection**: a trade-off matrix for the Managed / Bare / Dev Client decision
- **Proje kurulumu**: `npx create-expo-app` + template secimi (`default` / `tabs` / `bare-minimum`)
- **Paket secimi**: Kritik Expo SDK paketlerinin listesi + alternatif degerlendirme
- **EAS hesap baglanti**: `eas login`, `eas whoami`, project ID yonetimi
- **Release planlama**: TestFlight/internal track → production akisi
- **Skill routing**: subcategory selection and in-family delegation

## Yonlendirme Matrisi

| Soru / Durum | Hangi skill'e? |
|--------------|---------------|
| File-based routing, deep linking, layout | `expo-router` |
| `eas build` profil ayari, credentials | `expo-eas-build` |
| App Store / Play Store submit | `expo-eas-submit` |
| OTA update, channel, runtime version | `expo-eas-update` |
| `withInfoPlist`, `withAndroidManifest` plugin | `expo-config-plugin` |
| Managed → bare transition, prebuild | `expo-prebuild` |
| Swift/Kotlin native modul yazimi | `expo-modules` |
| Dev build vs Expo Go karari | `expo-dev-client` |
| Push notification (FCM/APNs) | `expo-notifications` |
| `app.json` / `app.config.ts` ayarlari | `expo-app-config` |
| Cache, version mismatch, build hatalari | `expo-troubleshooting` |

## Workflow Secim Matrisi

### Managed Workflow
**When**: quick prototyping, no need to write native code, Expo SDK packages suffice, OTA updates are critical.
**Limit**: you can't use 3rd-party native libs (only those a config plugin supports); EAS Build is required for the App Store.

### Bare Workflow
**When**: writing native modules, a 3rd-party iOS/Android SDK is required, custom build steps, familiarity with Xcode/Android Studio.
**Limit**: Expo Go won't work (dev-client required), native upgrades are on you, OTA updates need EAS Update + runtime-version discipline.

### Dev Client (orta yol)
**Ne zaman**: bircok managed avantaji (OTA, EAS) + bir kac native modul. Modern Expo'da default oneri.
**Komut**: `npx expo install expo-dev-client && eas build --profile development`

## Tipik Akis (sifirdan production)

1. **Proje olustur**
   ```bash
   npx create-expo-app@latest MyApp --template default
   cd MyApp
   ```

2. **EAS hesap baglanti**
   ```bash
   npm install -g eas-cli
   eas login
   eas init               # project ID atar app.json'a
   ```

3. **Dev client (onerilen)**
   ```bash
   npx expo install expo-dev-client
   eas build --profile development --platform all
   ```
   → `expo-dev-client` skill'i

4. **App config & router**
   - `app.json` / `app.config.ts`: bundle ID, version, scheme → `expo-app-config`
   - File-based router: `app/_layout.tsx` + `app/(tabs)/index.tsx` → `expo-router`

5. **Build profilleri** (`eas.json`)
   - development / preview / production → `expo-eas-build`

6. **OTA updates**
   - `eas update:configure`, channels, runtime versions → `expo-eas-update`

7. **Store submit**
   - `eas submit --platform ios/android` → `expo-eas-submit`

## Onerilen Paketler (default kurulum)

```bash
npx expo install \
  expo-router expo-dev-client \
  expo-constants expo-linking expo-status-bar \
  expo-splash-screen expo-system-ui \
  react-native-safe-area-context react-native-screens
```

As needed:
- Auth: `expo-auth-session`, `expo-secure-store`
- Notifications: `expo-notifications` → `expo-notifications` skill
- Media: `expo-image`, `expo-av`, `expo-image-picker`
- Storage: `@react-native-async-storage/async-storage`
- Database: `expo-sqlite`

## On Bilgi Toplama (her engagement basinda)

When a new project or feature arrives, ask first:
- **Workflow** durumu: managed / bare / dev-client?
- Are the **EAS** account and project ID set up?
- **Platform** hedefi: iOS / Android / web / hepsi?
- **Distribution** stratejisi: internal / TestFlight / production?
- Is an **OTA** strategy needed? (it speeds the release cycle)
- Is a **native module** needed? (it exceeds the managed limit)

Bu bilgi olmadan onerme yapma — onerilen workflow degisir.

## Hard Refusal

Red list for this skill:
- App store gozetim kurallari ihlali (privacy, IAP bypass, deceptive UI)
- Jailbreak/root detection bypass
- Premium icerik bypass-for-gain
- Yetkisiz reverse engineering uygulanan baska app'lerin

Always verify user intent. No unauthorized targets.

## Cikti Formati

Bir oneride bulundugunda:
1. **Workflow karari** + rationale (1-2 satir)
2. **Komut sirasi** (kopya-yapistir hazir)
3. **Onerilen skill** (alt kategori)
4. **Risks and decisions**: who owns native upgrades, is OTA needed, cost
5. **Next step**: when to move to which skill

## Sik Hata Kaliplari

- **Expo SDK + package version mismatch**: verify with `npx expo install --check`, then fix
- **EAS project ID missing**: run `eas init`, check `extra.eas.projectId` in app.json
- **iOS bundle ID degisikligi**: provisioning profile + push cert yeniden — `expo-eas-build`
- **Android upload key lost**: is EAS reading the credentials, there should be a backup — `expo-eas-build`
- **Metro bundler cache**: `npx expo start --clear` or `watchman watch-del-all`
