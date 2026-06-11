---
name: expo-config-plugin
description: Writing Expo config plugins, withInfoPlist, withAndroidManifest, withDangerousMod, mod compose, plugin testing, and registration in app.config.ts. Triggers on config plugin, with-plugin, withInfoPlist, withAndroidManifest, withDangerousMod, withEntitlementsPlist, withGradleProperties, mod, native config, expo plugin, plugin test, app.config plugin.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  homepage: https://github.com/fatihkan/badi-skills/tree/main/skills/expo-config-plugin
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-config-plugin

A guide to writing Expo Config Plugins. Automatically modifying native files (Info.plist, AndroidManifest.xml, build.gradle, Podfile) during prebuild. Plugin compose discipline, dangerous-mod usage, and the registration/test flow. The prebuild process itself lives in `expo-prebuild`.

## What It Does

- iOS `Info.plist`, `entitlements.plist`, `Podfile`, `xcodeproj` modification
- Android `AndroidManifest.xml`, `build.gradle`, `MainApplication.kt`, `strings.xml` modification
- Plugin mod compose (`withPlugins`)
- File writing with `withDangerousMod` (last resort)
- Plugin tests (snapshot)
- Registration and parameter passing in `app.config.ts`

## Plugin Structure

```ts
// plugins/withMyPlugin.ts
import {
  ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
  withDangerousMod,
} from "expo/config-plugins";

type Props = { apiKey: string };

const withMyPlugin: ConfigPlugin<Props> = (config, { apiKey }) => {
  // iOS
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.MyApiKey = apiKey;
    cfg.modResults.NSCameraUsageDescription = "Camera access required";
    return cfg;
  });

  // Android
  config = withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (app) {
      app["meta-data"] = app["meta-data"] || [];
      app["meta-data"].push({
        $: { "android:name": "com.myapp.API_KEY", "android:value": apiKey },
      });
    }
    return cfg;
  });

  return config;
};

export default withMyPlugin;
```

`app.config.ts`:
```ts
export default {
  expo: {
    name: "MyApp",
    plugins: [
      ["./plugins/withMyPlugin", { apiKey: process.env.MY_API_KEY }],
    ],
  },
};
```

## Mod Table

| Mod | Target | Usage |
|-----|--------|-------|
| `withInfoPlist` | iOS Info.plist | usage descriptions, URL schemes |
| `withEntitlementsPlist` | iOS entitlements | push, app groups, keychain |
| `withAndroidManifest` | AndroidManifest.xml | permissions, intent filters |
| `withStringsXml` | values/strings.xml | localized strings, app_name |
| `withGradleProperties` | gradle.properties | global gradle vars |
| `withAppBuildGradle` | app/build.gradle | dependencies, packaging |
| `withProjectBuildGradle` | build.gradle | repositories, classpath |
| `withPodfile` | ios/Podfile | (via `withDangerousMod`) |
| `withMainApplication` | MainApplication.kt | provider, lifecycle |
| `withAppDelegate` | AppDelegate.swift | lifecycle, URL handling |
| `withXcodeProject` | project.pbxproj | target settings, build phases |
| `withDangerousMod` | any file | last resort; write idempotently |

## `withDangerousMod` Example

```ts
import { withDangerousMod } from "expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

const withPodfileCustom: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      let content = fs.readFileSync(podfile, "utf8");
      const insert = `pod 'MyCustomPod', '1.0.0'`;
      if (!content.includes(insert)) {
        content = content.replace(/use_expo_modules!/, `use_expo_modules!\n  ${insert}`);
        fs.writeFileSync(podfile, content);
      }
      return cfg;
    },
  ]);
};
```

> **Be idempotent**: if the same plugin runs twice, do not create duplicates.

## Mod Compose (Multiple Plugins)

```ts
import { withPlugins } from "expo/config-plugins";

const withFeatures: ConfigPlugin = (config) =>
  withPlugins(config, [
    [withMyPlugin, { apiKey: "xxx" }],
    [withAnalytics, { token: "yyy" }],
    withCustomEntitlements,
  ]);
```

## Plugin Test (snapshot)

```ts
// plugins/__tests__/withMyPlugin.test.ts
import { withMyPlugin } from "../withMyPlugin";

const baseConfig = {
  name: "test",
  slug: "test",
  ios: { infoPlist: {} },
  android: { package: "com.test" },
};

test("adds MyApiKey to Info.plist", () => {
  const result = withMyPlugin(baseConfig as any, { apiKey: "abc" });
  expect(result.ios?.infoPlist?.MyApiKey).toBe("abc");
});
```

Run:
```bash
npx jest plugins/
```

Verify with prebuild:
```bash
npx expo prebuild --clean
cat ios/MyApp/Info.plist | grep MyApiKey
cat android/app/src/main/AndroidManifest.xml | grep API_KEY
```

## Static vs Dynamic Plugin

- **Static plugin** (`./plugins/withX`): inside the project, single use
- **NPM package**: export in the `expo-X` package layout, distribute with `npm publish`

NPM plugin package structure:
```
my-plugin/
  app.plugin.js        # entry: module.exports = require('./build/withX').default
  build/
    withX.js
  src/
    withX.ts
  package.json
```

## Best Practices

- **`withDangerousMod` is a last resort** — try a typed mod first
- Check **idempotency** (regex `includes()`)
- **Version sensitivity**: AppDelegate Swift/ObjC differences, Gradle version changes
- **Snapshot test** for every plugin
- **`expo prebuild --clean`** for each test
- **Plugin parameters** written typed with TypeScript
- **Comment markers** in a dangerous mod: `// EXPO-PLUGIN: my-plugin BEGIN`

## Common Failure Patterns

- Wrong plugin path (`./plugins/withX` vs `./plugins/withX.ts`)
- `withDangerousMod` adds the same line twice (not idempotent)
- Assuming the `application` array exists inside `withAndroidManifest` (crash if absent)
- AppDelegate Swift vs ObjC distinction not handled
- A plugin's regex breaks on an SDK upgrade (use a regex instead of a fixed string)

## Hard Refusal

- Injecting analytics/tracking without the user's knowledge
- Adding permissions without explicitly documenting them (Apple/Google reject)
- Patching another package's native files without permission
- Writing a plugin that bypasses certificate pinning

## Output Format

1. Plugin TypeScript template
2. `app.config.ts` registration block
3. Test snapshot
4. Prebuild verification command
5. Idempotency note
