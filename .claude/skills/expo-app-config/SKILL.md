---
name: expo-app-config
description: Choosing between app.json vs app.config.ts vs app.config.js, environment variables, variants, extra fields, plugin chain, and slug/scheme/bundle/version discipline. Triggers on app.json, app.config.ts, app.config.js, expo config, environment variable, .env, eas secret, variant, extra field, slug, scheme, bundle identifier, package name, version, build number, version code.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-app-config

Choosing among `app.json`, `app.config.ts`, `app.config.js`, plus environment variables, variants (dev/staging/prod), and identifier discipline. The plugin chain lives in `expo-config-plugin`.

## What It Does

- `app.json` vs `app.config.ts` vs `app.config.js` decision
- Environment variables (`.env`, `EXPO_PUBLIC_*`, EAS Secrets)
- Multi-variant (dev/staging/production) configuration
- `extra` field discipline and runtime access
- Slug, scheme, bundleIdentifier, package, version, buildNumber management
- Plugin chain order

## Which Format?

| Format | Advantage | Limit | When? |
|--------|-----------|-------|-------|
| `app.json` | Static, simple | No JS, no env | Single variant, simple |
| `app.config.js` | Dynamic, env | No TypeScript | Older choice |
| `app.config.ts` | Dynamic + typed | Compile step | **Recommended** |

> Use `app.config.ts` in most projects. Keep `app.json` as a static fallback or drop it entirely.

## `app.config.ts` Template

```ts
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT ?? "development";
  const isProduction = variant === "production";

  return {
    ...config,
    name: variantName(variant),
    slug: "myapp",
    scheme: "myapp",
    version: "1.2.0",
    orientation: "portrait",
    icon: `./assets/icon-${variant}.png`,
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: bundleId(variant),
      buildNumber: "1",
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Camera access required",
      },
    },
    android: {
      package: bundleId(variant),
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: `./assets/icon-fg-${variant}.png`,
        backgroundColor: "#ffffff",
      },
    },
    plugins: [
      "expo-router",
      "expo-dev-client",
      ["expo-notifications", { icon: "./assets/notif-icon.png" }],
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      sentryDsn: process.env.SENTRY_DSN,
      eas: { projectId: "your-eas-project-id" },
      variant,
    },
    runtimeVersion: { policy: "fingerprint" },
    updates: {
      url: "https://u.expo.dev/your-project-id",
    },
  };
};

function variantName(v: string): string {
  switch (v) {
    case "production": return "MyApp";
    case "staging": return "MyApp (Staging)";
    default: return "MyApp (Dev)";
  }
}

function bundleId(v: string): string {
  const base = "com.example.myapp";
  if (v === "production") return base;
  return `${base}.${v}`;
}
```

## Running a Variant

```bash
APP_VARIANT=development npx expo start
APP_VARIANT=staging eas build --profile preview
APP_VARIANT=production eas build --profile production
```

`eas.json`:
```json
{
  "build": {
    "development": { "env": { "APP_VARIANT": "development" } },
    "preview":     { "env": { "APP_VARIANT": "staging" } },
    "production":  { "env": { "APP_VARIANT": "production" } }
  }
}
```

## Environment Variables

| Type | Access | Build-time | Runtime |
|------|--------|------------|---------|
| `EXPO_PUBLIC_*` (`.env`) | JS: `process.env.EXPO_PUBLIC_X` | Yes | Yes (embedded) |
| `process.env.X` (`app.config.ts`) | Only in config | Yes | No |
| EAS Secret | During EAS build | Yes | No (not embedded) |
| `extra` field | `Constants.expoConfig.extra.X` | Yes | Yes |

> **CRITICAL**: **NEVER** prefix API keys with `EXPO_PUBLIC_*` — they get embedded in the client and everyone can read them. Real secrets stay on the backend.

## `.env` Files

```bash
# .env (default)
EXPO_PUBLIC_API_URL=https://api.dev.example.com

# .env.production
EXPO_PUBLIC_API_URL=https://api.example.com
```

`.gitignore`:
```
.env.local
.env.*.local
```

> Is `.env` committed? `EXPO_PUBLIC_*` is already public, so it's fine. Secret values live in `.env.local` and are never committed.

## `extra` Field Runtime Access

```ts
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
const variant = Constants.expoConfig?.extra?.variant;
```

Typed wrapper:
```ts
// src/config.ts
import Constants from "expo-constants";

type AppExtra = {
  apiUrl: string;
  sentryDsn: string;
  variant: "development" | "staging" | "production";
};

export const appConfig = Constants.expoConfig?.extra as AppExtra;
```

## Identifier Discipline

| Field | Format | If it changes |
|-------|--------|---------------|
| `slug` | `kebab-case` | EAS project ID changes |
| `scheme` | `kebab-case` or a single word | Deep link breaks |
| `ios.bundleIdentifier` | `com.org.app` | New app, certificate invalid |
| `android.package` | `com.org.app` | New app, keystore invalid |
| `version` | `1.2.3` (SemVer) | New release |
| `ios.buildNumber` | `string` | Increment on every build |
| `android.versionCode` | `integer` | Increment on every build |

> If `bundleIdentifier` and `package` change, the app becomes a **new app**. Existing installs are lost.

## Bundle ID Strategy for Variants

```
com.example.myapp           # production
com.example.myapp.staging   # staging
com.example.myapp.dev       # development
```

Advantage: 3 separate apps side by side on the same device. Does not put the production device at risk.

## Plugin Chain

```ts
plugins: [
  "expo-router",                                    // Routing first
  "expo-dev-client",                                // Dev tools
  ["expo-build-properties", {                       // Native build properties
    ios: { deploymentTarget: "15.1" },
    android: { compileSdkVersion: 34 }
  }],
  ["expo-notifications", { icon: "..." }],          // Native modules
  "./plugins/withCustomConfig",                     // Custom plugins
]
```

Order: routing → dev tools → build props → native modules → custom.

## Best Practices

- **Choose `app.config.ts`** — typed + dynamic
- **Variant** bundle-ID discipline for 3 parallel apps
- **EAS Secrets** for real secrets (never `.env` or `EXPO_PUBLIC_`)
- **`expo-build-properties`** plugin for native version control
- **`runtimeVersion: fingerprint`** for OTA discipline
- **`extra.eas.projectId`** NEVER delete by hand
- **SemVer**: major (breaking), minor (feature), patch (fix)

## Common Failure Patterns

- Both `app.json` + `app.config.ts` present → `app.config.ts` wins, causes confusion
- `EXPO_PUBLIC_API_SECRET` → secret leaks to the client
- `extra.eas.projectId` deleted → EAS tries to create a new project
- `bundleIdentifier` changed → you must renew the certificate/keystore
- `versionCode` not incremented → Play Store rejects
- After a `.env` change the Metro cache → needs `--clear`
- `extra` field untyped → `undefined` blow-up at runtime

## Hard Refusal

- Impersonating (hijacking) another app's bundle ID
- Embedding an API secret with the `EXPO_PUBLIC_` prefix
- Putting credit card data/PII inside the `extra` field
- Connecting production data to the staging app without variant-ID discipline

## Output Format

1. Format choice (`app.config.ts` rationale)
2. Variant and bundle-ID strategy
3. `.env` vs EAS Secret separation
4. Plugin chain order
5. Identifier-discipline summary
6. Next step: `expo-config-plugin` or `expo-eas-build`
