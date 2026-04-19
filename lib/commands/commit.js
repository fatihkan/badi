import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { chalk, showBanner } from "../cli.js";

const TYPES = [
	{ type: "feat", desc: "Yeni ozellik", emoji: "+" },
	{ type: "fix", desc: "Hata duzeltmesi", emoji: "x" },
	{ type: "docs", desc: "Dokumantasyon", emoji: "d" },
	{ type: "style", desc: "Format, whitespace", emoji: "s" },
	{ type: "refactor", desc: "Yeniden duzenleme", emoji: "r" },
	{ type: "perf", desc: "Performans", emoji: "p" },
	{ type: "test", desc: "Test ekleme/guncelleme", emoji: "t" },
	{ type: "chore", desc: "Bakim isleri", emoji: "c" },
	{ type: "ci", desc: "CI/CD degisiklikleri", emoji: "ci" },
	{ type: "build", desc: "Build sistemi", emoji: "b" },
];

function git(args) {
	try {
		return execFileSync("git", args, { encoding: "utf-8", timeout: 10000 }).trim();
	} catch (e) {
		throw new Error(`git ${args[0]} hatasi: ${e.message}`);
	}
}

function showStagedChanges() {
	try {
		const diff = git(["diff", "--cached", "--stat"]);
		if (!diff) return null;
		return diff;
	} catch { return null; }
}

// ─── commit ───

export async function runCommit(args) {
	if (args[0] === "--help" || args[0] === "-h") {
		showBanner();
		console.log(chalk.bold("Conventional Commit Yardimi:"));
		console.log("");
		console.log(`  ${chalk.cyan("badi commit")}                        Tip + mesaj onerileri goster`);
		console.log(`  ${chalk.cyan("badi commit --check")}                Son commit lint kontrolu`);
		console.log(`  ${chalk.cyan("badi commit --message 'feat: X'")}    Conventional kontrol + git commit`);
		console.log("");
		console.log(chalk.bold("Tipler:"));
		for (const t of TYPES) {
			console.log(`  ${chalk.cyan(t.type.padEnd(10))} ${chalk.dim(t.desc)}`);
		}
		console.log("");
		console.log(chalk.bold("Format:"));
		console.log(chalk.dim("  <tip>(<kapsam>): <kisa aciklama>"));
		console.log(chalk.dim("  "));
		console.log(chalk.dim("  <govde — ne/neden>"));
		console.log(chalk.dim("  "));
		console.log(chalk.dim("  BREAKING CHANGE: <aciklama>"));
		return;
	}

	// --check: son commit'in conventional olup olmadigini kontrol et
	if (args.includes("--check")) {
		showBanner();
		const lastMsg = git(["log", "-1", "--pretty=%B"]);
		console.log(chalk.bold("Son Commit:"));
		console.log(chalk.dim(lastMsg.substring(0, 200)));
		console.log("");

		const firstLine = lastMsg.split("\n")[0];
		const convRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\([a-z0-9-]+\))?!?:\s.{1,100}$/;
		if (convRegex.test(firstLine)) {
			console.log(chalk.bold.green("Conventional commit formati uygun!"));
			return;
		}

		console.log(chalk.bold.red("Conventional commit formati UYGUN DEGIL"));
		console.log("");
		console.log(chalk.bold("Beklenen format:"));
		console.log(chalk.dim("  tip(kapsam): kisa aciklama"));
		console.log("");
		console.log(chalk.bold("Ornek:"));
		console.log(chalk.dim("  feat(auth): JWT token refresh mekanizmasi eklendi"));
		console.log(chalk.dim("  fix(api): 500 hatasi yayinlanamazdi"));
		process.exit(1);
	}

	// --message ile gercek commit
	const msgIdx = args.indexOf("--message");
	if (msgIdx >= 0) {
		const message = args[msgIdx + 1];
		if (!message) { console.error(chalk.red("Mesaj bos")); process.exit(1); }

		const firstLine = message.split("\n")[0];
		const convRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\([a-z0-9-]+\))?!?:\s.{1,100}$/;
		if (!convRegex.test(firstLine)) {
			console.error(chalk.red("Conventional format UYMUYOR"));
			console.log(chalk.dim(`  Alinan: ${firstLine}`));
			console.log(chalk.dim("  Beklenen: tip(kapsam): aciklama"));
			process.exit(1);
		}

		try {
			execFileSync("git", ["commit", "-m", message], { stdio: "inherit" });
		} catch (e) {
			console.error(chalk.red(`Commit hatasi: ${e.message}`));
			process.exit(1);
		}
		return;
	}

	// Varsayilan: interaktif rehberlik
	showBanner();
	console.log(chalk.bold("Conventional Commit Olustur:"));
	console.log("");

	const staged = showStagedChanges();
	if (staged) {
		console.log(chalk.bold("Staged Dosyalar:"));
		console.log(chalk.dim(staged));
		console.log("");
	} else {
		console.log(chalk.yellow("Staged dosya yok. Once git add ..."));
		return;
	}

	console.log(chalk.bold("Onerilen Tipler:"));
	for (const t of TYPES) {
		console.log(`  ${chalk.cyan(t.type.padEnd(10))} ${chalk.dim(t.desc)}`);
	}

	console.log("");
	console.log(chalk.bold("Commit icin:"));
	console.log(chalk.dim('  badi commit --message "feat(area): kisa aciklama"'));
	console.log(chalk.dim('  git commit -m "feat(area): kisa aciklama"'));
	console.log("");
	console.log(chalk.bold("Kontrol icin:"));
	console.log(chalk.dim("  badi commit --check    # Son commit'i dogrula"));
}

