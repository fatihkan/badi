Mobil proje yonetim komutu. React Native/Flutter/Expo/Swift/Kotlin proje iskelesi, version sync, build ve release rehberleri.

# Gerekli Araclar
- Bash (badi mobile komutlari)

# Prosedur

### Adim 1: Ne Yapmak Istiyor?

Kullaniciya sor:
- **Yeni proje** — `init` ile iskelet
- **Version bump** — iOS/Android/Flutter sync
- **Build** — Release APK/IPA
- **Release** — TestFlight/Play Store rehberi
- **Asset uretimi** — Icon/Splash/Screenshots

### Adim 2: Yeni Proje (init)

```bash
badi mobile init MyApp --framework [rn|flutter|expo|swift|kotlin]
```

Framework'e gore:
- **react-native**: npx react-native init
- **flutter**: flutter create
- **expo**: create-expo-app
- **swift**: Xcode manuel rehber
- **kotlin**: Android Studio manuel rehber

Sonrasi:
```bash
cd MyApp
npx @fatihkan/badi init      # Badi konfigurasyonu
```

### Adim 3: Version Bump

```bash
badi mobile version bump [major|minor|patch]
```

Sync ettigi dosyalar (otomatik tespit):
- `package.json` (RN, Expo)
- `ios/**/Info.plist` (iOS)
- `android/app/build.gradle` (Android)
- `pubspec.yaml` (Flutter)

### Adim 4: Build

```bash
badi mobile build ios        # iOS release (Xcode/xcodebuild)
badi mobile build android    # Android AAB (Gradle)
```

Proje turu otomatik tespit edilir (RN vs Flutter).

### Adim 5: Release Pipeline

```bash
badi mobile release testflight      # iOS beta
badi mobile release play-internal   # Android internal track
badi mobile release appstore        # iOS production
badi mobile release play            # Android production
```

Her hedef icin adim adim rehber gosterir. Otomatik deploy icin:
- fastlane (iOS + Android)
- eas submit (Expo)

### Adim 6: Asset Uretimi

```bash
badi mobile assets icon [source.png]      # 40+ boyut rehberi (iOS + Android)
badi mobile assets splash                 # Splash screen boyutlari
badi mobile assets screenshots            # App Store + Play screenshot boyutlari
```

ImageMagick kurulu ise otomatik uretim komutlari verir.

### Adim 7: Release Notes

```bash
badi icerik release-notes --platform ios --version X.Y.Z --lang tr,en
badi icerik release-notes --platform android --version X.Y.Z
```

### Adim 8: ASO Entegrasyonu

Launch oncesi:
- `/aso` — App Store listing optimizasyonu
- `/aso-strategy` — Marketing plan
- `/icerik-uret` — Lansman postlari

# Checklist: Yeni Surum Cikarma

1. `badi mobile version bump minor`
2. `badi mobile build ios && badi mobile build android`
3. `badi icerik release-notes --platform ios --version X.Y.Z --lang tr,en`
4. `badi secret-scan --git` (guvenlik)
5. `badi mobile release testflight` (ios staging)
6. `badi mobile release play-internal` (android staging)
7. Test + QA
8. `badi mobile release appstore && badi mobile release play` (production)
9. `badi aso audit [app-id]` (listing kontrol)

# Ornek
```
/mobile init MyApp --framework react-native
/mobile version bump minor
/mobile build android
```
