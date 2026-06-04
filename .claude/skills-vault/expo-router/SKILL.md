---
name: expo-router
description: File-based routing with Expo Router, dynamic routes, layout hierarchy, deep linking, and navigation patterns. Triggers on expo-router, file-based routing, app dizini, _layout.tsx, [id].tsx, deep linking, expo-linking, tab navigation, stack navigation, drawer, prefetch, parallel routes, redirects, navigation, useRouter, useLocalSearchParams.
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

File-based routing discipline for Expo Router (v3+). Guides the `app/` directory structure, dynamic routes, layout chains, deep linking, and navigation patterns. Stays out of build/release or native config.

## What It Does

- `app/` directory structure recommendation (tabs, stack, drawer, modal)
- Configures dynamic and catch-all route patterns
- `_layout.tsx` chains and nested-layout discipline
- Deep linking (`expo-linking`) + scheme + universal links configuration
- Prefetch, redirects, error boundaries, not-found handling
- Typed routes and `useLocalSearchParams` type discipline

## Basic Setup

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

## Directory Structure (recommended)

```
app/
  _layout.tsx              # Root layout (providers, theme, fonts)
  index.tsx                # / route
  +not-found.tsx           # 404
  (auth)/                  # group — not reflected in the URL
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

## Layout Examples

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
        options={{ title: "Home", tabBarIcon: ({ color }) => <Ionicons name="home" color={color} /> }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
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

<Link href={`/posts/${post.id}`}>View</Link>
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

- **Group folders** `(name)` to organize without polluting the URL
- **Enable typed routes** (`experiments.typedRoutes: true`) — compile-time check
- **`+not-found.tsx`** always define it
- Use the `<Redirect href="/login" />` component for **redirects**
- **Modal vs page**: present a native modal with `presentation: "modal"`
- **Prefetch**: preload with `<Link href="/heavy" prefetch>`
- **Error boundary**: put `<ErrorBoundary>` in the layout

## Common Failure Patterns

- `main` is not `expo-router/entry` → the app won't launch
- `scheme` missing → deep link doesn't work
- No `_layout.tsx` inside `(group)` → the group's children don't render
- `useLocalSearchParams` untyped → you get `undefined` instead of a string
- Wrong nested Stack/Tabs order → header clash

## Hard Refusal

- Impersonating (hijacking) an unauthorized app's URL scheme
- Bypassing universal link verification
- Generating fake deep links for phishing

## Output Format

1. Directory tree (app/ structure)
2. `_layout.tsx` examples
3. `app.json` scheme/plugins block
4. Test command (uri-scheme / adb)
5. Next step (deep link test, enable typed routes)
