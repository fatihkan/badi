---
name: expo-orchestrator
description: Expo + React Native cross-platform mobile app development orchestrator — workflow selection (managed/bare/dev-client), project setup, eas profile discipline, release strategy. Triggers on expo, react native, eas, mobil, app store, play store, ios, android, app.json, eas.json, prebuild, expo-router, expo-modules.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  homepage: https://github.com/fatihkan/badi-skills/tree/main/skills/expo-orchestrator
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-orchestrator

The main orchestrator for Expo CLI + EAS-based React Native projects. Guides workflow selection, project setup, package selection, and release strategy. Routes to the other `expo-*` skills.

## What It Does

- **Workflow selection**: a trade-off matrix for the Managed / Bare / Dev Client decision
- **Project setup**: `npx create-expo-app` + template selection (`default` / `tabs` / `bare-minimum`)
- **Package selection**: a list of critical Expo SDK packages + alternatives evaluation
- **EAS account connection**: `eas login`, `eas whoami`, project ID management
- **Release planning**: TestFlight/internal track → production flow
- **Skill routing**: subcategory selection and in-family delegation

## Routing Matrix

| Question / Situation | Which skill? |
|----------------------|--------------|
| File-based routing, deep linking, layout | `expo-router` |
| `eas build` profile setup, credentials | `expo-eas-build` |
| App Store / Play Store submit | `expo-eas-submit` |
| OTA update, channel, runtime version | `expo-eas-update` |
| `withInfoPlist`, `withAndroidManifest` plugin | `expo-config-plugin` |
| Managed → bare transition, prebuild | `expo-prebuild` |
| Writing Swift/Kotlin native modules | `expo-modules` |
| Dev build vs Expo Go decision | `expo-dev-client` |
| Push notification (FCM/APNs) | `expo-notifications` |
| `app.json` / `app.config.ts` settings | `expo-app-config` |
| Cache, version mismatch, build errors | `expo-troubleshooting` |

## Workflow Selection Matrix

### Managed Workflow
**When**: quick prototyping, no need to write native code, Expo SDK packages suffice, OTA updates are critical.
**Limit**: you can't use 3rd-party native libs (only those a config plugin supports); EAS Build is required for the App Store.

### Bare Workflow
**When**: writing native modules, a 3rd-party iOS/Android SDK is required, custom build steps, familiarity with Xcode/Android Studio.
**Limit**: Expo Go won't work (dev-client required), native upgrades are on you, OTA updates need EAS Update + runtime-version discipline.

### Dev Client (middle ground)
**When**: most of the managed advantages (OTA, EAS) + a few native modules. The default recommendation in modern Expo.
**Command**: `npx expo install expo-dev-client && eas build --profile development`

## Typical Flow (from scratch to production)

1. **Create the project**
   ```bash
   npx create-expo-app@latest MyApp --template default
   cd MyApp
   ```

2. **EAS account connection**
   ```bash
   npm install -g eas-cli
   eas login
   eas init               # assigns the project ID to app.json
   ```

3. **Dev client (recommended)**
   ```bash
   npx expo install expo-dev-client
   eas build --profile development --platform all
   ```
   → the `expo-dev-client` skill

4. **App config & router**
   - `app.json` / `app.config.ts`: bundle ID, version, scheme → `expo-app-config`
   - File-based router: `app/_layout.tsx` + `app/(tabs)/index.tsx` → `expo-router`

5. **Build profiles** (`eas.json`)
   - development / preview / production → `expo-eas-build`

6. **OTA updates**
   - `eas update:configure`, channels, runtime versions → `expo-eas-update`

7. **Store submit**
   - `eas submit --platform ios/android` → `expo-eas-submit`

## Recommended Packages (default setup)

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

## Up-Front Information Gathering (at the start of every engagement)

When a new project or feature arrives, ask first:
- **Workflow** status: managed / bare / dev-client?
- Are the **EAS** account and project ID set up?
- **Platform** target: iOS / Android / web / all?
- **Distribution** strategy: internal / TestFlight / production?
- Is an **OTA** strategy needed? (it speeds the release cycle)
- Is a **native module** needed? (it exceeds the managed limit)

Don't make a recommendation without this information — the recommended workflow changes.

## Hard Refusal

Red list for this skill:
- Violating app store review rules (privacy, IAP bypass, deceptive UI)
- Jailbreak/root detection bypass
- Premium content bypass-for-gain
- Unauthorized reverse engineering of other apps

Always verify user intent. No unauthorized targets.

## Output Format

When you make a recommendation:
1. **Workflow decision** + rationale (1-2 lines)
2. **Command sequence** (copy-paste ready)
3. **Recommended skill** (subcategory)
4. **Risks and decisions**: who owns native upgrades, is OTA needed, cost
5. **Next step**: when to move to which skill

## Common Failure Patterns

- **Expo SDK + package version mismatch**: verify with `npx expo install --check`, then fix
- **EAS project ID missing**: run `eas init`, check `extra.eas.projectId` in app.json
- **iOS bundle ID change**: renew provisioning profile + push cert — `expo-eas-build`
- **Android upload key lost**: is EAS reading the credentials, there should be a backup — `expo-eas-build`
- **Metro bundler cache**: `npx expo start --clear` or `watchman watch-del-all`
