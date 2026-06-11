---
name: expo-dev-client
description: Custom development builds with expo-dev-client, build profiles, a custom dev menu, runtime-version compatibility, and EAS Update integration. Triggers on expo-dev-client, dev client, custom dev build, development build, dev menu, expo go, runtime version, debug build, dev launcher, scan qr, dev server.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  homepage: https://github.com/fatihkan/badi-skills/tree/main/skills/expo-dev-client
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-dev-client

Setting up custom development builds with `expo-dev-client`. Comparison with Expo Go, build profiles, a custom dev menu, runtime-version compatibility, and the EAS Update test flow.

## What It Does

- `expo-dev-client` setup + build profile
- Expo Go vs Dev Client decision
- Dev menu (cmd+D / shake) and custom actions
- Dev launcher (multi-app, multi-server)
- EAS Update test flow (via the dev client)
- Runtime version & native dep compatibility

## Setup

```bash
npx expo install expo-dev-client
```

`app.json` (automatic plugin):
```json
{
  "expo": {
    "plugins": ["expo-dev-client"]
  }
}
```

EAS profile:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "channel": "development"
    }
  }
}
```

Build:
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
# or local
npx expo run:ios
npx expo run:android
```

## Expo Go vs Dev Client

| Feature | Expo Go | Dev Client |
|---------|---------|------------|
| Setup | From the App Store | Your own build |
| Native module | Only Expo SDK | All custom modules |
| Config plugin | Limited | Full support |
| Bundle ID | host.exp.Exponent | Your own ID |
| Splash/icon | Generic | Your own |
| EAS Update | ❌ | ✅ |
| Push notification | Limited | Full support |
| Production-like | No | Yes |

> In modern Expo the default recommendation is **Dev Client**. Expo Go is for quick prototyping only.

## Start the Dev Server

```bash
npx expo start --dev-client
# or
npx expo start
# → the "dev client" option appears in the QR menu
```

Once the Dev Client app opens:
- Show the server URL (LAN/Tunnel)
- Scan the QR or enter the URL manually
- The bundle loads

## Dev Launcher

With the Dev Client's `Switch to another bundle`:
- Connect to a different dev server (collab)
- Preview an EAS Update branch
- Preview the production bundle (rare)

## Dev Menu

Trigger:
- iOS sim: `Cmd+D` or `Cmd+Ctrl+Z`
- Android emulator: `Cmd+M` / `Ctrl+M`
- Device: shake

Menu contents:
- Reload
- Toggle Element Inspector
- Toggle Performance Monitor
- Open JS Debugger (Hermes inspector)
- Show Dev Menu (custom button)

## Custom Dev Menu Item

```ts
import { registerDevMenuItems } from "expo-dev-menu";

if (__DEV__) {
  registerDevMenuItems([
    {
      name: "Reset Storage",
      callback: async () => {
        await AsyncStorage.clear();
      },
    },
    {
      name: "Open Sentry",
      callback: () => Linking.openURL("https://sentry.io/myorg/myapp"),
    },
  ]);
}
```

## EAS Update Test Flow

Previewing an EAS Update branch in the Dev Client:
1. Publish an update to the branch
   ```bash
   eas update --branch preview --message "test"
   ```
2. In the Dev Client app go to **Extensions > Updates**
3. Select the branch, open it as a preview
4. Return to normal mode after testing

## Runtime Version Compatibility

If the Dev Client build and the production build are on different `runtimeVersion`s, OTA won't apply. During testing:

```json
{
  "expo": {
    "runtimeVersion": { "policy": "fingerprint" }
  }
}
```

The moment you add a native dep to the dev client, a new build is required. JS-only changes already arrive over the dev server.

## Debug Build vs Production Build

| Type | Hermes | JS bundle | Splash | Dev menu |
|------|--------|-----------|--------|----------|
| Debug (dev client) | Dev | Metro server | Native | Yes |
| Release (preview) | Prod | Embedded | Native | No |
| Production | Prod | Embedded | Native | No |

## Best Practices

- **Dev client** a separate build per team member (Apple device UDIDs registered)
- **Tunnel** usage: `npx expo start --tunnel` (behind a firewall)
- **`developmentClient: true`** profile for the dev profile only
- **Hermes** turned on in dev too (same behavior as production)
- **AndroidManifest cleartext traffic** is needed in dev; turn it off in production

## Common Failure Patterns

- Device can't find the dev server → not on the same LAN, or a firewall
- "Native module XYZ doesn't exist" → the dev client was not rebuilt
- iOS simulator dev client crash → `simulator: true` missing in the profile
- Old client after a bundle ID change → uninstall + reinstall
- Tunnel is too slow → prefer LAN or `--lan`

## Hard Refusal

- Distributing a production bundle via the dev client without signing
- Registering a device UDID without the owner's permission
- Leaving the dev menu open in production (security risk)

## Output Format

1. Build profile (`development`)
2. `expo-dev-client` install command
3. Start command (copy-paste)
4. Why dev client instead of Expo Go? (rationale)
5. EAS Update test plan
