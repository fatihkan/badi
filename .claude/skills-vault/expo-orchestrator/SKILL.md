---
name: expo-orchestrator
description: Expo + React Native cross-platform mobil uygulama gelistirme orchestrator — workflow secimi (managed/bare/dev-client), proje kurulumu, eas profil disiplini, release stratejisi. Triggers on expo, react native, eas, mobil, app store, play store, ios, android, app.json, eas.json, prebuild, expo-router, expo-modules.
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

Expo CLI + EAS tabanli React Native projeleri icin ana orkestrator. Workflow secimi, proje kurulumu, paket secimi ve release stratejisinde rehberlik eder. Diger `expo-*` skill'lere yonlendirme yapar.

## Ne Yapar

- **Workflow secimi**: Managed / Bare / Dev Client karari icin trade-off matrisi
- **Proje kurulumu**: `npx create-expo-app` + template secimi (`default` / `tabs` / `bare-minimum`)
- **Paket secimi**: Kritik Expo SDK paketlerinin listesi + alternatif degerlendirme
- **EAS hesap baglanti**: `eas login`, `eas whoami`, project ID yonetimi
- **Release planlama**: TestFlight/internal track → production akisi
- **Skill yonlendirme**: alt kategori secimi ve aile-ici delegation

## Yonlendirme Matrisi

| Soru / Durum | Hangi skill'e? |
|--------------|---------------|
| File-based routing, deep linking, layout | `expo-router` |
| `eas build` profil ayari, credentials | `expo-eas-build` |
| App Store / Play Store submit | `expo-eas-submit` |
| OTA update, channel, runtime version | `expo-eas-update` |
| `withInfoPlist`, `withAndroidManifest` plugin | `expo-config-plugin` |
| Managed → bare gecis, prebuild | `expo-prebuild` |
| Swift/Kotlin native modul yazimi | `expo-modules` |
| Dev build vs Expo Go karari | `expo-dev-client` |
| Push notification (FCM/APNs) | `expo-notifications` |
| `app.json` / `app.config.ts` ayarlari | `expo-app-config` |
| Cache, version mismatch, build hatalari | `expo-troubleshooting` |

## Workflow Secim Matrisi

### Managed Workflow
**Ne zaman**: hizli prototip, native kod yazmaya gerek yok, Expo SDK paketleri yeterli, OTA update kritik.
**Sinir**: 3rd-party native lib kullanamazsin (sadece config plugin destekleyenler), App Store icin EAS Build zorunlu.

### Bare Workflow
**Ne zaman**: native modul yazimi, 3rd-party iOS/Android SDK zorunlu, custom build steps, Xcode/Android Studio aliskinligi var.
**Sinir**: Expo Go calismaz (dev-client zorunlu), native upgrades elinde, OTA update icin EAS Update + runtime version disiplini.

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

İhtiyaca göre:
- Auth: `expo-auth-session`, `expo-secure-store`
- Notifications: `expo-notifications` → `expo-notifications` skill
- Media: `expo-image`, `expo-av`, `expo-image-picker`
- Storage: `@react-native-async-storage/async-storage`
- Database: `expo-sqlite`

## On Bilgi Toplama (her engagement basinda)

Yeni bir proje veya feature gelince once sor:
- **Workflow** durumu: managed / bare / dev-client?
- **EAS** hesap ve project ID kurulu mu?
- **Platform** hedefi: iOS / Android / web / hepsi?
- **Distribution** stratejisi: internal / TestFlight / production?
- **OTA** stratejisi gerekli mi? (release dongusu hizlandirir)
- **Native modul** ihtiyaci var mi? (managed sinirini asar)

Bu bilgi olmadan onerme yapma — onerilen workflow degisir.

## Hard Refusal

Bu skill icin red listesi:
- App store gozetim kurallari ihlali (privacy, IAP bypass, deceptive UI)
- Jailbreak/root detection bypass
- Premium icerik bypass-for-gain
- Yetkisiz reverse engineering uygulanan baska app'lerin

Kullanici niyeti her zaman dogrula. Yetkisiz hedef yok.

## Cikti Formati

Bir oneride bulundugunda:
1. **Workflow karari** + rationale (1-2 satir)
2. **Komut sirasi** (kopya-yapistir hazir)
3. **Onerilen skill** (alt kategori)
4. **Riskler ve kararlar**: native upgrade'lerin sahibi kim, OTA gerekli mi, cost
5. **Sonraki adim**: ne zaman hangi skill'e gec

## Sik Hata Kaliplari

- **Expo SDK + paket version mismatch**: `npx expo install --check` ile dogrula, sonra fix
- **EAS project ID eksik**: `eas init` koş, app.json `extra.eas.projectId` kontrol et
- **iOS bundle ID degisikligi**: provisioning profile + push cert yeniden — `expo-eas-build`
- **Android upload key kayip**: EAS credentials okuyor mu, yedek olmali — `expo-eas-build`
- **Metro bundler cache**: `npx expo start --clear` veya `watchman watch-del-all`
