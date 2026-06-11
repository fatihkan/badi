# Badi Skill Library

> 62 opt-in categories — 25 general + 25 pentest-* (advisory/defensive, v1.25+) + 12 expo-* (mobile dev lifecycle, v1.27+)

Skills are not prompt templates but structured operating procedures. Claude activates them automatically when it detects a relevant task. Activate categories with: badi skills add <name>

## General (25)

| # | Category | Description |
|---|----------|-------------|
| 1 | [ai-automation](ai-automation/) | Workflow automation skills using AI |
| 2 | [consulting](consulting/) | Strategic consulting skills for organizations |
| 3 | [content](content/) | Content production and SEO writing skills |
| 4 | [customer-success](customer-success/) | Customer onboarding, retention, and success skills |
| 5 | [data-analytics](data-analytics/) | Data analysis, visualization, machine learning, business intelligence, and data engineering skills |
| 6 | [design](design/) | UI/UX, visual hierarchy, typography, color theory, design systems, accessibility, and prototyping skills |
| 7 | [design-tokens](design-tokens/) | Project-level DESIGN.md tokens reference |
| 8 | [development](development/) | Modern frontend application development with React, Vue, Angular, Next.js, and component-driven architecture |
| 9 | [devops](devops/) | CI/CD, container orchestration, cloud architecture, monitoring, infrastructure security, and platform… |
| 10 | [ecommerce](ecommerce/) | Product catalog management, pricing strategy, checkout optimization, inventory, payment integrations, and… |
| 11 | [email](email/) | Email marketing and automation skills |
| 12 | [finance](finance/) | Budget planning, cash flow management, financial modeling, reporting, tax strategy, investment analysis,… |
| 13 | [frontend-taste](frontend-taste/) | Premium frontend design skills that override LLM defaults |
| 14 | [marketing](marketing/) | Digital marketing, brand strategy, ad management, content marketing, conversion optimization, and… |
| 15 | [mobile](mobile/) | Mobile app design, development, testing, deployment, and optimization |
| 16 | [product](product/) | Product management, strategy, user experience, development planning, and product analytics skills |
| 17 | [productivity](productivity/) | Personal productivity, time management, project management, team productivity, automation, and process… |
| 18 | [sales](sales/) | Sales strategy, customer relationships, pipeline management, sales techniques, CRM, and sales analytics |
| 19 | [security](security/) | Cybersecurity, compliance, access control, application security, and threat management skills |
| 20 | [security-check](security-check/) | Comprehensive AI-powered security scanning suite with 48 skills covering OWASP Top 10, 7 language-specific… |
| 21 | [seo](seo/) | Technical SEO, content SEO, link building, local SEO, e-commerce SEO, analytics, and AI SEO/AEO skills |
| 22 | [seo-crawl-budget](seo-crawl-budget/) | A 6-24 hour indexing methodology for low-competition long-tail keywords |
| 23 | [social-media](social-media/) | Platform strategy, content production, community management, ads, and social analytics |
| 24 | [startup](startup/) | Idea validation, MVP development, team building, fundraising preparation, and growth strategy skills for… |
| 25 | [testing](testing/) | Software test strategy, test automation, performance testing, security testing, and quality assurance skills |

## Pentest Family (25, advisory-only)

