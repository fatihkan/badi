// `badi kb` — Bilgi tabani grafigi komutu (#12 MVP).
//
// Alt komutlar:
//   badi kb graph                  Tum dosyalar + interaktif SVG HTML uretir
//   badi kb backlinks <dosya>      Belirli dosyaya gelen referanslari listeler
//   badi kb orphans                Hicbir dosyadan referans almayan dosyalari listeler
//   badi kb stats                  Genel istatistikler
//
// MVP scope disinda kalan ve gelecek surumlere itelenenler:
//   - --topic filtresi (etiket/baslik bazli filtreleme)
//   - Otomatik tarayicida acma (sadece dosya yolu raporlanir)
//   - Kirik link tespiti (extends edilebilir, su an warn vermiyor)
//
// Tarama kapsami: .claude/ altindaki *.md dosyalari (skills-vault ve
// backups haric). Wikilink ([[dosya]]) ve markdown link ([metin](yol))
// desenleri yakalanir.

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
const MARKDOWN_LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;

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
	console.log(chalk.bold("Badi KB Graph — Bilgi Tabani Grafigi"));
	console.log("");
	console.log(chalk.bold("Kullanim:"));
	console.log(
		`  ${chalk.cyan("badi kb graph")}              HTML grafik dosyasi uret`,
	);
	console.log(
		`  ${chalk.cyan("badi kb backlinks <dosya>")}  Geri referanslari listele`,
	);
	console.log(
		`  ${chalk.cyan("badi kb orphans")}            Referanssiz dosyalari bul`,
	);
	console.log(
		`  ${chalk.cyan("badi kb stats")}              Genel istatistikler`,
	);
	console.log("");
	console.log(chalk.bold("Secenekler:"));
	console.log("  --target <dir>   Tarama kok dizini (varsayilan: .claude)");
	console.log(
		"  --out <yol>      HTML cikti yolu (varsayilan: .claude/workspace/knowledge-graph.html)",
	);
}

/**
 * Dizini recursive tarar ve .md dosyalarini bulur. SKIP_DIRS atlanir.
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
 * Bir markdown dosyasindan cikan link'leri cikarir.
 * Donus: Set<string> — relative path veya wikilink hedefi.
 *
 * Wikilink "[[memory]]" -> "memory" (uzantisiz)
 * Markdown "[x](./memory.md)" -> "./memory.md"
 *
 * Eksternal URL'ler (http, https, mailto, vb.) atlanir.
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
		// Anchor + path ayri tut
		const cleaned = target.split("#")[0];
		if (cleaned) links.add(cleaned);
	}
	return links;
}

/**
 * Dosya turunu yola gore tahmin eder (renk/kategorizasyon icin).
 */
