---
name: expo-router
description: Expo Router ile file-based routing, dynamic routes, layout hiyerarsisi, deep linking ve navigation patterns. Triggers on expo-router, file-based routing, app dizini, _layout.tsx, [id].tsx, deep linking, expo-linking, tab navigation, stack navigation, drawer, prefetch, parallel routes, redirects, navigation, useRouter, useLocalSearchParams.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-router

Expo Router (v3+) icin file-based routing disiplini. `app/` dizini yapisi, dynamic routes, layout zinciri, deep linking ve navigation patterns konularinda rehberlik eder. Build/release veya native config disinda kalir.

## Ne Yapar

- `app/` dizin yapisi onerisi (tabs, stack, drawer, modal)
- Dynamic ve catch-all route patternlerini yapilandirir
- `_layout.tsx` zinciri ve nested layout disiplini
- Deep linking (`expo-linking`) + scheme + universal links konfigurasyonu
- Prefetch, redirects, error boundaries, not-found handling
- Typed routes ve `useLocalSearchParams` tipi disiplini

## Temel Kurulum

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens \
  expo-linking expo-constants expo-status-bar
```

`package.json`:
```json
{ "main": "expo-router/entry" }
```

`app.json`:
```json
{
  "expo": {
    "scheme": "myapp",
    "plugins": ["expo-router"],
    "experiments": { "typedRoutes": true }
  }
}
```

## Dizin Yapisi (onerilen)

```
app/
  _layout.tsx              # Root layout (providers, theme, fonts)
  index.tsx                # / route
  +not-found.tsx           # 404
  (auth)/                  # group — URL'e yansimaz
    _layout.tsx
    login.tsx
    register.tsx
  (tabs)/                  # tab navigator
    _layout.tsx            # Tabs definition
    index.tsx              # /
    profile.tsx            # /profile
    settings.tsx
  posts/
    index.tsx              # /posts
    [id].tsx               # /posts/:id  (dynamic)
    [...slug].tsx          # /posts/* (catch-all)
  modal.tsx                # presentation: modal
```

## Layout Ornekleri

### Root Layout
```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaProvider>
  );
}
```

### Tabs Layout
```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#007aff" }}>
      <Tabs.Screen
        name="index"
        options={{ title: "Anasayfa", tabBarIcon: ({ color }) => <Ionicons name="home" color={color} /> }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
```

## Dynamic Routes & Params

```tsx
// app/posts/[id].tsx
import { useLocalSearchParams, Link } from "expo-router";

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>Post {id}</Text>;
}
```

Navigation:
```tsx
import { router, Link } from "expo-router";

<Link href={`/posts/${post.id}`}>Goruntule</Link>
router.push({ pathname: "/posts/[id]", params: { id: post.id } });
router.replace("/(tabs)");
router.back();
```

## Deep Linking

`app.json`:
```json
{
  "expo": {
    "scheme": "myapp",
    "ios": { "associatedDomains": ["applinks:myapp.com"] },
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "autoVerify": true,
        "data": [{ "scheme": "https", "host": "myapp.com" }],
        "category": ["BROWSABLE", "DEFAULT"]
      }]
    }
  }
}
```

Test:
```bash
npx uri-scheme open myapp://posts/42 --ios
adb shell am start -W -a android.intent.action.VIEW -d "myapp://posts/42"
```

## Best Practices

- **Group folders** `(name)` ile URL kirletmeden organize et
- **Typed routes** ac (`experiments.typedRoutes: true`) — compile-time check
- **`+not-found.tsx`** her zaman tanimla
- **Redirects** icin `<Redirect href="/login" />` component'i kullan
- **Modal vs sayfa**: `presentation: "modal"` ile native modal sun
- **Prefetch**: `<Link href="/heavy" prefetch>` ile onceden yukle
- **Error boundary**: layout'a `<ErrorBoundary>` koy

## Sik Hata Kaliplari

- `main` `expo-router/entry` degil → uygulama acilmaz
- `scheme` eksik → deep link calismaz
- `(group)` icinde `_layout.tsx` yok → group cocugu render olmaz
- `useLocalSearchParams` tipsiz → string yerine `undefined` gelir
- Nested Stack/Tabs sirasi yanlis → header cakismasi

## Hard Refusal

- Yetkisiz uygulamanin URL scheme'ini taklit (hijack)
- Universal link dogrulama atlatma
- Phishing icin sahte deep link uretimi

## Cikti Formati

1. Dizin agaci (app/ yapisi)
2. `_layout.tsx` ornekleri
3. `app.json` scheme/plugins blogu
4. Test komutu (uri-scheme / adb)
5. Sonraki adim (deep link test, typed routes ac)
