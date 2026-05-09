// MCP server testleri — JSON-RPC roundtrip ve CLI metadata.

import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");

function setupVault() {
	const dir = mkdtempSync(join(tmpdir(), "badi-mcp-test-"));
	const claudeDir = join(dir, ".claude");
	const vault = join(claudeDir, "skills-vault");
	const active = join(claudeDir, "skills");
	mkdirSync(vault, { recursive: true });
	mkdirSync(active, { recursive: true });
	mkdirSync(join(claudeDir, "workspace"), { recursive: true });

	mkdirSync(join(vault, "seo"), { recursive: true });
	writeFileSync(
		join(vault, "seo", "SKILL.md"),
		"---\nname: seo\ndescription: SEO. Triggers on: schema, keyword, meta.\n---\n\nSEO body.\n",
	);
	mkdirSync(join(active, "seo"), { recursive: true });
	writeFileSync(
		join(active, "seo", "SKILL.md"),
		"---\nname: seo\ndescription: SEO active.\n---\n\nactive\n",
	);

	writeFileSync(join(claudeDir, "memory.md"), "# Memory\nTest content.\n");
	writeFileSync(join(claudeDir, "knowledge-base.md"), "# KB\nTest content.\n");
	writeFileSync(
		join(claudeDir, "workspace", "TaskBoard.md"),
		"# Tasks\nTest.\n",
	);

	return dir;
}

async function rpc(dir, requests) {
	return new Promise((resolve, reject) => {
		const child = spawn("node", [CLI, "mcp", "serve"], {
			cwd: dir,
			stdio: ["pipe", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (c) => {
			stdout += c.toString();
		});
		child.stderr.on("data", (c) => {
			stderr += c.toString();
		});
		child.on("error", reject);
		child.on("exit", () => {
			const lines = stdout.split("\n").filter(Boolean);
			const responses = lines.map((l) => JSON.parse(l));
			resolve({ responses, stderr });
		});

		for (const req of requests) {
			child.stdin.write(`${JSON.stringify(req)}\n`);
		}
		child.stdin.end();

		setTimeout(() => {
			child.kill("SIGTERM");
			reject(new Error("MCP server timeout"));
		}, 8000).unref();
	});
}

describe("mcp CLI metadata", () => {
	let dir;
	beforeEach(() => {
		dir = setupVault();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("--help banner + komut listesi", () => {
		const out = execFileSync("node", [CLI, "mcp", "--help"], {
			cwd: dir,
			encoding: "utf-8",
			timeout: 10000,
		});
		assert.match(out, /serve/);
		assert.match(out, /tools/);
		assert.match(out, /config/);
	});

	it("tools alt komutu tool listesi yazar", () => {
		const out = execFileSync("node", [CLI, "mcp", "tools"], {
			cwd: dir,
			encoding: "utf-8",
			timeout: 10000,
		});
		assert.match(out, /badi\.skills\.route/);
		assert.match(out, /badi\.skills\.list/);
	});

	it("resources alt komutu resource listesi yazar", () => {
		const out = execFileSync("node", [CLI, "mcp", "resources"], {
			cwd: dir,
			encoding: "utf-8",
			timeout: 10000,
		});
		assert.match(out, /badi:\/\/memory/);
		assert.match(out, /badi:\/\/knowledge-base/);
	});

	it("config gecerli .mcp.json snippet'i yazar", () => {
		const out = execFileSync("node", [CLI, "mcp", "config"], {
			cwd: dir,
			encoding: "utf-8",
			timeout: 10000,
		});
		const parsed = JSON.parse(out);
		assert.ok(parsed.mcpServers);
		assert.ok(parsed.mcpServers.badi);
		assert.equal(parsed.mcpServers.badi.command, "npx");
	});
});

describe("mcp serve JSON-RPC", () => {
	let dir;
	beforeEach(() => {
		dir = setupVault();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("initialize cevap dondurur", async () => {
		const { responses } = await rpc(dir, [
			{ jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
		]);
		assert.equal(responses.length, 1);
		assert.equal(responses[0].id, 1);
		assert.ok(responses[0].result.protocolVersion);
		assert.equal(responses[0].result.serverInfo.name, "badi");
	});

	it("tools/list MCP tool listesi", async () => {
		const { responses } = await rpc(dir, [
			{ jsonrpc: "2.0", id: 1, method: "tools/list" },
		]);
		assert.ok(responses[0].result.tools.length >= 4);
		const names = responses[0].result.tools.map((t) => t.name);
		assert.ok(names.includes("badi.skills.route"));
	});

	it("resources/list MCP resource listesi", async () => {
		const { responses } = await rpc(dir, [
			{ jsonrpc: "2.0", id: 1, method: "resources/list" },
		]);
		assert.ok(responses[0].result.resources.length >= 3);
	});

	it("tools/call badi.skills.route eslesen skill", async () => {
		const { responses } = await rpc(dir, [
			{
				jsonrpc: "2.0",
				id: 1,
				method: "tools/call",
				params: {
					name: "badi.skills.route",
					arguments: { prompt: "schema markup keyword" },
				},
			},
		]);
		assert.ok(responses[0].result.content);
		const text = responses[0].result.content[0].text;
		assert.match(text, /seo/);
	});

	it("tools/call badi.skills.list aktif listesi", async () => {
		const { responses } = await rpc(dir, [
			{
				jsonrpc: "2.0",
				id: 1,
				method: "tools/call",
				params: { name: "badi.skills.list", arguments: {} },
			},
		]);
		const text = responses[0].result.content[0].text;
		assert.match(text, /seo/);
	});

	it("resources/read badi://memory dosyasi okur", async () => {
		const { responses } = await rpc(dir, [
			{
				jsonrpc: "2.0",
				id: 1,
				method: "resources/read",
				params: { uri: "badi://memory" },
			},
		]);
		assert.ok(responses[0].result.contents);
		assert.match(responses[0].result.contents[0].text, /Memory/);
	});

	it("bilinmeyen method JSON-RPC error", async () => {
		const { responses } = await rpc(dir, [
			{ jsonrpc: "2.0", id: 1, method: "frobnicate" },
		]);
		assert.ok(responses[0].error);
		assert.equal(responses[0].error.code, -32601);
	});
});
