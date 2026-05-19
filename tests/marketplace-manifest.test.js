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
	isManifestStale,
	writeManifests,
} = await import("../lib/data/marketplace-manifest.js");

describe("marketplace-manifest generator", () => {
	it("collectAgents alfabetik dizi doner", () => {
		const agents = collectAgents(TEMPLATE);
		assert.ok(agents.length >= 20);
		for (let i = 1; i < agents.length; i++) {
			assert.ok(agents[i - 1] < agents[i], `${agents[i - 1]} >= ${agents[i]}`);
		}
		assert.ok(agents.every((a) => a.startsWith("./.claude/agents/")));
	});

	it("countHooks _util hook'u haric tutuyor", () => {
		const n = countHooks(TEMPLATE);
		// _util.mjs sayilmamali; sayim 10+ olmali (gercek hook'lar)
		assert.ok(n >= 10);
	});

	it("countCommands template'den sayi doner", () => {
		const n = countCommands(TEMPLATE);
		assert.ok(n >= 50);
	});

	it("countSkillCategories vault sayar", () => {
		const n = countSkillCategories(TEMPLATE);
		// skills-vault yoksa sifir; varsa 60+
		assert.ok(n >= 0);
	});

	it("buildPluginManifest required alanlari uretir", () => {
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

	it("buildPluginManifest hook command paths ${CLAUDE_PLUGIN_ROOT} kullanir", () => {
		const m = buildPluginManifest({ pkg: PKG, claudeDir: TEMPLATE });
		const allHooks = [...m.hooks.PreToolUse, ...m.hooks.UserPromptSubmit];
		for (const block of allHooks) {
			for (const h of block.hooks) {
				assert.match(h.command, /CLAUDE_PLUGIN_ROOT/);
				assert.match(h.command, /\.mjs$/);
			}
		}
	});

	it("buildMarketplaceManifest required alanlari uretir", () => {
		const m = buildMarketplaceManifest({ pkg: PKG, claudeDir: TEMPLATE });
		assert.equal(m.name, "badi-marketplace");
		assert.ok(Array.isArray(m.plugins));
		assert.equal(m.plugins.length, 1);
		assert.equal(m.plugins[0].source, "./");
		assert.equal(m.plugins[0].category, "productivity");
		assert.ok(m.plugins[0].license);
	});

	it("isManifestStale missing path icin missing:true", () => {
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

	it("writeManifests dosyalari yazar", () => {
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

	it("writeManifests dry-run yazmaz", () => {
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
	it("plugin.json stale degil (generator ile eslesir)", () => {
		const pluginDir = join(PKG_ROOT, ".claude-plugin");
		if (!existsSync(pluginDir)) return; // optional setup
		const m = buildPluginManifest({ pkg: PKG, claudeDir: TEMPLATE });
		const r = isManifestStale({ pluginDir, generated: m });
		assert.equal(r.stale, false, "Run: badi release sync-manifest");
	});
});

describe("dist/ multi-package skeletons exist", () => {
	it("homebrew formula mevcut", () => {
		const p = join(PKG_ROOT, "dist", "homebrew", "badi.rb");
		assert.ok(existsSync(p));
		const body = readFileSync(p, "utf-8");
		assert.match(body, /class Badi < Formula/);
		assert.match(body, /homepage "https:\/\/github\.com\/fatihkan\/badi"/);
	});

	it("scoop manifest mevcut", () => {
		const p = join(PKG_ROOT, "dist", "scoop", "badi.json");
		assert.ok(existsSync(p));
		const m = JSON.parse(readFileSync(p, "utf-8"));
		assert.ok(m.version);
		assert.equal(m.license, "MIT");
		assert.equal(m.bin, "badi");
	});

	it("dist publish workflow mevcut", () => {
		const p = join(PKG_ROOT, ".github", "workflows", "dist-publish.yml");
		assert.ok(existsSync(p));
		const body = readFileSync(p, "utf-8");
		assert.match(body, /workflow_dispatch/);
		assert.match(body, /permissions:/);
	});
});
