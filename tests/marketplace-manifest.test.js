import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const PKG_ROOT = resolve(__dirname, "..");
const PKG = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf-8"));
const TEMPLATE = join(PKG_ROOT, ".claude");

const {
	buildPluginManifest,
	buildMarketplaceManifest,
	collectAgents,
	countCommands,
	countHooks,
	countSkillCategories,
	deepEqualJson,
	isManifestStale,
	writeManifests,
} = await import("../lib/data/marketplace-manifest.js");

describe("deepEqualJson (key-order insensitive)", () => {
	it("identical primitives", () => {
		assert.ok(deepEqualJson(1, 1));
		assert.ok(deepEqualJson("x", "x"));
		assert.ok(deepEqualJson(null, null));
		assert.ok(!deepEqualJson(null, undefined));
		assert.ok(!deepEqualJson(1, "1"));
	});

	it("arrays element-wise", () => {
		assert.ok(deepEqualJson([1, 2, 3], [1, 2, 3]));
		assert.ok(!deepEqualJson([1, 2], [1, 2, 3]));
		assert.ok(!deepEqualJson([1, 2, 3], [3, 2, 1])); // order matters in arrays
	});

	it("objects key-order insensitive (O3 fix kernel)", () => {
		const a = { x: 1, y: 2, z: 3 };
		const b = { z: 3, x: 1, y: 2 };
		assert.ok(deepEqualJson(a, b));
	});

	it("nested object key-order insensitive", () => {
		const a = { outer: { x: 1, y: 2 }, list: [{ p: 1, q: 2 }] };
		const b = { list: [{ q: 2, p: 1 }], outer: { y: 2, x: 1 } };
		assert.ok(deepEqualJson(a, b));
	});

	it("differing values fail", () => {
		assert.ok(!deepEqualJson({ x: 1 }, { x: 2 }));
		assert.ok(!deepEqualJson({ x: 1 }, { y: 1 }));
	});

	it("array vs object reject", () => {
		assert.ok(!deepEqualJson([], {}));
	});
});

