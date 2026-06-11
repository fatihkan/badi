---
name: expo-troubleshooting
description: Common Expo errors: Metro cache, version mismatch, expo-doctor, Pod install, Gradle daemon, native module conflicts, EAS Build logs, dependency hoisting. Triggers on expo error, metro cache, version mismatch, expo-doctor, expo install check, pod install error, gradle error, native module not found, build failed, eas build log, dependency conflict, hermes error, hoisting.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  homepage: https://github.com/fatihkan/badi-skills/tree/main/skills/expo-troubleshooting
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-troubleshooting

Common error patterns and fix recipes in Expo + React Native projects. Metro cache, version mismatch, native build errors, reading EAS Build logs, and dependency conflicts.

## What It Does

- Metro bundler cache-clearing recipe
- Health check with `expo-doctor` and `expo install --check`
- iOS Pod install errors (mismatch, cache, deployment target)
- Android Gradle daemon, cache, multiDex
- Native module conflicts and autolinking problems
- A guide to reading EAS Build logs
- Monorepo dependency hoisting problems

## Quick Health Check

```bash
npx expo-doctor
npx expo install --check
npx expo install --fix       # auto-fix incompatibilities
```

`expo-doctor` checks these areas:
- SDK version compatibility
- Package version mismatch
- Plugin configuration
- Network access
- Native file consistency

## Metro Cache Problems

**Symptom**: "Module not found", stale JS, a new file isn't picked up.

```bash
# Quick
npx expo start --clear

# Deeper
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

`watchman` problem:
```bash
watchman shutdown-server
brew install --HEAD watchman    # macOS
```

## Version Mismatch

**Symptom**: "react-native@0.74.x is not compatible with expo@51"

```bash
npx expo install --check
# > "react-native@X.Y is incompatible. Expected: X.Y"

npx expo install --fix
# or by hand
npx expo install react-native react react-dom
```

Manual inspection:
```bash
npx expo install --check --json
```

## iOS Pod Install Errors

### Error: "CocoaPods could not find compatible versions"

```bash
cd ios
pod repo update
pod deintegrate
rm -rf Pods Podfile.lock
pod install --repo-update
```

### Error: "Deployment target ... but pod requires iOS 15.1"

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

### Error: "Use of undeclared identifier ... missing module"

The native module couldn't be autolinked:
```bash
npx expo prebuild --clean
cd ios && pod install
```

## Android Gradle Errors

### Error: "Could not find / Duplicate class"

```bash
cd android
./gradlew --stop
./gradlew clean
rm -rf ~/.gradle/caches/build-cache-*
rm -rf .gradle build app/build
./gradlew assembleDebug --stacktrace
```

### Error: "compileSdkVersion ... required X"

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

**Symptom**: "Native module XYZ doesn't exist"

Checklist:
1. Is the module in `package.json`?
2. Was `npx expo prebuild --clean` run?
3. iOS: was `pod install` run?
4. Was the dev client rebuilt? (`eas build --profile development`)
5. Is `expo-modules-autolinking` version-compatible?

```bash
# See the autolinking list
npx expo-modules-autolinking search
```

## Hermes Problems

**Symptom**: "Hermes engine ... incompatible bytecode"

```bash
# Check the Hermes version
node -e "console.log(require('hermes-engine/package.json').version)"

# Clear the cache
rm -rf ios/Pods android/build
npx expo prebuild --clean
```

## Reading EAS Build Logs

```bash
# List the latest builds
eas build:list --limit 5

# Download a specific build log
eas build:view <build-id>

# Open in the browser
eas build:view <build-id> --url
```

**Log files**:
- `Install dependencies` — npm install/yarn output
- `Prebuild` — config plugin output (generates the native files)
- `Install pods` — iOS pod install
- `Build` — xcodebuild / gradle output
- `Upload artifact` — IPA/APK upload

The error is usually in the **Build** stage. Read the stacktrace from the bottom up.

## Dependency Hoisting (Monorepo)

**Symptom**: "Multiple versions of react / Module 'react' not found"

```bash
# Verify hoisting
ls node_modules/react/package.json
ls apps/mobile/node_modules/react   # SHOULD NOT EXIST (should be hoisted)
```

`apps/mobile/metro.config.js`:
```js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Watch the workspace root
config.watchFolders = [path.resolve(__dirname, "../..")];

// Only a single React copy
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../../node_modules"),
];

// Symlink support
config.resolver.unstable_enableSymlinks = true;
module.exports = config;
```

For pnpm:
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

**Symptom**: "Cleartext HTTP traffic to ... not permitted"

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

> Development only. Use HTTPS in production.

## EAS Build Local Test

```bash
eas build --local --profile preview --platform android
```

Works locally but crashes on EAS:
- Is `.easignore` excluding too much? (deleting only node_modules isn't enough)
- Is the EAS Node version different? (`eas.json` `node` field)
- Is an EAS Secret missing?

## Network/Tunnel Problems

```bash
# Tunnel if there's a LAN problem
npx expo start --tunnel

# Tunnel slow, try LAN
npx expo start --lan

# Specific port
npx expo start --port 19000
```

## Quick Error-Fix Table

| Error | Fix |
|-------|-----|
| `Unable to resolve module ...` | `npx expo start --clear` |
| `Native module doesn't exist` | `npx expo prebuild --clean && pod install` |
| `Version mismatch` | `npx expo install --fix` |
| `Pod install failed` | `pod repo update && pod install` |
| `Gradle daemon disappeared` | `./gradlew --stop && ./gradlew clean` |
| `Multiple versions of react` | set metro.config.js hoisting |
| `Hermes incompatible bytecode` | Clear the cache + prebuild |
| `Cleartext traffic` | `expo-build-properties` plugin |
| `Bundle ID invalid` | `app.config.ts` bundle discipline |

## Hard Refusal

- Deploying to production while stuck in dev mode without informing the user
- A runtime patch that bypasses a certificate error (`NSAllowsArbitraryLoads` in production)
- A hack that bypasses security checks (root detection, jailbreak)
- Reading another developer's EAS build log without permission

## Output Format

1. Error message + category (Metro / Pod / Gradle / Autolink / Hoist)
2. Quick recipe (copy-paste)
3. Deep recipe (if the quick one doesn't work)
4. Prevention: what to do so the same thing doesn't recur
5. Next step: which skill (build, prebuild, app-config)
