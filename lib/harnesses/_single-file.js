import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { PKG_ROOT } from "../cli.js";

// _single-file.js — paylasilan harness factory'si (v1.30 review C1 fix).
//
// gemini / windsurf / agents adapter'leri %80'den fazla ayni kodu paylasiyordu
// (553 satir, count*, build*, runInstall, doctor). Bu modul ortak imzayi
// soyutlar; her adapter sadece kendine ozgu konfigurasyonu deklare eder.
//
// Konfigurasyon:
//   id: "windsurf"
//   name: "Windsurf"
//   filename: ".windsurfrules"             // hedef dosya (single-file rules)
//   skippedReasons: {                       // her bilesen icin Turkce neden
//     hooks: "Windsurf'ta hook esdegeri yok",
//     skills: "...",
//     subagents: "...",
//     commands: "...",
//   }
//   extraWriter (opsiyonel):                // gemini icin .gemini/settings.json
//     ({ target, src, force, dryRun, result }) => void
//   ensureDir (opsiyonel):                  // gemini icin .gemini/ dizini
//     (target) => string | null
//
// Adapter sonucta { id, name, supports, detect, install, update, doctor }
// ihrac eder — eskisi gibi.

export function countSourceCommands(src) {
	const dir = join(src, "commands");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

export function countSourceHooks(src) {
	const dir = join(src, "hooks");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".mjs") || f.endsWith(".sh"))
		.length;
}

export function countSourceSkills(src) {
	const vault = join(src, "skills-vault");
	const dir = existsSync(vault) ? vault : join(src, "skills");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir, { withFileTypes: true }).filter((d) =>
		d.isDirectory(),
	).length;
}

export function countSourceAgents(src) {
	const dir = join(src, "agents");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

/**
 * Canonical CLAUDE.md + memory + knowledge-base'i tek string'e merge eder.
 * Tum tek-dosya harness'ler ayni kaynagi okur.
 */
export function buildMergedDoc(src) {
	const sections = [];
	const claudeMd = resolve(PKG_ROOT, "CLAUDE.md");
	if (existsSync(claudeMd)) {
		sections.push(readFileSync(claudeMd, "utf-8").trim());
	}
	const memoryMd = join(src, "memory.md");
	if (existsSync(memoryMd)) {
		sections.push(
			`\n---\n\n# Proje Bellegi\n\n${readFileSync(memoryMd, "utf-8").trim()}`,
		);
	}
	const kbMd = join(src, "knowledge-base.md");
	if (existsSync(kbMd)) {
		sections.push(
			`\n---\n\n# Bilgi Tabani\n\n${readFileSync(kbMd, "utf-8").trim()}`,
		);
	}
	return sections.length ? `${sections.join("\n\n")}\n` : null;
}

function compileFile(src, target, filename, force, dryRun, result) {
	const content = buildMergedDoc(src);
	if (!content) return;
	const dest = join(target, filename);
	const existed = existsSync(dest);
	if (existed && !force) {
		result.skipped++;
		return;
	}
	if (!dryRun) {
		mkdirSync(dirname(dest), { recursive: true });
		writeFileSync(dest, content);
	}
	result.copied++;
	if (!existed) result.created++;
}

function buildSkippedReport(src, reasons) {
	const hooks = countSourceHooks(src);
	const skills = countSourceSkills(src);
	const agents = countSourceAgents(src);
	const commands = countSourceCommands(src);
	const skipped = [];
	if (hooks > 0 && reasons.hooks)
		skipped.push({ component: "hooks", count: hooks, reason: reasons.hooks });
	if (skills > 0 && reasons.skills)
		skipped.push({
			component: "skills",
			count: skills,
			reason: reasons.skills,
		});
	if (agents > 0 && reasons.subagents)
		skipped.push({
			component: "subagents",
			count: agents,
			reason: reasons.subagents,
		});
	if (commands > 0 && reasons.commands)
		skipped.push({
			component: "commands",
			count: commands,
			reason: reasons.commands,
		});
	return skipped;
}

/**
 * Factory — single-file harness adapter olustur.
 * Eski 3 adapter (gemini/windsurf/agents) bunu sariyor.
 */
export function buildSingleFileHarness({
	id,
	name,
	filename,
	supports,
	skippedReasons,
	extraWriter,
	ensureDir,
	doctorChecks,
}) {
	const detectFiles = [filename];

	function runInstall({ target, src, force = false, dryRun = false }) {
		const result = { copied: 0, skipped: 0, created: 0 };
		if (ensureDir && !dryRun) {
			const dir = ensureDir(target);
			if (dir && !existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
				result.created++;
			}
		}
		compileFile(src, target, filename, force, dryRun, result);
		if (typeof extraWriter === "function") {
			extraWriter({ target, src, force, dryRun, result });
		}
		result.skippedComponents = buildSkippedReport(src, skippedReasons || {});
		return result;
	}

	return {
		id,
		name,
		supports: supports || {
			rules: true,
			commands: false,
			mcp: false,
			subagents: false,
			hooks: false,
			skills: false,
		},

		detect(target) {
			return detectFiles.some((f) => existsSync(join(target, f)));
		},

		install(opts) {
			return runInstall(opts);
		},

		update(opts) {
			return runInstall({ ...opts, force: !!opts.force });
		},

		doctor({ target }) {
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

			// Default: hedef dosya mevcudiyeti
			run(`${filename} mevcut`, () => existsSync(join(target, filename)));
			// Adapter'a ozgu ekstra check'ler (gemini icin .gemini/settings.json)
			if (Array.isArray(doctorChecks)) {
				for (const c of doctorChecks) run(c.label, () => c.fn(target));
			}

			return { pass, warn, fail, checks };
		},
	};
}

// Re-export internal helpers — test ve cogu adapter icin
export { compileFile, buildSkippedReport, cpSync, mkdirSync, existsSync };
