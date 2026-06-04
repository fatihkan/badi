Mobile project management command. React Native/Flutter/Expo/Swift/Kotlin scaffolding, version sync, build and release guides.

# Required Tools
- Bash (badi mobile commands)

# Procedure

### Step 1: What Do They Want?

Ask the user:
- **New project** — scaffold with `init`
- **Version bump** — iOS/Android/Flutter sync
- **Build** — Release APK/IPA
- **Release** — TestFlight/Play Store guide
- **Asset production** — Icon/Splash/Screenshots

### Step 2: New Project (init)

```bash
badi mobile init MyApp --framework [rn|flutter|expo|swift|kotlin]
```

Per framework:
- **react-native**: npx react-native init
- **flutter**: flutter create
- **expo**: create-expo-app
- **swift**: Xcode manual guide
- **kotlin**: Android Studio manual guide

Afterwards:
```bash
cd MyApp
npx @fatihkan/badi init      # Badi configuration
```

### Step 3: Version Bump

```bash
badi mobile version bump [major|minor|patch]
```

Files it syncs (auto-detected):
- `package.json` (RN, Expo)
- `ios/**/Info.plist` (iOS)
- `android/app/build.gradle` (Android)
- `pubspec.yaml` (Flutter)

### Step 4: Build

```bash
badi mobile build ios        # iOS release (Xcode/xcodebuild)
badi mobile build android    # Android AAB (Gradle)
```

The project type is auto-detected (RN vs Flutter).

### Step 5: Release Pipeline

```bash
badi mobile release testflight      # iOS beta
badi mobile release play-internal   # Android internal track
badi mobile release appstore        # iOS production
badi mobile release play            # Android production
```

Shows a step-by-step guide per target. For automated deploys:
- fastlane (iOS + Android)
- eas submit (Expo)

### Step 6: Asset Production

```bash
badi mobile assets icon [source.png]      # 40+ size guide (iOS + Android)
badi mobile assets splash                 # Splash screen sizes
badi mobile assets screenshots            # App Store + Play screenshot sizes
```

If ImageMagick is installed, it provides automatic generation commands.

### Step 7: Release Notes

```bash
badi content release-notes --platform ios --version X.Y.Z
badi content release-notes --platform android --version X.Y.Z
```

### Step 8: ASO Integration

Before launch:
- `/aso` — App Store listing optimization
- `aso-master` agent — Marketing plan / full strategy
- `/content-generate` — Launch posts

# Checklist: Shipping a New Version

1. `badi mobile version bump minor`
2. `badi mobile build ios && badi mobile build android`
3. `badi content release-notes --platform ios --version X.Y.Z`
4. `badi secret-scan --git` (security)
5. `badi mobile release testflight` (iOS staging)
6. `badi mobile release play-internal` (Android staging)
7. Test + QA
8. `badi mobile release appstore && badi mobile release play` (production)
9. `badi aso audit [app-id]` (listing check)

# Example
```
/mobile init MyApp --framework react-native
/mobile version bump minor
/mobile build android
```
