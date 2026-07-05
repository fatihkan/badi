import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import {
	applyFilters,
	costForUsage,
	findSession,
	formatDuration,
	listTranscriptFiles,
	MODEL_PRICING,
	parseSession,
	parseSessionWithEvents,
	shortSessionId,
	transcriptsRoot,
} from "../lib/data/transcript-reader.js";

describe("transcriptsRoot precedence (override > env > default)", () => {
	it("explicit override wins over env and default", () => {
		const prev = process.env.BADI_TRANSCRIPTS_ROOT;
		process.env.BADI_TRANSCRIPTS_ROOT = "/env/path";
		try {
			assert.equal(transcriptsRoot("/explicit"), "/explicit");
		} finally {
			if (prev === undefined) delete process.env.BADI_TRANSCRIPTS_ROOT;
			else process.env.BADI_TRANSCRIPTS_ROOT = prev;
		}
	});

	it("BADI_TRANSCRIPTS_ROOT env is used when no override is given", () => {
		const prev = process.env.BADI_TRANSCRIPTS_ROOT;
		process.env.BADI_TRANSCRIPTS_ROOT = "/env/path";
		try {
			assert.equal(transcriptsRoot(), "/env/path");
		} finally {
			if (prev === undefined) delete process.env.BADI_TRANSCRIPTS_ROOT;
			else process.env.BADI_TRANSCRIPTS_ROOT = prev;
		}
	});

	it("falls back to ~/.claude/projects when neither is set", () => {
		const prev = process.env.BADI_TRANSCRIPTS_ROOT;
		delete process.env.BADI_TRANSCRIPTS_ROOT;
		try {
			assert.match(transcriptsRoot(), /[/\\]\.claude[/\\]projects$/);
		} finally {
			if (prev !== undefined) process.env.BADI_TRANSCRIPTS_ROOT = prev;
		}
	});
});

function jsonl(arr) {
	return arr.map((o) => JSON.stringify(o)).join("\n");
}

let tmp;
let root;

const SAMPLE_SESSION_ID = "11111111-2222-3333-4444-555555555555";
const SAMPLE_SLUG = "-tmp-test-project";

before(() => {
	tmp = mkdtempSync(join(tmpdir(), "badi-transcript-"));
	root = join(tmp, "projects");
	mkdirSync(join(root, SAMPLE_SLUG), { recursive: true });
	const lines = jsonl([
		{
			type: "user",
			timestamp: "2026-05-15T10:00:00Z",
			cwd: "/tmp/test-project",
			gitBranch: "main",
			sessionId: SAMPLE_SESSION_ID,
			message: { role: "user", content: "secret-scan refactor planla" },
		},
		{
			type: "assistant",
			timestamp: "2026-05-15T10:00:05Z",
			cwd: "/tmp/test-project",
			gitBranch: "main",
			sessionId: SAMPLE_SESSION_ID,
			message: {
				model: "claude-opus-4-7",
				role: "assistant",
				content: [
					{ type: "text", text: "ok" },
					{
						type: "tool_use",
						name: "Edit",
						input: { file_path: "/tmp/test-project/foo.js" },
					},
					{
						type: "tool_use",
						name: "mcp__context7__query-docs",
						input: {},
					},
				],
				usage: {
					input_tokens: 100,
					output_tokens: 200,
					cache_creation_input_tokens: 50,
					cache_read_input_tokens: 1000,
				},
			},
		},
		{
			type: "assistant",
			timestamp: "2026-05-15T10:05:00Z",
			cwd: "/tmp/test-project",
			gitBranch: "main",
			sessionId: SAMPLE_SESSION_ID,
			message: {
				model: "claude-sonnet-4-6",
				role: "assistant",
				content: [{ type: "tool_use", name: "Bash", input: { command: "ls" } }],
				usage: { input_tokens: 10, output_tokens: 20 },
			},
		},
		{ type: "last-prompt", prompt: "search bunu da bul" },
	]);
	writeFileSync(join(root, SAMPLE_SLUG, `${SAMPLE_SESSION_ID}.jsonl`), lines);
});

after(() => {
	try {
		rmSync(tmp, { recursive: true, force: true });
	} catch {}
});

