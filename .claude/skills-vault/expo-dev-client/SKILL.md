---
name: expo-dev-client
description: expo-dev-client ile custom development build, build profili, custom dev menu, runtime version uyumu ve EAS Update entegrasyonu. Triggers on expo-dev-client, dev client, custom dev build, development build, dev menu, expo go, runtime version, debug build, dev launcher, scan qr, dev server.
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

`expo-dev-client` ile custom development build kurulumu. Expo Go ile karsilastirma, build profili, custom dev menu, runtime version uyumu ve EAS Update test akisi.

## Ne Yapar

- `expo-dev-client` kurulum + build profili
- Expo Go vs Dev Client karari
- Dev menu (cmd+D / shake) ve custom action
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
# veya local
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

> Modern Expo'da default oneri **Dev Client**. Expo Go sadece hizli prototip icin.

## Dev Server Baslat

```bash
npx expo start --dev-client
# veya
npx expo start
# → QR menusunde "dev client" secenegi cikar
```

Dev Client uygulamasi acilince:
- Server URL'i goster (LAN/Tunnel)
- QR scan veya manuel URL gir
- Bundle yuklenir

## Dev Launcher

Dev Client `Switch to another bundle` ile:
- Farkli dev server'a baglan (collab)
- EAS Update branch'ini onizle
- Production bundle'i onizle (rare)

## Dev Menu

Tetikleme:
- iOS sim: `Cmd+D` veya `Cmd+Ctrl+Z`
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
4. Test bittikten sonra normal mode'a don

## Runtime Version Uyumu

Dev Client build'i ile production build farkli `runtimeVersion`'da ise OTA gitmez. Test sirasinda:

```json
{
  "expo": {
    "runtimeVersion": { "policy": "fingerprint" }
  }
}
```

Dev client native dep ekledigin anda yeni build gerekir. JS-only degisiklik dev server uzerinden zaten gelir.

## Debug Build vs Production Build

| Tip | Hermes | JS bundle | Splash | Dev menu |
|-----|--------|-----------|--------|----------|
| Debug (dev client) | Dev | Metro server | Native | Var |
| Release (preview) | Prod | Embedded | Native | Yok |
| Production | Prod | Embedded | Native | Yok |

## Best Practices

- **Dev client** her takim uyesi icin ayri build (Apple cihaz UDID kayitli)
- **Tunnel** kullanimi: `npx expo start --tunnel` (firewall arkasi)
- **`developmentClient: true`** profili sadece dev profili
- **Hermes** dev'de de ac (production'la ayni davranis)
- **AndroidManifest cleartext traffic** dev'de gerekir, production'da kapat

## Sik Hata Kaliplari

- Cihaz dev server'i bulamiyor → ayni LAN'da degil veya firewall
- "Native module XYZ doesn't exist" → dev client yeniden build edilmedi
- iOS simulator dev client crash → `simulator: true` profilde yok
- Bundle ID degisikligi sonrasi eski client → uninstall + reinstall
- Tunnel cok yavas → LAN tercih et veya `--lan`

## Hard Refusal

- Production bundle'i dev client ile imza atmadan dagitmak
- Cihaz UDID'sini sahibinin izni olmadan kayit etmek
- Dev menu'yu production'da acik birakmak (security risk)

## Cikti Formati

1. Build profili (`development`)
2. `expo-dev-client` install komutu
3. Start komutu (kopya-yapistir)
4. Expo Go yerine dev client neden? (rationale)
5. EAS Update test plani
