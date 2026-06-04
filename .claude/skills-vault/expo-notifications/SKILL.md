---
name: expo-notifications
description: expo-notifications setup, push tokens, FCM + APNs credentials, categories, scheduled notifications, channels, and the permission flow. Triggers on expo-notifications, push notification, fcm, apns, push token, notification permission, notification channel, notification category, action button, scheduled notification, local notification, badge, silent push.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-notifications

Push and local notification setup with `expo-notifications`. iOS (APNs) + Android (FCM) credentials, permission flow, channels (Android 8+), categories, and scheduled notifications.

## Ne Yapar

- `expo-notifications` setup and permission request
- Expo Push Token alma + backend'e gonderme
- iOS APNs Auth Key and Android FCM Service Account
- Notification categories + action buttons
- Scheduled / repeating notifications
- Channels (Android 8+) and importance levels
- Background notification handler and silent push

## Kurulum

```bash
npx expo install expo-notifications expo-device expo-constants
```

`app.json`:
```json
{
  "expo": {
    "plugins": [
      ["expo-notifications", {
        "icon": "./assets/notification-icon.png",
        "color": "#ffffff",
        "sounds": ["./assets/notification-sound.wav"]
      }]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

## Permission + Token

```ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  return token;
}
```

## iOS APNs Credentials

EAS uzerinden:
```bash
eas credentials -p ios
# > Push Notifications: Setup
# > APNs Auth Key (.p8)
```

App Store Connect > Keys > APNs Auth Key:
- **A single key** can be used across all apps
- Downloadable once — keep a backup

## Android FCM Credentials

```bash
# 1. Firebase Console > Project Settings > Service Accounts
# 2. "Generate new private key" → google-services.json indir
# 3. Proje koklerine koy
# 4. eas credentials -p android > Service Account upload
```

`app.json`:
```json
{
  "android": { "googleServicesFile": "./google-services.json" }
}
```

> ADD `google-services.json` to `.gitignore` (don't commit it; inject via EAS Secrets or CI).

## Local & Scheduled Notification

```ts
// Hemen
await Notifications.scheduleNotificationAsync({
  content: { title: "Test", body: "Hello", sound: true },
  trigger: null,
});

// after 60 s
await Notifications.scheduleNotificationAsync({
  content: { title: "Hatirla", body: "Su iciver" },
  trigger: { seconds: 60 },
});

// Belirli saat
await Notifications.scheduleNotificationAsync({
  content: { title: "Sabah" },
  trigger: { hour: 9, minute: 0, repeats: true },
});

// Calendar trigger (iOS only ileri)
await Notifications.scheduleNotificationAsync({
  content: { title: "Pazartesi" },
  trigger: { weekday: 2, hour: 9, minute: 0, repeats: true },
});
```

## Categories + Action Buttons

```ts
await Notifications.setNotificationCategoryAsync("message", [
  {
    identifier: "reply",
    buttonTitle: "Yanitla",
    textInput: { submitButtonTitle: "Gonder", placeholder: "Mesaj..." },
  },
  {
    identifier: "mark_read",
    buttonTitle: "Okundu",
    options: { opensAppToForeground: false },
  },
]);

await Notifications.scheduleNotificationAsync({
  content: { title: "Yeni mesaj", body: "...", categoryIdentifier: "message" },
  trigger: null,
});
```

Action handler:
```ts
Notifications.addNotificationResponseReceivedListener((response) => {
  const action = response.actionIdentifier;
  const userInput = (response as any).userText;
  // ...
});
```

## Android Channels (8+)

```ts
await Notifications.setNotificationChannelAsync("messages", {
  name: "Mesajlar",
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#FF231F7C",
  sound: "default",
});

await Notifications.setNotificationChannelAsync("silent", {
  name: "Sessiz bildirimler",
  importance: Notifications.AndroidImportance.LOW,
});
```

> A channel is MANDATORY for Android 8+. Without a channel, notifications aren't shown.

## Push Gonderme (Expo Push Service)

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxx]",
    "title": "Selam",
    "body": "Test",
    "sound": "default",
    "categoryId": "message",
    "data": { "screen": "/posts/42" }
  }'
```

Backend SDK: `expo-server-sdk` (Node.js).

## Deep Link via Notification

```ts
const responseListener = Notifications.addNotificationResponseReceivedListener((res) => {
  const path = res.notification.request.content.data?.screen;
  if (path) router.push(path);
});
```

## Best Practices

- **Permission-request timing**: when the feature needs it, not right when the app opens
- **Channel'lar her zaman setup** (Android 8+)
- **Silent push** for badge updates (`contentAvailable: true`)
- **Token yenilenmesini dinle**: `addPushTokenListener`
- **Backend'de token sakla** (user + device key)
- **Test device**: a real device is required (simulators don't receive push)
- **Sound dosyalari** plugin'de tanimla, build'e gomulsun

## Sik Hata Kaliplari

- iOS push not arriving: APNs Auth Key missing, no "Push Notifications" capability
- Android push gelmiyor: `google-services.json` eksik, FCM Service Account yanlis
- No channel → Android 8+ silently drops it
- No `UIBackgroundModes: ["remote-notification"]` → silent push won't arrive
- Production'da `Notifications.scheduleNotificationAsync` `trigger: null` yerine `{ seconds: 1 }` → daha guvenli
- Permission request flood → kullanici reddeder, bir daha ac demek soyle

## Hard Refusal

- Kullanici onayi olmadan permission abuse (her saat sor)
- Spam/misleading push content (ASC + Play Store rule)
- Health/finance verisini sifresiz push payload'da gondermek
- Forcing marketing push with no opt-out
- Cross-referencing a tracking ID with the push token (GDPR)

## Cikti Formati

1. Kurulum komutlari (kopya-yapistir)
2. Permission flow kodu
3. iOS + Android credentials adimlari
4. Channel and category setup
5. Test komutu (curl)
6. Risk: permission abuse, store kurali
