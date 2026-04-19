import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { chalk, showBanner } from "../cli.js";

// Kabaca token sayimi (OpenAI tiktoken'a yakin): 1 token ~= 4 karakter (EN), Turkce'de ~3.5
function estimateTokens(text) {
	return Math.ceil(text.length / 3.8);
}

function walkDir(dir, exts = [".md", ".json", ".sh"]) {
	const results = [];
	if (!existsSync(dir)) return results;
	function walk(current) {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			if (entry.name.startsWith(".") && entry.name !== ".claude") continue;
			const full = join(current, entry.name);
			if (entry.isDirectory()) walk(full);
			else if (entry.isFile() && (exts.length === 0 || exts.includes(extname(entry.name)))) {
				try {
					const stat = statSync(full);
					if (stat.size > 500 * 1024) continue;
					results.push(full);
				} catch { /* */ }
			}
		}
	}
	walk(dir);
	return results;
}

// ─── badi ai token ───

function aiToken() {
	showBanner();
	console.log(chalk.bold("Token Kullanim Analizi (.claude/)"));
	console.log("");

	const claudeDir = join(process.cwd(), ".claude");
	if (!existsSync(claudeDir)) {
		console.error(chalk.red(".claude/ dizini bulunamadi"));
		process.exit(1);
	}

	const categories = {
		agents: 0,
		commands: 0,
		hooks: 0,
		skills: 0,
		references: 0,
		memory: 0,
		workspace: 0,
		other: 0,
	};
	const fileList = { agents: [], commands: [], skills: [] };
	let totalFiles = 0;
	let totalBytes = 0;
	let totalTokens = 0;

	for (const subdir of Object.keys(categories)) {
		const path = join(claudeDir, subdir);
		if (!existsSync(path)) continue;
		const files = walkDir(path);
		for (const f of files) {
			try {
				const content = readFileSync(f, "utf-8");
				const tokens = estimateTokens(content);
				categories[subdir] += tokens;
				totalTokens += tokens;
				totalBytes += content.length;
				totalFiles++;
				if (fileList[subdir]) {
					fileList[subdir].push({ path: relative(claudeDir, f), tokens });
				}
			} catch { /* */ }
		}
	}

	// CLAUDE.md
	const claudeMd = join(process.cwd(), "CLAUDE.md");
	let claudeMdTokens = 0;
	if (existsSync(claudeMd)) {
		claudeMdTokens = estimateTokens(readFileSync(claudeMd, "utf-8"));
	}

	console.log(chalk.bold("Kategori Bazli:"));
	const maxLabel = 12;
	for (const [cat, tokens] of Object.entries(categories)) {
		if (tokens === 0) continue;
		const pct = ((tokens / totalTokens) * 100).toFixed(1);
		const bar = "█".repeat(Math.round(pct / 2));
		const color = tokens > 50000 ? chalk.red : tokens > 20000 ? chalk.yellow : chalk.green;
		console.log(`  ${cat.padEnd(maxLabel)} ${color(String(tokens).padStart(7))} tokens  ${chalk.dim(pct + "%")}  ${chalk.cyan(bar)}`);
	}

	console.log("");
	console.log(chalk.bold("Toplam:"));
	console.log(`  Dosya sayisi:  ${chalk.cyan(totalFiles)}`);
	console.log(`  Toplam bayt:   ${chalk.cyan((totalBytes / 1024).toFixed(1) + " KB")}`);
	console.log(`  Tahmini token: ${chalk.bold.cyan(totalTokens)} (~${Math.round(totalTokens / 1000)}K)`);
	if (claudeMdTokens > 0) {
		console.log(`  CLAUDE.md:     ${chalk.cyan(claudeMdTokens)} tokens`);
	}

	// En buyuk dosyalar
	console.log("");
	console.log(chalk.bold("En Buyuk 10 Dosya:"));
	const allFiles = [...fileList.agents, ...fileList.commands, ...fileList.skills]
		.sort((a, b) => b.tokens - a.tokens)
		.slice(0, 10);
	for (const f of allFiles) {
		console.log(`  ${chalk.yellow(String(f.tokens).padStart(6))} ${chalk.dim(f.path)}`);
	}

	// Uyarilar
	console.log("");
	if (totalTokens > 150000) {
		console.log(chalk.red("UYARI: Toplam token yuksek. Optimizasyon oneriler:"));
		console.log(chalk.dim("  - Buyuk SKILL.md'leri referans dosyalara bol"));
		console.log(chalk.dim("  - Unused commandlari kaldir"));
		console.log(chalk.dim("  - CLAUDE.md'yi minimize et"));
	} else if (totalTokens > 80000) {
		console.log(chalk.yellow("Token kullanimi orta. Izlemeye devam edin."));
	} else {
		console.log(chalk.green("Token kullanimi saglikli."));
	}
}

