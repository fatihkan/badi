// `badi kb` testleri (#12 MVP).
// Saf yardimcilar (extractLinks, classifyFile, buildGraph, findBacklinks,
// findOrphans, computeStats) birim test edilir. Subprocess akisi tek
// happy-path + missing-target ile dogrulanir.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
	buildGraph,
	classifyFile,
	computeStats,
	extractLinks,
	findBacklinks,
	findOrphans,
	renderHtml,
	scanFiles,
} from "../lib/commands/kb.js";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const REPO_ROOT = resolve(__dirname, "..");
const BADI = join(REPO_ROOT, "bin", "badi.js");

function setupKb() {
	const dir = mkdtempSync(join(tmpdir(), "badi-kb-test-"));
	const root = join(dir, ".claude");
	mkdirSync(join(root, "workspace"), { recursive: true });
	mkdirSync(join(root, "agents"), { recursive: true });
	mkdirSync(join(root, "commands"), { recursive: true });
	mkdirSync(join(root, "skills-vault", "foo"), { recursive: true });
	return { dir, root };
}

describe("extractLinks", () => {
	it("wikilink yakalar", () => {
		const links = extractLinks("Bak [[memory]] dosyasina");
		assert.ok(links.has("memory"));
	});

	it("wikilink pipe label'i atlatir", () => {
		const links = extractLinks("[[memory|hafiza]]");
		assert.ok(links.has("memory"));
	});

	it("markdown link relative path yakalar", () => {
		const links = extractLinks("[bak](./memory.md)");
		assert.ok(links.has("./memory.md"));
	});

	it("eksternal URL atlanir", () => {
		const links = extractLinks(
			"[google](https://google.com) [mail](mailto:x@y.z)",
		);
		assert.equal(links.size, 0);
	});

	it("anchor ile path birlestirilince path donulur", () => {
		const links = extractLinks("[s](./memory.md#bolum)");
		assert.ok(links.has("./memory.md"));
	});

	it("hicbir link yoksa bos set", () => {
		const links = extractLinks("Sade metin, link yok.");
		assert.equal(links.size, 0);
	});
});

describe("classifyFile", () => {
	it("memory.md -> memory", () => {
		assert.equal(classifyFile("memory.md"), "memory");
		assert.equal(classifyFile("sub/memory.md"), "memory");
	});
	it("knowledge-base.md -> knowledge", () => {
		assert.equal(classifyFile("knowledge-base.md"), "knowledge");
	});
	it("agents/foo.md -> agent (relative path)", () => {
		assert.equal(classifyFile("agents/foo.md"), "agent");
	});
	it("commands/x.md -> command", () => {
		assert.equal(classifyFile("commands/x.md"), "command");
	});
	it("skills-vault icinde -> skill", () => {
		assert.equal(classifyFile("skills-vault/foo/SKILL.md"), "skill");
	});
	it("daily-notes -> daily", () => {
		assert.equal(classifyFile("daily-notes/110526.md"), "daily");
	});
	it("eslesmeyen -> other", () => {
		assert.equal(classifyFile("random/path/x.md"), "other");
	});
	it("Windows backslash normalize edilir", () => {
		assert.equal(classifyFile("agents\\foo.md"), "agent");
	});
});

