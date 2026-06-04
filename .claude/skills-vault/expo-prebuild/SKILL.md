---
name: expo-prebuild
description: Managed-to-bare transition with Expo prebuild, the ios/android directories, .easignore, native-upgrade discipline, and custom-mod application order. Triggers on expo prebuild, prebuild, managed to bare, bare workflow, native upgrade, ios android directory, easignore, prebuild cache, eject, sync native, native code generation.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-prebuild

A guide to the managed → bare transition and continuous native sync with `npx expo prebuild`. Managing the `ios/` and `android/` directories, `.easignore`, the native-upgrade flow, and custom-mod application order. Plugin writing lives in `expo-config-plugin`.

## Ne Yapar

- Generates the native projects with the `prebuild` command
- Continuous native generation (CNG) vs persisted native karari
- EAS build cleanup with `.easignore`
- Native upgrade akisi (Expo SDK + dependencies)
- Prebuild cache and `--clean` flag usage
- Custom mod compose sirasi

## Prebuild Komutlari

```bash
# Temel
npx expo prebuild

# Tek platform
npx expo prebuild --platform ios
npx expo prebuild --platform android

# Clean start (delete and regenerate the native directories)
npx expo prebuild --clean

# Belirli template
npx expo prebuild --template <github-url-or-tarball>

# Skip dependency install
npx expo prebuild --no-install
```

## Iki Strateji

### A) Continuous Native Generation (CNG) — Onerilen
- **Don't commit** the `ios/` and `android/` directories
- Her build oncesi `prebuild` calisir (EAS otomatik)
- Native config tamamen `app.config.ts` + plugin'lerden uretilir
- Advantage: easy SDK upgrades, no conflicts
- Limit: very custom native changes = you must write a config plugin

### B) Persisted Native (eski "bare")
- `ios/` and `android/` are committed
- `prebuild` calistirma — dogrudan Xcode/Android Studio
- Advantage: full native control
- Sinir: SDK upgrade manuel, conflict beklenir

## `.gitignore` (for CNG)

```
/ios
/android
```

## `.easignore` (EAS build hizlandirma)

```
/ios
/android
.expo/
node_modules/
*.test.ts
__tests__/
docs/
apps/web/
packages/web-only/
```

> Every file in `.gitignore` is fine for `.easignore` too. Without `.easignore`, EAS uses `.gitignore`.

## Native Upgrade Akisi

```bash
# 1. Expo SDK yukselt
npx expo install expo@latest
npx expo install --check          # uyumsuz paketleri tespit et
npx expo install --fix            # otomatik uyumlu surume cek

# 2. Prebuild yeniden (CNG ise her zaman)
npx expo prebuild --clean

# 3. Pod install (iOS)
cd ios && pod install && cd ..

# 4. Test
npx expo run:ios
npx expo run:android
```

## Persisted Native Mode: Manuel Patch Akisi

CNG kullanmiyorsan:

```bash
# 1. See which native changes the new Expo SDK brought
npx expo prebuild --clean --platform ios
# Review the ios/ changes with git diff

# 2. Patch'leri kendi ios/ android/ dizinine elle uygula
# 3. ios/ android/ commit'le
```

> Daha cok hata ihtimali. CNG'ye gecmek genelde daha az aci.

## Custom Mod Uygulama Sirasi

Prebuild sirasinda mod'lar sirayla calisir:
1. `app.config.ts` `plugins` arrayindaki sira **kritik**
2. Once `withInfoPlist` mod'lari uygulanir
3. Sonra `withDangerousMod` mod'lari
4. En son `mod.finalize`

Cakisma varsa: bir plugin Info.plist'e key ekliyor, sonraki silmemeli.

```ts
// app.config.ts
export default {
  expo: {
    plugins: [
      "./plugins/withBaseConfig",      // 1. Temel
      "./plugins/withFeatureFlags",    // 2. Flag'leri ekle
      "./plugins/withFinalize",        // 3. Son temizlik
    ],
  },
};
```

## Prebuild Cache

```bash
# Cache temizleme (sorun cikarsa)
rm -rf node_modules .expo ios android
npm install
npx expo prebuild --clean
cd ios && pod install && cd ..
```

iOS Pods cache:
```bash
cd ios
pod cache clean --all
pod deintegrate
pod install
```

Gradle cache:
```bash
cd android
./gradlew --stop
./gradlew clean
rm -rf ~/.gradle/caches/build-cache-*
```

## Dogrulama

```bash
# Native dosya kontrolu
ls -la ios/MyApp.xcworkspace
ls -la android/app/build.gradle

# Info.plist plugin etkisi
plutil -p ios/MyApp/Info.plist | grep MyCustomKey

# AndroidManifest plugin etkisi
grep "API_KEY" android/app/src/main/AndroidManifest.xml

# Run
npx expo run:ios
npx expo run:android
```

## Best Practices

- **CNG modu sec** (ios/android commit etme) — SDK upgrade kolaylasir
- **`.easignore`** EAS upload boyutunu dusurur
- **`--clean`** use often — it fixes stale-residue problems
- **Plugin sirasi** belirgin yaz (yorum koy)
- **Pod install** her prebuild sonrasi (iOS native dep degisirse)
- Run **`expo-doctor`** before and after prebuild

## Sik Hata Kaliplari

- `ios/` committed but a plugin exists too → manual patch + plugin clash
- `pod install` atlanmis → iOS build "module not found"
- Gradle cache tortusu → "duplicate class"
- `--clean` olmadan plugin degisikligi → eski state kalir
- Native dependency missing from `package.json` but present in `ios/Podfile` → lost in CI
- `expo-modules-autolinking` version mismatch → autolink fails

## Hard Refusal

- Baska gelistiricinin native kodunu izinsiz commit'lemek
- Prebuilding with a forged bundle ID and trying to submit
- App Store kurali ihlali eden native modifikasyon (private API kullanimi)

## Cikti Formati

1. CNG mi persisted mi karari (rationale)
2. `.easignore` ornegi
3. Prebuild komutu (kopya-yapistir)
4. Native upgrade sirasi
5. Dogrulama komutlari
6. Next step: `expo-config-plugin` (custom mod) or `expo-eas-build`