// ─── badi ai prompt-test ───

function aiPromptTest() {
	showBanner();
	console.log(chalk.bold("Prompt Regression Testi"));
	console.log("");

	const commandsDir = join(process.cwd(), ".claude", "commands");
	const agentsDir = join(process.cwd(), ".claude", "agents");
	let issues = 0;
	let checked = 0;

	function checkFile(path, type) {
		const content = readFileSync(path, "utf-8");
		const name = relative(process.cwd(), path);
		checked++;

		// Bos dosya
		if (content.trim().length < 50) {
			console.log(`  ${chalk.red("XX")} ${name} — cok kisa (${content.trim().length} char)`);
			issues++;
			return;
		}

		// Agent frontmatter kontrolu
		if (type === "agent") {
			if (!content.startsWith("---")) {
				console.log(`  ${chalk.red("XX")} ${name} — frontmatter eksik`);
				issues++;
			} else {
				const hasName = /^name:\s*\S/m.test(content);
				const hasDesc = /^description:\s*\S/m.test(content);
				if (!hasName || !hasDesc) {
					console.log(`  ${chalk.yellow("!!")} ${name} — name/description eksik`);
					issues++;
				}
			}
		}

		// TODO/TBD/FIXME kontrolu (production icin)
		const todos = content.match(/\b(TODO|TBD|FIXME|XXX)\b/g);
		if (todos && todos.length > 0) {
			console.log(`  ${chalk.yellow("!!")} ${name} — ${todos.length} TODO/FIXME`);
			issues++;
		}

		// Cok uzun tek satir (formatting bozuk olabilir)
		const lines = content.split("\n");
		const longLines = lines.filter((l) => l.length > 500).length;
		if (longLines > 0) {
			console.log(`  ${chalk.yellow("!!")} ${name} — ${longLines} uzun satir (>500 char)`);
			issues++;
		}
	}

	console.log(chalk.bold("Slash Komutlari:"));
	if (existsSync(commandsDir)) {
		for (const f of readdirSync(commandsDir).filter((f) => f.endsWith(".md"))) {
			checkFile(join(commandsDir, f), "command");
		}
	}

	console.log("");
	console.log(chalk.bold("Ajanlar:"));
	if (existsSync(agentsDir)) {
		for (const f of readdirSync(agentsDir).filter((f) => f.endsWith(".md"))) {
			checkFile(join(agentsDir, f), "agent");
		}
	}

	console.log("");
	if (issues === 0) {
		console.log(chalk.bold.green(`${checked} dosya temiz!`));
	} else {
		console.log(chalk.bold.yellow(`${checked} dosya kontrol edildi, ${issues} sorun tespit edildi.`));
	}
}

// ─── badi ai memory-diff ───