// ─── changelog ───

function parseCommits(range) {
	const format = "%H|%s|%an|%aI";
	const raw = git(["log", range, `--pretty=format:${format}`]);
	if (!raw) return [];
	return raw.split("\n").filter(Boolean).map((line) => {
		const [hash, subject, author, date] = line.split("|");
		return { hash: hash.substring(0, 7), subject, author, date };
	});
}

function groupCommits(commits) {
	const groups = {
		feat: { label: "Eklenen", emoji: "+" },
		fix: { label: "Duzeltilen", emoji: "x" },
		perf: { label: "Performans", emoji: "p" },
		refactor: { label: "Yeniden Duzenlenen", emoji: "r" },
		docs: { label: "Dokumantasyon", emoji: "d" },
		test: { label: "Test", emoji: "t" },
		build: { label: "Build", emoji: "b" },
		ci: { label: "CI/CD", emoji: "ci" },
		chore: { label: "Bakim", emoji: "c" },
		other: { label: "Diger", emoji: "?" },
	};
	const result = {};
	for (const c of commits) {
		const m = c.subject.match(/^(\w+)(?:\([^)]+\))?!?:\s*(.+)$/);
		const type = m ? m[1] : "other";
		const clean = m ? m[2] : c.subject;
		if (!groups[type]) continue;
		if (!result[type]) result[type] = [];
		result[type].push({ ...c, clean });
	}
	return { groups, result };
}

export async function runChangelog(args) {
	if (args[0] === "--help" || args[0] === "-h") {
		showBanner();
		console.log(chalk.bold("Changelog Generator:"));
		console.log("");
		console.log(`  ${chalk.cyan("badi changelog")}                    Son tag'den HEAD'e`);
		console.log(`  ${chalk.cyan("badi changelog --from v1.0.0")}      Belirli tag'den beri`);
		console.log(`  ${chalk.cyan("badi changelog --to v2.0.0")}        Belirli tag'e kadar`);
		console.log(`  ${chalk.cyan("badi changelog --version 1.5.0")}    Yeni CHANGELOG.md bolumu uret`);
		console.log(`  ${chalk.cyan("badi changelog --write")}            CHANGELOG.md dosyasina ekle`);
		console.log("");
		console.log(chalk.dim("Conventional commit tipleriyle gruplama yapar."));
		return;
	}

	// Parametreler
	let fromRef = null;
	let toRef = "HEAD";
	let version = null;
	let write = args.includes("--write");
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--from") fromRef = args[++i];
		else if (args[i] === "--to") toRef = args[++i];
		else if (args[i] === "--version") version = args[++i];
	}

	// fromRef belirtilmemisse en son tag'i bul
	if (!fromRef) {
		try {
			fromRef = git(["describe", "--tags", "--abbrev=0"]);
		} catch {
			// Tag yok - ilk commit'ten baslat
			fromRef = git(["rev-list", "--max-parents=0", "HEAD"]).split("\n")[0];
		}
	}

	const range = `${fromRef}..${toRef}`;
	showBanner();
	console.log(chalk.bold(`Changelog: ${fromRef} -> ${toRef}`));
	console.log("");

	const commits = parseCommits(range);
	if (commits.length === 0) {
		console.log(chalk.dim("Bu aralikta commit yok."));
		return;
	}

	const { groups, result } = groupCommits(commits);
	const today = new Date().toISOString().substring(0, 10);

	// Markdown cikti
	const lines = [];
	if (version) lines.push(`## [${version}] - ${today}`);
	else lines.push(`## [${toRef}] - ${today}`);
	lines.push("");

	for (const [type, items] of Object.entries(result)) {
		if (items.length === 0) continue;
		lines.push(`### ${groups[type].label}`);
		for (const c of items) {
			lines.push(`- ${c.clean} (${c.hash})`);
		}
		lines.push("");
	}

	const content = lines.join("\n");

	if (write) {
		if (!existsSync("CHANGELOG.md")) {
			writeFileSync("CHANGELOG.md", `# Degisiklik Gunlugu\n\n${content}\n`);
			console.log(chalk.green("CHANGELOG.md olusturuldu"));
			return;
		}
		const current = readFileSync("CHANGELOG.md", "utf-8");
		// Ilk ## satirindan sonra ekle (veya en basa)
		const firstVersionIdx = current.search(/^## /m);
		if (firstVersionIdx >= 0) {
			const updated = current.substring(0, firstVersionIdx) + content + "\n" + current.substring(firstVersionIdx);
			writeFileSync("CHANGELOG.md", updated);
		} else {
			writeFileSync("CHANGELOG.md", current + "\n" + content + "\n");
		}
		console.log(chalk.green(`CHANGELOG.md guncellendi (${commits.length} commit)`));
	} else {
		console.log(content);
		console.log("");
		console.log(chalk.dim(`Toplam: ${commits.length} commit`));
		console.log(chalk.dim("Dosyaya yazmak icin: badi changelog --write --version X.Y.Z"));
	}
}
