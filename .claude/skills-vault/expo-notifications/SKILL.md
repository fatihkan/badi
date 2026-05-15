---
name: expo-notifications
description: expo-notifications kurulumu, push token, FCM + APNs credentials, kategoriler, scheduled notifications, channels ve permission flow. Triggers on expo-notifications, push notification, fcm, apns, push token, notification permission, notification channel, notification category, action button, scheduled notification, local notification, badge, silent push.
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

`expo-notifications` ile push ve local notification kurulumu. iOS (APNs) + Android (FCM) credentials, permission flow, channels (Android 8+), categories ve scheduled notifications.

## Ne Yapar

- `expo-notifications` setup ve permission istegi
- Expo Push Token alma + backend'e gonderme
- iOS APNs Auth Key ve Android FCM Service Account
- Notification categories + action buttons
- Scheduled / repeating notifications
- Channels (Android 8+) ve importance levels
- Background notification handler ve silent push

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
- **Tek key** tum app'lerde kullanilabilir
- Bir kez indirilebilir — yedek tut

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

> `google-services.json` `.gitignore`'a EKLE (commit etme; EAS Secrets veya CI'da inject).

## Local & Scheduled Notification

```ts
// Hemen
await Notifications.scheduleNotificationAsync({
  content: { title: "Test", body: "Hello", sound: true },
  trigger: null,
});

// 60 sn sonra
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

> Android 8+ icin channel ZORUNLU. Channel yoksa bildirim gosterilmez.

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

- **Permission isteme zamanlamasi**: feature gerektiginde, app acilir acilmaz degil
- **Channel'lar her zaman setup** (Android 8+)
- **Silent push** badge update icin (`contentAvailable: true`)
- **Token yenilenmesini dinle**: `addPushTokenListener`
- **Backend'de token sakla** (user + device key)
- **Test cihazi**: gercek cihaz zorunlu (simulator push almaz)
- **Sound dosyalari** plugin'de tanimla, build'e gomulsun

## Sik Hata Kaliplari

- iOS push gelmiyor: APNs Auth Key eksik, capability "Push Notifications" yok
- Android push gelmiyor: `google-services.json` eksik, FCM Service Account yanlis
- Channel yok → Android 8+ sessiz reddediyor
- `UIBackgroundModes: ["remote-notification"]` yok → silent push gelmez
- Production'da `Notifications.scheduleNotificationAsync` `trigger: null` yerine `{ seconds: 1 }` → daha guvenli
- Permission request flood → kullanici reddeder, bir daha ac demek soyle

## Hard Refusal

- Kullanici onayi olmadan permission abuse (her saat sor)
- Spam/yaniltici push iceriği (ASC + Play Store kurali)
- Health/finance verisini sifresiz push payload'da gondermek
- Marketing push'u opt-out olmadan zorunlu kilmak
- Tracking ID'sini push token ile cross-reference etmek (GDPR)

## Cikti Formati

1. Kurulum komutlari (kopya-yapistir)
2. Permission flow kodu
3. iOS + Android credentials adimlari
4. Channel ve category setup
5. Test komutu (curl)
6. Risk: permission abuse, store kurali
