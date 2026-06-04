---
name: expo-eas-update
description: Publishing OTA updates with EAS Update, channels, runtime versions, branch management, and rollback strategy. Triggers on eas update, ota, over-the-air, runtime version, channel, branch, rollback, embedded update, asset selection, expo-updates, hot update, partial release, release cohort.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-eas-update

OTA (over-the-air) update publishing discipline with EAS Update. Channel/branch model, runtime-version strategy, rollback, and embedded vs OTA payload decisions. Build profiles live in `expo-eas-build`.

## Ne Yapar

- Publishing JS/asset payloads with `eas update`
- Channel ↔ branch eslestirmesi yonetimi
- Runtime-version discipline (`appVersion` / `sdkVersion` / `fingerprint` / custom)
- Branch yonetimi (preview, staging, production, feature/*)
- Rollback and cohort/rollout-percent strategy
- Embedded update vs OTA payload secimi

## Kurulum

```bash
npx expo install expo-updates
eas update:configure
```

`app.json`:
```json
{
  "expo": {
    "runtimeVersion": { "policy": "appVersion" },
    "updates": {
      "url": "https://u.expo.dev/<project-id>",
      "fallbackToCacheTimeout": 0,
      "checkAutomatically": "ON_LOAD",
      "enabled": true
    }
  }
}
```

## Channel ↔ Branch Model

| Build channel | Branch | Purpose |
|---------------|--------|------|
| development | development | Dev client OTA |
| preview | preview | QA test |
| production | production | Production |

A single branch can be bound to different channels (`eas channel:edit production --branch hotfix-1`).

## Runtime Version Politikalari

| Policy | Nasil cikarir | Kullanim |
|--------|--------------|----------|
| `appVersion` | `expo.version` | Native change = new build + new runtime |
| `sdkVersion` | Expo SDK | SDK upgrade = yeni runtime (artik onerilmiyor) |
| `nativeVersion` | `version`+`buildNumber` | Every build a different runtime — OTA usually won't apply |
| `fingerprint` | Native dependency fingerprint | **Recommended**: auto-detects whether native changed |

`fingerprint` (modern Expo'da default oneri):
```json
"runtimeVersion": { "policy": "fingerprint" }
```

## Update Yayinlama

```bash
# Branch'e yayinla
eas update --branch production --message "fix: profile crash"

# Same name as the current Git branch
eas update --auto

# Sadece bir platform
eas update --branch production --platform ios --message "iOS-only fix"

# Kanal listesi
eas channel:list
eas branch:list
```

## Branch Akisi

```bash
# Yeni branch
eas branch:create staging

# Channel'a bagla
eas channel:edit production --branch production

# Kanal degis (hotfix → production'a switch)
eas channel:edit production --branch hotfix-2025-05

# Geri al (rollback)
eas channel:edit production --branch production-pre-bug
```

## Rollback Stratejisi

### Yontem 1: Onceki branch'e geri don
```bash
eas channel:edit production --branch production-v1.2.0
```

### Yontem 2: Republish onceki update
```bash
eas update:list --branch production
eas update:republish --branch production --group <previous-update-group>
```

### Yontem 3: Rollout decrease
Publish the new update at 10%; if there's a problem, reset the rollout.

## Rollout Kontrolu (cohort)

```bash
eas update --branch production --message "v1.2.1" --rollout-percentage 10
# %10 cihaz aliyor

# Artir
eas update:edit --branch production --rollout-percentage 50

# Tam yayin
eas update:edit --branch production --rollout-percentage 100
```

## Embedded vs OTA Payload

| Senaryo | Davranis |
|---------|----------|
| `eas update` wasn't called in the build | The build ships with the embedded bundle |
| `eas update` build sonrasi | Cihaz indirir, OTA bundle kullanir |
| Cihaz offline | Embedded bundle calisir |
| New runtime version | OTA DOES NOT APPLY — a new build is required |

> **OTA limits**: native code, `app.json` plugin changes, a new Expo SDK = OTA is NOT enough. Only JS/asset/JSON changes go over OTA.

## Asset Selection

Buyuk asset'leri OTA'dan disla:
```json
{
  "expo": {
    "assetBundlePatterns": ["assets/icons/*"],
    "updates": {
      "assetPatternsToBeBundled": ["assets/critical/*"]
    }
  }
}
```

Lazy-fetch very large assets (video, models) with `expo-asset` — the OTA payload shrinks.

## Client-Side Kontrol

```tsx
import * as Updates from "expo-updates";

useEffect(() => {
  async function check() {
    if (__DEV__) return;
    const u = await Updates.checkForUpdateAsync();
    if (u.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  }
  check();
}, []);
```

## Best Practices

- Use the **fingerprint policy** (auto runtime detection)
- **Rollout** 10% → 50% → 100% for every production update
- **Sentry/Bugsnag** OTA payload'a release tag at — hata izleme bozulmasin
- Clarify the **rollback plan** before every release
- **Embedded bundle** kritik (offline ilk acilis)
- **Native change** = new build, not OTA

## Sik Hata Kaliplari

- Runtime version uyusmazligi → OTA cihaza gitmez
- Thinking a plugin change ships via OTA → it doesn't, a build is required
- Channel not bound to a branch → `update:list` is empty
- `fallbackToCacheTimeout: 0` but first launch is offline → blank screen
- Reload sirasinda state kaybi → kullanici aksiyondayken `reloadAsync()` cagirma

## Hard Refusal

- Kullaniciyi bilgilendirmeden zararli native-equivalent davranis push'lamak
- Misuse: turning on an unauthorized data-collection feature flag via OTA
- Shipping an update that violates compliance/store rules (ASC still expects the rules over OTA)

## Cikti Formati

1. Runtime version politikasi karari
2. Branch/channel yapisi
3. Update komutu (kopya-yapistir)
4. Rollout/rollback plani
5. OTA-insufficient list (native-change check)
