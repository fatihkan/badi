# Agents

Badi ships 21 specialized agents under `.claude/agents/`. Each agent declares its tools, permissionMode, and (for read-only agents) disallowedTools so Claude Code 2.1.119+ honors the policy in headless/`--print` execution.

## Read-only / advisor agents (15)

Cannot Write, Edit, or NotebookEdit:

| Agent | Description |
|-------|-------------|
| [archaeologist](https://github.com/fatihkan/badi/blob/main/.claude/agents/archaeologist.md) | Code history researcher — answers "why was this written this way?" |
| [api-designer](https://github.com/fatihkan/badi/blob/main/.claude/agents/api-designer.md) | API design expert — REST/GraphQL consistency, documentation, versioning |
| [architecture-advisor](https://github.com/fatihkan/badi/blob/main/.claude/agents/architecture-advisor.md) | Architecture design advisor — patterns, system design, ADRs |
| [debt-collector](https://github.com/fatihkan/badi/blob/main/.claude/agents/debt-collector.md) | Technical debt scanner and prioritization |
| [error-whisperer](https://github.com/fatihkan/badi/blob/main/.claude/agents/error-whisperer.md) | Error diagnosis — translates errors into readable language |
| [migration-pilot](https://github.com/fatihkan/badi/blob/main/.claude/agents/migration-pilot.md) | Migration planner — risk analysis + step-by-step plans |
| [onboarding-sherpa](https://github.com/fatihkan/badi/blob/main/.claude/agents/onboarding-sherpa.md) | Codebase guide — makes new projects digestible in minutes |
| [performance-profiler](https://github.com/fatihkan/badi/blob/main/.claude/agents/performance-profiler.md) | Performance analyzer — bottlenecks, N+1, memory leaks |
| [pr-ghostwriter](https://github.com/fatihkan/badi/blob/main/.claude/agents/pr-ghostwriter.md) | PR descriptions, commit messages, changelog entries |
| [refactoring-advisor](https://github.com/fatihkan/badi/blob/main/.claude/agents/refactoring-advisor.md) | Code quality + refactoring — pattern detection, modernization |
| [rubber-duck](https://github.com/fatihkan/badi/blob/main/.claude/agents/rubber-duck.md) | Socratic questioning partner — thought partner for complex decisions |
| [security-scanner](https://github.com/fatihkan/badi/blob/main/.claude/agents/security-scanner.md) | Security vulnerability scanner — OWASP Top 10, secrets, deps |
| [test-strategist](https://github.com/fatihkan/badi/blob/main/.claude/agents/test-strategist.md) | Test strategy expert — coverage analysis, test planning |
| [unsticker](https://github.com/fatihkan/badi/blob/main/.claude/agents/unsticker.md) | Root-cause analyst — diagnoses project blockers |
| [yak-shave-detector](https://github.com/fatihkan/badi/blob/main/.claude/agents/yak-shave-detector.md) | Scope creep detector — keeps tasks on the rails |

## Producer agents (6)

Have Write/Edit access for emitting files:

| Agent | Description |
|-------|-------------|
| [auditor](https://github.com/fatihkan/badi/blob/main/.claude/agents/auditor.md) | QA gatekeeper — validates outputs, detects inconsistencies |
| [coach](https://github.com/fatihkan/badi/blob/main/.claude/agents/coach.md) | Proactive consultant — pattern detection + coaching |
| [code-generator](https://github.com/fatihkan/badi/blob/main/.claude/agents/code-generator.md) | Generates scaffolds and templates |
| [content-creator](https://github.com/fatihkan/badi/blob/main/.claude/agents/content-creator.md) | Social media content producer |
| [project-architect](https://github.com/fatihkan/badi/blob/main/.claude/agents/project-architect.md) | Project planner — produces 5 docs from idea to actionable blueprint |
| [visual-director](https://github.com/fatihkan/badi/blob/main/.claude/agents/visual-director.md) | Visual director — visual brief, palette, composition, AI prompts |

## How to use

```bash
# Inside a Claude Code session, invoke by name
/agents auditor
/agents security-scanner

# Or list and inspect from the CLI
badi list --agents
```
