import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const TMP = resolve(__dirname, "..", ".test-tmp-stats");

function run(args = [], cwd = TMP) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd,
	});
}

function createUsageLog(entries) {
	const logDir = join(TMP, ".claude", "logs");
	mkdirSync(logDir, { recursive: true });
	const lines = `${entries.map((e) => JSON.stringify(e)).join("\n")}\n`;
	writeFileSync(join(logDir, "usage.jsonl"), lines);
}

describe("badi stats", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		mkdirSync(TMP, { recursive: true });
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
	});

	it("--help yardim gosterir", () => {
		const output = run(["stats", "--help"]);
		assert.ok(output.includes("Kullanim Istatistikleri"));
		assert.ok(output.includes("month"));
		assert.ok(output.includes("habits"));
		assert.ok(output.includes("export"));
	});

	it("bos veri ile mesaj gosterir", () => {
		const output = run(["stats"]);
		assert.ok(output.includes("Henuz kullanim verisi yok"));
	});

	it("haftalik ozet gosterir", () => {
		const now = new Date();
		const entries = [];
		for (let i = 0; i < 5; i++) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			entries.push({
				timestamp: d.toISOString(),
				tool: "Bash",
				command: "",
				subcommand: "",
				exit_code: 0,
			});
			entries.push({
				timestamp: d.toISOString(),
				tool: "Read",
				command: "badi",
				subcommand: "doctor",
				exit_code: 0,
			});
		}
		createUsageLog(entries);

		const output = run(["stats", "--week"]);
		assert.ok(output.includes("Kullanim Istatistikleri"));
		assert.ok(output.includes("Son 7 gun"));
		assert.ok(output.includes("Bash"));
	});

	it("aylik ozet gosterir", () => {
		const output = run(["stats", "--month"]);
		assert.ok(output.includes("Son 30 gun"));
	});

	it("--command filtresi calisiyor", () => {
		const output = run(["stats", "--command", "Bash"]);
		assert.ok(output.includes("Bash"));
		assert.ok(output.includes("Filtre"));
	});

	it("--habits seri analizi gosterir", () => {
		const output = run(["stats", "--habits"]);
		assert.ok(output.includes("seri") || output.includes("gun"));
	});

	it("--export csv ciktisi uretir", () => {
		const output = run(["stats", "--export", "csv"]);
		assert.ok(output.includes("timestamp,tool,command,subcommand,exit_code"));
		const lines = output.trim().split("\n");
		assert.ok(lines.length > 1, "CSV birden fazla satir olmali");
	});
});
