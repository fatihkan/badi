// `badi kb` — knowledge base graph command (#12 MVP).
//
// Subcommands:
//   badi kb graph                  Generate an interactive SVG HTML of all files
//   badi kb backlinks <file>       List references pointing to a specific file
//   badi kb orphans                List files that no other file references
//   badi kb stats                  General statistics
//
// Pushed beyond the MVP scope to future releases:
//   - --topic filter (tag/title-based filtering)
//   - Auto-open in the browser (only the file path is reported)
//   - Broken-link detection (extendable, currently no warning)
//
// Scan scope: *.md files under .claude/ (excluding skills-vault and
// backups). Wikilink ([[file]]) and markdown link ([text](path))
// patterns are captured.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { chalk, showBanner } from "../cli.js";

const SKIP_DIRS = new Set([
	"skills-vault",
	"backups",
	"node_modules",
	".git",
	"logs",
]);

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
// Markdown link: `[text](url)`. Uses `(?:\([^)]*\)|[^)])*` to tolerate
// nested parentheses — e.g. in Wikipedia URLs, inner parens like
// "Foo_(bar)" stay inside a single link.
const MARKDOWN_LINK_RE = /\[[^\]]*\]\(((?:\([^)]*\)|[^)])*)\)/g;

function parseFlags(args) {
	const flags = { out: null, target: null };
	const positional = [];
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--out") flags.out = args[++i];
		else if (a === "--target") flags.target = args[++i];
		else if (!a.startsWith("--")) positional.push(a);
	}
	flags._ = positional;
	return flags;
}

function showHelp() {
	showBanner();
	console.log(chalk.bold("Badi KB Graph — Knowledge Base Graph"));
	console.log("");
	console.log(chalk.bold("Usage:"));
	console.log(
		`  ${chalk.cyan("badi kb graph")}              Generate an HTML graph file`,
	);
	console.log(`  ${chalk.cyan("badi kb backlinks <file>")}   List backlinks`);
	console.log(
		`  ${chalk.cyan("badi kb orphans")}            Find unreferenced files`,
	);
	console.log(
		`  ${chalk.cyan("badi kb stats")}              General statistics`,
	);
	console.log("");
	console.log(chalk.bold("Options:"));
	console.log("  --target <dir>   Scan root directory (default: .claude)");
	console.log(
		"  --out <path>     HTML output path (default: .claude/workspace/knowledge-graph.html)",
	);
}

/**
 * Recursively scans a directory and finds .md files. SKIP_DIRS is skipped.
 */
export function scanFiles(root) {
	const out = [];
	function walk(dir) {
		let entries;
		try {
			entries = readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const ent of entries) {
			if (SKIP_DIRS.has(ent.name)) continue;
			const full = join(dir, ent.name);
			if (ent.isDirectory()) walk(full);
			else if (ent.isFile() && ent.name.endsWith(".md")) out.push(full);
		}
	}
	walk(root);
	return out.sort();
}

/**
 * Extracts the links emitted from a markdown file.
 * Returns: Set<string> — relative path or wikilink target.
 *
 * Wikilink "[[memory]]" -> "memory" (no extension)
 * Markdown "[x](./memory.md)" -> "./memory.md"
 *
 * External URLs (http, https, mailto, etc.) are skipped.
 */