function aiMemoryDiff() {
	const memoryFile = join(process.cwd(), ".claude", "memory.md");
	const kbFile = join(process.cwd(), ".claude", "knowledge-base.md");
	const globalMemDir = join(homedir(), ".claude", "projects");

	showBanner();
	console.log(chalk.bold("Memory Analizi"));
	console.log("");

	if (existsSync(memoryFile)) {
		const content = readFileSync(memoryFile, "utf-8");
		const lines = content.split("\n").length;
		const limit = 100;
		const tokens = estimateTokens(content);
		const color = lines > limit ? chalk.red : lines > limit * 0.8 ? chalk.yellow : chalk.green;
		console.log(chalk.bold("Oturum Memory (.claude/memory.md):"));
		console.log(`  Satir: ${color(lines)} / ${limit}`);
		console.log(`  Token: ${chalk.cyan(tokens)}`);
		if (lines > limit) {
			console.log(chalk.yellow("  UYARI: Sinir asildi. Konsolidasyon onerilir."));
		}
		console.log("");
	}

	if (existsSync(kbFile)) {
		const content = readFileSync(kbFile, "utf-8");
		const lines = content.split("\n").length;
		const limit = 200;
		const tokens = estimateTokens(content);
		const color = lines > limit ? chalk.red : lines > limit * 0.8 ? chalk.yellow : chalk.green;
		console.log(chalk.bold("Bilgi Tabani (.claude/knowledge-base.md):"));
		console.log(`  Satir: ${color(lines)} / ${limit}`);
		console.log(`  Token: ${chalk.cyan(tokens)}`);
		// TBD/TODO kontrol
		const forbidden = content.match(/\b(TBD|TODO|FIXME)\b/g);
		if (forbidden && forbidden.length > 0) {
			console.log(chalk.red(`  UYARI: ${forbidden.length} adet TBD/TODO/FIXME — knowledge-base'de YASAK`));
		}
		console.log("");
	}

	// Global projects karsilastirmasi (varsa)
	if (existsSync(globalMemDir)) {
		const projects = readdirSync(globalMemDir, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);
		if (projects.length > 1) {
			console.log(chalk.bold(`Global Memory Projeleri (${projects.length}):`));
			for (const p of projects.slice(0, 10)) {
				const memFile = join(globalMemDir, p, "memory", "MEMORY.md");
				if (existsSync(memFile)) {
					try {
						const c = readFileSync(memFile, "utf-8");
						console.log(`  ${chalk.dim(p.padEnd(40))} ${chalk.cyan(c.split("\n").length + " satir")}`);
					} catch { /* */ }
				}
			}
		}
	}
}

// ─── badi ai review ───

async function aiReview() {
	showBanner();
	console.log(chalk.bold("Staged Diff AI Review"));
	console.log("");

	const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
	if (!apiKey) {
		console.error(chalk.red("ANTHROPIC_API_KEY tanimli degil."));
		console.log(chalk.dim("Kurulum: export ANTHROPIC_API_KEY=sk-ant-..."));
		console.log(chalk.dim("Kayit: https://console.anthropic.com/settings/keys"));
		process.exit(1);
	}

	// Staged diff al
	let diff;
	try {
		diff = execFileSync("git", ["diff", "--cached"], { encoding: "utf-8" });
	} catch {
		console.error(chalk.red("git diff hatasi"));
		process.exit(1);
	}

	if (!diff || diff.trim().length < 50) {
		console.log(chalk.yellow("Staged degisiklik yok. Once git add ..."));
		return;
	}

	if (diff.length > 50000) {
		console.log(chalk.yellow(`Diff cok buyuk (${(diff.length / 1024).toFixed(1)}KB). Ilk 50KB gonderilecek.`));
		diff = diff.substring(0, 50000);
	}

	console.log(chalk.cyan(`Claude API'ye gonderiliyor (${(diff.length / 1024).toFixed(1)}KB)...`));
	console.log("");

	const systemPrompt = `Sen kidemli bir kod incelemecisisin. Staged git diff'i incele ve su kategorilerde bulgular raporla:
1. KRITIK guvenlik sorunlari
2. Bug potansiyeli
3. Performans sorunlari
4. Kod kalitesi (DRY, naming, complexity)
5. Olumlu gozlemler

Kisa ve somut ol. Her bulgu icin dosya:satir referansi ver. Turkce yaz.`;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 60000);

	try {
		const res = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			signal: controller.signal,
			headers: {
				"content-type": "application/json",
				"x-api-key": apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: "claude-haiku-4-5-20251001",
				max_tokens: 2000,
				system: systemPrompt,
				messages: [{ role: "user", content: `Git diff incelemesi:\n\n\`\`\`diff\n${diff}\n\`\`\`` }],
			}),
		});
		clearTimeout(timeout);

		if (!res.ok) {
			const err = await res.text();
			console.error(chalk.red(`API hatasi: ${res.status}`));
			console.error(chalk.dim(err.substring(0, 500)));
			process.exit(1);
		}

		const data = await res.json();
		const review = data.content?.[0]?.text || "(bos yanit)";
		console.log(chalk.bold("Kod Incelemesi:"));
		console.log("");
		console.log(review);
		console.log("");
		console.log(chalk.dim(`Model: ${data.model}  Tokens: in=${data.usage?.input_tokens} out=${data.usage?.output_tokens}`));
	} catch (e) {
		clearTimeout(timeout);
		console.error(chalk.red(`Hata: ${e.message}`));
		process.exit(1);
	}
}

// ─── badi ai translate ───

