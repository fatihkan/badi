// Command profile definitions.
//
// The 86 .claude/commands/ files split into 4 profiles:
//   core    — always active (session management, measurement)
//   dev     — code/infrastructure/devops focused
//   content — social media/marketing focused
//   pentest — authorized pentest engagement (future)
//
// the "all" profile enables every command (default).
// the "core" profile keeps only the essential commands.

export const PROFILES = ["core", "dev", "content", "pentest", "all"];

/**
 * The primary profile label of each command.
 * A command belongs to exactly one profile (simple include/exclude).
 * "core" commands are always active; they stay even among
 * profile-changing commands.
 */
export const COMMAND_PROFILES = {
	// core (21) — always active
	start: "core",
	sync: "core",
	"wrap-up": "core",
	clear: "core",
	doctor: "core",
	"system-audit": "core",
	"drift-detect": "core",
	health: "core",
	dashboard: "core",
	stats: "core",
	"ai-token": "core",
	schedule: "core",
	plugin: "core",
	"memory-diff": "core",
	"prompt-test": "core",
	audit: "core",
	unstick: "core",
	handoff: "core",
	coach: "core",
	standup: "core",
	onboard: "core",

	// dev (46) — development/devops/audit + virtual eng team
	adr: "dev",
	"ceo-review": "dev",
	"eng-review": "dev",
	qa: "dev",
	ship: "dev",
	team: "dev",
	"ai-review": "dev",
	"ai-translate": "dev",
	"api-doc": "dev",
	"api-test": "dev",
	architect: "dev",
	brief: "dev",
	"bundle-analyze": "dev",
	changelog: "dev",
	"changelog-gen": "dev",
	"conv-commit": "dev",
	"debt-map": "dev",
	deploy: "dev",
	"deps-update": "dev",
	"docker-lint": "dev",
	"docs-audit": "dev",
	"env-check": "dev",
	hotfix: "dev",
	lighthouse: "dev",
	"perf-check": "dev",
	playbook: "dev",
	"post-mortem": "dev",
	refactor: "dev",
	release: "dev",
	report: "dev",
	retro: "dev",
	review: "dev",
	scaffold: "dev",
	"secret-scan": "dev",
	"security-scan": "dev",
	"spec-check": "dev",
	"a11y-audit": "dev",
	"dns-audit": "dev",
	"ssl-check": "dev",
	whois: "dev",
	seo: "dev",
	aso: "dev",
	wp: "dev",
	mobile: "dev",
	market: "dev",
	tasks: "dev",

	// content (19) — content production/marketing + ads review
	"meta-review": "content",
	"ads-review": "content",
	"content-generate": "content",
	"content-start": "content",
	"content-status": "content",
	"content-plan": "content",
	"content-close": "content",
	"content-idea": "content",
	"content-search": "content",
	"content-perf": "content",
	"content-template": "content",
	"content-calendar": "content",
	"content-visual-brief": "content",
	"content-brand-voice": "content",
	"content-video-script": "content",
	"content-carousel": "content",
	"competitive-intel": "content",
	launch: "content",
	proposal: "content",
};

/**
 * The commands that should stay active for the given profile.
 * core is always included; "all" returns everything.
 */
export function commandsForProfile(profile) {
	const target = profile === "all" ? null : profile;
	const result = [];
	for (const [name, p] of Object.entries(COMMAND_PROFILES)) {
		if (target === null) result.push(name);
		else if (p === "core" || p === target) result.push(name);
	}
	return result.sort();
}

/**
 * Tell whether it's a member of a profile.
 */
export function isInProfile(commandName, profile) {
	if (profile === "all") return true;
	const p = COMMAND_PROFILES[commandName];
	if (!p) return true; // unknown -> leave it (may be a user command)
	return p === "core" || p === profile;
}

/**
 * Profile counts.
 */
export function profileCounts() {
	const counts = { core: 0, dev: 0, content: 0, pentest: 0 };
	for (const p of Object.values(COMMAND_PROFILES)) {
		if (counts[p] !== undefined) counts[p]++;
	}
	return counts;
}
