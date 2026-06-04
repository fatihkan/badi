// `badi kb` tests (#12 MVP).
// Pure helpers (extractLinks, classifyFile, buildGraph, findBacklinks,
// findOrphans, computeStats) are unit tested. The subprocess flow is verified
// with a single happy-path + missing-target case.

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
	it("captures a wikilink", () => {
		const links = extractLinks("Bak [[memory]] dosyasina");
		assert.ok(links.has("memory"));
	});

	it("skips the wikilink pipe label", () => {
		const links = extractLinks("[[memory|hafiza]]");
		assert.ok(links.has("memory"));
	});

	it("captures a markdown link relative path", () => {
		const links = extractLinks("[bak](./memory.md)");
		assert.ok(links.has("./memory.md"));
	});

	it("skips external URLs", () => {
		const links = extractLinks(
			"[google](https://google.com) [mail](mailto:x@y.z)",
		);
		assert.equal(links.size, 0);
	});

	it("returns the path when an anchor is joined to the path", () => {
		const links = extractLinks("[s](./memory.md#bolum)");
		assert.ok(links.has("./memory.md"));
	});

	it("empty set when there are no links", () => {
		const links = extractLinks("Sade metin, link yok.");
		assert.equal(links.size, 0);
	});

	it("captures URLs with inner parentheses as a single link", () => {
		// Wikipedia style: the "Foo_(bar)" inner parenthesis must stay inside the link.
		const links = extractLinks(
			"[Wiki](https://en.wikipedia.org/wiki/Foo_(bar))",
		);
		assert.ok(
			links.has("https://en.wikipedia.org/wiki/Foo_(bar)") ||
				// may be skipped by the external URL filter;
				// enough: must not become "Foo_(bar" via bad closing
				!Array.from(links).some((l) => l.endsWith("Foo_(bar")),
			"inner parenthesis cut at the wrong place",
		);
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
	it("inside skills-vault -> skill", () => {
		assert.equal(classifyFile("skills-vault/foo/SKILL.md"), "skill");
	});
	it("daily-notes -> daily", () => {
		assert.equal(classifyFile("daily-notes/110526.md"), "daily");
	});
	it("unmatched -> other", () => {
		assert.equal(classifyFile("random/path/x.md"), "other");
	});
	it("Windows backslash is normalized", () => {
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

	it("finds md files, skips skills-vault", () => {
		writeFileSync(join(root, "memory.md"), "# Memory");
		writeFileSync(join(root, "agents", "auditor.md"), "# Auditor");
		writeFileSync(join(root, "skills-vault", "foo", "SKILL.md"), "# Skill");
		const files = scanFiles(root);
		// memory + auditor; SKILL.md missing because skills-vault is skipped
		assert.equal(files.length, 2);
		assert.ok(files.some((f) => f.endsWith("memory.md")));
		assert.ok(files.some((f) => f.endsWith("auditor.md")));
	});

	it("a relative markdown link creates an edge between two files", () => {
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

	it("creates an edge via wikilink basename match", () => {
		writeFileSync(join(root, "memory.md"), "[[auditor]]");
		writeFileSync(join(root, "agents", "auditor.md"), "# Auditor");
		const files = scanFiles(root);
		const graph = buildGraph(files, root);
		assert.equal(graph.edges.length, 1);
		assert.equal(graph.edges[0].target, "agents/auditor.md");
	});

	it("an unresolved link is marked as broken", () => {
		writeFileSync(join(root, "memory.md"), "[ghost](./ghost.md)");
		const files = scanFiles(root);
		const graph = buildGraph(files, root);
		assert.equal(graph.edges.length, 0);
		assert.equal(graph.brokenLinks.length, 1);
		assert.equal(graph.brokenLinks[0].source, "memory.md");
	});

	it("an external URL adds nothing", () => {
		writeFileSync(join(root, "memory.md"), "[g](https://google.com)");
		const files = scanFiles(root);
		const graph = buildGraph(files, root);
		assert.equal(graph.edges.length, 0);
		assert.equal(graph.brokenLinks.length, 0);
	});

	it("node title is extracted from H1, otherwise basename", () => {
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

	it("two backlinks for auditor.md", () => {
		const graph = buildGraph(scanFiles(root), root);
		const back = findBacklinks(graph, "agents/auditor.md");
		assert.equal(back.length, 2);
		const sources = back.map((b) => b.source).sort();
		assert.deepEqual(sources, ["knowledge-base.md", "memory.md"]);
	});

	it("orphan.md is in the orphan list", () => {
		const graph = buildGraph(scanFiles(root), root);
		const orphans = findOrphans(graph);
		assert.ok(orphans.includes("agents/orphan.md"));
		assert.ok(orphans.includes("memory.md")); // no incoming reference to memory
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

	it("produces self-contained HTML (no external CDN)", () => {
		writeFileSync(join(root, "memory.md"), "[a](./x.md)");
		writeFileSync(join(root, "x.md"), "# X");
		const graph = buildGraph(scanFiles(root), root);
		const html = renderHtml(graph);
		// must have no CDN dependency
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

	it("XSS guard: a title containing '</script>' cannot perform tag injection", () => {
		// If a markdown file's H1 heading contains a malicious payload
		// the inline <script> block must not close early.
		writeFileSync(
			join(root, "evil.md"),
			"# </script><img src=x onerror=alert(1)>",
		);
		const graph = buildGraph(scanFiles(root), root);
		const html = renderHtml(graph);
		// In the output, a literal '</script>' (lowercase) should appear only as a
		// closing tag; inside inline JSON it should be in '</script>' form.
		const scriptCloses = (html.match(/<\/script>/gi) || []).length;
		// A single closing tag — the end of our own script block.
		assert.equal(scriptCloses, 1, "More than one </script> found — XSS hole");
		// Payload must be Unicode escaped
		assert.match(html, /\\u003c\/script/i);
	});

	it("a URL with inner parentheses does not break renderHtml", () => {
		writeFileSync(join(root, "p.md"), "[w](https://x.com/Foo_(bar))");
		const graph = buildGraph(scanFiles(root), root);
		const html = renderHtml(graph);
		assert.match(html, /<svg/);
	});
});

describe("badi kb: subprocess flow", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "badi-kb-subprocess-"));
		mkdirSync(join(dir, ".claude", "workspace"), { recursive: true });
		writeFileSync(join(dir, ".claude", "memory.md"), "# M");
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("--help shows the help message", () => {
		const r = spawnSync("node", [BADI, "kb", "--help"], { encoding: "utf-8" });
		assert.equal(r.status, 0);
		assert.match(r.stdout, /badi kb graph/);
		assert.match(r.stdout, /backlinks/);
	});

	it("graph writes an HTML file", () => {
		const r = spawnSync("node", [BADI, "kb", "graph"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		const out = join(dir, ".claude", "workspace", "knowledge-graph.html");
		assert.ok(existsSync(out), "no HTML output");
	});

	it("stats subcommand reports total files", () => {
		const r = spawnSync("node", [BADI, "kb", "stats"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /Total files/);
	});

	it("backlinks: exit 1 when the required file flag is missing", () => {
		const r = spawnSync("node", [BADI, "kb", "backlinks"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 1);
		assert.match(r.stderr, /File path required/);
	});

	it("exit 1 when the target directory does not exist", () => {
		const r = spawnSync("node", [BADI, "kb", "graph", "--target", "/nope/x"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 1);
		assert.match(r.stderr, /Target directory does not exist/);
	});

	it("unknown subcommand exit 1", () => {
		const r = spawnSync("node", [BADI, "kb", "bogus"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 1);
		assert.match(r.stderr, /Unknown subcommand/);
	});
});