| # | Category | Description |
|---|----------|-------------|
| 1 | [pentest-ad](pentest-ad/) | Active Directory pentest methodology — BloodHound graph analysis, Kerberos abuse, ACL exploitation,… |
| 2 | [pentest-api](pentest-api/) | API security testing — REST/GraphQL/WebSocket, OWASP API Top 10, JWT/OAuth analysis, mass assignment,… |
| 3 | [pentest-bizlogic](pentest-bizlogic/) | Business logic flaw hunting — price manipulation, race condition, workflow bypass, authorization edge case… |
| 4 | [pentest-bugbounty](pentest-bugbounty/) | Bug bounty methodology — HackerOne/Bugcrowd/Intigriti, deduplication, report writing, severity scoring,… |
| 5 | [pentest-cicd](pentest-cicd/) | CI/CD red team methodology — GitHub Actions, GitLab CI, Jenkins pipeline security analysis, secret leak,… |
| 6 | [pentest-cloud](pentest-cloud/) | Cloud security pentest — AWS/Azure/GCP IAM analysis, lateral path, container escape pattern, serverless… |
| 7 | [pentest-credentials](pentest-credentials/) | Credential testing methodology — hash crack selection, wordlist generation, password spray (advisory),… |
| 8 | [pentest-ctf](pentest-ctf/) | CTF (Capture the Flag) challenge solving advisory — HackTheBox, TryHackMe, PicoCTF,… |
| 9 | [pentest-detection](pentest-detection/) | Detection engineering — Sigma, Splunk SPL, Elastic KQL, Microsoft Sentinel KQL, YARA, Suricata rule… |
| 10 | [pentest-engagement](pentest-engagement/) | Penetration testing engagement planning — scoping, ROE drafting, phased timeline, MITRE ATT&CK mapping,… |
| 11 | [pentest-exploit-chain](pentest-exploit-chain/) | Multi-step exploit chain analysis — linking low/medium severity findings into a critical chain,… |
| 12 | [pentest-forensics](pentest-forensics/) | Digital forensics — evidence acquisition, memory/disk imaging analysis, timeline reconstruction, IOC… |
| 13 | [pentest-llm](pentest-llm/) | LLM application red team — OWASP LLM Top 10, prompt injection, RAG poisoning, MCP server abuse, agent tool… |
| 14 | [pentest-malware](pentest-malware/) | Malware analysis — triage, static analysis, dynamic sandbox, IOC extract, YARA signature writing advisory |
| 15 | [pentest-mobile](pentest-mobile/) | Mobile application pentest — Android/iOS, MASTG/MASVS, Frida/Objection dynamic analysis,… |
| 16 | [pentest-opsec-evidence](pentest-opsec-evidence/) | Operator OPSEC + evidence handling — operator identity hygiene, source IP design, burner infrastructure,… |
| 17 | [pentest-orchestrator](pentest-orchestrator/) | Authorized penetration testing engagement orchestrator — scope declaration, OPSEC tagging,… |
| 18 | [pentest-privesc](pentest-privesc/) | Privilege escalation methodology — Linux + Windows + container escape advisory |
| 19 | [pentest-recon](pentest-recon/) | Reconnaissance and enumeration advisory — Nmap/Nessus/Nikto/BloodHound output parsing, attack surface… |
| 20 | [pentest-report](pentest-report/) | Penetration test report writing — executive summary, technical writeup, CVSS scoring, remediation roadmap… |
| 21 | [pentest-social](pentest-social/) | Social engineering pentest methodology — phishing strategy, pretexting, vishing scenario, awareness… |
| 22 | [pentest-stig](pentest-stig/) | DISA STIG (Security Technical Implementation Guide) audit + GPO remediation + keep-open justification advisory |
| 23 | [pentest-threat-model](pentest-threat-model/) | Threat modeling — STRIDE, DREAD, attack tree, data flow diagram, MITRE ATT&CK Navigator integration |
| 24 | [pentest-web](pentest-web/) | Web application security testing methodology — OWASP Top 10, SSRF, IDOR, auth bypass, injection-class advisory |
| 25 | [pentest-wireless](pentest-wireless/) | Wireless network pentest — WPA/WPA2/WPA3, evil twin, 802.1X enterprise, Bluetooth advisory |

## Expo Family (12, advisory-only)

| # | Category | Description |
|---|----------|-------------|
| 1 | [expo-app-config](expo-app-config/) | Choosing between app.json vs app.config.ts vs app.config.js, environment variables, variants, extra… |
| 2 | [expo-config-plugin](expo-config-plugin/) | Writing Expo config plugins, withInfoPlist, withAndroidManifest, withDangerousMod, mod compose, plugin… |
| 3 | [expo-dev-client](expo-dev-client/) | Custom development builds with expo-dev-client, build profiles, a custom dev menu, runtime-version… |
| 4 | [expo-eas-build](expo-eas-build/) | iOS and Android build profiles with EAS Build, credentials management, build cache, secrets, and monorepo… |
| 5 | [expo-eas-submit](expo-eas-submit/) | App Store Connect and Google Play Console upload flow with EAS Submit, metadata, build-artifact selection,… |
| 6 | [expo-eas-update](expo-eas-update/) | Publishing OTA updates with EAS Update, channels, runtime versions, branch management, and rollback strategy |
| 7 | [expo-modules](expo-modules/) | Writing Swift/Kotlin native modules with the Expo Modules API, requireNativeModule, async functions, view… |
| 8 | [expo-notifications](expo-notifications/) | expo-notifications setup, push tokens, FCM + APNs credentials, categories, scheduled notifications,… |
| 9 | [expo-orchestrator](expo-orchestrator/) | Expo + React Native cross-platform mobile app development orchestrator — workflow selection… |
| 10 | [expo-prebuild](expo-prebuild/) | Managed-to-bare transition with Expo prebuild, the ios/android directories, .easignore, native-upgrade… |
| 11 | [expo-router](expo-router/) | File-based routing with Expo Router, dynamic routes, layout hierarchy, deep linking, and navigation patterns |
| 12 | [expo-troubleshooting](expo-troubleshooting/) | Common Expo errors: Metro cache, version mismatch, expo-doctor, Pod install, Gradle daemon, native module… |

## Skill Structure

Every skill follows this standard structure:
1. Reads the project context (memory.md, knowledge-base.md)
2. Follows a step-by-step framework
3. Produces a defined output
4. Validates quality
5. Writes learnings to memory

## Skill Chains

### From Zero to First Customer (4-8 weeks)
customer-success > product > marketing > sales

### Product Launch (7 weeks)
product > design > development > marketing > sales

### Content-Driven Growth (ongoing weekly ritual)
content > seo > social-media > email

### Sales Machine (2-week setup + ongoing)
sales > crm > email > customer-success

### AI-Assisted Productivity (1-week setup)
ai-automation > productivity > development

### Security Pipeline (v1.34+ harness-interop chain)
pentest-threat-model > security-check (THREAT_MODEL.md > VULN-FINDINGS.json > TRIAGE.json)
