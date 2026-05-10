import {
	chmodSync,
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { PKG_ROOT } from "../cli.js";
import { copyRecursive, listDirs } from "../helpers.js";

const USER_CUSTOMIZABLE = [
	"memory.md",
	"knowledge-base.md",
	"knowledge-nominations.md",
	"workspace/",
	"plugins/",
	"logs/",
	"backups/",
	"agent-memory/",
	"skills/", // v1.17+ opt-in: kullanici secimi, update sirasinda korunur
];

function isUserFile(relativePath) {
	return USER_CUSTOMIZABLE.some(
		(p) => relativePath === p || relativePath.startsWith(p),
	);
}

function chmodHooks(destClaude) {
	const hooksDir = join(destClaude, "hooks");
	if (!existsSync(hooksDir)) return;
	// Windows'ta chmod no-op; .mjs dosyalari node ile cagrildigi icin
	// executable bit gerekmez. .sh varsa eski install'larda backwards-compat.
	for (const f of readdirSync(hooksDir)) {
		if (f.endsWith(".sh") || f.endsWith(".mjs")) {
			try {
				chmodSync(join(hooksDir, f), 0o755);
			} catch {
				/* Windows: no-op */
			}
		}
	}
}

function installClaudeMd(target, force, dryRun, result) {
	const srcClaudeMd = resolve(PKG_ROOT, "CLAUDE.md");
	const destClaudeMd = join(target, "CLAUDE.md");
	if (!existsSync(srcClaudeMd)) return;
	const missing = !existsSync(destClaudeMd);
	if (missing || force) {
		if (!dryRun) cpSync(srcClaudeMd, destClaudeMd);
		result.copied++;
		result.files.push({
			path: "CLAUDE.md",
			status: missing ? "added" : "overwritten",
		});
	} else {
		result.skipped++;
	}
}

export default {
	id: "claude",
	name: "Claude Code",
	supports: {
		rules: true,
		commands: true,
		mcp: true,
		subagents: true,
		hooks: true,
		skills: true,
	},

	detect(target) {
		return existsSync(join(target, ".claude"));
	},

	install({ target, src, force = false, dryRun = false }) {
		const destClaude = join(target, ".claude");
		if (!dryRun && !existsSync(destClaude)) {
			mkdirSync(destClaude, { recursive: true });
		}
		const result = copyRecursive(src, destClaude, { force, dryRun });
		result.files = [];
		installClaudeMd(target, force, dryRun, result);
		if (!dryRun) chmodHooks(destClaude);
		result.skippedComponents = [];
		return result;
	},

	update({ target, src, force = false, dryRun = false }) {
		const destClaude = join(target, ".claude");
		const result = copyRecursive(src, destClaude, {
			dryRun,
			updateMode: !force,
			force,
			userCustomizable: isUserFile,
		});
		result.files = [];
		installClaudeMd(target, force, dryRun, result);
		if (!dryRun) chmodHooks(destClaude);
		result.skippedComponents = [];
		return result;
	},

	doctor({ target }) {
		const claudeDir = join(target, ".claude");
		const checks = [];
		let pass = 0;
		let warn = 0;
		let fail = 0;

		const run = (label, fn) => {
			try {
				const r = fn();
				const status = r === true ? "pass" : r === "warn" ? "warn" : "fail";
				checks.push({ label, status });
				if (status === "pass") pass++;
				else if (status === "warn") warn++;
				else fail++;
			} catch (e) {
				checks.push({ label: `${label} (${e.message})`, status: "fail" });
				fail++;
			}
		};

		run(".claude/ dizini mevcut", () => existsSync(claudeDir));
		run("settings.json gecerli JSON", () => {
			const p = join(claudeDir, "settings.json");
			if (!existsSync(p)) return false;
			JSON.parse(readFileSync(p, "utf-8"));
			return true;
		});

		const hooks = [
			"guard-bash.mjs",
			"backup-before-write.mjs",
			"completeness-gate.mjs",
			"log-changes.mjs",
			"log-failures.mjs",
			"log-stop-verdict.mjs",
			"post-compact-resume.mjs",
			"pre-compact-handoff.mjs",
			"session-reset.mjs",
			"dependency-audit.mjs",
			"branch-guard.mjs",
			"track-usage.mjs",
			"skill-router.mjs",
		];
		for (const h of hooks) {
			run(`Hook: ${h}`, () => {
				const p = join(claudeDir, "hooks", h);
				return existsSync(p);
			});
		}

		const agents = [
			"archaeologist",
			"auditor",
			"coach",
			"debt-collector",
			"error-whisperer",
			"onboarding-sherpa",
			"pr-ghostwriter",
			"rubber-duck",
			"unsticker",
			"yak-shave-detector",
			"security-scanner",
			"performance-profiler",
			"test-strategist",
			"api-designer",
			"migration-pilot",
			"code-generator",
			"refactoring-advisor",
			"architecture-advisor",
			"content-creator",
			"visual-director",
			"project-architect",
		];
		for (const a of agents) {
			run(`Agent: ${a}.md`, () => {
				const p = join(claudeDir, "agents", `${a}.md`);
				if (!existsSync(p)) return false;
				const content = readFileSync(p, "utf-8");
				if (!content.startsWith("---")) return "warn";
				return true;
			});
		}

		run("memory.md boyut limiti (<=100 satir)", () => {
			const p = join(claudeDir, "memory.md");
			if (!existsSync(p)) return "warn";
			return readFileSync(p, "utf-8").split("\n").length <= 100 ? true : "warn";
		});
		run("knowledge-base.md boyut limiti (<=200 satir)", () => {
			const p = join(claudeDir, "knowledge-base.md");
			if (!existsSync(p)) return "warn";
			return readFileSync(p, "utf-8").split("\n").length <= 200 ? true : "warn";
		});
		run("CLAUDE.md mevcut", () => existsSync(join(target, "CLAUDE.md")));
		run("command-index.md mevcut", () =>
			existsSync(join(claudeDir, "command-index.md")),
		);
		run("Skill vault mevcut", () => {
			// v1.17+ opt-in: vault tum skill'leri tutar, aktif dizini kullanici secer
			const vault = join(claudeDir, "skills-vault");
			if (!existsSync(vault)) return false;
			return listDirs(vault).length >= 16 ? true : "warn";
		});
		run("Aktif skill dizin yapisi", () => {
			// v1.17+ opt-in: 0 aktif normaldir (kullanici 'badi skills add' ile sec)
			const skillsDir = join(claudeDir, "skills");
			return existsSync(skillsDir) ? true : "warn";
		});

		return { pass, warn, fail, checks };
	},
};
