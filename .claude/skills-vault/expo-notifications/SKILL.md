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

## What It Does

- `expo-notifications` setup and permission request
- Getting the Expo Push Token + sending it to the backend
- iOS APNs Auth Key and Android FCM Service Account
- Notification categories + action buttons
- Scheduled / repeating notifications
- Channels (Android 8+) and importance levels
- Background notification handler and silent push

## Setup

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

Via EAS:
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
# 2. "Generate new private key" → download google-services.json
# 3. Put it at the project root
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
// Immediately
await Notifications.scheduleNotificationAsync({
  content: { title: "Test", body: "Hello", sound: true },
  trigger: null,
});

// after 60 s
await Notifications.scheduleNotificationAsync({
  content: { title: "Reminder", body: "Drink some water" },
  trigger: { seconds: 60 },
});

// Specific time
await Notifications.scheduleNotificationAsync({
  content: { title: "Morning" },
  trigger: { hour: 9, minute: 0, repeats: true },
});

// Calendar trigger (iOS only, advanced)
await Notifications.scheduleNotificationAsync({
  content: { title: "Monday" },
  trigger: { weekday: 2, hour: 9, minute: 0, repeats: true },
});
```

## Categories + Action Buttons

```ts
await Notifications.setNotificationCategoryAsync("message", [
  {
    identifier: "reply",
    buttonTitle: "Reply",
    textInput: { submitButtonTitle: "Send", placeholder: "Message..." },
  },
  {
    identifier: "mark_read",
    buttonTitle: "Mark read",
    options: { opensAppToForeground: false },
  },
]);

await Notifications.scheduleNotificationAsync({
  content: { title: "New message", body: "...", categoryIdentifier: "message" },
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
  name: "Messages",
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#FF231F7C",
  sound: "default",
});

await Notifications.setNotificationChannelAsync("silent", {
  name: "Silent notifications",
  importance: Notifications.AndroidImportance.LOW,
});
```

> A channel is MANDATORY for Android 8+. Without a channel, notifications aren't shown.

## Sending a Push (Expo Push Service)

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxx]",
    "title": "Hello",
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
- **Always set up channels** (Android 8+)
- **Silent push** for badge updates (`contentAvailable: true`)
- **Listen for token refresh**: `addPushTokenListener`
- **Store the token on the backend** (user + device key)
- **Test device**: a real device is required (simulators don't receive push)
- **Define sound files** in the plugin so they're embedded in the build

## Common Failure Patterns

- iOS push not arriving: APNs Auth Key missing, no "Push Notifications" capability
- Android push not arriving: `google-services.json` missing, FCM Service Account wrong
- No channel → Android 8+ silently drops it
- No `UIBackgroundModes: ["remote-notification"]` → silent push won't arrive
- In production, `Notifications.scheduleNotificationAsync` with `{ seconds: 1 }` instead of `trigger: null` → safer
- Permission request flood → the user denies; tell them to re-enable it manually

## Hard Refusal

- Permission abuse without user consent (asking every hour)
- Spam/misleading push content (ASC + Play Store rule)
- Sending health/finance data in an unencrypted push payload
- Forcing marketing push with no opt-out
- Cross-referencing a tracking ID with the push token (GDPR)

## Output Format

1. Setup commands (copy-paste)
2. Permission flow code
3. iOS + Android credentials steps
4. Channel and category setup
5. Test command (curl)
6. Risk: permission abuse, store rule
