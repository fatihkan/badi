import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chalk } from "./cli.js";
import { parseFrontmatter } from "./frontmatter.js";

export { parseFrontmatter };

export function loadPreferences() {
	const prefFile = join(homedir(), ".config", "badi", "preferences.json");
	try {
		if (existsSync(prefFile)) {
			return JSON.parse(readFileSync(prefFile, "utf-8"));
		}
	} catch {
		// Preferences okunamazsa varsayilan
	}
	return { defaultLanguages: ["en"] };
}

export function parseLanguageFlag(args) {
	const remaining = [];
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--lang") {
			i++; // deger varsa atla — icerik English-only (faz 1), --lang no-op
		} else {
			remaining.push(args[i]);
		}
	}
	// English-only: her zaman EN. --lang geriye-uyum icin yutulur ama etkisizdir.
	return { languages: ["en"], remaining };
}

export function levenshteinDistance(a, b) {
	// Erken cikis: boy farki buyuk ise benzerlik anlamsiz
	if (a === b) return 0;
	if (!a.length) return b.length;
	if (!b.length) return a.length;

	// O(n) bellek — tek satir kullan
	const m = a.length;
	const n = b.length;
	let prev = new Array(n + 1);
	let curr = new Array(n + 1);
	for (let j = 0; j <= n; j++) prev[j] = j;

	for (let i = 1; i <= m; i++) {
		curr[0] = i;
		for (let j = 1; j <= n; j++) {
			curr[j] =
				a[i - 1] === b[j - 1]
					? prev[j - 1]
					: 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
		}
		[prev, curr] = [curr, prev];
	}
	return prev[n];
}

export function calculateSimilarity(a, b) {
	const na = slugify(a);
	const nb = slugify(b);
	if (!na || !nb) return 0;
	const maxLen = Math.max(na.length, nb.length);
	const levSim = 1 - levenshteinDistance(na, nb) / maxLen;
	const wordsA = new Set(na.split("-").filter(Boolean));
	const wordsB = new Set(nb.split("-").filter(Boolean));
	const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
	const union = new Set([...wordsA, ...wordsB]).size;
	const jaccard = union > 0 ? intersection / union : 0;
	return levSim * 0.4 + jaccard * 0.6;
}

export function slugify(text) {
	return text
		.toLowerCase()
		.replace(/ı/g, "i")
		.replace(/ğ/g, "g")
		.replace(/ü/g, "u")
		.replace(/ş/g, "s")
		.replace(/ö/g, "o")
		.replace(/ç/g, "c")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.substring(0, 50);
}

