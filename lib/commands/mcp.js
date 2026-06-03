// Badi mcp command — Model Context Protocol server.
//
// `badi mcp serve` starts a minimal MCP server over stdio. External AI
// clients (Claude Code, Cursor, Continue.dev) connected via
// `claude mcp add badi` can call tools/resources through the Badi bridge.
//
// Zero external dependencies: JSON-RPC over stdio implemented by hand.
// MCP spec: https://modelcontextprotocol.io/

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";

const MCP_VERSION = "2024-11-05";
const SERVER_NAME = "badi";

// ─── Tool and resource definitions (read-only, safe) ───

const TOOLS = [
	{
		name: "badi.skills.route",
		description:
			"Scores matching skills for the given prompt (auto-router). Returns: matched skill list + score.",
		inputSchema: {
			type: "object",
			properties: {
				prompt: { type: "string", description: "User prompt" },
				top: {
					type: "number",
					description: "At most N skills (default 3)",
					default: 3,
				},
			},
			required: ["prompt"],
		},
	},
	{
		name: "badi.skills.list",
		description: "Lists the active (opt-in) skill categories.",
		inputSchema: { type: "object", properties: {} },
	},
	{
		name: "badi.skills.available",
		description:
			"Lists all skill categories in the vault (even if not installed).",
		inputSchema: { type: "object", properties: {} },
	},
	{
		name: "badi.skills.inject",
		description:
			"Concatenates and returns the SKILL.md bodies of skills matching the given prompt (context injection).",
		inputSchema: {
			type: "object",
			properties: {
				prompt: { type: "string" },
			},
			required: ["prompt"],
		},
	},
];

const RESOURCES = [
	{
		uri: "badi://memory",
		name: "memory.md",
		description: "Session memory (decisions, notes, current state)",
		mimeType: "text/markdown",
		path: ".claude/memory.md",
	},
	{
		uri: "badi://knowledge-base",
		name: "knowledge-base.md",
		description: "Project knowledge base (persistent rules, patterns)",
		mimeType: "text/markdown",
		path: ".claude/knowledge-base.md",
	},
	{
		uri: "badi://taskboard",
		name: "TaskBoard.md",
		description: "Task board (open/pending work)",
		mimeType: "text/markdown",
		path: ".claude/workspace/TaskBoard.md",
	},
];

// ─── JSON-RPC helpers ───

function jsonRpcResponse(id, result) {
	return JSON.stringify({ jsonrpc: "2.0", id, result });
}

function jsonRpcError(id, code, message) {
	return JSON.stringify({
		jsonrpc: "2.0",
		id,
		error: { code, message },
	});
}

// ─── Tool execution ───

async function callTool(name, args, target) {
	if (name === "badi.skills.route") {
		const { buildSkillIndex, routePrompt } = await import(
			"../skills-router.js"
		);
		const idx = buildSkillIndex(join(target, ".claude", "skills-vault"));
		const matched = routePrompt(args.prompt || "", idx, {
			top: args.top || 3,
		});
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify({ matched }, null, 2),
				},
			],
		};
	}

	if (name === "badi.skills.list") {
		const { listDirs } = await import("../helpers.js");
		const active = join(target, ".claude", "skills");
		const skills = existsSync(active) ? listDirs(active).sort() : [];
		return {
			content: [
				{ type: "text", text: JSON.stringify({ active: skills }, null, 2) },
			],
		};
	}

	if (name === "badi.skills.available") {
		const { listDirs } = await import("../helpers.js");
		const vault = join(target, ".claude", "skills-vault");
		const skills = existsSync(vault) ? listDirs(vault).sort() : [];
		return {
			content: [
				{ type: "text", text: JSON.stringify({ available: skills }, null, 2) },
			],
		};
	}

	if (name === "badi.skills.inject") {
		const { buildContextInjection, buildSkillIndex, routePrompt } =
			await import("../skills-router.js");
		const idx = buildSkillIndex(join(target, ".claude", "skills-vault"));
		const matched = routePrompt(args.prompt || "", idx);
		const blob = buildContextInjection(matched, idx);
		return {
			content: [{ type: "text", text: blob || "(no match)" }],
		};
	}

	throw new Error(`Unknown tool: ${name}`);
}

async function readResource(uri, target) {
	const res = RESOURCES.find((r) => r.uri === uri);
	if (!res) throw new Error(`Unknown resource: ${uri}`);
	const file = join(target, res.path);
	const text = existsSync(file) ? readFileSync(file, "utf-8") : "(no file)";
	return {
		contents: [{ uri, mimeType: res.mimeType, text }],
	};
}

// ─── Request handler ───

