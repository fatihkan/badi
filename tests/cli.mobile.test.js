import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) => execFileSync("node", [BIN, ...args], { encoding: "utf-8", timeout: 10000 }).trim();

describe("badi mobile", () => {
	it("yardim gosterir", () => {
		const out = run("mobile", "--help");
		assert.ok(out.includes("Mobil Gelistirme"));
		assert.ok(out.includes("badi mobile init"));
		assert.ok(out.includes("badi mobile build"));
	});

	it("argumansiz yardim gosterir", () => {
		const out = run("mobile");
		assert.ok(out.includes("Mobil Gelistirme"));
	});

	it("init proje adi olmadan hata verir", () => {
		assert.throws(() => run("mobile", "init"), { status: 1 });
	});

	it("init gecersiz framework hata verir", () => {
		assert.throws(() => run("mobile", "init", "myapp", "--framework", "xyz"), { status: 1 });
	});

	it("version bump gecersiz tip hata verir", () => {
		assert.throws(() => run("mobile", "version", "bump", "xxxx"), { status: 1 });
	});

	it("build gecersiz platform hata verir", () => {
		assert.throws(() => run("mobile", "build", "windows"), { status: 1 });
	});

	it("release rehberi testflight gosterir", () => {
		const out = run("mobile", "release", "testflight");
		assert.ok(out.includes("TestFlight") || out.includes("Xcode"));
	});

	it("release rehberi play-internal gosterir", () => {
		const out = run("mobile", "release", "play-internal");
		assert.ok(out.includes("Play Console") || out.includes("AAB"));
	});

	it("release gecersiz hedef hata verir", () => {
		assert.throws(() => run("mobile", "release", "invalid"), { status: 1 });
	});

	it("assets icon rehberi gosterir", () => {
		const out = run("mobile", "assets", "icon");
		assert.ok(out.includes("iOS") || out.includes("Android"));
		assert.ok(out.includes("1024") || out.includes("512"));
	});

	it("assets splash rehberi gosterir", () => {
		const out = run("mobile", "assets", "splash");
		assert.ok(out.includes("Splash"));
	});

	it("assets screenshots rehberi gosterir", () => {
		const out = run("mobile", "assets", "screenshots");
		assert.ok(out.includes("Screenshot") || out.includes("iPhone"));
	});

	it("bilinmeyen komut hata verir", () => {
		assert.throws(() => run("mobile", "invalid"), { status: 1 });
	});
});
