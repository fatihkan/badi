---
name: expo-dev-client
description: Custom development builds with expo-dev-client, build profiles, a custom dev menu, runtime-version compatibility, and EAS Update integration. Triggers on expo-dev-client, dev client, custom dev build, development build, dev menu, expo go, runtime version, debug build, dev launcher, scan qr, dev server.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-dev-client

Setting up custom development builds with `expo-dev-client`. Comparison with Expo Go, build profiles, a custom dev menu, runtime-version compatibility, and the EAS Update test flow.

## Ne Yapar

- `expo-dev-client` kurulum + build profili
- Expo Go vs Dev Client karari
- Dev menu (cmd+D / shake) and custom actions
- Dev launcher (multi-app, multi-server)
- EAS Update test akisi (dev client uzerinden)
- Runtime version & native dep uyumu

## Kurulum

```bash
npx expo install expo-dev-client
```

`app.json` (otomatik plugin):
```json
{
  "expo": {
    "plugins": ["expo-dev-client"]
  }
}
```

EAS profili:
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

| Ozellik | Expo Go | Dev Client |
|---------|---------|------------|
| Kurulum | App Store'dan | Kendi build'in |
| Native modul | Sadece Expo SDK | Tum custom modul |
| Config plugin | Sinirli | Tam destek |
| Bundle ID | host.exp.Exponent | Kendi ID'n |
| Splash/icon | Generic | Kendi |
| EAS Update | ❌ | ✅ |
| Push notification | Sinirli | Tam destek |
| Production benzeri | Hayir | Evet |

> In modern Expo the default recommendation is **Dev Client**. Expo Go is for quick prototyping only.

## Dev Server Baslat

```bash
npx expo start --dev-client
# or
npx expo start
# → QR menusunde "dev client" secenegi cikar
```

Dev Client uygulamasi acilince:
- Server URL'i goster (LAN/Tunnel)
- Scan the QR or enter the URL manually
- Bundle yuklenir

## Dev Launcher

With the Dev Client's `Switch to another bundle`:
- Connect to a different dev server (collab)
- EAS Update branch'ini onizle
- Production bundle'i onizle (rare)

## Dev Menu

Tetikleme:
- iOS sim: `Cmd+D` or `Cmd+Ctrl+Z`
- Android emulator: `Cmd+M` / `Ctrl+M`
- Cihaz: shake (sallama)

Menu icerigi:
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

## EAS Update Test Akisi

Dev Client EAS Update branch onizleme:
1. Branch'e update yayinla
   ```bash
   eas update --branch preview --message "test"
   ```
2. Dev Client uygulamasinda **Extensions > Updates**
3. Branch sec, preview olarak ac
4. Return to normal mode after testing

## Runtime Version Uyumu

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

| Tip | Hermes | JS bundle | Splash | Dev menu |
|-----|--------|-----------|--------|----------|
| Debug (dev client) | Dev | Metro server | Native | Var |
| Release (preview) | Prod | Embedded | Native | Yok |
| Production | Prod | Embedded | Native | Yok |

## Best Practices

- **Dev client** a separate build per team member (Apple device UDIDs registered)
- **Tunnel** kullanimi: `npx expo start --tunnel` (firewall arkasi)
- **`developmentClient: true`** profile for the dev profile only
- **Hermes** dev'de de ac (production'la ayni davranis)
- **AndroidManifest cleartext traffic** is needed in dev; turn it off in production

## Sik Hata Kaliplari

- Device can't find the dev server → not on the same LAN, or a firewall
- "Native module XYZ doesn't exist" → dev client yeniden build edilmedi
- iOS simulator dev client crash → `simulator: true` missing in the profile
- Bundle ID degisikligi sonrasi eski client → uninstall + reinstall
- Tunnel is too slow → prefer LAN or `--lan`

## Hard Refusal

- Distributing a production bundle via the dev client without signing
- Cihaz UDID'sini sahibinin izni olmadan kayit etmek
- Dev menu'yu production'da acik birakmak (security risk)

## Cikti Formati

1. Build profili (`development`)
2. `expo-dev-client` install komutu
3. Start komutu (kopya-yapistir)
4. Expo Go yerine dev client neden? (rationale)
5. EAS Update test plani
