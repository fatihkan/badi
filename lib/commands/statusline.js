// Badi statusline komutu — Claude Code status line yonetimi.
//
// settings.json'a statusLine alani yazar/siler.
// Yerlesik profiller: git, skill-chip.

import {
	chmodSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";

const PROFILES = {
	git: {
		description: "Git branch + dirty mark (* varsa).",
		script: `#!/usr/bin/env bash
# Badi statusline: git
dir="\${CLAUDE_PROJECT_DIR:-.}"
branch=$(git -C "$dir" branch --show-current 2>/dev/null || echo "no-git")
dirty=$(git -C "$dir" status --porcelain 2>/dev/null | head -1)
mark=""
[ -n "$dirty" ] && mark="*"
echo "[$branch$mark]"
`,
	},
	"skill-chip": {
		description: "Git branch + aktif skill sayisi chip.",
		script: `#!/usr/bin/env bash
# Badi statusline: skill-chip
dir="\${CLAUDE_PROJECT_DIR:-.}"
branch=$(git -C "$dir" branch --show-current 2>/dev/null || echo "no-git")
skill_count=$(ls "$dir/.claude/skills/" 2>/dev/null | wc -l | tr -d ' ')
echo "[$branch] [skills:$skill_count]"
`,
	},
};

function settingsPath(target) {
	return join(target, ".claude", "settings.json");
}

function scriptPath(target, name) {
	return join(target, ".claude", "status-line", `${name}.sh`);
}

function readSettings(file) {
	if (!existsSync(file)) return {};
	try {
		return JSON.parse(readFileSync(file, "utf-8"));
	} catch {
		return {};
	}
}

function writeSettings(file, settings) {
	mkdirSync(join(file, ".."), { recursive: true });
	writeFileSync(file, `${JSON.stringify(settings, null, "\t")}\n`, "utf-8");
}

function showHelp() {
	console.log(`${chalk.bold("badi statusline")} — Claude Code status line`);
	console.log("");
	console.log("  set <profile>   settings.json'a statusLine alani ekle");
	console.log("  list            Mevcut konfigi goster");
	console.log("  available       Yerlesik profilleri goster");
	console.log("  reset           statusLine alanini settings.json'dan kaldir");
	console.log("");
	console.log(chalk.bold("Yerlesik profiller:"));
	for (const [name, p] of Object.entries(PROFILES)) {
		console.log(`  ${chalk.cyan(name.padEnd(12))} ${chalk.dim(p.description)}`);
	}
}

export async function runStatusline(args) {
	const [sub, ...rest] = args;
	const target = process.cwd();
	const sFile = settingsPath(target);

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		showHelp();
		return;
	}

	if (sub === "available") {
		console.log(chalk.bold("Yerlesik profiller:"));
		for (const [name, p] of Object.entries(PROFILES)) {
			console.log(`  ${chalk.cyan(name)} — ${p.description}`);
		}
		return;
	}

	if (sub === "list") {
		const settings = readSettings(sFile);
		if (!settings.statusLine) {
			console.log(chalk.dim("(statusLine konfigure edilmemis)"));
			return;
		}
		console.log(chalk.bold("statusLine:"));
		console.log(`  type:    ${chalk.cyan(settings.statusLine.type || "?")}`);
		console.log(`  command: ${chalk.cyan(settings.statusLine.command || "?")}`);
		return;
	}

	if (sub === "set") {
		const name = rest[0];
		if (!name) {
			console.error(chalk.red("Hata: profil adi gerekli"));
			console.error("Ornek: badi statusline set git");
			process.exit(1);
		}
		if (!PROFILES[name]) {
			console.error(chalk.red(`Hata: bilinmeyen profil "${name}"`));
			console.error(
				`Mevcut: ${Object.keys(PROFILES)
					.map((n) => chalk.cyan(n))
					.join(", ")}`,
			);
			process.exit(1);
		}

		const sPath = scriptPath(target, name);
		mkdirSync(join(sPath, ".."), { recursive: true });
		writeFileSync(sPath, PROFILES[name].script, "utf-8");
		try {
			chmodSync(sPath, 0o755);
		} catch {
			/* yetki yoksa atla */
		}

		const settings = readSettings(sFile);
		settings.statusLine = {
			type: "command",
			command: `bash .claude/status-line/${name}.sh`,
		};
		writeSettings(sFile, settings);
		console.log(
			chalk.green(`+ statusLine ayarlandi: .claude/status-line/${name}.sh`),
		);
		console.log(chalk.dim("Claude Code'u yeniden baslatip etkisini gor."));
		return;
	}

	if (sub === "reset") {
		const settings = readSettings(sFile);
		if (!settings.statusLine) {
			console.log(chalk.dim("(zaten konfigure edilmemis)"));
			return;
		}
		settings.statusLine = undefined;
		delete settings.statusLine;
		writeSettings(sFile, settings);
		console.log(chalk.yellow("- statusLine kaldirildi"));
		return;
	}

	console.error(chalk.red(`Bilinmeyen alt komut: ${sub}`));
	showHelp();
	process.exit(1);
}
