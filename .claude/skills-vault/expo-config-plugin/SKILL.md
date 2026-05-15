---
name: expo-config-plugin
description: Expo config plugin yazma, withInfoPlist, withAndroidManifest, withDangerousMod, mod compose, plugin testing ve app.config.ts'te kayit. Triggers on config plugin, with-plugin, withInfoPlist, withAndroidManifest, withDangerousMod, withEntitlementsPlist, withGradleProperties, mod, native config, expo plugin, plugin test, app.config plugin.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-config-plugin

Expo Config Plugin yazma rehberi. Native dosyalari (Info.plist, AndroidManifest.xml, build.gradle, Podfile) prebuild sirasinda otomatik degistirme. Plugin compose disiplini, dangerous mod kullanimi ve kayit/test akisi. Prebuild surecinin kendisi `expo-prebuild`'dedir.

## Ne Yapar

- iOS `Info.plist`, `entitlements.plist`, `Podfile`, `xcodeproj` modifikasyon
- Android `AndroidManifest.xml`, `build.gradle`, `MainApplication.kt`, `strings.xml` modifikasyon
- Plugin mod compose (`withPlugins`)
- `withDangerousMod` ile dosya yazma (son care)
- Plugin testleri (snapshot)
- `app.config.ts` icinde kayit ve parametre gecisi

## Plugin Yapisi

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
    cfg.modResults.NSCameraUsageDescription = "Kamera erisimi gerekli";
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

## Mod Tablosu

| Mod | Hedef | Kullanim |
|-----|-------|----------|
| `withInfoPlist` | iOS Info.plist | usage descriptions, URL schemes |
| `withEntitlementsPlist` | iOS entitlements | push, app groups, keychain |
| `withAndroidManifest` | AndroidManifest.xml | permissions, intent filters |
| `withStringsXml` | values/strings.xml | localized strings, app_name |
| `withGradleProperties` | gradle.properties | global gradle vars |
| `withAppBuildGradle` | app/build.gradle | dependencies, packaging |
| `withProjectBuildGradle` | build.gradle | repositories, classpath |
| `withPodfile` | ios/Podfile | (`withDangerousMod` ile) |
| `withMainApplication` | MainApplication.kt | provider, lifecycle |
| `withAppDelegate` | AppDelegate.swift | lifecycle, URL handling |
| `withXcodeProject` | project.pbxproj | target settings, build phases |
| `withDangerousMod` | herhangi dosya | son care; idempotent yaz |

## `withDangerousMod` Ornegi

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

> **Idempotent ol**: ayni plugin iki kez calistirilirsa duplicate olusturma.

## Mod Compose (Birden Fazla Plugin)

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

Calistir:
```bash
npx jest plugins/
```

Prebuild ile dogrula:
```bash
npx expo prebuild --clean
cat ios/MyApp/Info.plist | grep MyApiKey
cat android/app/src/main/AndroidManifest.xml | grep API_KEY
```

## Static vs Dynamic Plugin

- **Static plugin** (`./plugins/withX`): proje icinde, tek kullanim
- **NPM paketi**: `expo-X` paket yapisinda export, `npm publish` ile dagit

NPM plugin paketi yapisi:
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

- **`withDangerousMod` son care** — once typed mod dene
- **Idempotency** kontrol et (regex `includes()`)
- **Versiyon hassasiyeti**: AppDelegate Swift/ObjC fark, Gradle versiyonu degisir
- **Snapshot test** her plugin icin
- **`expo prebuild --clean`** ile her test
- **Plugin parametreleri** TypeScript ile tipli yaz
- **Comment markerlari** dangerous mod'da: `// EXPO-PLUGIN: my-plugin BEGIN`

## Sik Hata Kaliplari

- Plugin path yanlis (`./plugins/withX` vs `./plugins/withX.ts`)
- `withDangerousMod` ayni satiri iki kez ekler (idempotent degil)
- `withAndroidManifest` icinde `application` array varsayimi (yoksa crash)
- AppDelegate Swift vs ObjC ayrimi yapilmamis
- Plugin SDK upgrade'de regex'i bozulur (sabit string yerine regex kullan)

## Hard Refusal

- Kullanici bilgisi olmadan analytics/tracking enjekte etmek
- Permission'lari acikca dokumante etmeden eklemek (Apple/Google reject)
- Baska bir paketin native dosyasini izinsiz patchlemek
- Sertifika pinning'i atlatan plugin yazmak

## Cikti Formati

1. Plugin TypeScript sablon
2. `app.config.ts` kayit blogu
3. Test snapshot
4. Prebuild dogrulama komutu
5. Idempotency notu