async function aiTranslate(args) {
	const sourceFile = args[0];
	if (!sourceFile) {
		console.error(chalk.red("Kaynak dosya gerekli: badi ai translate [file.md] --to en"));
		process.exit(1);
	}
	if (!existsSync(sourceFile)) {
		console.error(chalk.red(`Dosya bulunamadi: ${sourceFile}`));
		process.exit(1);
	}

	const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
	if (!apiKey) {
		console.error(chalk.red("ANTHROPIC_API_KEY tanimli degil."));
		process.exit(1);
	}

	let targetLang = "en";
	const toIdx = args.indexOf("--to");
	if (toIdx >= 0) targetLang = args[toIdx + 1] || "en";

	const content = readFileSync(sourceFile, "utf-8");
	if (content.length > 30000) {
		console.error(chalk.red("Dosya cok buyuk (>30KB). Boleek gonderin."));
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold(`Icerik Cevirisi: ${sourceFile} -> ${targetLang.toUpperCase()}`));
	console.log("");

	const langMap = { tr: "Turkish", en: "English", es: "Spanish", de: "German", fr: "French" };
	const targetName = langMap[targetLang] || targetLang;

	const systemPrompt = `Icerik cevirisi uzmanisin. Sosyal medya/blog icerik tonunu koru. Markdown formatini bozma. Hashtag'leri ve teknik terimleri uygun sekilde lokalize et.`;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 60000);

	try {
		const res = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			signal: controller.signal,
			headers: {
				"content-type": "application/json",
				"x-api-key": apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: "claude-haiku-4-5-20251001",
				max_tokens: 4000,
				system: systemPrompt,
				messages: [{ role: "user", content: `Bu icerigi ${targetName}'ya cevir. Markdown yapisini koru.\n\n${content}` }],
			}),
		});
		clearTimeout(timeout);

		if (!res.ok) {
			const err = await res.text();
			console.error(chalk.red(`API hatasi: ${res.status}`));
			console.error(chalk.dim(err.substring(0, 500)));
			process.exit(1);
		}

		const data = await res.json();
		const translated = data.content?.[0]?.text || "";

		// Dosyaya yaz
		const ext = extname(sourceFile);
		const base = sourceFile.substring(0, sourceFile.length - ext.length);
		const outFile = `${base}-${targetLang}${ext}`;
		writeFileSync(outFile, translated);

		console.log(chalk.bold.green("Ceviri tamamlandi!"));
		console.log(`  Cikti: ${chalk.cyan(outFile)}`);
		console.log(chalk.dim(`  Model: ${data.model}  Tokens: in=${data.usage?.input_tokens} out=${data.usage?.output_tokens}`));
	} catch (e) {
		clearTimeout(timeout);
		console.error(chalk.red(`Hata: ${e.message}`));
		process.exit(1);
	}
}

// ─── Ana komut ───

export async function runAi(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("AI/LLM Araclari:"));
		console.log("");
		console.log(chalk.bold.cyan("Analiz (API gerektirmez):"));
		console.log(`  ${chalk.cyan("badi ai token")}           Token kullanim analizi (.claude/)`);
		console.log(`  ${chalk.cyan("badi ai prompt-test")}     Slash/ajan dosyalari regression`);
		console.log(`  ${chalk.cyan("badi ai memory-diff")}     memory.md + knowledge-base limit analizi`);
		console.log("");
		console.log(chalk.bold.cyan("Claude API (ANTHROPIC_API_KEY gerekli):"));
		console.log(`  ${chalk.cyan("badi ai review")}          Staged diff AI kod review`);
		console.log(`  ${chalk.cyan("badi ai translate [file]")} Markdown cevirisi (--to en|de|fr)`);
		console.log("");
		console.log(chalk.bold("API Anahtari:"));
		console.log(chalk.dim("  export ANTHROPIC_API_KEY=sk-ant-..."));
		console.log(chalk.dim("  Kayit: https://console.anthropic.com/settings/keys"));
		return;
	}

	try {
		switch (sub) {
			case "token": aiToken(); break;
			case "prompt-test": aiPromptTest(); break;
			case "memory-diff": aiMemoryDiff(); break;
			case "review": await aiReview(); break;
			case "translate": await aiTranslate(args.slice(1)); break;
			default:
				console.error(chalk.red(`Bilinmeyen ai komutu: ${sub}`));
				console.log("Kullanim: badi ai [token|prompt-test|memory-diff|review|translate]");
				process.exit(1);
		}
	} catch (e) {
		console.error(chalk.red(`Hata: ${e.message}`));
		process.exit(1);
	}
}
