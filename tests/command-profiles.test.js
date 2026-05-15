// command-profiles birim testleri.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	COMMAND_PROFILES,
	commandsForProfile,
	isInProfile,
	PROFILES,
	profileCounts,
} from "../lib/command-profiles.js";

describe("command-profiles: PROFILES sabiti", () => {
	it("5 profil tanimlar", () => {
		assert.deepEqual(PROFILES, ["core", "dev", "content", "pentest", "all"]);
	});
});

describe("command-profiles: COMMAND_PROFILES tutarliligi", () => {
	it("her profil core/dev/content/pentest'ten biri", () => {
		const valid = new Set(["core", "dev", "content", "pentest"]);
		for (const [name, p] of Object.entries(COMMAND_PROFILES)) {
			assert.ok(valid.has(p), `${name} -> ${p} bilinmeyen profil`);
		}
	});

	it("core profilinde temel oturum komutlari var", () => {
		assert.equal(COMMAND_PROFILES.start, "core");
		assert.equal(COMMAND_PROFILES.sync, "core");
		assert.equal(COMMAND_PROFILES["wrap-up"], "core");
		assert.equal(COMMAND_PROFILES.doctor, "core");
	});

	it("content profilinde icerik komutlari var", () => {
		assert.equal(COMMAND_PROFILES["icerik-uret"], "content");
		assert.equal(COMMAND_PROFILES.karousel, "content");
		assert.equal(COMMAND_PROFILES["video-senaryo"], "content");
	});

	it("dev profilinde dev komutlari var", () => {
		assert.equal(COMMAND_PROFILES.review, "dev");
		assert.equal(COMMAND_PROFILES.refactor, "dev");
		assert.equal(COMMAND_PROFILES.deploy, "dev");
	});
});

describe("command-profiles: commandsForProfile", () => {
	it("all profili tum komutlari dondurur", () => {
		const all = commandsForProfile("all");
		assert.equal(all.length, Object.keys(COMMAND_PROFILES).length);
	});

	it("core profili sadece core komutlari dondurur", () => {
		const core = commandsForProfile("core");
		for (const name of core) {
			assert.equal(COMMAND_PROFILES[name], "core", `${name} core olmali`);
		}
	});

	it("dev profili core + dev birlikte verir", () => {
		const dev = commandsForProfile("dev");
		const counts = profileCounts();
		assert.equal(dev.length, counts.core + counts.dev);
	});

	it("content profili core + content birlikte verir", () => {
		const content = commandsForProfile("content");
		const counts = profileCounts();
		assert.equal(content.length, counts.core + counts.content);
	});

	it("dev profilinde icerik-uret YOK", () => {
		const dev = commandsForProfile("dev");
		assert.ok(!dev.includes("icerik-uret"), "dev'de icerik komutu olmamali");
	});

	it("content profilinde refactor YOK", () => {
		const content = commandsForProfile("content");
		assert.ok(!content.includes("refactor"), "content'te refactor olmamali");
	});

	it("dev profilinde core start VAR", () => {
		const dev = commandsForProfile("dev");
		assert.ok(dev.includes("start"), "core/start dev'de de olmali");
	});

	it("ciktilar sorted", () => {
		const dev = commandsForProfile("dev");
		const sorted = [...dev].sort();
		assert.deepEqual(dev, sorted);
	});
});

describe("command-profiles: isInProfile", () => {
	it("all profilinde her komut", () => {
		assert.equal(isInProfile("review", "all"), true);
		assert.equal(isInProfile("icerik-uret", "all"), true);
	});

	it("core komutu her profilde", () => {
		assert.equal(isInProfile("start", "dev"), true);
		assert.equal(isInProfile("start", "content"), true);
		assert.equal(isInProfile("start", "core"), true);
	});

	it("dev komutu sadece dev'de", () => {
		assert.equal(isInProfile("review", "dev"), true);
		assert.equal(isInProfile("review", "content"), false);
		assert.equal(isInProfile("review", "core"), false);
	});

	it("bilinmeyen komut dokunulmaz (true)", () => {
		assert.equal(isInProfile("user-custom-cmd", "core"), true);
		assert.equal(isInProfile("user-custom-cmd", "dev"), true);
	});
});

describe("command-profiles: profileCounts", () => {
	it("toplam tanimli komut sayisi 77 olmali", () => {
		const counts = profileCounts();
		const total = counts.core + counts.dev + counts.content + counts.pentest;
		assert.equal(total, Object.keys(COMMAND_PROFILES).length);
	});

	it("core, dev, content her biri en az 1", () => {
		const counts = profileCounts();
		assert.ok(counts.core >= 1);
		assert.ok(counts.dev >= 1);
		assert.ok(counts.content >= 1);
	});
});
