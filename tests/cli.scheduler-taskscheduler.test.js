// Windows Task Scheduler backend testleri.
// Adapter shape (id/platform/isAvailable/install/uninstall) tum platformlarda
// dogrulanir. Gercek schtasks cagirimi sadece Windows + CI matrix'te smoke.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWindows } from "../lib/platform.js";
import taskscheduler from "../lib/schedulers/taskscheduler.js";

describe("taskscheduler adapter shape", () => {
	it("id ve platform tanimli", () => {
		assert.equal(taskscheduler.id, "taskscheduler");
		assert.equal(taskscheduler.platform, "win32");
	});

	it("API methodlari mevcut", () => {
		for (const fn of [
			"isAvailable",
			"install",
			"uninstall",
			"isInstalled",
			"describe",
		]) {
			assert.equal(
				typeof taskscheduler[fn],
				"function",
				`${fn} fonksiyon olmali`,
			);
		}
	});
});

describe("taskscheduler.isAvailable", () => {
	it("non-Windows'ta false", () => {
		if (!isWindows) {
			assert.equal(taskscheduler.isAvailable(), false);
		}
	});

	it("Windows'ta boolean dondurur", () => {
		if (isWindows) {
			assert.equal(typeof taskscheduler.isAvailable(), "boolean");
		}
	});
});

describe("taskscheduler.install dryRun", () => {
	it("dryRun task adi + plan dondurur (cross-platform)", () => {
		const r = taskscheduler.install(
			{
				name: "test-task",
				cmd: "node",
				args: ["script.js"],
				cwd: "/tmp",
				intervalSeconds: 3600,
			},
			{ dryRun: true },
		);
		assert.match(r.plan, /Badi\\test-task/);
		assert.match(r.content, /schtasks/);
		assert.match(r.content, /HOURLY/);
	});

	it("intervalSeconds 86400 -> DAILY", () => {
		const r = taskscheduler.install(
			{
				name: "daily-task",
				cmd: "node",
				args: [],
				cwd: "/tmp",
				intervalSeconds: 86400,
			},
			{ dryRun: true },
		);
		assert.match(r.content, /DAILY/);
	});

	it("intervalSeconds 300 -> MINUTE 5", () => {
		const r = taskscheduler.install(
			{
				name: "freq",
				cmd: "node",
				args: [],
				cwd: "/tmp",
				intervalSeconds: 300,
			},
			{ dryRun: true },
		);
		assert.match(r.content, /MINUTE/);
		assert.match(r.content, /\/MO 5/);
	});
});

describe("taskscheduler.uninstall dryRun", () => {
	it("dryRun existed flag dondurur", () => {
		const r = taskscheduler.uninstall({ name: "x" }, { dryRun: true });
		assert.equal(typeof r.existed, "boolean");
		assert.match(r.plan, /Badi\\x/);
	});
});

describe("taskscheduler in registry", () => {
	it("SCHEDULERS listesinde mevcut", async () => {
		const { SCHEDULERS } = await import("../lib/schedulers/index.js");
		const ids = SCHEDULERS.map((s) => s.id);
		assert.ok(ids.includes("taskscheduler"));
	});
});
