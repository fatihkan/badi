# Badi Command Index

> 84 commands | 4 profiles (core / dev / content / pentest) — filter with `badi commands profile <name>`. The pentest profile is reserved (0 commands today); pentest capabilities ship as opt-in skills (`badi skills`).

## Core — always active (session, audit, measurement) (21)

| Command | Description |
|---------|-------------|
| `/ai-token` | Badi/.claude/ token usage analysis command. Categorized token counts, largest files, optimization suggestions. |
| `/audit` | Quality audit command. Runs a systematic audit over code, structure, or process. |
| `/clear` | Context-clearing command. Provides a seamless transition across session boundaries. Target: under 30 seconds. |
| `/coach` | Coaching analysis command. Performs data-driven work-pattern analysis and offers personal improvement suggestions. |
| `/dashboard` | Daily statistics panel. Presents task, audit, event, and performance data as a unified table. |
| `/doctor` | Badi configuration validation. Checks all Badi components and produces a diagnostic report. |
| `/drift-detect` | Configuration drift detection command. Finds inconsistencies, orphaned components, and stale content in the Badi system. |
| `/handoff` | Handoff briefing command. Enables a smooth transition to another developer or session. |
| `/health` | System health check. Audits dependencies, security, performance, and (if present) the production domain with a triple scan. |
| `/memory-diff` | Memory and knowledge-base limit check + global project comparison. |
| `/onboard` | Project onboarding command. For adapting to a new project quickly and thoroughly. |
| `/plugin` | Plugin management command. Installs, removes, and lists plugins in the Badi system. |
| `/prompt-test` | Regression test for slash command and agent files. Format and content validation. |
| `/schedule` | Scheduled command reminders. Shell-based reminder system for daily/weekly recurring tasks. |
| `/standup` | Daily standup command. Produces a quick status summary in under 30 seconds. |
| `/start` | Badi session start command. Runs new-project onboarding or a daily kickoff. |
| `/stats` | Usage analytics command. Badi tool usage statistics, bar charts, daily trends, habit streaks. |
| `/sync` | Mid-session context refresh command. Keeps context fresh and consistent during work. |
| `/system-audit` | Deep infrastructure audit command. Comprehensively audits all Badi components across 9 checkpoints. |
| `/unstick` | Unblocking command. Finds a fast solution with a structured approach when you're stuck. |
| `/wrap-up` | End-of-day ritual command. Prepares the day for closure and sets the stage for tomorrow. |

## Dev — code / infra / devops (44)

| Command | Description |
|---------|-------------|
| `/a11y-audit` | Web accessibility (WCAG 2.1) audit command. axe-core-based checks via PageSpeed Insights. |
| `/adr` | Architecture Decision Record (ADR) command. Documents architectural decisions in a structured format. |
| `/ai-review` | AI code review of the staged git diff via the Claude API. |
| `/ai-translate` | Markdown file translation. Technical/content translation via the Claude API (without breaking markdown structure). |
| `/api-doc` | API documentation generation. Scans route definitions and produces structured API docs. |
| `/api-test` | HTTP API endpoint testing. Send GET/POST/PUT/DELETE requests, analyze status + response, assertions. |
| `/architect` | Project planning command. Turns vague project ideas into 5 structured documents: specification, implementation plan, task list, brand identity, and a kickoff prompt. |
| `/aso` | App Store Optimization command. iOS app listing analysis via the iTunes API, keyword optimization, and competitor comparison. |
| `/brief` | Project briefing command. Turns raw project ideas into structured, actionable briefs. |
| `/bundle-analyze` | Bundle size + framework detection + largest assets + heavy-dependency warnings. |
| `/ceo-review` | CEO/product review command. Challenges a feature or roadmap from the top — should we build it, for whom, what does success look like — via the product-strategist agent. |
| `/changelog` | Automatic changelog generation. Produces a structured changelog from commit history. |
| `/changelog-gen` | CHANGELOG.md update command. Generates a changelog from git history grouped by conventional commit types. |
| `/conv-commit` | Conventional commit helper command. Reads staged files, suggests type/scope/message, and validates. |
| `/debt-map` | Technical debt mapping command. Systematically detects and prioritizes technical debt in the codebase. |
| `/deploy` | Deployment checklist. Verifies all pre-deployment requirements and produces a readiness report. |
| `/deps-update` | Safe dependency update analysis. Patch/minor/major categorization with optional automatic patch application. |
| `/dns-audit` | DNS record audit command. Checks A/AAAA/MX/TXT/SPF/DMARC/CAA records and scores email security. |
| `/docker-lint` | Dockerfile best-practice checks. Security, size, and reproducibility warnings. |
| `/docs-audit` | Documentation audit command. Evaluates completeness, freshness, and quality of technical documentation. |
| `/eng-review` | Engineering review command. Turns a green-lit goal into a locked architecture and a sequenced, shippable increment plan via the engineering-manager agent. |
| `/env-check` | .env file validation. Detects missing, extra, empty, and placeholder values + .gitignore check. |
| `/hotfix` | Emergency fix workflow. Manages a fast, safe patching process for production errors. |
| `/lighthouse` | Lighthouse audit command. Performance, Accessibility, Best Practices, SEO scores and Core Web Vitals via the Google PageSpeed Insights API. |
| `/mobile` | Mobile project management command. React Native/Flutter/Expo/Swift/Kotlin scaffolding, version sync, build and release guides. |
| `/perf-check` | Performance profiling. Detects hot paths, bottlenecks, and optimization opportunities. |
| `/playbook` | Workflow-to-command command. Converts repetitive manual workflows into reusable Badi commands. |
| `/post-mortem` | Post-incident analysis (post-mortem) command. Documents root-cause analysis of production incidents and major failures. |
| `/qa` | QA sign-off command. Verifies a change against acceptance criteria, runs the test suite, probes edge cases, and issues a ship / no-ship verdict via the qa-lead agent. |
| `/refactor` | Refactoring command. Detects code smells and creates a safe refactoring plan. |
| `/release` | Release notes command. Compiles changes into formats for 3 different audiences. |
| `/report` | Professional report command. Turns raw data and findings into professional, audience-appropriate reports. |
| `/retro` | Sprint retrospective command. Analyzes the past period and identifies improvement areas. |
| `/review` | Deep code review command. Comprehensive code analysis across security, performance, and architecture. |
| `/scaffold` | Code scaffolding command. Analyzes project structure and generates consistent module, component, or API skeletons. |
| `/secret-scan` | Project-wide secret/credential scan command. AWS/GCP/GitHub/npm/Stripe/OpenAI/Anthropic keys, JWTs, database URIs, private keys. |
| `/security-scan` | Security scan. Searches the codebase and dependencies for vulnerabilities and produces a severity-ranked report. |
| `/seo` | SEO audit command. Website SEO analysis, meta tag checks, sitemap validation, and speed assessment. |
| `/ship` | Ship command. Runs the pre-flight gate, decides the version bump, assembles the changelog, and opens the PR via the release-manager agent. Nothing ships unless the gate is green. |
| `/spec-check` | Specification conformance command. Audits the current code against SPECIFICATION.md, detecting feature gaps and scope drift. |
| `/ssl-check` | SSL certificate analysis command. Checks certificate validity, TLS version, and cipher strength for a domain. |
| `/team` | Virtual eng team orchestrator. Runs a goal end-to-end through the whole team — strategy → plan → build → QA → ship — conducted by the engineering-manager, delegating to every specialist. One entry point that connects /ceo-review, /eng-review, /qa, and /ship. |
| `/whois` | Domain WHOIS command. Checks registration date, expiry, registrar, and transfer lock status. |
| `/wp` | WordPress site management command. Site status, plugin/theme management, security scan, and bulk updates. |

