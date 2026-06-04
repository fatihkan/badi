import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const SCHEDULE_FILE = join(homedir(), ".config", "badi", "schedules.json");

let backupData = null;

function run(args = []) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	});
}

describe("badi schedule", () => {
	before(() => {
		// Mevcut schedules.json'i yedekle
		if (existsSync(SCHEDULE_FILE)) {
			backupData = readFileSync(SCHEDULE_FILE, "utf-8");
		}
		// Test icin temiz baslat
		const dir = join(homedir(), ".config", "badi");
		mkdirSync(dir, { recursive: true });
		writeFileSync(SCHEDULE_FILE, JSON.stringify({ version: 1, schedules: [] }));
	});

	after(() => {
		// Yedegi geri yukle
		if (backupData) {
			writeFileSync(SCHEDULE_FILE, backupData);
		} else if (existsSync(SCHEDULE_FILE)) {
			// Test sirasinda olusturulanlari temizle
			writeFileSync(
				SCHEDULE_FILE,
				JSON.stringify({ version: 1, schedules: [] }),
			);
		}
	});

	it("--help shows help", () => {
		const output = run(["schedule"]);
		assert.ok(output.includes("Reminder"));
		assert.ok(output.includes("add"));
		assert.ok(output.includes("list"));
		assert.ok(output.includes("remove"));
	});

	it("list shows an empty list", () => {
		const output = run(["schedule", "list"]);
		assert.ok(
			output.includes("No reminders yet") || output.includes("Reminder"),
		);
	});

	it("add adds a reminder", () => {
		const output = run([
			"schedule",
			"add",
			"icerik basla",
			"--at",
			"09:00",
			"--days",
			"mon-fri",
		]);
		assert.ok(output.includes("created"));
		assert.ok(output.includes("09:00"));

		const data = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"));
		assert.ok(data.schedules.length >= 1);
		assert.equal(data.schedules[data.schedules.length - 1].hours, 9);
	});

	it("list shows the added reminder", () => {
		const output = run(["schedule", "list"]);
		assert.ok(
			output.includes("icerik basla") || output.includes("badi content basla"),
		);
		assert.ok(output.includes("09:00"));
	});

	it("add adds a second reminder", () => {
		const output = run(["schedule", "add", "wrap-up", "--at", "18:00"]);
		assert.ok(output.includes("created"));
		assert.ok(output.includes("18:00"));
	});

	it("remove deletes a reminder", () => {
		const data = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"));
		const lastId = data.schedules[data.schedules.length - 1].id;
		const output = run(["schedule", "remove", String(lastId)]);
		assert.ok(output.includes("removed"));
	});

	it("remove errors on a nonexistent ID", () => {
		assert.throws(
			() => run(["schedule", "remove", "999"]),
			(err) => err.status === 1,
		);
	});

	it("check runs silently (not yet due)", () => {
		const output = run(["schedule", "check"]);
		// Zamani gelmemisse sessiz olmali
		assert.ok(!output.includes("HATA"));
	});

	it("add errors without a command", () => {
		assert.throws(
			() => run(["schedule", "add"]),
			(err) => err.status === 1,
		);
	});
});
