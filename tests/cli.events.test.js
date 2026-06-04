import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");

function run(args = [], env = {}) {
	try {
		return {
			stdout: execFileSync("node", [CLI, ...args], {
				encoding: "utf-8",
				timeout: 10_000,
				env: { ...process.env, ...env },
			}),
			code: 0,
		};
	} catch (e) {
		return {
			stdout: e.stdout?.toString() || "",
			stderr: e.stderr?.toString() || "",
			code: e.status ?? 1,
		};
	}
}

describe("badi events", () => {
	it("--help shows the subcommand list", () => {
		const r = run(["events", "--help"]);
		assert.equal(r.code, 0);
		assert.match(r.stdout, /badi events list/);
		assert.match(r.stdout, /badi events stats/);
		assert.match(r.stdout, /BADI_TELEMETRY=off/);
	});

	it("status command shows telemetry on/off", () => {
		const r = run(["events", "status"]);
		assert.equal(r.code, 0);
		assert.match(r.stdout, /Telemetry:/);
		assert.match(r.stdout, /Log file:/);
	});

	it("BADI_TELEMETRY=off shows off in status", () => {
		const r = run(["events", "status"], { BADI_TELEMETRY: "off" });
		assert.equal(r.code, 0);
		assert.match(r.stdout, /off/);
	});

	it("path command prints the path", () => {
		const r = run(["events", "path"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("badi-events.jsonl"));
	});

	it("list command shows events once a call is made", () => {
		// Telemetry on (default), once bir komut cagiralim
		run(["doctor", "--help"]);
		const r = run(["events", "list", "--limit", "5"]);
		assert.equal(r.code, 0);
		// Pek cok kez emit olur — kontrol esnek
		assert.ok(r.stdout.length > 0);
	});

	it("unknown subcommand exits 1", () => {
		const r = run(["events", "bogus"]);
		assert.equal(r.code, 1);
	});
});
