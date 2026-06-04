---
name: expo-eas-submit
description: App Store Connect and Google Play Console upload flow with EAS Submit, metadata, build-artifact selection, review notes, and phased release. Triggers on eas submit, app store connect, google play, asc api key, service account, metadata, screenshot, phased release, review notes, testflight, internal testing, production submit, release management.
license: MIT
compatibility: Works with Claude Code
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: badi
  badi-version: ">=1.27.0"
  category: expo
  scope: advisory
---

# expo-eas-submit

A guide to the App Store Connect (iOS) and Google Play Console (Android) submit process with EAS Submit. Metadata management, build-artifact selection, review notes, and phased-release discipline. Build-profile DETAIL lives in `expo-eas-build`.

## Ne Yapar

- Uploading iOS/Android builds with `eas submit`
- App Store Connect API Key (ASC) and Google Play Service Account setup
- Build artifact secimi (en son / belirli URL / belirli ID)
- Review notes and demo-account management
- Phased release / staged rollout
- Screenshot and metadata upload discipline

## Kurulum

```bash
eas submit:configure
```

## `eas.json` Submit Bolumu

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345",
        "ascApiKeyPath": "./credentials/AuthKey_XXX.p8",
        "ascApiKeyId": "XXX",
        "ascApiKeyIssuerId": "yyy-yyy-yyy"
      },
      "android": {
        "serviceAccountKeyPath": "./credentials/play-service-account.json",
        "track": "internal",
        "releaseStatus": "draft",
        "rollout": 0.1,
        "changesNotSentForReview": false
      }
    },
    "preview": {
      "android": { "track": "internal" }
    }
  }
}
```

## iOS Submit Akisi

```bash
# 1. Son build'i yukle
eas submit --platform ios --profile production --latest

# 2. Belirli build ID
eas submit -p ios --id <build-id>

# 3. Yerel IPA yukle
eas submit -p ios --path ./build.ipa
```

### ASC API Key (onerilen)

App Store Connect > Users and Access > Integrations > App Store Connect API:
- Key ID, Issuer ID, `.p8` dosyasi
- Role: **App Manager** (enough for submit)

Store `ascApiKeyPath` in `eas.json` or on the EAS server.

### TestFlight Akisi
1. Submit basariyla biter → ASC > TestFlight > Processing
2. **Compliance** sorulari yanitla (encryption usage)
3. Internal testing grubu ekle
4. **Beta Review** is required for external testing

## Android Submit Akisi

```bash
eas submit -p android --profile production --latest
eas submit -p android --path ./app.aab
```

### Service Account Kurulumu

Google Play Console > Setup > API access:
1. **Create new service account** (GCP project icinde)
2. Role: **Service Account User**
3. Play Console > Users and permissions > **Invite** service account
4. Permissions: **Release manager** (submit + manage)
5. JSON key indir → `eas.json` `serviceAccountKeyPath`

### Tracks

| Track | Purpose | Approval |
|-------|------|------|
| internal | 100 tester, hizli | Anlik |
| closed (alpha/beta) | Email listesi | Anlik |
| open testing | Public beta | Review required |
| production | All users | Review required |

### Staged Rollout

```json
{
  "android": {
    "track": "production",
    "rollout": 0.1,      // %10 baslangic
    "releaseStatus": "inProgress"
  }
}
```

Console'dan kademeli artir: 0.1 → 0.25 → 0.5 → 1.0.

## Metadata Yonetimi

`store.config.json` (Expo store metadata):
```json
{
  "configVersion": 0,
  "apple": {
    "info": {
      "en-US": {
        "title": "MyApp",
        "subtitle": "Productivity for everyone",
        "description": "...",
        "keywords": ["productivity", "tasks"],
        "marketingUrl": "https://myapp.com",
        "supportUrl": "https://myapp.com/support",
        "privacyPolicyUrl": "https://myapp.com/privacy"
      }
    },
    "copyright": "2026 MyCompany",
    "release": {
      "automaticRelease": false,
      "phasedRelease": true
    }
  }
}
```

```bash
eas metadata:push          # ASC'ye gonder
eas metadata:pull          # Mevcut metadata'yi cek
```

## Review Notes & Demo Account

Before submit, in `eas.json` or ASC:
- **Demo account**: test username/password
- **Notes**: a test path for review (e.g. login → premium feature path)
- **Contact info**: review ekibi sorarsa kim

## Screenshot Upload

Boyut zorunluluklari (iOS 2026):
- 6.9" iPhone (1320 x 2868)
- 6.5" iPhone (1284 x 2778)
- 12.9" iPad (2048 x 2732)

Android:
- Phone: min 320px, max 3840px
- 7" tablet, 10" tablet

> Upload to ASC with `eas metadata` or use Fastlane Snapshot. Manual upload is always an option.

## Best Practices

- Use the **ASC API Key** (instead of Apple ID/password — no 2FA issues)
- **Service Account** rolu minimum: Release Manager
- **Phased release** her zaman ac (panic rollback)
- Clarify **compliance** questions first (export compliance, encryption)
- **Review notes** demo path acik yaz — reject riski azalir
- Refresh **What's New** for every release

## Sik Hata Kaliplari

- ASC bundle ID build'le eslesmiyor → submit reject
- Service Account is not "Release Manager" → permission denied
- No privacy policy URL → reject (critical for Apple)
- Encryption usage doldurulmamis → TestFlight'ta stuck
- Screenshot boyutu yanlis → upload basarisiz
- Build "Missing Compliance" → ASC'de manuel set et

## Hard Refusal

- Yanlis/yaniltici metadata (false advertising)
- Baska sirketin/markanin logosunu/ismini iznesiz kullanmak
- Demo account'a production verisi koymak (review ekibi gorur)
- Privacy policy'de gercege aykiri beyan
- Hijacking an ASC or Play Console account

## Cikti Formati

1. Submit komutu (kopya-yapistir)
2. Credentials kurulum adimlari
3. Track/rollout decision (with rationale)
4. Review notes sablonu
5. Phased release plani
6. Risk: reject ihtimali, demo account hijyeni
