---
name: expo-troubleshooting
description: Sik karsilasilan Expo hatalari: Metro cache, version mismatch, expo-doctor, Pod install, Gradle daemon, native module conflicts, EAS Build logs, dependency hoisting. Triggers on expo error, metro cache, version mismatch, expo-doctor, expo install check, pod install error, gradle error, native module not found, build failed, eas build log, dependency conflict, hermes error, hoisting.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-troubleshooting

Expo + React Native projelerinde sik karsilasilan hata kaliplari ve cozum reçeteleri. Metro cache, version mismatch, native build hatalari, EAS Build log okuma ve dependency conflict.

## Ne Yapar

- Metro bundler cache temizleme reçetesi
- `expo-doctor` ve `expo install --check` ile saglik kontrolu
- iOS Pod install hatalari (mismatch, cache, deployment target)
- Android Gradle daemon, cache, multiDex
- Native module conflict ve autolinking sorunlari
- EAS Build log okuma rehberi
- Monorepo dependency hoisting sorunlari

## Hizli Saglik Kontrolu

```bash
npx expo-doctor
npx expo install --check
npx expo install --fix       # uyumsuzlari otomatik fix
```

`expo-doctor` su konuları kontrol eder:
- SDK version uyumu
- Package version mismatch
- Plugin konfigurasyon
- Network erişimi
- Native dosya tutarliligi

## Metro Cache Sorunlari

**Belirti**: "Module not found", eski JS, yeni dosya gorulmuyor.

```bash
# Hizli
npx expo start --clear

# Daha derin
rm -rf node_modules/.cache .expo
watchman watch-del-all
npm cache clean --force
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# Reset
rm -rf node_modules
npm install
npx expo start --clear
```

`watchman` problemi:
```bash
watchman shutdown-server
brew install --HEAD watchman    # macOS
```

## Version Mismatch

**Belirti**: "react-native@0.74.x is not compatible with expo@51"

```bash
npx expo install --check
# > "react-native@X.Y is incompatible. Expected: X.Y"

npx expo install --fix
# veya elle
npx expo install react-native react react-dom
```

Manuel inceleme:
```bash
npx expo install --check --json
```

## iOS Pod Install Hatalari

### Hata: "CocoaPods could not find compatible versions"

```bash
cd ios
pod repo update
pod deintegrate
rm -rf Pods Podfile.lock
pod install --repo-update
```

### Hata: "Deployment target ... but pod requires iOS 15.1"

`app.json`:
```json
{
  "expo": {
    "plugins": [
      ["expo-build-properties", {
        "ios": { "deploymentTarget": "15.1" }
      }]
    ]
  }
}
```

```bash
npx expo prebuild --clean
cd ios && pod install
```

### Hata: "Use of undeclared identifier ... missing module"

Native modul autolink edilemedi:
```bash
npx expo prebuild --clean
cd ios && pod install
```

## Android Gradle Hatalari

### Hata: "Could not find / Duplicate class"

```bash
cd android
./gradlew --stop
./gradlew clean
rm -rf ~/.gradle/caches/build-cache-*
rm -rf .gradle build app/build
./gradlew assembleDebug --stacktrace
```

### Hata: "compileSdkVersion ... required X"

`app.json`:
```json
{
  "expo": {
    "plugins": [
      ["expo-build-properties", {
        "android": {
          "compileSdkVersion": 34,
          "targetSdkVersion": 34,
          "buildToolsVersion": "34.0.0"
        }
      }]
    ]
  }
}
```

### Gradle Daemon Memory

`android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

### MultiDex

`build.gradle` `defaultConfig`:
```gradle
multiDexEnabled true
```

## Native Module Conflict

**Belirti**: "Native module XYZ doesn't exist"

Kontrol listesi:
1. Modul `package.json`'da var mi?
2. `npx expo prebuild --clean` calistirildi mi?
3. iOS: `pod install` calistirildi mi?
4. Dev client yeniden build edildi mi? (`eas build --profile development`)
5. `expo-modules-autolinking` versiyon uyumlu mu?

```bash
# Autolinking listesini gor
npx expo-modules-autolinking search
```

## Hermes Sorunlari

**Belirti**: "Hermes engine ... incompatible bytecode"

```bash
# Hermes versiyonu kontrol
node -e "console.log(require('hermes-engine/package.json').version)"

