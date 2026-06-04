---
name: expo-modules
description: Writing Swift/Kotlin native modules with the Expo Modules API, requireNativeModule, async functions, view modules, and the event-emitter pattern. Triggers on expo modules, native module, swift, kotlin, requireNativeModule, expo-module-scripts, expo.modules.json, view module, event emitter, native function, async function, native code, jsi.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-modules

A guide to writing native modules in Swift (iOS) and Kotlin (Android) with the Expo Modules API. Function/view/event module structure, async definitions, autolinking, and TypeScript-binding discipline.

## Ne Yapar

- Creating a new module with `create-expo-module`
- Swift `Module` and Kotlin `Module` class structure
- `Function`, `AsyncFunction`, `Property`, `Events`, `View` tanimlari
- TypeScript bindings and `requireNativeModule` usage
- Local modul (proje icinde) vs publishable package
- Event emitter pattern

## Yeni Modul Olusturma

```bash
# Yeni package (npm publish edilebilir)
npx create-expo-module my-native-module
cd my-native-module
npm run build
npm run open:ios       # Xcode'da ac
npm run open:android   # Android Studio'da ac

# Local module (this project only)
npx create-expo-module@latest --local my-feature
# Creates it under modules/my-feature/
```

## Dizin Yapisi

```
my-native-module/
  android/
    src/main/java/expo/modules/mynativemodule/
      MyNativeModuleModule.kt
  ios/
    MyNativeModuleModule.swift
  src/
    index.ts              # TypeScript binding
    MyNativeModule.types.ts
    MyNativeModuleModule.ts
    MyNativeModuleView.tsx
  expo-module.config.json
  package.json
```

## iOS — Swift Modul

```swift
// ios/MyNativeModuleModule.swift
import ExpoModulesCore

public class MyNativeModuleModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyNativeModule")

    Constants([
      "PI": Double.pi
    ])

    Function("hello") {
      return "Hello from Swift"
    }

    AsyncFunction("setValueAsync") { (value: String) in
      UserDefaults.standard.set(value, forKey: "myValue")
    }

    AsyncFunction("getValueAsync") { () -> String? in
      return UserDefaults.standard.string(forKey: "myValue")
    }

    Events("onChange")

    OnStartObserving {
      // listener eklenince
    }

    OnStopObserving {
      // listener kalkinca
    }

    View(MyNativeModuleView.self) {
      Prop("url") { (view: MyNativeModuleView, url: URL) in
        view.url = url
      }
      Events("onLoad")
    }
  }
}
```

## Android — Kotlin Modul

```kotlin
// android/src/main/java/expo/modules/mynativemodule/MyNativeModuleModule.kt
package expo.modules.mynativemodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyNativeModuleModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyNativeModule")

    Constants(
      "PI" to Math.PI
    )

    Function("hello") {
      "Hello from Kotlin"
    }

    AsyncFunction("setValueAsync") { value: String ->
      val prefs = appContext.reactContext?.getSharedPreferences("my", 0)
      prefs?.edit()?.putString("myValue", value)?.apply()
    }

    AsyncFunction("getValueAsync") {
      val prefs = appContext.reactContext?.getSharedPreferences("my", 0)
      prefs?.getString("myValue", null)
    }

    Events("onChange")

    View(MyNativeModuleView::class) {
      Prop("url") { view: MyNativeModuleView, url: String ->
        view.setUrl(url)
      }
      Events("onLoad")
    }
  }
}
```

## TypeScript Binding

```ts
// src/MyNativeModule.ts
import { requireNativeModule } from "expo-modules-core";

const NativeModule = requireNativeModule("MyNativeModule");

export default NativeModule;
```

```ts
// src/index.ts
import { EventEmitter, Subscription } from "expo-modules-core";
import MyNativeModule from "./MyNativeModule";

export const PI: number = MyNativeModule.PI;

export function hello(): string {
  return MyNativeModule.hello();
}

export async function setValueAsync(value: string): Promise<void> {
  return await MyNativeModule.setValueAsync(value);
}

export async function getValueAsync(): Promise<string | null> {
  return await MyNativeModule.getValueAsync();
}

const emitter = new EventEmitter(MyNativeModule);

export function addChangeListener(
  listener: (event: { value: string }) => void
): Subscription {
  return emitter.addListener("onChange", listener);
}

export { default as MyNativeModuleView } from "./MyNativeModuleView";
```

## View Modul (Native UI)

```ts
// src/MyNativeModuleView.tsx
import { requireNativeViewManager } from "expo-modules-core";
import * as React from "react";
import { ViewProps } from "react-native";

type Props = { url: string; onLoad?: (e: { nativeEvent: { url: string } }) => void } & ViewProps;

const NativeView = requireNativeViewManager("MyNativeModule");

export default function MyNativeModuleView(props: Props) {
  return <NativeView {...props} />;
}
```

## `expo-module.config.json`

```json
{
  "platforms": ["ios", "android"],
  "ios": {
    "modules": ["MyNativeModuleModule"]
  },
  "android": {
    "modules": ["expo.modules.mynativemodule.MyNativeModuleModule"]
  }
}
```

## Local Modul Kullanma

`app.json` (automatic autolinking for the local module):
```json
{
  "expo": {
    "autolinking": {
      "nativeModulesDir": "./modules"
    }
  }
}
```

Sonra `prebuild`:
```bash
npx expo prebuild --clean
```

## Function Tipleri

| Tip | Senkron mu? | Kullanim |
|-----|-------------|----------|
| `Function` | Senkron | Hizli getter, constant |
| `AsyncFunction` | Async | I/O, network, ag isi |
| `Constants` | Build-time | Static deger |
| `Property` | Getter/setter | View instance |
| `Events` | Async event | onChange, onLoad |

## Async Function Ornegi (file I/O)

```swift
AsyncFunction("readFileAsync") { (uri: URL) -> String in
  return try String(contentsOf: uri, encoding: .utf8)
}
```

```kotlin
AsyncFunction("readFileAsync") { uri: String ->
  java.io.File(uri).readText()
}
```

## Event Emit

```swift
sendEvent("onChange", ["value": newValue])
```

```kotlin
sendEvent("onChange", mapOf("value" to newValue))
```

## Best Practices

- **AsyncFunction** for network/disk work — don't use **Function**
- **Type strict** parametreler: `URL`, `Data`, custom struct
- **Check permissions inside the module** (warn the user)
- Clean up listeners with **OnStartObserving / OnStopObserving** (memory leak)
- Start with a **local module**; extract to a package if needed
- Mind **Kotlin null-safety** and **Swift optionals** — JS undefined mapping

## Sik Hata Kaliplari

- `Name("X")` written DIFFERENTLY in Swift and Kotlin → JS `requireNativeModule("X")` can't find it
- `AsyncFunction` yerine `Function` → main thread block, ANR
- Listener kaldirilmiyor → memory leak
- View prop type mismatch (Swift `URL` but JS string) → crash
- `prebuild` calistirilmadan modul ekleme → autolink bulamaz

## Hard Refusal

- Private iOS API kullanan modul (Apple reject)
- Kullanici izni olmadan mikrofon/kamera/konum okuyan native modul
- Native code for root/jailbreak bypass
- Kullanicinin keychain/keystore icerigini izinsiz dump etmek

## Cikti Formati

1. Modul iskelet (Swift + Kotlin)
2. TypeScript binding
3. `expo-module.config.json`
4. Prebuild + run komutu
5. Function/Event tip secimi rationale
