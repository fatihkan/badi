# awesome-claude-code Başvuru — Copy/Paste

**ÖNEMLİ:** Başvuru sadece web UI üzerinden, gh CLI YASAK (ban riski).

**Form URL:**
https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml

Aşağıdaki alanları sırayla doldur. Maintainer "descriptive, not promotional, no emojis, do not address reader" istiyor.

---

## Title (Issue başlığı)

```
[Resource]: Badi
```

## Display Name

```
Badi
```

## Category

`Tooling`

## Sub-Category

`Tooling: Orchestrators`

> _Gerekçe:_ Badi 21 ajan + 80 slash komut + 13 hook + 25 skill kategorisini tek CLI altında orkestre ediyor. "Config Managers" da uygun olabilir, ama orkestrasyon ana değer.

## Primary Link

```
https://github.com/fatihkan/badi
```

## Author Name

```
fatihkan
```

## Author Link

```
https://github.com/fatihkan
```

## License

`MIT`

## Description (1-3 cümle, açıklayıcı, promosyon değil, "you" yok)

```
Badi is a workflow management CLI for Claude Code that ships 21 subagents, 80 slash commands, 13 hooks, and 25 opt-in skill categories from a single npm package. It targets daily-driver development workflows with conventions around memory.md, knowledge-base.md, and a TaskBoard; the same source compiles down to Cursor and Gemini CLI harnesses as well. Configuration is project-local under .claude/ and the package is zero-runtime-dependency.
```

## Validate Claims (mandatory — düşük sürtüşmeli kanıt)

```
After installation, run `badi doctor` in any project to see a diagnostic report covering 30+ config checks (hook presence, settings.json validity, agent/command counts, skill vault, memory limits). Run `badi list --agents --commands --hooks` to enumerate everything shipped. `badi mcp serve` exposes Badi as a stdio MCP server so an external Claude session can call its tools and resources directly. None of this requires --dangerously-skip-permissions.
```

## Specific Task(s)

```
Install Badi globally with `npm install -g @fatihkan/badi`. Run `badi init --harness claude` in an empty directory. Then ask Claude Code to use the `/start` slash command — it will trigger Badi's daily-briefing workflow that loads .claude/memory.md, surveys .claude/workspace/TaskBoard.md, summarizes background watcher reports, and presents a structured briefing.
```

## Specific Prompt(s)

```
/start
```

(Tek satır — yeterli. Komut tüm akışı yönetiyor.)

## Additional Comments (opsiyonel)

```
Badi is Turkish for "fresh start." The project began as personal scaffolding for daily Claude Code use and grew into a packaged distribution. All hooks are pure Node.js (no bash required, Windows-compatible since v1.22.1). The skill system is opt-in: skills ship in a vault (skills-vault/) and users explicitly install categories with `badi skills add <name>` to keep token costs predictable.
```

## Recommendation Checklist (hepsini işaretle)

- [x] I have checked that this resource hasn't already been submitted
- [x] It has been over one week since the first public commit
- [x] All provided links are working and publicly accessible
- [x] I do NOT have any other open issues in this repository
- [x] I am primarily composed of human-y stuff and not electrical circuits

---

## Submission Sonrası Akış

1. Bot 1-2 dakika içinde validation yorumu atar (URL erişilebilir mi, duplicate var mı, format düzgün mü)
2. Eğer bot "needs changes" derse → düzelt
3. Eğer validation pass → maintainer review queue'sunda bekler
4. Onaylanırsa bot otomatik PR açıp listeye ekler

**Submission sonrası bana haber ver, issue # ile takip edebilirim.**
