---
name: expo-eas-update
description: EAS Update ile OTA update yayinlama, channels, runtime versions, branch yonetimi ve rollback stratejisi. Triggers on eas update, ota, over-the-air, runtime version, channel, branch, rollback, embedded update, asset selection, expo-updates, hot update, partial release, release cohort.
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

EAS Update ile OTA (over-the-air) update yayini disiplini. Channel/branch model, runtime version stratejisi, rollback ve embedded vs OTA payload kararlari. Build profili `expo-eas-build`'dedir.

## Ne Yapar

- `eas update` ile JS/asset payload yayini
- Channel ↔ branch eslestirmesi yonetimi
- Runtime version disiplini (`appVersion` / `sdkVersion` / `fingerprint` / custom)
- Branch yonetimi (preview, staging, production, feature/*)
- Rollback ve cohort/rollout-percent stratejisi
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

| Build channel | Branch | Amaç |
|---------------|--------|------|
| development | development | Dev client OTA |
| preview | preview | QA test |
| production | production | Production |

Tek branch farkli channel'lara baglanabilir (`eas channel:edit production --branch hotfix-1`).

## Runtime Version Politikalari

| Policy | Nasil cikarir | Kullanim |
|--------|--------------|----------|
| `appVersion` | `expo.version` | Native degisiklik = yeni build + yeni runtime |
| `sdkVersion` | Expo SDK | SDK upgrade = yeni runtime (artik onerilmiyor) |
| `nativeVersion` | `version`+`buildNumber` | Her build farkli runtime — OTA cogu zaman uygulanmaz |
| `fingerprint` | Native dependency fingerprint | **Onerilen**: native degisiklik var mi otomatik anlar |

`fingerprint` (modern Expo'da default oneri):
```json
"runtimeVersion": { "policy": "fingerprint" }
```

## Update Yayinlama

```bash
# Branch'e yayinla
eas update --branch production --message "fix: profile crash"

# Mevcut Git branch ile ayni isim
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
Yeni update'i %10 ile yayinla, sorun cikarsa rollout sifirla.

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
| Build'de `eas update` cagrilmadi | Build embedded bundle ile gelir |
| `eas update` build sonrasi | Cihaz indirir, OTA bundle kullanir |
| Cihaz offline | Embedded bundle calisir |
| Yeni runtime version | OTA UYGULANMAZ — yeni build gerekir |

> **OTA sinirlari**: native kod, `app.json` plugin degisikligi, yeni Expo SDK = OTA YETMEZ. Sadece JS/asset/JSON degisiklikleri OTA ile gider.

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

Cok buyuk asset'ler (video, model) `expo-asset` ile lazy fetch et — OTA payload kuculur.

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

- **Fingerprint policy** kullan (auto runtime detection)
- **Rollout** her production update icin %10 → %50 → %100
- **Sentry/Bugsnag** OTA payload'a release tag at — hata izleme bozulmasin
- **Rollback plani** her yayindan once netlestir
- **Embedded bundle** kritik (offline ilk acilis)
- **Native degisiklik** = yeni build, OTA degil

## Sik Hata Kaliplari

- Runtime version uyusmazligi → OTA cihaza gitmez
- Plugin degisikligi OTA ile gonderilir saniliyor → calismaz, build gerekir
- Channel branch'e bagli degil → `update:list` bos
- `fallbackToCacheTimeout: 0` ama ilk acilis offline → bos ekran
- Reload sirasinda state kaybi → kullanici aksiyondayken `reloadAsync()` cagirma

## Hard Refusal

- Kullaniciyi bilgilendirmeden zararli native-equivalent davranis push'lamak
- Kotuye kullanim: izinsiz veri toplama feature flag'ini OTA ile acmak
- Compliance/store kurali ihlali eden update gondermek (ASC OTA ile kurallari yine bekler)

## Cikti Formati

1. Runtime version politikasi karari
2. Branch/channel yapisi
3. Update komutu (kopya-yapistir)
4. Rollout/rollback plani
5. OTA-yetmez liste (native degisiklik kontrol)