describe("scanFiles + buildGraph", () => {
	let dir;
	let root;
	beforeEach(() => {
		({ dir, root } = setupKb());
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("md dosyalarini bulur, skills-vault atlar", () => {
		writeFileSync(join(root, "memory.md"), "# Memory");
		writeFileSync(join(root, "agents", "auditor.md"), "# Auditor");
		writeFileSync(join(root, "skills-vault", "foo", "SKILL.md"), "# Skill");
		const files = scanFiles(root);
		// memory + auditor; skills-vault atlandigi icin SKILL.md yok
		assert.equal(files.length, 2);
		assert.ok(files.some((f) => f.endsWith("memory.md")));
		assert.ok(files.some((f) => f.endsWith("auditor.md")));
	});

	it("relative markdown link iki dosya arasi edge olusturur", () => {
		writeFileSync(
			join(root, "memory.md"),
			"# Memory\n\nBak [auditor](./agents/auditor.md)\n",
		);
		writeFileSync(join(root, "agents", "auditor.md"), "# Auditor");
		const files = scanFiles(root);
		const graph = buildGraph(files, root);
		assert.equal(graph.nodes.length, 2);
		assert.equal(graph.edges.length, 1);
		assert.equal(graph.edges[0].source, "memory.md");
		assert.equal(graph.edges[0].target, "agents/auditor.md");
		assert.equal(graph.brokenLinks.length, 0);
	});

	it("wikilink basename match ile edge olusturur", () => {
		writeFileSync(join(root, "memory.md"), "[[auditor]]");
		writeFileSync(join(root, "agents", "auditor.md"), "# Auditor");
		const files = scanFiles(root);
		const graph = buildGraph(files, root);
		assert.equal(graph.edges.length, 1);
		assert.equal(graph.edges[0].target, "agents/auditor.md");
	});

	it("bulunamayan link kirik olarak isaretlenir", () => {
		writeFileSync(join(root, "memory.md"), "[ghost](./ghost.md)");
		const files = scanFiles(root);
		const graph = buildGraph(files, root);
		assert.equal(graph.edges.length, 0);
		assert.equal(graph.brokenLinks.length, 1);
		assert.equal(graph.brokenLinks[0].source, "memory.md");
	});

	it("eksternal URL hicbir sey eklemez", () => {
		writeFileSync(join(root, "memory.md"), "[g](https://google.com)");
		const files = scanFiles(root);
		const graph = buildGraph(files, root);
		assert.equal(graph.edges.length, 0);
		assert.equal(graph.brokenLinks.length, 0);
	});

	it("node baslik H1'den cikarilir, yoksa basename", () => {
		writeFileSync(join(root, "memory.md"), "# Custom Title\n\nbody");
		writeFileSync(join(root, "no-h1.md"), "body without h1");
		const graph = buildGraph(scanFiles(root), root);
		const titles = Object.fromEntries(graph.nodes.map((n) => [n.id, n.title]));
		assert.equal(titles["memory.md"], "Custom Title");
		assert.equal(titles["no-h1.md"], "no-h1.md");
	});
});

describe("findBacklinks + findOrphans + computeStats", () => {
	let dir;
	let root;
	beforeEach(() => {
		({ dir, root } = setupKb());
		writeFileSync(
			join(root, "memory.md"),
			"# Memory\n[a](./agents/auditor.md)\n[b](./agents/coach.md)",
		);
		writeFileSync(
			join(root, "knowledge-base.md"),
			"# KB\n[a](./agents/auditor.md)",
		);
		writeFileSync(join(root, "agents", "auditor.md"), "# Auditor");
		writeFileSync(join(root, "agents", "coach.md"), "# Coach");
		writeFileSync(join(root, "agents", "orphan.md"), "# Orphan");
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("auditor.md icin iki backlink", () => {
		const graph = buildGraph(scanFiles(root), root);
		const back = findBacklinks(graph, "agents/auditor.md");
		assert.equal(back.length, 2);
		const sources = back.map((b) => b.source).sort();
		assert.deepEqual(sources, ["knowledge-base.md", "memory.md"]);
	});

	it("orphan.md yetim listesinde", () => {
		const graph = buildGraph(scanFiles(root), root);
		const orphans = findOrphans(graph);
		assert.ok(orphans.includes("agents/orphan.md"));
		assert.ok(orphans.includes("memory.md")); // memory'ye gelen referans yok
	});

	it("stats: totalEdges + topReferenced + typeCounts", () => {
		const graph = buildGraph(scanFiles(root), root);
		const stats = computeStats(graph);
		assert.equal(stats.totalFiles, 5);
		assert.equal(stats.totalEdges, 3);
		assert.equal(stats.topReferenced[0].id, "agents/auditor.md");
		assert.equal(stats.topReferenced[0].count, 2);
		assert.equal(stats.typeCounts.agent, 3);
		assert.equal(stats.typeCounts.memory, 1);
		assert.equal(stats.typeCounts.knowledge, 1);
	});
});

describe("renderHtml", () => {
	let dir;
	let root;
	beforeEach(() => {
		({ dir, root } = setupKb());
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("self-contained HTML uretir (external CDN yok)", () => {
		writeFileSync(join(root, "memory.md"), "[a](./x.md)");
		writeFileSync(join(root, "x.md"), "# X");
		const graph = buildGraph(scanFiles(root), root);
		const html = renderHtml(graph);
		// CDN bagimliligi olmamali
		assert.equal(html.includes("d3js.org"), false);
		assert.equal(html.includes("cdnjs"), false);
		assert.equal(html.includes("unpkg"), false);
		assert.equal(html.includes("jsdelivr"), false);
		// Inline SVG + script
		assert.match(html, /<svg/);
		assert.match(html, /<script>/);
		// Node + edge JSON inline
		assert.match(html, /const nodes = /);
		assert.match(html, /const edges = /);
	});
});

describe("badi kb: subprocess akisi", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "badi-kb-subprocess-"));
		mkdirSync(join(dir, ".claude", "workspace"), { recursive: true });
		writeFileSync(join(dir, ".claude", "memory.md"), "# M");
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("--help help mesaji gosterir", () => {
		const r = spawnSync("node", [BADI, "kb", "--help"], { encoding: "utf-8" });
		assert.equal(r.status, 0);
		assert.match(r.stdout, /badi kb graph/);
		assert.match(r.stdout, /backlinks/);
	});

	it("graph HTML dosyasi yazar", () => {
		const r = spawnSync("node", [BADI, "kb", "graph"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		const out = join(dir, ".claude", "workspace", "knowledge-graph.html");
		assert.ok(existsSync(out), "HTML cikti yok");
	});

	it("stats subcommand toplam dosya raporlar", () => {
		const r = spawnSync("node", [BADI, "kb", "stats"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /Toplam dosya/);
	});

	it("backlinks: dosya gerekli flag eksikse exit 1", () => {
		const r = spawnSync("node", [BADI, "kb", "backlinks"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 1);
		assert.match(r.stderr, /Dosya yolu gerekli/);
	});

	it("hedef dizin yok ise exit 1", () => {
		const r = spawnSync("node", [BADI, "kb", "graph", "--target", "/nope/x"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 1);
		assert.match(r.stderr, /Hedef dizin yok/);
	});

	it("bilinmeyen alt-komut exit 1", () => {
		const r = spawnSync("node", [BADI, "kb", "bogus"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 1);
		assert.match(r.stderr, /Bilinmeyen alt-komut/);
	});
});
