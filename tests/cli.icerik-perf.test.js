import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const TMP = resolve(__dirname, "..", ".test-tmp-icerik-perf");

function run(args = [], cwd = TMP) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd,
	});
}

function seedPerfData(entries) {
	const dir = join(TMP, ".claude", "workspace");
	mkdirSync(dir, { recursive: true });
	const lines = `${entries.map((e) => JSON.stringify(e)).join("\n")}\n`;
	writeFileSync(join(dir, "performans.jsonl"), lines);
}

describe("badi content perf", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		mkdirSync(TMP, { recursive: true });
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
	});

	it("--help shows help", () => {
		const output = run(["content", "perf", "--help"]);
		assert.ok(output.includes("Performance Tracking"));
		assert.ok(output.includes("--file"));
		assert.ok(output.includes("--platform"));
	});

	it("shows a message with empty data", () => {
		const output = run(["content", "perf"]);
		assert.ok(output.includes("No performance data yet"));
	});

	it("perf add adds data", () => {
		const output = run([
			"content",
			"perf",
			"add",
			"--file",
			"test-post.md",
			"--platform",
			"instagram",
			"--likes",
			"100",
			"--comments",
			"10",
			"--shares",
			"5",
			"--saves",
			"20",
			"--reach",
			"1000",
			"--effort",
			"2",
		]);
		assert.ok(output.includes("saved"));
		assert.ok(output.includes("instagram"));

		const perfFile = join(TMP, ".claude", "workspace", "performans.jsonl");
		assert.ok(existsSync(perfFile), "performans.jsonl should be created");

		const content = readFileSync(perfFile, "utf-8");
		const entry = JSON.parse(content.trim().split("\n").pop());
		assert.equal(entry.likes, 100);
		assert.equal(entry.platform, "instagram");
	});

	it("perf list lists records", () => {
		const output = run(["content", "perf", "list"]);
		assert.ok(output.includes("Performance Records"));
		assert.ok(output.includes("instagram"));
		assert.ok(output.includes("test-post.md"));
	});

	it("perf shows a weekly summary", () => {
		const output = run(["content", "perf", "--week"]);
		assert.ok(
			output.includes("Performance Report") || output.includes("Last 7 days"),
		);
	});

	it("perf --roi performs a calculation", () => {
		seedPerfData([
			{
				timestamp: new Date().toISOString(),
				date: new Date().toISOString().split("T")[0],
				file: "roi-test.md",
				platform: "instagram",
				likes: 200,
				comments: 20,
				shares: 10,
				saves: 30,
				reach: 5000,
				effort: 3,
			},
		]);

		const output = run(["content", "perf", "--roi"]);
		assert.ok(output.includes("ROI"));
		assert.ok(output.includes("instagram"));
	});

	it("perf --platform filter works", () => {
		seedPerfData([
			{
				timestamp: new Date().toISOString(),
				date: new Date().toISOString().split("T")[0],
				file: "ig-post.md",
				platform: "instagram",
				likes: 100,
				comments: 5,
			},
			{
				timestamp: new Date().toISOString(),
				date: new Date().toISOString().split("T")[0],
				file: "tw-post.md",
				platform: "twitter",
				likes: 50,
				comments: 3,
			},
		]);

		const output = run(["content", "perf", "--platform", "instagram"]);
		assert.ok(output.includes("instagram"));
	});

	it("perf add errors on a missing parameter", () => {
		assert.throws(
			() => run(["content", "perf", "add"]),
			(err) => err.status === 1,
		);
	});
});
