---
name: expo-prebuild
description: Expo prebuild ile managed'tan bare'e gecis, ios/android dizinleri, .easignore, native upgrade disiplini ve custom mods uygulama sirasi. Triggers on expo prebuild, prebuild, managed to bare, bare workflow, native upgrade, ios android directory, easignore, prebuild cache, eject, sync native, native code generation.
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

`npx expo prebuild` ile managed → bare gecisi ve continuous native sync rehberi. `ios/` ve `android/` dizinlerinin yonetimi, `.easignore`, native upgrade akisi ve custom mod uygulama sirasi. Plugin yazimi `expo-config-plugin`'dedir.

## Ne Yapar

- `prebuild` komutu ile native projeleri uretir
- Continuous native generation (CNG) vs persisted native karari
- `.easignore` ile EAS build temizligi
- Native upgrade akisi (Expo SDK + dependencies)
- Prebuild cache ve `--clean` flag kullanimi
- Custom mod compose sirasi

## Prebuild Komutlari

```bash
# Temel
npx expo prebuild

# Tek platform
npx expo prebuild --platform ios
npx expo prebuild --platform android

# Temiz baslangic (native dizinleri sil ve yeniden uret)
npx expo prebuild --clean

# Belirli template
npx expo prebuild --template <github-url-or-tarball>

# Skip dependency install
npx expo prebuild --no-install
```

## Iki Strateji

### A) Continuous Native Generation (CNG) — Onerilen
- `ios/` ve `android/` dizinlerini **commit etme**
- Her build oncesi `prebuild` calisir (EAS otomatik)
- Native config tamamen `app.config.ts` + plugin'lerden uretilir
- Avantaj: SDK upgrade kolay, conflict yok
- Sinir: cok ozel native degisiklik = config plugin yazmak gerekir

### B) Persisted Native (eski "bare")
- `ios/` ve `android/` commit edilir
- `prebuild` calistirma — dogrudan Xcode/Android Studio
- Avantaj: tum native kontrolu
- Sinir: SDK upgrade manuel, conflict beklenir

## `.gitignore` (CNG icin)

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

> Her `.gitignore`'da olan dosya `.easignore` icin de uygundur. `.easignore` yoksa EAS `.gitignore` kullanir.

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
# 1. Yeni Expo SDK'da hangi native degisikligi geldigini gor
npx expo prebuild --clean --platform ios
# git diff ile ios/ degisikliklerini incele

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
- **`--clean`** Sik kullan — kalin tortu sorunu cozer
- **Plugin sirasi** belirgin yaz (yorum koy)
- **Pod install** her prebuild sonrasi (iOS native dep degisirse)
- **`expo-doctor`** prebuild oncesi ve sonrasi calistir

## Sik Hata Kaliplari

- `ios/` commit edilmis ama plugin de var → manuel patch + plugin cakismasi
- `pod install` atlanmis → iOS build "module not found"
- Gradle cache tortusu → "duplicate class"
- `--clean` olmadan plugin degisikligi → eski state kalir
- Native dependency `package.json`'da yok, `ios/Podfile`'da var → CI'da kaybolur
- `expo-modules-autolinking` versiyon uyumsuzlugu → autolink basarisiz

## Hard Refusal

- Baska gelistiricinin native kodunu izinsiz commit'lemek
- Sahte bundle ID ile prebuild yapip submit etmeye calismak
- App Store kurali ihlali eden native modifikasyon (private API kullanimi)

## Cikti Formati

1. CNG mi persisted mi karari (rationale)
2. `.easignore` ornegi
3. Prebuild komutu (kopya-yapistir)
4. Native upgrade sirasi
5. Dogrulama komutlari
6. Sonraki adim: `expo-config-plugin` (custom mod) veya `expo-eas-build`