export function extractLinks(content) {
	const links = new Set();
	for (const m of content.matchAll(WIKILINK_RE)) {
		const target = m[1].trim();
		if (target) links.add(target);
	}
	for (const m of content.matchAll(MARKDOWN_LINK_RE)) {
		const target = m[1].trim();
		if (!target) continue;
		if (/^(https?:|mailto:|tel:|#)/.test(target)) continue;
		// Keep anchor + path separate
		const cleaned = target.split("#")[0];
		if (cleaned) links.add(cleaned);
	}
	return links;
}

/**
 * Guesses the file type from its path (for color/categorization).
 */
export function classifyFile(relPath) {
	const lower = relPath.toLowerCase().replace(/\\/g, "/");
	// Path can be 'agents/foo.md' or 'sub/agents/foo.md'; accept a leading
	// '/' or line start so both cases match.
	const has = (segment) => new RegExp(`(^|/)${segment}/`).test(lower);
	if (basename(lower) === "memory.md") return "memory";
	if (basename(lower) === "knowledge-base.md") return "knowledge";
	if (has("workspace")) return "workspace";
	if (has("agents")) return "agent";
	if (has("commands")) return "command";
	if (has("skills") || has("skills-vault")) return "skill";
	if (has("output-styles")) return "output-style";
	if (has("agent-memory")) return "agent-memory";
	if (has("daily-notes")) return "daily";
	if (has("adr") || lower.includes("/adr-")) return "adr";
	return "other";
}

/**
 * Resolves a link target to an absolute file path.
 * - Relative path -> resolved against the source file
 * - Wikilink (no extension) -> searches for a matching basename under the root
 *
 * Returns null if not found (broken link).
 *
 * Performance: indexes are precomputed by buildGraph for O(1) lookup
 * (fileSet + basenameIndex).
 */
function resolveLink(target, sourceFile, fileSet, basenameIndex) {
	if (
		target.startsWith("./") ||
		target.startsWith("../") ||
		target.includes("/")
	) {
		const resolved = resolve(dirname(sourceFile), target);
		const withExt = resolved.endsWith(".md") ? resolved : `${resolved}.md`;
		if (fileSet.has(withExt)) return withExt;
		if (fileSet.has(resolved)) return resolved;
		return null;
	}
	const candidate = target.endsWith(".md") ? target : `${target}.md`;
	const matches = basenameIndex.get(candidate);
	return matches ? matches[0] : null;
}

/**
 * Builds a directed graph from all files.
 *
 * Returns: {
 *   nodes: [{ id, path, type, title }],
 *   edges: [{ source, target }],
 *   brokenLinks: [{ source, target }]
 * }
 *
 * 'id' = relative path (relative to root).
 */
export function buildGraph(files, root) {
	// Single-pass content read + index computation (Y2/O1).
	const contents = new Map();
	const fileSet = new Set(files);
	const basenameIndex = new Map();
	for (const f of files) {
		contents.set(f, safeRead(f));
		const b = basename(f);
		const list = basenameIndex.get(b);
		if (list) list.push(f);
		else basenameIndex.set(b, [f]);
	}

	const nodes = files.map((f) => {
		const content = contents.get(f);
		const title = extractTitle(content) || basename(f);
		const rel = relative(root, f);
		return { id: rel, path: f, type: classifyFile(rel), title };
	});

	const idByPath = new Map(nodes.map((n) => [n.path, n.id]));
	const edges = [];
	const brokenLinks = [];

	for (const node of nodes) {
		const links = extractLinks(contents.get(node.path));
		for (const link of links) {
			const resolved = resolveLink(link, node.path, fileSet, basenameIndex);
			if (resolved && idByPath.has(resolved)) {
				edges.push({ source: node.id, target: idByPath.get(resolved) });
			} else if (link.endsWith(".md") || link.match(/^[a-z0-9-_]+$/i)) {
				brokenLinks.push({ source: node.id, target: link });
			}
		}
	}

	return { nodes, edges, brokenLinks };
}

function safeRead(path) {
	try {
		return readFileSync(path, "utf-8");
	} catch {
		return "";
	}
}

function extractTitle(content) {
	const m = content.match(/^#\s+(.+)$/m);
	return m ? m[1].trim() : null;
}

/**
 * Lists references pointing to a file.
 * Returns: [{ source: id, count: number }]
 */
export function findBacklinks(graph, targetId) {
	const counts = new Map();
	for (const edge of graph.edges) {
		if (edge.target === targetId) {
			counts.set(edge.source, (counts.get(edge.source) || 0) + 1);
		}
	}
	return Array.from(counts.entries())
		.map(([source, count]) => ({ source, count }))
		.sort((a, b) => b.count - a.count);
}

/**
 * Lists files that no file references.
 */
export function findOrphans(graph) {
	const referenced = new Set(graph.edges.map((e) => e.target));
	return graph.nodes
		.filter((n) => !referenced.has(n.id))
		.map((n) => n.id)
		.sort();
}

/**
 * Computes general statistics.
 */
export function computeStats(graph) {
	const incoming = new Map();
	for (const edge of graph.edges) {
		incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1);
	}
	const ranked = Array.from(incoming.entries()).sort((a, b) => b[1] - a[1]);
	const orphans = findOrphans(graph);
	const typeCounts = {};
	for (const n of graph.nodes) {
		typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
	}
	return {
		totalFiles: graph.nodes.length,
		totalEdges: graph.edges.length,
		brokenLinks: graph.brokenLinks.length,
		orphans: orphans.length,
		typeCounts,
		topReferenced: ranked.slice(0, 5).map(([id, count]) => ({ id, count })),
	};
}

const TYPE_COLORS = {
	memory: "#3b82f6",
	knowledge: "#8b5cf6",
	workspace: "#f59e0b",
	agent: "#10b981",
	command: "#06b6d4",
	skill: "#ec4899",
	"output-style": "#a855f7",
	"agent-memory": "#14b8a6",
	daily: "#f97316",
	adr: "#ef4444",
	other: "#6b7280",
};

/**
 * Generates self-contained HTML (no CDN dependency). Vanilla SVG +
 * minimal force-directed simulation in inline JS.
 */
/**
 * JSON.stringify is not HTML-safe — if a node title contains '</script>'
 * the inline <script> tag closes early (XSS). We hide the '<' character
 * with a Unicode escape to prevent tag injection.
 */
function safeJsonForScript(value) {
	return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function renderHtml(graph) {
	const stats = computeStats(graph);
	const nodesJson = safeJsonForScript(
		graph.nodes.map((n) => ({
			id: n.id,
			type: n.type,
			title: n.title,
			color: TYPE_COLORS[n.type] || TYPE_COLORS.other,
		})),
	);
	const edgesJson = safeJsonForScript(graph.edges);
	const legendItems = Object.entries(TYPE_COLORS)
		.filter(([type]) => stats.typeCounts[type])
		.map(
			([type, color]) =>
				`<span class="legend-item"><span class="dot" style="background:${color}"></span>${type} (${stats.typeCounts[type]})</span>`,
		)
		.join("");

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Badi KB Graph</title>
<style>
  body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
  header { padding: 12px 20px; border-bottom: 1px solid #1e293b; }
  header h1 { margin: 0; font-size: 16px; font-weight: 600; }
  .stats { font-size: 13px; color: #94a3b8; margin-top: 4px; }
  .legend { display: flex; flex-wrap: wrap; gap: 12px; padding: 8px 20px; border-bottom: 1px solid #1e293b; font-size: 12px; }
  .legend-item { display: inline-flex; align-items: center; gap: 6px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  svg { display: block; cursor: grab; }
  svg:active { cursor: grabbing; }
  .link { stroke: #334155; stroke-opacity: 0.6; }
  .node { cursor: pointer; }
  .node:hover circle { stroke: #fbbf24; stroke-width: 2; }
  .node-label { font-size: 9px; fill: #cbd5e1; pointer-events: none; user-select: none; }
  #tooltip { position: fixed; background: #1e293b; padding: 8px 12px; border-radius: 4px; font-size: 12px; pointer-events: none; opacity: 0; transition: opacity 0.1s; max-width: 320px; }
</style>
</head>
<body>
<header>
  <h1>Badi KB Graph</h1>
  <div class="stats">${stats.totalFiles} files · ${stats.totalEdges} links · ${stats.orphans} orphans · ${stats.brokenLinks} broken</div>
</header>
<div class="legend">${legendItems}</div>
<svg id="graph" width="100%" height="900"></svg>
<div id="tooltip"></div>
<script>
const nodes = ${nodesJson};
const edges = ${edgesJson};
const svg = document.getElementById('graph');
const tooltip = document.getElementById('tooltip');
const W = window.innerWidth;
const H = 900;

// Random initial positions
for (const n of nodes) {
  n.x = W / 2 + (Math.random() - 0.5) * 400;
  n.y = H / 2 + (Math.random() - 0.5) * 400;
  n.vx = 0; n.vy = 0;
}
const nodeById = new Map(nodes.map(n => [n.id, n]));
const links = edges.map(e => ({ source: nodeById.get(e.source), target: nodeById.get(e.target) })).filter(l => l.source && l.target);

// Force simulation (minimal)
const SPRING_LEN = 80, SPRING_K = 0.02, CHARGE = -250, CENTER_K = 0.005, DAMP = 0.85;
function step() {
  for (const n of nodes) { n.fx = 0; n.fy = 0; }
  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist2 = Math.max(dx*dx + dy*dy, 1);
      const f = CHARGE / dist2;
      const dist = Math.sqrt(dist2);
      a.fx -= f * dx / dist; a.fy -= f * dy / dist;
      b.fx += f * dx / dist; b.fy += f * dy / dist;
    }
  }
  // Springs
  for (const l of links) {
    const dx = l.target.x - l.source.x, dy = l.target.y - l.source.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const f = SPRING_K * (dist - SPRING_LEN);
    l.source.fx += f * dx / dist; l.source.fy += f * dy / dist;
    l.target.fx -= f * dx / dist; l.target.fy -= f * dy / dist;
  }
  // Center pull
  for (const n of nodes) {
    n.fx += (W/2 - n.x) * CENTER_K;
    n.fy += (H/2 - n.y) * CENTER_K;
  }
  // Integrate
  for (const n of nodes) {
    if (n.fixed) continue;
    n.vx = (n.vx + n.fx) * DAMP;
    n.vy = (n.vy + n.fy) * DAMP;
    n.x += n.vx; n.y += n.vy;
  }
}

// Render
const svgNS = 'http://www.w3.org/2000/svg';
const g = document.createElementNS(svgNS, 'g');
svg.appendChild(g);
const linkEls = links.map(l => {
  const el = document.createElementNS(svgNS, 'line');
  el.setAttribute('class', 'link');
  g.appendChild(el);
  return el;
});
const nodeEls = nodes.map(n => {
  const group = document.createElementNS(svgNS, 'g');
  group.setAttribute('class', 'node');
  const c = document.createElementNS(svgNS, 'circle');
  c.setAttribute('r', '6');
  c.setAttribute('fill', n.color);
  c.setAttribute('stroke', '#0f172a');
  c.setAttribute('stroke-width', '1');
  const t = document.createElementNS(svgNS, 'text');
  t.setAttribute('class', 'node-label');
  t.setAttribute('dx', '8');
  t.setAttribute('dy', '3');
  t.textContent = n.title.length > 24 ? n.title.slice(0, 22) + '...' : n.title;
  group.appendChild(c);
  group.appendChild(t);
  group.addEventListener('mouseenter', (e) => {
    // Prevent XSS via textContent + DOM API (title/id come from markdown).
    tooltip.replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = n.title;
    const idSpan = document.createElement('span');
    idSpan.style.color = '#94a3b8';
    idSpan.textContent = n.id;
    tooltip.append(strong, document.createElement('br'), idSpan, document.createElement('br'), 'type: ' + n.type);
    tooltip.style.opacity = 1;
  });
  group.addEventListener('mousemove', (e) => {
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY + 12) + 'px';
  });
  group.addEventListener('mouseleave', () => { tooltip.style.opacity = 0; });
  // Drag
  let dragging = false;
  c.addEventListener('mousedown', (e) => { dragging = true; n.fixed = true; e.stopPropagation(); });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = svg.getBoundingClientRect();
    n.x = (e.clientX - rect.left - panX) / zoom;
    n.y = (e.clientY - rect.top - panY) / zoom;
  });
  window.addEventListener('mouseup', () => { dragging = false; n.fixed = false; });
  g.appendChild(group);
  return group;
});

// Zoom + pan
let zoom = 1, panX = 0, panY = 0;
svg.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  zoom *= delta;
  g.setAttribute('transform', 'translate(' + panX + ',' + panY + ') scale(' + zoom + ')');
});
let panDrag = false, lastX = 0, lastY = 0;
svg.addEventListener('mousedown', (e) => { if (e.target === svg) { panDrag = true; lastX = e.clientX; lastY = e.clientY; } });
window.addEventListener('mousemove', (e) => {
  if (!panDrag) return;
  panX += e.clientX - lastX; panY += e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;
  g.setAttribute('transform', 'translate(' + panX + ',' + panY + ') scale(' + zoom + ')');
});
window.addEventListener('mouseup', () => { panDrag = false; });

function tick() {
  step();
  for (let i = 0; i < linkEls.length; i++) {
    const l = links[i];
    linkEls[i].setAttribute('x1', l.source.x);
    linkEls[i].setAttribute('y1', l.source.y);
    linkEls[i].setAttribute('x2', l.target.x);
    linkEls[i].setAttribute('y2', l.target.y);
  }
  for (let i = 0; i < nodeEls.length; i++) {
    nodeEls[i].setAttribute('transform', 'translate(' + nodes[i].x + ',' + nodes[i].y + ')');
  }
  requestAnimationFrame(tick);
}
tick();
</script>
</body>
</html>
`;
}

function defaultTarget() {
	return join(process.cwd(), ".claude");
}

function defaultOutPath() {
	return join(process.cwd(), ".claude", "workspace", "knowledge-graph.html");
}

function subGraph(flags) {
	const target = flags.target ? resolve(flags.target) : defaultTarget();
	const outPath = flags.out ? resolve(flags.out) : defaultOutPath();
	if (!existsSync(target)) {
		console.error(chalk.red(`Target directory does not exist: ${target}`));
		process.exit(1);
	}
	const files = scanFiles(target);
	showBanner();
	console.log(chalk.bold("Badi KB Graph"));
	console.log("");
	console.log(chalk.dim(`  Scan: ${target}`));
	const graph = buildGraph(files, target);
	const html = renderHtml(graph);
	writeFileSync(outPath, html);
	const stats = computeStats(graph);
	console.log(
		`  ${stats.totalFiles} files · ${stats.totalEdges} links · ${stats.orphans} orphans · ${stats.brokenLinks} broken`,
	);
	console.log("");
	console.log(chalk.green(`  ${outPath}`));
	console.log(chalk.dim("  Open in browser: file:// + the path above"));
}

function subBacklinks(flags) {
	const file = flags._[0];
	if (!file) {
		console.error(chalk.red("File path required: badi kb backlinks <file>"));
		process.exit(1);
	}
	const target = flags.target ? resolve(flags.target) : defaultTarget();
	const files = scanFiles(target);
	const graph = buildGraph(files, target);

	// file param normalize: relative or basename match
	const matchId = graph.nodes.find(
		(n) => n.id === file || basename(n.id) === basename(file),
	);
	if (!matchId) {
		console.error(chalk.red(`File not found: ${file}`));
		process.exit(1);
	}
	const links = findBacklinks(graph, matchId.id);
	showBanner();
	console.log(chalk.bold(`Backlinks for ${matchId.id}:`));
	console.log("");
	if (links.length === 0) {
		console.log(chalk.dim("  (no references — orphan file)"));
		return;
	}
	for (const { source, count } of links) {
		console.log(`  - ${source} (${count})`);
	}
}

function subOrphans(flags) {
	const target = flags.target ? resolve(flags.target) : defaultTarget();
	const files = scanFiles(target);
	const graph = buildGraph(files, target);
	const orphans = findOrphans(graph);
	showBanner();
	console.log(chalk.bold(`Unreferenced files: ${orphans.length}`));
	console.log("");
	if (orphans.length === 0) {
		console.log(chalk.green("  No orphan files."));
		return;
	}
	for (const id of orphans) {
		console.log(`  - ${id}`);
	}
}

function subStats(flags) {
	const target = flags.target ? resolve(flags.target) : defaultTarget();
	const files = scanFiles(target);
	const graph = buildGraph(files, target);
	const stats = computeStats(graph);
	showBanner();
	console.log(chalk.bold("Knowledge Base Statistics"));
	console.log("");
	console.log(`  Total files:         ${stats.totalFiles}`);
	console.log(`  Total links:         ${stats.totalEdges}`);
	console.log(`  Orphan files:        ${stats.orphans}`);
	console.log(`  Broken links:        ${stats.brokenLinks}`);
	console.log("");
	console.log(chalk.bold("  Most referenced:"));
	for (const { id, count } of stats.topReferenced) {
		console.log(`    ${count}  ${id}`);
	}
	console.log("");
	console.log(chalk.bold("  Type distribution:"));
	for (const [type, count] of Object.entries(stats.typeCounts).sort(
		(a, b) => b[1] - a[1],
	)) {
		console.log(`    ${type.padEnd(14)} ${count}`);
	}
}

export async function runKb(args) {
	const sub = args[0];
	if (!sub || sub === "--help" || sub === "-h" || sub === "help") {
		showHelp();
		return;
	}
	const flags = parseFlags(args.slice(1));
	switch (sub) {
		case "graph":
			return subGraph(flags);
		case "backlinks":
			return subBacklinks(flags);
		case "orphans":
			return subOrphans(flags);
		case "stats":
			return subStats(flags);
		default:
			console.error(chalk.red(`Unknown subcommand: ${sub}`));
			showHelp();
			process.exit(1);
	}
}
