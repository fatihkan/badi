import { readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";

// Claude Code transcript JSONL'lerinin kanonik konumu.
// can be overridden (for tests).
export function transcriptsRoot(override) {
	return override || join(homedir(), ".claude", "projects");
}

// Per-1M-token approximate pricing (USD). Public Anthropic listesi.
// Note: this table is not fixed; if the model name changes, a fallback applies.
export const MODEL_PRICING = {
	"claude-opus-4-7": {
		input: 15,
		output: 75,
		cacheWrite: 18.75,
		cacheRead: 1.5,
	},
	"claude-opus-4-6": {
		input: 15,
		output: 75,
		cacheWrite: 18.75,
		cacheRead: 1.5,
	},
	"claude-opus-4-5": {
		input: 15,
		output: 75,
		cacheWrite: 18.75,
		cacheRead: 1.5,
	},
	"claude-sonnet-4-6": {
		input: 3,
		output: 15,
		cacheWrite: 3.75,
		cacheRead: 0.3,
	},
	"claude-sonnet-4-5": {
		input: 3,
		output: 15,
		cacheWrite: 3.75,
		cacheRead: 0.3,
	},
	"claude-haiku-4-5": { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
	"claude-haiku-4-5-20251001": {
		input: 1,
		output: 5,
		cacheWrite: 1.25,
		cacheRead: 0.1,
	},
};

function classifyModel(model) {
	if (!model) return "unknown";
	if (model.includes("opus")) return "opus";
	if (model.includes("sonnet")) return "sonnet";
	if (model.includes("haiku")) return "haiku";
	return "other";
}

function pricingFor(model) {
	if (MODEL_PRICING[model]) return MODEL_PRICING[model];
	const family = classifyModel(model);
	if (family === "opus")
		return { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 };
	if (family === "sonnet")
		return { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 };
	if (family === "haiku")
		return { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 };
	return null;
}

export function costForUsage(model, usage) {
	const p = pricingFor(model);
	if (!p || !usage) return 0;
	const inp = usage.input_tokens || 0;
	const out = usage.output_tokens || 0;
	const cw = usage.cache_creation_input_tokens || 0;
	const cr = usage.cache_read_input_tokens || 0;
	return (
		(inp * p.input + out * p.output + cw * p.cacheWrite + cr * p.cacheRead) /
		1_000_000
	);
}

export function listTranscriptFiles(root) {
	const base = transcriptsRoot(root);
	let dirs;
	try {
		dirs = readdirSync(base);
	} catch {
		return [];
	}
	const out = [];
	for (const d of dirs) {
		const projectDir = join(base, d);
		let files;
		try {
			files = readdirSync(projectDir);
		} catch {
			continue;
		}
		for (const f of files) {
			if (!f.endsWith(".jsonl")) continue;
			const full = join(projectDir, f);
			let st;
			try {
				st = statSync(full);
			} catch {
				continue;
			}
			if (!st.isFile()) continue;
			out.push({
				path: full,
				projectSlug: d,
				sessionId: f.replace(/\.jsonl$/, ""),
				mtimeMs: st.mtimeMs,
				size: st.size,
			});
		}
	}
	return out;
}

// Tek JSONL'i okuyup minimal session ozetine cevirir.
// Bu hot-path; gerekli olan minimum alanlari toplar.
export function parseSession(filePath) {
	let raw;
	try {
		raw = readFileSync(filePath, "utf-8");
	} catch {
		return null;
	}
	const lines = raw.split("\n");
	const session = {
		sessionId: basename(filePath, ".jsonl"),
		path: filePath,
		cwd: null,
		project: null,
		gitBranch: null,
		models: new Set(),
		firstTs: null,
		lastTs: null,
		promptCount: 0,
		assistantCount: 0,
		toolUseCount: 0,
		toolCounts: {},
		filesTouched: new Set(),
		mcpToolCounts: {},
		usage: {
			input: 0,
			output: 0,
			cacheCreate: 0,
			cacheRead: 0,
		},
		costUsd: 0,
		lastPromptText: "",
		firstPromptText: "",
		events: [], // sadece istenirse doldurulur (parseSession(path, {events:true}))
	};

	for (const line of lines) {
		if (!line) continue;
		let o;
		try {
			o = JSON.parse(line);
		} catch {
			continue;
		}
		const ts = o.timestamp;
		if (ts) {
			if (!session.firstTs || ts < session.firstTs) session.firstTs = ts;
			if (!session.lastTs || ts > session.lastTs) session.lastTs = ts;
		}
		if (o.cwd && !session.cwd) {
			session.cwd = o.cwd;
			session.project = basename(o.cwd);
		}
		if (o.gitBranch && !session.gitBranch) session.gitBranch = o.gitBranch;

		if (o.type === "user") {
			session.promptCount += 1;
			const c = o.message?.content;
			if (typeof c === "string") {
				if (!session.firstPromptText) session.firstPromptText = c.slice(0, 500);
				session.lastPromptText = c.slice(0, 500);
			}
		} else if (o.type === "last-prompt") {
			if (typeof o.prompt === "string")
				session.lastPromptText = o.prompt.slice(0, 500);
		} else if (o.type === "assistant") {
			session.assistantCount += 1;
			const m = o.message?.model;
			if (m) session.models.add(m);
			const u = o.message?.usage;
			if (u) {
				session.usage.input += u.input_tokens || 0;
				session.usage.output += u.output_tokens || 0;
				session.usage.cacheCreate += u.cache_creation_input_tokens || 0;
				session.usage.cacheRead += u.cache_read_input_tokens || 0;
				session.costUsd += costForUsage(m, u);
			}
			const content = o.message?.content;
			if (Array.isArray(content)) {
				for (const b of content) {
					if (b?.type === "tool_use") {
						session.toolUseCount += 1;
						const name = b.name || "unknown";
						session.toolCounts[name] = (session.toolCounts[name] || 0) + 1;
						if (name.startsWith("mcp__")) {
							session.mcpToolCounts[name] =
								(session.mcpToolCounts[name] || 0) + 1;
						}
						const inp = b.input || {};
						const fp = inp.file_path || inp.path;
						if (typeof fp === "string") session.filesTouched.add(fp);
					}
				}
			}
		}
	}

	session.models = [...session.models];
	session.filesTouched = [...session.filesTouched];
	session.durationMs =
		session.firstTs && session.lastTs
			? new Date(session.lastTs).getTime() - new Date(session.firstTs).getTime()
			: 0;
	return session;
}

// For a detailed timeline — also fills events.
export function parseSessionWithEvents(filePath) {
	let raw;
	try {
		raw = readFileSync(filePath, "utf-8");
	} catch {
		return null;
	}
	const base = parseSession(filePath);
	if (!base) return null;
	const lines = raw.split("\n");
	const events = [];
	for (const line of lines) {
		if (!line) continue;
		let o;
		try {
			o = JSON.parse(line);
		} catch {
			continue;
		}
		if (o.type === "user" && typeof o.message?.content === "string") {
			events.push({
				ts: o.timestamp,
				kind: "prompt",
				text: o.message.content.slice(0, 200),
			});
		} else if (o.type === "assistant" && Array.isArray(o.message?.content)) {
			for (const b of o.message.content) {
				if (b?.type === "tool_use") {
					events.push({
						ts: o.timestamp,
						kind: "tool",
						name: b.name,
						input: b.input,
					});
				} else if (b?.type === "thinking") {
					events.push({ ts: o.timestamp, kind: "thinking" });
				}
			}
		}
	}
	events.sort((a, b) => (a.ts || "").localeCompare(b.ts || ""));
	base.events = events;
	return base;
}

export function loadSessions(opts = {}) {
	const files = listTranscriptFiles(opts.root);
	const sessions = [];
	for (const f of files) {
		const s = parseSession(f.path);
		if (!s) continue;
		s.mtimeMs = f.mtimeMs;
		s.projectSlug = f.projectSlug;
		sessions.push(s);
	}
	return applyFilters(sessions, opts);
}

export function applyFilters(sessions, opts = {}) {
	let out = sessions;
	if (opts.since) {
		const t = new Date(opts.since).getTime();
		if (!Number.isNaN(t))
			out = out.filter((s) => new Date(s.lastTs || 0).getTime() >= t);
	}
	if (opts.until) {
		const t = new Date(opts.until).getTime();
		if (!Number.isNaN(t))
			out = out.filter((s) => new Date(s.firstTs || 0).getTime() <= t);
	}
	if (opts.branch) {
		out = out.filter((s) => s.gitBranch === opts.branch);
	}
	if (opts.project) {
		out = out.filter((s) => s.project === opts.project);
	}
	return out;
}

export function formatDuration(ms) {
	if (!ms || ms < 0) return "0s";
	const s = Math.floor(ms / 1000);
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m`;
	const h = Math.floor(m / 60);
	const rm = m % 60;
	return rm ? `${h}h${rm}m` : `${h}h`;
}

export function shortSessionId(id) {
	if (!id) return "????????";
	return id.slice(0, 8);
}

export function findSession(idOrPrefix, opts = {}) {
	const files = listTranscriptFiles(opts.root);
	const exact = files.find((f) => f.sessionId === idOrPrefix);
	if (exact) return exact;
	const prefix = files.filter((f) => f.sessionId.startsWith(idOrPrefix));
	if (prefix.length === 1) return prefix[0];
	if (prefix.length > 1) {
		const err = new Error(
			`Birden fazla session eslesiyor: ${prefix.map((p) => shortSessionId(p.sessionId)).join(", ")}`,
		);
		err.code = "AMBIGUOUS";
		err.matches = prefix;
		throw err;
	}
	return null;
}
