---
name: expo-eas-submit
description: EAS Submit ile App Store Connect ve Google Play Console yukleme akisi, metadata, build artifact secimi, review notlari ve phased release. Triggers on eas submit, app store connect, google play, asc api key, service account, metadata, screenshot, phased release, review notes, testflight, internal testing, production submit, release management.
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

EAS Submit ile App Store Connect (iOS) ve Google Play Console (Android) submit surecine rehber. Metadata yonetimi, build artifact secimi, review notlari ve phased release disiplini. Build profili DETAYI `expo-eas-build`'dedir.

## Ne Yapar

- `eas submit` ile iOS/Android build yukleme
- App Store Connect API Key (ASC) ve Google Play Service Account kurulumu
- Build artifact secimi (en son / belirli URL / belirli ID)
- Review notes ve demo account yonetimi
- Phased release / staged rollout
- Screenshot ve metadata upload disiplini

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
- Rol: **App Manager** (submit icin yeterli)

`eas.json`'a `ascApiKeyPath` veya EAS server'da sakla.

### TestFlight Akisi
1. Submit basariyla biter → ASC > TestFlight > Processing
2. **Compliance** sorulari yanitla (encryption usage)
3. Internal testing grubu ekle
4. External testing icin **Beta Review** gerekli

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

| Track | Amaç | Onay |
|-------|------|------|
| internal | 100 tester, hizli | Anlik |
| closed (alpha/beta) | Email listesi | Anlik |
| open testing | Public beta | Review gerekli |
| production | Tum kullanicilar | Review gerekli |

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

Submit oncesi `eas.json` veya ASC'de:
- **Demo account**: test username/password
- **Notes**: review icin test yolu (orn. login → premium feature path)
- **Contact info**: review ekibi sorarsa kim

## Screenshot Upload

Boyut zorunluluklari (iOS 2026):
- 6.9" iPhone (1320 x 2868)
- 6.5" iPhone (1284 x 2778)
- 12.9" iPad (2048 x 2732)

Android:
- Phone: min 320px, max 3840px
- 7" tablet, 10" tablet

> ASC `eas metadata` ile yukle veya Fastlane Snapshot kullan. Manuel upload her zaman secenek.

## Best Practices

- **ASC API Key** kullan (Apple ID/password yerine — 2FA sorunu yok)
- **Service Account** rolu minimum: Release Manager
- **Phased release** her zaman ac (panic rollback)
- **Compliance** sorularini once netlestir (export compliance, encryption)
- **Review notes** demo path acik yaz — reject riski azalir
- **What's New** her surumde yenile

## Sik Hata Kaliplari

- ASC bundle ID build'le eslesmiyor → submit reject
- Service Account "Release Manager" degil → permission denied
- Privacy policy URL yok → reject (Apple kritik)
- Encryption usage doldurulmamis → TestFlight'ta stuck
- Screenshot boyutu yanlis → upload basarisiz
- Build "Missing Compliance" → ASC'de manuel set et

## Hard Refusal

- Yanlis/yaniltici metadata (false advertising)
- Baska sirketin/markanin logosunu/ismini iznesiz kullanmak
- Demo account'a production verisi koymak (review ekibi gorur)
- Privacy policy'de gercege aykiri beyan
- ASC veya Play Console hesabini hijack etmek

## Cikti Formati

1. Submit komutu (kopya-yapistir)
2. Credentials kurulum adimlari
3. Track/rollout karari (rationale ile)
4. Review notes sablonu
5. Phased release plani
6. Risk: reject ihtimali, demo account hijyeni