export function getDateString() {
	const d = new Date();
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

export function getIcerikWorkspace(subdir) {
	const base = join(process.cwd(), ".claude", "workspace", subdir);
	if (!existsSync(base)) {
		mkdirSync(base, { recursive: true });
	}
	return base;
}
export function loadCustomTemplate(name) {
	const sablonDir = join(process.cwd(), ".claude", "workspace", "sablonlar");
	const filePath = join(sablonDir, `${name}.md`);
	if (!existsSync(filePath)) return null;
	const content = readFileSync(filePath, "utf-8");
	const { meta, body } = parseFrontmatter(content);
	return { meta, body, filePath };
}

export function resolveTemplate(name, visited = new Set()) {
	if (visited.has(name)) {
		console.error(
			chalk.red(
				`Dairesel kalitim tespit edildi: ${[...visited, name].join(" -> ")}`,
			),
		);
		process.exit(1);
	}
	visited.add(name);
	const tmpl = loadCustomTemplate(name);
	if (!tmpl) {
		console.error(chalk.red(`Sablon bulunamadi: ${name}`));
		process.exit(1);
	}
	const validBases = ["post", "karousel", "video", "gorsel", "takvim"];
	if (tmpl.meta.extends && !validBases.includes(tmpl.meta.extends)) {
		return resolveTemplate(tmpl.meta.extends, visited);
	}
	return tmpl;
}

export function mergeTemplateContent(baseContent, customBody) {
	if (!customBody) return baseContent;
	const baseSections = new Map();
	const baseLines = baseContent.split("\n");
	let currentKey = "__intro__";
	let currentLines = [];
	for (const line of baseLines) {
		if (line.startsWith("## ")) {
			baseSections.set(currentKey, currentLines.join("\n"));
			currentKey = line;
			currentLines = [line];
		} else {
			currentLines.push(line);
		}
	}
	baseSections.set(currentKey, currentLines.join("\n"));

	const customSections = customBody.split(/(?=^## )/m).filter(Boolean);
	for (const section of customSections) {
		const firstLine = section.split("\n")[0];
		if (firstLine.startsWith("## ")) {
			baseSections.set(firstLine, section);
		} else {
			baseSections.set("__custom__", section);
		}
	}

	return [...baseSections.values()].join("\n");
}

export function searchWorkspaceFiles(workspaceBase, query, filters = {}) {
	const subdirs = [
		"icerikler",
		"senaryolar",
		"gorseller",
		"takvim",
		"sablonlar",
	];
	const results = [];
	const queryLower = query.toLowerCase();
	const queryWords = slugify(query).split("-").filter(Boolean);

	for (const dir of subdirs) {
		const dirPath = join(workspaceBase, dir);
		if (!existsSync(dirPath)) continue;
		const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
		for (const f of files) {
			const fullPath = join(dirPath, f);
			const content = readFileSync(fullPath, "utf-8");
			const contentLower = content.toLowerCase();
			const stat = statSync(fullPath);

			// Filtreler
			if (
				filters.platform &&
				!contentLower.includes(filters.platform.toLowerCase())
			)
				continue;
			if (filters.tur) {
				const typeMap = {
					post: "icerikler",
					karousel: "icerikler",
					video: "senaryolar",
					gorsel: "gorseller",
					takvim: "takvim",
				};
				if (typeMap[filters.tur] && typeMap[filters.tur] !== dir) continue;
			}
			if (filters.son) {
				const cutoff = new Date(Date.now() - filters.son * 86400000);
				if (stat.mtime < cutoff) continue;
			}
			if (
				filters.hashtag &&
				!contentLower.includes(`#${filters.hashtag.toLowerCase()}`)
			)
				continue;

			// Skor hesapla
			let score = 0;
			for (const word of queryWords) {
				const regex = new RegExp(word, "gi");
				const matches = contentLower.match(regex);
				if (matches) score += matches.length;
			}
			if (score === 0 && !f.toLowerCase().includes(queryLower)) continue;

			// Dosya adi bonus
			if (f.toLowerCase().includes(queryLower)) score += 5;

			// Guncellik bonusu
			const ageMs = Date.now() - stat.mtime.getTime();
			if (ageMs < 7 * 86400000) score *= 1.5;
			else if (ageMs < 30 * 86400000) score *= 1.2;

			// Snippet cikar
			const lines = content.split("\n");
			let snippet = "";
			for (const line of lines) {
				if (line.toLowerCase().includes(queryLower)) {
					snippet = line.trim().substring(0, 80);
					break;
				}
			}

			const typeIcon = {
				icerikler: "P",
				senaryolar: "V",
				gorseller: "G",
				takvim: "T",
				sablonlar: "S",
			};
			results.push({
				file: f,
				path: fullPath,
				dir,
				icon: typeIcon[dir] || "?",
				date: f.match(/^\d{4}-\d{2}-\d{2}/)
					? f.substring(0, 10)
					: stat.mtime.toISOString().substring(0, 10),
				score: Math.round(score * 10) / 10,
				snippet,
			});
		}
	}

	// Marka sesi dosyalari
	for (const mf of ["marka-sesi.md", "marka-sesi-en.md"]) {
		const mp = join(workspaceBase, mf);
		if (!existsSync(mp)) continue;
		const content = readFileSync(mp, "utf-8");
		if (content.toLowerCase().includes(queryLower)) {
			results.push({
				file: mf,
				path: mp,
				dir: "workspace",
				icon: "M",
				date: statSync(mp).mtime.toISOString().substring(0, 10),
				score: 2,
				snippet: "Marka sesi rehberi",
			});
		}
	}

	return results.sort((a, b) => b.score - a.score);
}

export function checkDuplicates(konu, workspaceBase) {
	const subdirs = ["icerikler", "senaryolar", "gorseller", "takvim"];
	const similar = [];
	for (const dir of subdirs) {
		const dirPath = join(workspaceBase, dir);
		if (!existsSync(dirPath)) continue;
		const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
		for (const f of files) {
			const titlePart = f
				.replace(/^\d{4}-\d{2}-\d{2}-/, "")
				.replace(/-?(en|brief|karousel|takvim)?\.md$/, "");
			const sim = calculateSimilarity(konu, titlePart.replace(/-/g, " "));
			if (sim >= 0.6) {
				similar.push({ file: f, dir, similarity: Math.round(sim * 100) });
			}
		}
	}
	return similar;
}