async function handleRequest(req, target) {
	const { id, method, params = {} } = req;

	try {
		if (method === "initialize") {
			return jsonRpcResponse(id, {
				protocolVersion: MCP_VERSION,
				capabilities: { tools: {}, resources: {} },
				serverInfo: { name: SERVER_NAME, version: getBadiVersion() },
			});
		}

		if (method === "tools/list") {
			return jsonRpcResponse(id, { tools: TOOLS });
		}

		if (method === "tools/call") {
			const result = await callTool(
				params.name,
				params.arguments || {},
				target,
			);
			return jsonRpcResponse(id, result);
		}

		if (method === "resources/list") {
			return jsonRpcResponse(id, {
				resources: RESOURCES.map((r) => ({
					uri: r.uri,
					name: r.name,
					description: r.description,
					mimeType: r.mimeType,
				})),
			});
		}

		if (method === "resources/read") {
			const result = await readResource(params.uri, target);
			return jsonRpcResponse(id, result);
		}

		if (method === "ping") {
			return jsonRpcResponse(id, {});
		}

		// notifications (initialized etc.) expect no response
		if (method.startsWith("notifications/")) {
			return null;
		}

		return jsonRpcError(id, -32601, `Method not found: ${method}`);
	} catch (e) {
		return jsonRpcError(id, -32603, e.message);
	}
}

function getBadiVersion() {
	try {
		const pkg = JSON.parse(
			readFileSync(new URL("../../package.json", import.meta.url), "utf-8"),
		);
		return pkg.version;
	} catch {
		return "unknown";
	}
}

// ─── Stdio server ───

export async function serveMcp(target) {
	let buffer = "";
	let pending = 0;
	let stdinEnded = false;

	const tryExit = () => {
		if (stdinEnded && pending === 0) {
			process.exit(0);
		}
	};

	const processLine = async (line) => {
		pending++;
		try {
			const req = JSON.parse(line);
			const resp = await handleRequest(req, target);
			if (resp !== null) {
				process.stdout.write(`${resp}\n`);
			}
		} catch (e) {
			const errResp = jsonRpcError(null, -32700, `Parse error: ${e.message}`);
			process.stdout.write(`${errResp}\n`);
		} finally {
			pending--;
			tryExit();
		}
	};

	process.stdin.setEncoding("utf-8");
	process.stdin.on("data", (chunk) => {
		buffer += chunk;
		let nl = buffer.indexOf("\n");
		while (nl !== -1) {
			const line = buffer.slice(0, nl).trim();
			buffer = buffer.slice(nl + 1);
			if (line) processLine(line);
			nl = buffer.indexOf("\n");
		}
	});

	process.stdin.on("end", () => {
		stdinEnded = true;
		tryExit();
	});
}

// ─── CLI helpers ───

function manifestSnippet() {
	return JSON.stringify(
		{
			mcpServers: {
				badi: {
					command: "npx",
					args: ["-y", "@fatihkan/badi", "mcp", "serve"],
				},
			},
		},
		null,
		2,
	);
}

function showHelp() {
	console.log(`${chalk.bold("badi mcp")} — Model Context Protocol server`);
	console.log("");
	console.log("  serve         Start the stdio MCP server");
	console.log("  tools         Show the exposed tool list");
	console.log("  resources     Show the exposed resource list");
	console.log("  config        .mcp.json snippet for Claude Code/Cursor");
	console.log("");
	console.log(chalk.bold("Setup (Claude Code):"));
	console.log("  claude mcp add badi -- npx -y @fatihkan/badi mcp serve");
	console.log("");
	console.log(chalk.bold("Manual (.mcp.json):"));
	console.log(chalk.dim("  badi mcp config > .mcp.json"));
}

export async function runMcp(args) {
	const [sub] = args;
	const target = process.cwd();

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		showHelp();
		return;
	}

	if (sub === "serve") {
		await serveMcp(target);
		return;
	}

	if (sub === "tools") {
		console.log(chalk.bold(`Tools (${TOOLS.length}):`));
		for (const t of TOOLS) {
			console.log(`  ${chalk.cyan(t.name)} — ${t.description}`);
		}
		return;
	}

	if (sub === "resources") {
		console.log(chalk.bold(`Resources (${RESOURCES.length}):`));
		for (const r of RESOURCES) {
			console.log(`  ${chalk.cyan(r.uri)} — ${r.description}`);
		}
		return;
	}

	if (sub === "config") {
		console.log(manifestSnippet());
		return;
	}

	console.error(chalk.red(`Unknown subcommand: ${sub}`));
	showHelp();
	process.exit(1);
}
