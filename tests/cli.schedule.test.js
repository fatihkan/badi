import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

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
			writeFileSync(SCHEDULE_FILE, JSON.stringify({ version: 1, schedules: [] }));
		}
	});

	it("--help yardim gosterir", () => {
		const output = run(["schedule"]);
		assert.ok(output.includes("Hatirlatici"));
		assert.ok(output.includes("add"));
		assert.ok(output.includes("list"));
		assert.ok(output.includes("remove"));
	});

	it("list bos liste gosterir", () => {
		const output = run(["schedule", "list"]);
		assert.ok(output.includes("Henuz hatirlatici yok") || output.includes("Hatirlatici"));
	});

	it("add hatirlatici ekler", () => {
		const output = run(["schedule", "add", "icerik basla", "--at", "09:00", "--days", "mon-fri"]);
		assert.ok(output.includes("olusturuldu"));
		assert.ok(output.includes("09:00"));

		const data = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"));
		assert.ok(data.schedules.length >= 1);
		assert.equal(data.schedules[data.schedules.length - 1].hours, 9);
	});

	it("list eklenen hatiralaticiyi gosterir", () => {
		const output = run(["schedule", "list"]);
		assert.ok(output.includes("icerik basla") || output.includes("badi icerik basla"));
		assert.ok(output.includes("09:00"));
	});

	it("add ikinci hatirlatici ekler", () => {
		const output = run(["schedule", "add", "wrap-up", "--at", "18:00"]);
		assert.ok(output.includes("olusturuldu"));
		assert.ok(output.includes("18:00"));
	});

	it("remove hatirlatici siler", () => {
		const data = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"));
		const lastId = data.schedules[data.schedules.length - 1].id;
		const output = run(["schedule", "remove", String(lastId)]);
		assert.ok(output.includes("silindi"));
	});

	it("remove mevcut olmayan ID hata verir", () => {
		assert.throws(
			() => run(["schedule", "remove", "999"]),
			(err) => err.status === 1,
		);
	});

	it("check sessiz calisir (zamani gelmemis)", () => {
		const output = run(["schedule", "check"]);
		// Zamani gelmemisse sessiz olmali
		assert.ok(!output.includes("HATA"));
	});

	it("add komut olmadan hata verir", () => {
		assert.throws(
			() => run(["schedule", "add"]),
			(err) => err.status === 1,
		);
	});
});
