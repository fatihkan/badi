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

## What It Does

- Publishing JS/asset payloads with `eas update`
- Channel ↔ branch mapping management
- Runtime-version discipline (`appVersion` / `sdkVersion` / `fingerprint` / custom)
- Branch management (preview, staging, production, feature/*)
- Rollback and cohort/rollout-percent strategy
- Embedded update vs OTA payload selection

## Setup

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
|---------------|--------|---------|
| development | development | Dev client OTA |
| preview | preview | QA test |
| production | production | Production |

A single branch can be bound to different channels (`eas channel:edit production --branch hotfix-1`).

## Runtime Version Policies

| Policy | How it's derived | Usage |
|--------|------------------|-------|
| `appVersion` | `expo.version` | Native change = new build + new runtime |
| `sdkVersion` | Expo SDK | SDK upgrade = new runtime (no longer recommended) |
| `nativeVersion` | `version`+`buildNumber` | Every build a different runtime — OTA usually won't apply |
| `fingerprint` | Native dependency fingerprint | **Recommended**: auto-detects whether native changed |

`fingerprint` (the default recommendation in modern Expo):
```json
"runtimeVersion": { "policy": "fingerprint" }
```

## Publishing an Update

```bash
# Publish to a branch
eas update --branch production --message "fix: profile crash"

# Same name as the current Git branch
eas update --auto

# A single platform only
eas update --branch production --platform ios --message "iOS-only fix"

# Channel list
eas channel:list
eas branch:list
```

## Branch Flow

```bash
# New branch
eas branch:create staging

# Bind to a channel
eas channel:edit production --branch production

# Switch channel (hotfix → switch to production)
eas channel:edit production --branch hotfix-2025-05

# Roll back
eas channel:edit production --branch production-pre-bug
```

## Rollback Strategy

### Method 1: Go back to the previous branch
```bash
eas channel:edit production --branch production-v1.2.0
```

### Method 2: Republish the previous update
```bash
eas update:list --branch production
eas update:republish --branch production --group <previous-update-group>
```

### Method 3: Rollout decrease
Publish the new update at 10%; if there's a problem, reset the rollout.

## Rollout Control (cohort)

```bash
eas update --branch production --message "v1.2.1" --rollout-percentage 10
# 10% of devices receive it

# Increase
eas update:edit --branch production --rollout-percentage 50

# Full rollout
eas update:edit --branch production --rollout-percentage 100
```

## Embedded vs OTA Payload

| Scenario | Behavior |
|----------|----------|
| `eas update` wasn't called in the build | The build ships with the embedded bundle |
| `eas update` after the build | The device downloads and uses the OTA bundle |
| Device offline | The embedded bundle runs |
| New runtime version | OTA DOES NOT APPLY — a new build is required |

> **OTA limits**: native code, `app.json` plugin changes, a new Expo SDK = OTA is NOT enough. Only JS/asset/JSON changes go over OTA.

## Asset Selection

Exclude large assets from OTA:
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

## Client-Side Control

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
- Add a **Sentry/Bugsnag** release tag to the OTA payload — don't break error tracking
- Clarify the **rollback plan** before every release
- **Embedded bundle** is critical (offline first launch)
- **Native change** = new build, not OTA

## Common Failure Patterns

- Runtime version mismatch → OTA doesn't reach the device
- Thinking a plugin change ships via OTA → it doesn't, a build is required
- Channel not bound to a branch → `update:list` is empty
- `fallbackToCacheTimeout: 0` but first launch is offline → blank screen
- State loss during reload → don't call `reloadAsync()` while the user is mid-action

## Hard Refusal

- Pushing harmful native-equivalent behavior without informing the user
- Misuse: turning on an unauthorized data-collection feature flag via OTA
- Shipping an update that violates compliance/store rules (ASC still expects the rules over OTA)

## Output Format

1. Runtime version policy decision
2. Branch/channel structure
3. Update command (copy-paste)
4. Rollout/rollback plan
5. OTA-insufficient list (native-change check)