## Content — content production / marketing / paid ads (19)

| Command | Description |
|---------|-------------|
| `/ads-review` | Google Ads review command. Builds a project-aware Google Ads strategy — keyword universe, Search/PMax structure, RSA assets, Quality Score levers, conversion tracking — via the ads-strategist agent. Advisory only: plans and verdicts, no ad spend. |
| `/competitive-intel` | Competitive analysis command. Analyzes the market, competitors, and opportunities with a comprehensive competitive-intelligence framework. |
| `/content-brand-voice` | Brand voice definition and management command. Creates a brand voice guide to keep tone, style, and personality consistent across all content. |
| `/content-calendar` | Content calendar command. Creates a weekly or monthly social media content plan with themes, platforms, and timing. |
| `/content-carousel` | Carousel (multi-frame) content command. Produces educational or storytelling carousel content for Instagram, LinkedIn, and other platforms. |
| `/content-close` | Content session close command. Summarizes the day's output, prepares for tomorrow, and notes learnings. |
| `/content-generate` | Social media content generation command. Produces ready-to-use posts, captions, visual briefs, and hashtags for the given platform and type. |
| `/content-idea` | Content idea generation command. Creates a structured idea list for a topic, theme, or platform. |
| `/content-perf` | Content performance tracking command. Tracks likes, comments, reach, and ROI for published content. |
| `/content-plan` | Weekly content planning session command. Sets next week's content strategy, themes, and production targets. |
| `/content-search` | Content archive search command. Keyword search, similarity detection, and filtering across all generated content. |
| `/content-start` | Content production session start command. Gives the daily content session a structured start, shows pending work, and sets priorities. |
| `/content-status` | Content production status panel. Shows current output volume, pending items, calendar fit, and trend data. |
| `/content-template` | Content template inheritance command. Custom template creation and inheritance-chain management for recurring content types. |
| `/content-video-script` | Video script command. Scene-by-scene scripts, captions, and visualization plans for Reels, Shorts, TikTok, and YouTube. |
| `/content-visual-brief` | Visual brief command. Detailed design instructions, color palettes, and AI image prompts for social visuals, banners, and video frames. |
| `/launch` | Product launch plan command. Creates a comprehensive plan for a new product or feature launch. |
| `/meta-review` | Meta (Facebook/Instagram) advertising review command. Builds a project-aware Meta ads strategy — audience, campaign structure, creative angles, budget, policy risks — via the ads-strategist agent. Advisory only: plans and verdicts, no ad spend. |
| `/proposal` | Client proposal command. Builds a professional client proposal from project summaries. Valid for 30 days. |
