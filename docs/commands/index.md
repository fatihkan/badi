# Commands

84 slash commands under `.claude/commands/`. Browse the full set:

```bash
badi list --commands
```

## Daily flow

| Command | Purpose |
|---------|---------|
| `/start` | Morning session — load context |
| `/sync` | Mid-day refresh |
| `/wrap-up` | End-of-day summary |
| `/audit` | Quality + OWASP Top 10 scan |
| `/review` | Code review pass |
| `/unstick` | Root-cause analysis when blocked |

## Categories

- **Workflow**: `/start`, `/sync`, `/wrap-up`, `/audit`, `/review`, `/unstick`
- **Content**: `/content-*` family (content-generate, content-carousel, content-video-script, content-visual-brief, content-calendar, content-brand-voice, content-search, content-template, content-perf)
- **Mobile**: `/mobile` family (init, version, build, release, assets)
- **WordPress**: `/wp` family (add, list, status, plugins, update, security)
- **SEO/ASO**: `/seo`, `/aso`, `/market`, `/lighthouse`
- **Release**: `/publish`, `/changelog`, `/version`
- **Memory/state**: `/clear`, `/compact`, `/memory`

For the full reference, see [`.claude/commands/`](https://github.com/fatihkan/badi/tree/main/.claude/commands) — each `.md` file is the canonical command spec.
