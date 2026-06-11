---
name: expo-prebuild
description: Managed-to-bare transition with Expo prebuild, the ios/android directories, .easignore, native-upgrade discipline, and custom-mod application order. Triggers on expo prebuild, prebuild, managed to bare, bare workflow, native upgrade, ios android directory, easignore, prebuild cache, eject, sync native, native code generation.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  homepage: https://github.com/fatihkan/badi-skills/tree/main/skills/expo-prebuild
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-prebuild

A guide to the managed → bare transition and continuous native sync with `npx expo prebuild`. Managing the `ios/` and `android/` directories, `.easignore`, the native-upgrade flow, and custom-mod application order. Plugin writing lives in `expo-config-plugin`.

## What It Does

- Generates the native projects with the `prebuild` command
- Continuous native generation (CNG) vs persisted native decision
- EAS build cleanup with `.easignore`
- Native upgrade flow (Expo SDK + dependencies)
- Prebuild cache and `--clean` flag usage
- Custom mod compose order

## Prebuild Commands

```bash
# Basic
npx expo prebuild

# Single platform
npx expo prebuild --platform ios
npx expo prebuild --platform android

# Clean start (delete and regenerate the native directories)
npx expo prebuild --clean

# Specific template
npx expo prebuild --template <github-url-or-tarball>

# Skip dependency install
npx expo prebuild --no-install
```

## Two Strategies

### A) Continuous Native Generation (CNG) — Recommended
- **Don't commit** the `ios/` and `android/` directories
- `prebuild` runs before every build (EAS does it automatically)
- Native config is fully generated from `app.config.ts` + plugins
- Advantage: easy SDK upgrades, no conflicts
- Limit: very custom native changes = you must write a config plugin

### B) Persisted Native (the old "bare")
- `ios/` and `android/` are committed
- Don't run `prebuild` — go straight to Xcode/Android Studio
- Advantage: full native control
- Limit: manual SDK upgrades, expect conflicts

## `.gitignore` (for CNG)

```
/ios
/android
```

## `.easignore` (speeds up the EAS build)

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

## Native Upgrade Flow

```bash
# 1. Upgrade the Expo SDK
npx expo install expo@latest
npx expo install --check          # detect incompatible packages
npx expo install --fix            # auto-pull compatible versions

# 2. Prebuild again (always, if using CNG)
npx expo prebuild --clean

# 3. Pod install (iOS)
cd ios && pod install && cd ..

# 4. Test
npx expo run:ios
npx expo run:android
```

## Persisted Native Mode: Manual Patch Flow

If you're not using CNG:

```bash
# 1. See which native changes the new Expo SDK brought
npx expo prebuild --clean --platform ios
# Review the ios/ changes with git diff

# 2. Apply the patches by hand to your own ios/ android/ directories
# 3. Commit ios/ android/
```

> Higher chance of errors. Moving to CNG is usually less painful.

## Custom Mod Application Order

During prebuild the mods run in order:
1. The order in the `app.config.ts` `plugins` array is **critical**
2. `withInfoPlist` mods are applied first
3. Then the `withDangerousMod` mods
4. `mod.finalize` last

If there's a clash: one plugin adds a key to Info.plist, the next must not delete it.

```ts
// app.config.ts
export default {
  expo: {
    plugins: [
      "./plugins/withBaseConfig",      // 1. Base
      "./plugins/withFeatureFlags",    // 2. Add the flags
      "./plugins/withFinalize",        // 3. Final cleanup
    ],
  },
};
```

## Prebuild Cache

```bash
# Clear the cache (if there's a problem)
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

## Verification

```bash
# Native file check
ls -la ios/MyApp.xcworkspace
ls -la android/app/build.gradle

# Info.plist plugin effect
plutil -p ios/MyApp/Info.plist | grep MyCustomKey

# AndroidManifest plugin effect
grep "API_KEY" android/app/src/main/AndroidManifest.xml

# Run
npx expo run:ios
npx expo run:android
```

## Best Practices

- **Choose CNG mode** (don't commit ios/android) — SDK upgrades get easier
- **`.easignore`** reduces the EAS upload size
- **`--clean`** use often — it fixes stale-residue problems
- Write the **plugin order** explicitly (add comments)
- **Pod install** after every prebuild (if an iOS native dep changes)
- Run **`expo-doctor`** before and after prebuild

## Common Failure Patterns

- `ios/` committed but a plugin exists too → manual patch + plugin clash
- `pod install` skipped → iOS build "module not found"
- Gradle cache residue → "duplicate class"
- A plugin change without `--clean` → old state remains
- Native dependency missing from `package.json` but present in `ios/Podfile` → lost in CI
- `expo-modules-autolinking` version mismatch → autolink fails

## Hard Refusal

- Committing another developer's native code without permission
- Prebuilding with a forged bundle ID and trying to submit
- Native modification that violates App Store rules (private API usage)

## Output Format

1. CNG vs persisted decision (rationale)
2. `.easignore` example
3. Prebuild command (copy-paste)
4. Native upgrade order
5. Verification commands
6. Next step: `expo-config-plugin` (custom mod) or `expo-eas-build`
