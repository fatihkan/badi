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

## What It Does

- Uploading iOS/Android builds with `eas submit`
- App Store Connect API Key (ASC) and Google Play Service Account setup
- Build artifact selection (latest / specific URL / specific ID)
- Review notes and demo-account management
- Phased release / staged rollout
- Screenshot and metadata upload discipline

## Setup

```bash
eas submit:configure
```

## `eas.json` Submit Section

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

## iOS Submit Flow

```bash
# 1. Upload the latest build
eas submit --platform ios --profile production --latest

# 2. Specific build ID
eas submit -p ios --id <build-id>

# 3. Upload a local IPA
eas submit -p ios --path ./build.ipa
```

### ASC API Key (recommended)

App Store Connect > Users and Access > Integrations > App Store Connect API:
- Key ID, Issuer ID, `.p8` file
- Role: **App Manager** (enough for submit)

Store `ascApiKeyPath` in `eas.json` or on the EAS server.

### TestFlight Flow
1. Submit completes successfully → ASC > TestFlight > Processing
2. Answer the **compliance** questions (encryption usage)
3. Add an internal testing group
4. **Beta Review** is required for external testing

## Android Submit Flow

```bash
eas submit -p android --profile production --latest
eas submit -p android --path ./app.aab
```

### Service Account Setup

Google Play Console > Setup > API access:
1. **Create new service account** (inside the GCP project)
2. Role: **Service Account User**
3. Play Console > Users and permissions > **Invite** service account
4. Permissions: **Release manager** (submit + manage)
5. Download the JSON key → `eas.json` `serviceAccountKeyPath`

### Tracks

| Track | Purpose | Approval |
|-------|---------|----------|
| internal | 100 testers, fast | Instant |
| closed (alpha/beta) | Email list | Instant |
| open testing | Public beta | Review required |
| production | All users | Review required |

### Staged Rollout

```json
{
  "android": {
    "track": "production",
    "rollout": 0.1,      // 10% start
    "releaseStatus": "inProgress"
  }
}
```

Increase gradually from the console: 0.1 → 0.25 → 0.5 → 1.0.

## Metadata Management

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
eas metadata:push          # send to ASC
eas metadata:pull          # fetch the current metadata
```

## Review Notes & Demo Account

Before submit, in `eas.json` or ASC:
- **Demo account**: test username/password
- **Notes**: a test path for review (e.g. login → premium feature path)
- **Contact info**: who to reach if the review team asks

## Screenshot Upload

Size requirements (iOS 2026):
- 6.9" iPhone (1320 x 2868)
- 6.5" iPhone (1284 x 2778)
- 12.9" iPad (2048 x 2732)

Android:
- Phone: min 320px, max 3840px
- 7" tablet, 10" tablet

> Upload to ASC with `eas metadata` or use Fastlane Snapshot. Manual upload is always an option.

## Best Practices

- Use the **ASC API Key** (instead of Apple ID/password — no 2FA issues)
- **Service Account** role minimum: Release Manager
- **Phased release** always on (panic rollback)
- Clarify **compliance** questions first (export compliance, encryption)
- Write the **review notes** demo path clearly — lowers the reject risk
- Refresh **What's New** for every release

## Common Failure Patterns

- ASC bundle ID doesn't match the build → submit reject
- Service Account is not "Release Manager" → permission denied
- No privacy policy URL → reject (critical for Apple)
- Encryption usage not filled in → stuck in TestFlight
- Wrong screenshot size → upload fails
- Build "Missing Compliance" → set it manually in ASC

## Hard Refusal

- Wrong/misleading metadata (false advertising)
- Using another company's/brand's logo or name without permission
- Putting production data in the demo account (the review team sees it)
- A false declaration in the privacy policy
- Hijacking an ASC or Play Console account

## Output Format

1. Submit command (copy-paste)
2. Credentials setup steps
3. Track/rollout decision (with rationale)
4. Review notes template
5. Phased release plan
6. Risk: chance of reject, demo account hygiene