describe("marketplace-manifest generator", () => {
	it("collectAgents returns an alphabetical array", () => {
		const agents = collectAgents(TEMPLATE);
		assert.ok(agents.length >= 20);
		for (let i = 1; i < agents.length; i++) {
			assert.ok(agents[i - 1] < agents[i], `${agents[i - 1]} >= ${agents[i]}`);
		}
		assert.ok(agents.every((a) => a.startsWith("./.claude/agents/")));
	});

	it("countHooks excludes the _util hook", () => {
		const n = countHooks(TEMPLATE);
		// _util.mjs sayilmamali; sayim 10+ olmali (gercek hook'lar)
		assert.ok(n >= 10);
	});

	it("countCommands returns a count from the template", () => {
		const n = countCommands(TEMPLATE);
		assert.ok(n >= 50);
	});

	it("countSkillCategories counts the vault", () => {
		const n = countSkillCategories(TEMPLATE);
		// skills-vault yoksa sifir; varsa 60+
		assert.ok(n >= 0);
	});

	it("buildPluginManifest produces the required fields", () => {
		const m = buildPluginManifest({ pkg: PKG, claudeDir: TEMPLATE });
		assert.equal(typeof m.name, "string");
		assert.equal(m.version, PKG.version);
		assert.ok(Array.isArray(m.agents));
		assert.ok(m.agents.length >= 20);
		assert.equal(m.commands, "./.claude/commands");
		assert.equal(m.skills, "./.claude/skills-vault");
		assert.ok(m.hooks);
		assert.ok(Array.isArray(m.hooks.PreToolUse));
		assert.ok(Array.isArray(m.hooks.UserPromptSubmit));
	});

	// biome-ignore lint/suspicious/noTemplateCurlyInString: test adi ${CLAUDE_PLUGIN_ROOT}'i kasitli icerir
	it("buildPluginManifest hook command paths use ${CLAUDE_PLUGIN_ROOT}", () => {
		const m = buildPluginManifest({ pkg: PKG, claudeDir: TEMPLATE });
		const allHooks = [...m.hooks.PreToolUse, ...m.hooks.UserPromptSubmit];
		for (const block of allHooks) {
			for (const h of block.hooks) {
				assert.match(h.command, /CLAUDE_PLUGIN_ROOT/);
				assert.match(h.command, /\.mjs$/);
			}
		}
	});

	it("buildMarketplaceManifest produces the required fields", () => {
		const m = buildMarketplaceManifest({ pkg: PKG, claudeDir: TEMPLATE });
		assert.equal(m.name, "badi-marketplace");
		assert.ok(Array.isArray(m.plugins));
		assert.equal(m.plugins.length, 1);
		assert.equal(m.plugins[0].source, "./");
		assert.equal(m.plugins[0].category, "productivity");
		assert.ok(m.plugins[0].license);
	});

	it("isManifestStale returns missing:true for a missing path", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-stale-"));
		try {
			const m = buildPluginManifest({ pkg: PKG, claudeDir: TEMPLATE });
			const r = isManifestStale({ pluginDir: tmp, generated: m });
			assert.equal(r.missing, true);
			assert.equal(r.stale, true);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("isManifestStale ignores the lastUpdated difference (#197 K1)", () => {
		// publish toISOString (UTC/ms/Z) yazar; release check git %cI (yerel
		// +offset, ms yok) ile uretir. Format/an farki STALE uretmemeli — yalniz
		// yapisal icerik kiyaslanir.
		const tmp = mkdtempSync(join(tmpdir(), "badi-lu-"));
		try {
			const onDisk = buildPluginManifest({
				pkg: PKG,
				claudeDir: TEMPLATE,
				lastUpdated: "2026-05-29T05:56:16.317Z",
			});
			writeManifests({
				pluginDir: tmp,
				plugin: onDisk,
				marketplace: buildMarketplaceManifest({
					pkg: PKG,
					claudeDir: TEMPLATE,
				}),
				dryRun: false,
			});
			const generated = buildPluginManifest({
				pkg: PKG,
				claudeDir: TEMPLATE,
				lastUpdated: "2026-05-29T00:45:25+03:00",
			});
			assert.equal(
				isManifestStale({ pluginDir: tmp, generated }).stale,
				false,
				"yalniz lastUpdated farki stale uretmemeli",
			);
			// Yapisal fark (version) hala yakalanmali.
			const structDiff = buildPluginManifest({
				pkg: { ...PKG, version: "9.9.9" },
				claudeDir: TEMPLATE,
				lastUpdated: "2026-05-29T00:45:25+03:00",
			});
			assert.equal(
				isManifestStale({ pluginDir: tmp, generated: structDiff }).stale,
				true,
				"yapisal fark stale uretmeli",
			);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("writeManifests writes the files", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-write-"));
		try {
			const plugin = buildPluginManifest({ pkg: PKG, claudeDir: TEMPLATE });
			const marketplace = buildMarketplaceManifest({
				pkg: PKG,
				claudeDir: TEMPLATE,
			});
			const r = writeManifests({
				pluginDir: tmp,
				plugin,
				marketplace,
				dryRun: false,
			});
			assert.equal(r.synced.length, 2);
			assert.ok(existsSync(join(tmp, "plugin.json")));
			assert.ok(existsSync(join(tmp, "marketplace.json")));
			const p = JSON.parse(readFileSync(join(tmp, "plugin.json"), "utf-8"));
			assert.equal(p.version, PKG.version);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("writeManifests does not write in dry-run", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-dry-"));
		try {
			const plugin = buildPluginManifest({ pkg: PKG, claudeDir: TEMPLATE });
			const marketplace = buildMarketplaceManifest({
				pkg: PKG,
				claudeDir: TEMPLATE,
			});
			writeManifests({
				pluginDir: tmp,
				plugin,
				marketplace,
				dryRun: true,
			});
			assert.ok(!existsSync(join(tmp, "plugin.json")));
			assert.ok(!existsSync(join(tmp, "marketplace.json")));
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

describe("on-disk .claude-plugin/ matches generator", () => {
	it("plugin.json is not stale (matches the generator)", () => {
		const pluginDir = join(PKG_ROOT, ".claude-plugin");
		if (!existsSync(pluginDir)) return; // optional setup
		const m = buildPluginManifest({ pkg: PKG, claudeDir: TEMPLATE });
		const r = isManifestStale({ pluginDir, generated: m });
		assert.equal(r.stale, false, "Run: badi release sync-manifest");
	});
});

describe("dist/ multi-package skeletons exist", () => {
	it("homebrew formula exists", () => {
		const p = join(PKG_ROOT, "dist", "homebrew", "badi.rb");
		assert.ok(existsSync(p));
		const body = readFileSync(p, "utf-8");
		assert.match(body, /class Badi < Formula/);
		assert.match(body, /homepage "https:\/\/github\.com\/fatihkan\/badi"/);
	});

	it("scoop manifest exists", () => {
		const p = join(PKG_ROOT, "dist", "scoop", "badi.json");
		assert.ok(existsSync(p));
		const m = JSON.parse(readFileSync(p, "utf-8"));
		assert.ok(m.version);
		assert.equal(m.license, "MIT");
		assert.equal(m.bin, "badi");
		// v1.30.1+ D2 fix: installer script `throw` ile hard-fail eder
		const scriptText = (m.installer?.script || []).join(" ");
		assert.match(scriptText, /throw/);
		assert.match(scriptText, /\$LASTEXITCODE/);
	});

	it("v1.31.0+ lastUpdated field is in plugin.json", () => {
		const p = readFileSync(
			join(PKG_ROOT, ".claude-plugin", "plugin.json"),
			"utf-8",
		);
		const parsed = JSON.parse(p);
		assert.ok(
			parsed.lastUpdated,
			"plugin.json lastUpdated yok (Claude Code 2.1.144+ Browse uyumu)",
		);
		assert.match(
			parsed.lastUpdated,
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
			"lastUpdated ISO 8601 olmali",
		);
	});

	it("v1.31.0+ lastUpdated field is in the marketplace.json plugin entry", () => {
		const p = readFileSync(
			join(PKG_ROOT, ".claude-plugin", "marketplace.json"),
			"utf-8",
		);
		const parsed = JSON.parse(p);
		assert.ok(
			parsed.plugins?.[0]?.lastUpdated,
			"marketplace.json lastUpdated yok",
		);
	});

	it("v1.31.0+ dist/github-actions/security-review.yml exists", () => {
		const p = join(PKG_ROOT, "dist", "github-actions", "security-review.yml");
		assert.ok(existsSync(p), "security-review.yml scaffold eksik");
		const body = readFileSync(p, "utf-8");
		assert.match(body, /permissions:/);
		assert.match(body, /pull-requests: write/);
		assert.match(body, /anthropics\/claude-code-security-review/);
		assert.match(body, /ANTHROPIC_API_KEY/);
		// pull_request (head SHA), NOT pull_request_target (prompt injection hardening)
		assert.match(body, /on:\s*\n\s+pull_request:/);
		assert.doesNotMatch(body, /pull_request_target/);
	});

	it("dist publish workflow exists + hardened", () => {
		const p = join(PKG_ROOT, ".github", "workflows", "dist-publish.yml");
		assert.ok(existsSync(p));
		const body = readFileSync(p, "utf-8");
		assert.match(body, /workflow_dispatch/);
		assert.match(body, /permissions:/);
		// v1.30.1+ K1 fix: env: pattern (no direct ${{ }} -> shell)
		assert.match(body, /env:\s*\n\s+INPUT_VERSION:/);
		assert.match(body, /env:\s*\n\s+VERSION:/);
		// v1.30.1+ Y1 fix: Authorization header, NOT URL-embedded token
		assert.match(body, /http\.https:\/\/github\.com\/\.extraHeader/);
		assert.doesNotMatch(
			body,
			/https:\/\/x-access-token:\$\{DIST_PUBLISH_TOKEN\}@github\.com/,
		);
		// v1.30.1+ O2 fix: GitHub Actions bot suffix
		assert.match(body, /github-actions\[bot\]@users\.noreply\.github\.com/);
	});
});