export function classifyFile(relPath) {
	const lower = relPath.toLowerCase().replace(/\\/g, "/");
	// Path 'agents/foo.md' veya 'sub/agents/foo.md' olabilir; her iki
	// duruma da matching olsun diye basta '/' veya satir basini kabul et.
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
 * Bir link hedefini absolute file path'e cozer.
 * - Relative path -> source dosyaya gore cozer
 * - Wikilink (uzantisiz) -> kok altinda matching basename arar
 *
 * Bulamazsa null doner (kirik link).
 */
function resolveLink(target, sourceFile, allFiles) {
	// Relative path mi?
	if (
		target.startsWith("./") ||
		target.startsWith("../") ||
		target.includes("/")
	) {
		const resolved = resolve(dirname(sourceFile), target);
		// .md uzantisi yoksa ekle
		const withExt = resolved.endsWith(".md") ? resolved : `${resolved}.md`;
		if (allFiles.includes(withExt)) return withExt;
		if (allFiles.includes(resolved)) return resolved;
		return null;
	}
	// Wikilink — basename match
	const candidate = target.endsWith(".md") ? target : `${target}.md`;
	const matches = allFiles.filter((f) => basename(f) === candidate);
	return matches[0] || null;
}

/**
 * Tum dosyalardan yonlu graf insa eder.
 *
 * Donus: {
 *   nodes: [{ id, path, type, title }],
 *   edges: [{ source, target }],
 *   brokenLinks: [{ source, target }]
 * }
 *
 * 'id' = relative path (root'a gore).
 */
export function buildGraph(files, root) {
	const nodes = files.map((f) => {
		const content = safeRead(f);
		const title = extractTitle(content) || basename(f);
		const rel = relative(root, f);
		return { id: rel, path: f, type: classifyFile(rel), title };
	});

	const idByPath = new Map(nodes.map((n) => [n.path, n.id]));
	const edges = [];
	const brokenLinks = [];

	for (const node of nodes) {
		const content = safeRead(node.path);
		const links = extractLinks(content);
		for (const link of links) {
			const resolved = resolveLink(link, node.path, files);
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
 * Bir dosyaya gelen referanslari listeler.
 * Donus: [{ source: id, count: number }]
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
 * Hicbir dosyadan referans almayan dosyalari listeler.
 */
export function findOrphans(graph) {
	const referenced = new Set(graph.edges.map((e) => e.target));
	return graph.nodes
		.filter((n) => !referenced.has(n.id))
		.map((n) => n.id)
		.sort();
}

/**
 * Genel istatistikler hesaplar.
 */
export function computeStats(graph) {
	const incoming = new Map();
	const outgoing = new Map();
	for (const edge of graph.edges) {
		incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1);
		outgoing.set(edge.source, (outgoing.get(edge.source) || 0) + 1);
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
 * Self-contained HTML uretir (CDN bagimliligi yok). Vanilla SVG +
 * minimal force-directed simulation inline JS.
 */
export function renderHtml(graph) {
	const stats = computeStats(graph);
	const nodesJson = JSON.stringify(
		graph.nodes.map((n) => ({
			id: n.id,
			type: n.type,
			title: n.title,
			color: TYPE_COLORS[n.type] || TYPE_COLORS.other,
		})),
	);
	const edgesJson = JSON.stringify(graph.edges);
	const legendItems = Object.entries(TYPE_COLORS)
		.filter(([type]) => stats.typeCounts[type])
		.map(
			([type, color]) =>
				`<span class="legend-item"><span class="dot" style="background:${color}"></span>${type} (${stats.typeCounts[type]})</span>`,
		)
		.join("");

	return `<!DOCTYPE html>
<html lang="tr">
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
  <div class="stats">${stats.totalFiles} dosya · ${stats.totalEdges} baglanti · ${stats.orphans} yetim · ${stats.brokenLinks} kirik</div>
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
    tooltip.innerHTML = '<strong>' + n.title + '</strong><br><span style="color:#94a3b8">' + n.id + '</span><br>tur: ' + n.type;
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
		console.error(chalk.red(`Hedef dizin yok: ${target}`));
		process.exit(1);
	}
	const files = scanFiles(target);
	showBanner();
	console.log(chalk.bold("Badi KB Graph"));
	console.log("");
	console.log(chalk.dim(`  Tarama: ${target}`));
	const graph = buildGraph(files, target);
	const html = renderHtml(graph);
	writeFileSync(outPath, html);
	const stats = computeStats(graph);
	console.log(
		`  ${stats.totalFiles} dosya · ${stats.totalEdges} baglanti · ${stats.orphans} yetim · ${stats.brokenLinks} kirik`,
	);
	console.log("");
	console.log(chalk.green(`  ${outPath}`));
	console.log(chalk.dim("  Tarayicida ac: file:// + yukaridaki yol"));
}

function subBacklinks(flags) {
	const file = flags._[0];
	if (!file) {
		console.error(chalk.red("Dosya yolu gerekli: badi kb backlinks <dosya>"));
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
		console.error(chalk.red(`Dosya bulunamadi: ${file}`));
		process.exit(1);
	}
	const links = findBacklinks(graph, matchId.id);
	showBanner();
	console.log(chalk.bold(`${matchId.id} icin geri referanslar:`));
	console.log("");
	if (links.length === 0) {
		console.log(chalk.dim("  (referans yok — yetim dosya)"));
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
	console.log(chalk.bold(`Referanssiz dosyalar: ${orphans.length}`));
	console.log("");
	if (orphans.length === 0) {
		console.log(chalk.green("  Hicbir yetim dosya yok."));
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
	console.log(chalk.bold("Bilgi Tabani Istatistikleri"));
	console.log("");
	console.log(`  Toplam dosya:        ${stats.totalFiles}`);
	console.log(`  Toplam baglanti:     ${stats.totalEdges}`);
	console.log(`  Yetim dosya:         ${stats.orphans}`);
	console.log(`  Kirik link:          ${stats.brokenLinks}`);
	console.log("");
	console.log(chalk.bold("  En cok referans alan:"));
	for (const { id, count } of stats.topReferenced) {
		console.log(`    ${count}  ${id}`);
	}
	console.log("");
	console.log(chalk.bold("  Tur dagilimi:"));
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
			console.error(chalk.red(`Bilinmeyen alt-komut: ${sub}`));
			showHelp();
			process.exit(1);
	}
}
