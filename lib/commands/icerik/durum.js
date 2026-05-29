import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../../cli.js";
import { getDateString } from "../../icerik-helpers.js";

export function runDurum() {
	const workspaceBase = join(process.cwd(), ".claude", "workspace");
	if (!existsSync(workspaceBase)) {
		console.log(
			chalk.dim("No content generated yet. Start: badi icerik basla"),
		);
		return;
	}

	showBanner();
	console.log(chalk.bold("Content Production Status"));
	console.log(
		chalk.dim(
			`${getDateString()} ${new Date().toTimeString().substring(0, 5)}`,
		),
	);
	console.log("");

	const subdirs = ["icerikler", "senaryolar", "gorseller", "takvim"];
	const now = new Date();
	const startOfWeek = new Date(now);
	startOfWeek.setDate(now.getDate() - now.getDay());
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);

	const envanter = { total: 0, bugun: 0, buHafta: 0, buAy: 0, eski: 0 };
	const tamamlanmislik = { tamamlanan: 0, kismi: 0, taslak: 0 };

	for (const dir of subdirs) {
		const dirPath = join(workspaceBase, dir);
		if (!existsSync(dirPath)) continue;
		const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
		for (const f of files) {
			const fullPath = join(dirPath, f);
			const stat = statSync(fullPath);
			const content = readFileSync(fullPath, "utf-8");

			envanter.total++;

			const mtime = stat.mtime;
			if (mtime >= startOfToday) envanter.bugun++;
			if (mtime >= startOfWeek) envanter.buHafta++;
			if (mtime >= startOfMonth) envanter.buAy++;

			const daysSince = Math.floor((now - mtime) / (1000 * 60 * 60 * 24));
			if (daysSince > 30) envanter.eski++;

			const placeholders = content.match(/\[[^\]\n]{2,50}\]/g) || [];
			if (placeholders.length === 0) {
				tamamlanmislik.tamamlanan++;
			} else if (placeholders.length < 5) {
				tamamlanmislik.kismi++;
			} else {
				tamamlanmislik.taslak++;
			}
		}
	}

	console.log(chalk.bold("Inventory"));
	console.log(`  Total:     ${chalk.cyan(envanter.total)}`);
	console.log(`  Today:     ${chalk.cyan(envanter.bugun)}`);
	console.log(`  This Week: ${chalk.cyan(envanter.buHafta)}`);
	console.log(`  This Month:${chalk.cyan(envanter.buAy)}`);
	console.log(`  Old (30+): ${chalk.yellow(envanter.eski)}`);
	console.log("");

	console.log(chalk.bold("Completeness"));
	const toplam =
		tamamlanmislik.tamamlanan + tamamlanmislik.kismi + tamamlanmislik.taslak;
	const orani =
		toplam > 0 ? Math.round((tamamlanmislik.tamamlanan / toplam) * 100) : 0;
	console.log(`  ${chalk.green("Complete:")} ${tamamlanmislik.tamamlanan}`);
	console.log(`  ${chalk.yellow("Partial: ")} ${tamamlanmislik.kismi}`);
	console.log(`  ${chalk.red("Draft:   ")} ${tamamlanmislik.taslak}`);
	console.log(`  Rate:      ${chalk.cyan(orani)}%`);
	console.log("");

	const markaPath = join(workspaceBase, "marka-sesi.md");
	console.log(chalk.bold("Status"));
	console.log(
		`  Brand Voice: ${existsSync(markaPath) ? chalk.green("YES") : chalk.yellow("NO")}`,
	);
	console.log("");

	if (envanter.eski > 0) {
		console.log(
			chalk.yellow(
				`WARNING: ${envanter.eski} old (30+ days) files, please review.`,
			),
		);
	}
	if (tamamlanmislik.taslak > tamamlanmislik.tamamlanan) {
		console.log(
			chalk.yellow("WARNING: More drafts than completed, focus on finishing."),
		);
	}
	if (envanter.bugun === 0) {
		console.log(
			chalk.dim("INFO: No content generated today yet. badi icerik basla"),
		);
	}
	console.log("");
	console.log(
		chalk.dim("For detailed status, use /icerik-durum in Claude Code."),
	);
}