describe("transcript-reader", () => {
	it("listTranscriptFiles finds transcript", () => {
		const files = listTranscriptFiles(root);
		assert.equal(files.length, 1);
		assert.equal(files[0].sessionId, SAMPLE_SESSION_ID);
	});

	it("parseSession aggregates metadata + tokens + tools", () => {
		const files = listTranscriptFiles(root);
		const s = parseSession(files[0].path);
		assert.equal(s.project, "test-project");
		assert.equal(s.gitBranch, "main");
		assert.equal(s.promptCount, 1);
		assert.equal(s.toolUseCount, 3);
		assert.deepEqual(s.toolCounts, {
			Edit: 1,
			"mcp__context7__query-docs": 1,
			Bash: 1,
		});
		assert.deepEqual(s.mcpToolCounts, { "mcp__context7__query-docs": 1 });
		assert.equal(s.usage.input, 110);
		assert.equal(s.usage.output, 220);
		assert.equal(s.usage.cacheCreate, 50);
		assert.equal(s.usage.cacheRead, 1000);
		assert.equal(s.filesTouched.length, 1);
		assert.ok(s.models.includes("claude-opus-4-7"));
		assert.ok(s.models.includes("claude-sonnet-4-6"));
	});

	it("last-prompt event overwrites lastPromptText", () => {
		const files = listTranscriptFiles(root);
		const s = parseSession(files[0].path);
		assert.equal(s.lastPromptText, "search bunu da bul");
	});

	it("costForUsage prices opus and sonnet differently", () => {
		const usage = {
			input_tokens: 1_000_000,
			output_tokens: 1_000_000,
		};
		const opus = costForUsage("claude-opus-4-8", usage);
		const sonnet = costForUsage("claude-sonnet-5", usage);
		assert.equal(opus, 5 + 25);
		assert.equal(sonnet, 3 + 15);
		assert.ok(opus > sonnet);
	});

	it("costForUsage falls back for an unknown model", () => {
		const c = costForUsage("claude-opus-4-99", {
			input_tokens: 1_000_000,
		});
		assert.equal(c, 5);
	});

	it("costForUsage returns 0 for a completely unknown model", () => {
		const c = costForUsage("gpt-4", { input_tokens: 1_000_000 });
		assert.equal(c, 0);
	});

	it("MODEL_PRICING covers the main models", () => {
		assert.ok(MODEL_PRICING["claude-fable-5"]);
		assert.ok(MODEL_PRICING["claude-opus-4-8"]);
		assert.ok(MODEL_PRICING["claude-sonnet-5"]);
		assert.ok(MODEL_PRICING["claude-haiku-4-5"]);
	});

	it("applyFilters --since filters the session", () => {
		const sessions = listTranscriptFiles(root).map((f) => parseSession(f.path));
		const after = applyFilters(sessions, { since: "2026-06-01" });
		assert.equal(after.length, 0);
		const before = applyFilters(sessions, { since: "2026-05-01" });
		assert.equal(before.length, 1);
	});

	it("applyFilters --until filters the session", () => {
		const sessions = listTranscriptFiles(root).map((f) => parseSession(f.path));
		const before = applyFilters(sessions, { until: "2026-05-01" });
		assert.equal(before.length, 0);
		const after = applyFilters(sessions, { until: "2026-06-01" });
		assert.equal(after.length, 1);
	});

	it("applyFilters --branch filters the session", () => {
		const sessions = listTranscriptFiles(root).map((f) => parseSession(f.path));
		assert.equal(applyFilters(sessions, { branch: "main" }).length, 1);
		assert.equal(applyFilters(sessions, { branch: "feature/x" }).length, 0);
	});

	it("findSession works with exact + prefix", () => {
		const exact = findSession(SAMPLE_SESSION_ID, { root });
		assert.ok(exact);
		const prefix = findSession(SAMPLE_SESSION_ID.slice(0, 8), { root });
		assert.ok(prefix);
		const none = findSession("zzzzzzzz", { root });
		assert.equal(none, null);
	});

	it("parseSessionWithEvents fills tool + prompt events in order", () => {
		const files = listTranscriptFiles(root);
		const s = parseSessionWithEvents(files[0].path);
		assert.ok(s.events.length >= 4);
		const kinds = s.events.map((e) => e.kind);
		assert.ok(kinds.includes("prompt"));
		assert.ok(kinds.includes("tool"));
	});

	it("formatDuration formats 0/seconds/minutes/hours", () => {
		assert.equal(formatDuration(0), "0s");
		assert.equal(formatDuration(45_000), "45s");
		assert.equal(formatDuration(120_000), "2m");
		assert.equal(formatDuration(3_600_000), "1h");
		assert.equal(formatDuration(3_900_000), "1h5m");
	});

	it("shortSessionId takes 8 characters", () => {
		assert.equal(shortSessionId("abcdef0123456789"), "abcdef01");
		assert.equal(shortSessionId(""), "????????");
		assert.equal(shortSessionId(null), "????????");
	});
});
