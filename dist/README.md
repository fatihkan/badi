# Distribution Channels (v1.30.1+)

Badi is published to **npm** (primary) and mirrored to additional package managers via the manifests in this directory.

| Channel | Manifest | Tap / Bucket repo | Install |
|---------|----------|-------------------|---------|
| **npm** | `package.json` | — | `npm i -g @fatihkan/badi` |
| **Claude Code marketplace** | `.claude-plugin/{plugin,marketplace}.json` | (in-repo) | `/plugin install fatihkan/badi` |
| **Homebrew** (macOS/Linux) | `dist/homebrew/badi.rb` | `fatihkan/homebrew-badi` | `brew tap fatihkan/badi && brew install badi` |
| **Scoop** (Windows) | `dist/scoop/badi.json` | `fatihkan/scoop-bucket` | `scoop bucket add badi <repo> && scoop install badi` |
| **GitHub Action templates** | `dist/github-actions/` | (in-repo) | `badi security init --ci` (v1.31+) |

## How the mirrors work

The npm release is the **source of truth**. Each mirror manifest references the same npm tarball:

- Homebrew formula downloads the npm `.tgz` and runs `npm install` into `libexec`.
- Scoop manifest pulls the same tarball and invokes `npm install --location=global`.

This means we don't ship separate binaries — both Homebrew and Scoop are essentially "wrappers around npm" that integrate with their respective package manager UX (auto-update, uninstall, version pinning).

## Manifest sync

Both `.claude-plugin/plugin.json` (Claude Code) and the homebrew/scoop manifests need to be updated on every release. Run:

```bash
badi release sync-manifest
```

This regenerates `.claude-plugin/` files from `package.json` + the current `.claude/` directory contents.

The Homebrew `sha256` and Scoop `hash` fields are populated automatically by the release CI (`.github/workflows/dist-publish.yml`) after the npm publish completes.

## Tap / bucket repo setup (one-time)

For first-time setup, the tap and bucket repos need to exist separately:

```bash
# Homebrew tap (one-time)
gh repo create fatihkan/homebrew-badi --public --description "Homebrew tap for Badi"
git clone https://github.com/fatihkan/homebrew-badi.git
mkdir -p homebrew-badi/Formula
cp dist/homebrew/badi.rb homebrew-badi/Formula/badi.rb
cd homebrew-badi && git add -A && git commit -m "init tap" && git push

# Scoop bucket (one-time)
gh repo create fatihkan/scoop-bucket --public --description "Scoop bucket for Badi"
git clone https://github.com/fatihkan/scoop-bucket.git
mkdir -p scoop-bucket/bucket
cp dist/scoop/badi.json scoop-bucket/bucket/badi.json
cd scoop-bucket && git add -A && git commit -m "init bucket" && git push
```

After the tap/bucket exist, the release workflow auto-updates them on every npm publish.

## GitHub Action templates (v1.31.0+)

`dist/github-actions/` icinde Badi'nin scaffold ettigi opt-in workflow sablonlari:

- `security-review.yml` — Anthropic resmi [`anthropics/claude-code-security-review`](https://github.com/anthropics/claude-code-security-review) action'ini wrap eder, PR'larda otomatik AI semantic security review yapar.

Kurulum:
```bash
badi security init --ci   # .github/workflows/security-review.yml olusturur
# Sonra: Repo Settings → Secrets → ANTHROPIC_API_KEY ekle
```

Workflow'lar `pull_request` (head SHA) ile tetiklenir, **`pull_request_target` DEGIL** — prompt injection hardening icin.

## Channels NOT supported

- **AUR (Arch User Repository)** — community-maintained. PKGBUILD can be derived from the npm tarball.
- **deb/rpm** — too much overhead for an npm-backed CLI; users on Linux should use npm or Homebrew Linux.
- **Cargo / Go modules** — not applicable; Badi is JavaScript.