# Cache temizle
rm -rf ios/Pods android/build
npx expo prebuild --clean
```

## EAS Build Log Okuma

```bash
# Son build'i listele
eas build:list --limit 5

# Belirli build log indir
eas build:view <build-id>

# Tarayicida ac
eas build:view <build-id> --url
```

**Log dosyalari**:
- `Install dependencies` — npm install/yarn output
- `Prebuild` — config plugin output (native dosyalari uretir)
- `Install pods` — iOS pod install
- `Build` — xcodebuild / gradle output
- `Upload artifact` — IPA/APK upload

Hata genelde **Build** asamasinda. Stacktrace'i sondan basa oku.

## Dependency Hoisting (Monorepo)

**Belirti**: "Multiple versions of react / Module 'react' not found"

```bash
# Hoist dogrula
ls node_modules/react/package.json
ls apps/mobile/node_modules/react   # OLMAMALI (hoist edilmis olmali)
```

`apps/mobile/metro.config.js`:
```js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Workspace root'u izle
config.watchFolders = [path.resolve(__dirname, "../..")];

// Sadece tek React kopyasi
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../../node_modules"),
];

// Symlink desteği
config.resolver.unstable_enableSymlinks = true;
module.exports = config;
```

pnpm icin:
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

`.npmrc`:
```
node-linker=hoisted
shamefully-hoist=true
```

## Cleartext Traffic (Android)

**Belirti**: "Cleartext HTTP traffic to ... not permitted"

```json
{
  "expo": {
    "plugins": [
      ["expo-build-properties", {
        "android": { "usesCleartextTraffic": true }
      }]
    ]
  }
}
```

> Sadece development icin. Production'da HTTPS kullan.

## EAS Build Local Test

```bash
eas build --local --profile preview --platform android
```

Local'de calisiyor ama EAS'te crash:
- `.easignore` cok mu disliyor? (sirf node_modules silmek yetmez)
- EAS Node versiyonu farkli mi? (`eas.json` `node` field)
- EAS Secret eksik mi?

## Network/Tunnel Sorunlari

```bash
# LAN'da sorun varsa tunnel
npx expo start --tunnel

# Tunnel yavas, LAN dene
npx expo start --lan

# Spesifik port
npx expo start --port 19000
```

## Sik Hata-Cozum Tablosu

| Hata | Cozum |
|------|-------|
| `Unable to resolve module ...` | `npx expo start --clear` |
| `Native module doesn't exist` | `npx expo prebuild --clean && pod install` |
| `Version mismatch` | `npx expo install --fix` |
| `Pod install failed` | `pod repo update && pod install` |
| `Gradle daemon disappeared` | `./gradlew --stop && ./gradlew clean` |
| `Multiple versions of react` | metro.config.js hoist sec |
| `Hermes incompatible bytecode` | Cache temizle + prebuild |
| `Cleartext traffic` | `expo-build-properties` plugin |
| `Bundle ID invalid` | `app.config.ts` bundle disiplini |

## Hard Refusal

- Kullanicidan habersiz dev mode'da kalip production'a deploy etmek
- Sertifika hatasini bypass eden runtime patch (`NSAllowsArbitraryLoads` production'da)
- Security check'leri (root detection, jailbreak) atlatan hack
- Baska gelistiricinin EAS build log'unu izinsiz okumak

## Cikti Formati

1. Hata mesaji + kategori (Metro / Pod / Gradle / Autolink / Hoist)
2. Hizli reçete (kopya-yapistir)
3. Derin reçete (eger hizli isemezse)
4. Onleme: aynisi tekrar etmesin diye ne yapilmali
5. Sonraki adim: hangi skill (build, prebuild, app-config)
