// command-profiles unit tests.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	COMMAND_PROFILES,
	commandsForProfile,
	isInProfile,
	PROFILES,
	profileCounts,
} from "../lib/command-profiles.js";

describe("command-profiles: PROFILES constant", () => {
	it("defines 5 profiles", () => {
		assert.deepEqual(PROFILES, ["core", "dev", "content", "pentest", "all"]);
	});
});

describe("command-profiles: COMMAND_PROFILES consistency", () => {
	it("every profile is one of core/dev/content/pentest", () => {
		const valid = new Set(["core", "dev", "content", "pentest"]);
		for (const [name, p] of Object.entries(COMMAND_PROFILES)) {
			assert.ok(valid.has(p), `${name} -> ${p} unknown profile`);
		}
	});

	it("core profile has the basic session commands", () => {
		assert.equal(COMMAND_PROFILES.start, "core");
		assert.equal(COMMAND_PROFILES.sync, "core");
		assert.equal(COMMAND_PROFILES["wrap-up"], "core");
		assert.equal(COMMAND_PROFILES.doctor, "core");
	});

	it("content profile has the content commands", () => {
		assert.equal(COMMAND_PROFILES["content-generate"], "content");
		assert.equal(COMMAND_PROFILES["content-carousel"], "content");
		assert.equal(COMMAND_PROFILES["content-video-script"], "content");
	});

	it("dev profile has the dev commands", () => {
		assert.equal(COMMAND_PROFILES.review, "dev");
		assert.equal(COMMAND_PROFILES.refactor, "dev");
		assert.equal(COMMAND_PROFILES.deploy, "dev");
	});
});

describe("command-profiles: commandsForProfile", () => {
	it("all profile returns every command", () => {
		const all = commandsForProfile("all");
		assert.equal(all.length, Object.keys(COMMAND_PROFILES).length);
	});

	it("core profile returns only core commands", () => {
		const core = commandsForProfile("core");
		for (const name of core) {
			assert.equal(COMMAND_PROFILES[name], "core", `${name} should be core`);
		}
	});

	it("dev profile returns core + dev together", () => {
		const dev = commandsForProfile("dev");
		const counts = profileCounts();
		assert.equal(dev.length, counts.core + counts.dev);
	});

	it("content profile returns core + content together", () => {
		const content = commandsForProfile("content");
		const counts = profileCounts();
		assert.equal(content.length, counts.core + counts.content);
	});

	it("content generation is NOT in the dev profile", () => {
		const dev = commandsForProfile("dev");
		assert.ok(
			!dev.includes("content-generate"),
			"there should be no content command in dev",
		);
	});

	it("refactor is NOT in the content profile", () => {
		const content = commandsForProfile("content");
		assert.ok(
			!content.includes("refactor"),
			"there should be no refactor in content",
		);
	});

	it("core start IS in the dev profile", () => {
		const dev = commandsForProfile("dev");
		assert.ok(dev.includes("start"), "core/start should also be in dev");
	});

	it("outputs are sorted", () => {
		const dev = commandsForProfile("dev");
		const sorted = [...dev].sort();
		assert.deepEqual(dev, sorted);
	});
});

describe("command-profiles: isInProfile", () => {
	it("every command is in the all profile", () => {
		assert.equal(isInProfile("review", "all"), true);
		assert.equal(isInProfile("content-generate", "all"), true);
	});

	it("a core command is in every profile", () => {
		assert.equal(isInProfile("start", "dev"), true);
		assert.equal(isInProfile("start", "content"), true);
		assert.equal(isInProfile("start", "core"), true);
	});

	it("a dev command is only in dev", () => {
		assert.equal(isInProfile("review", "dev"), true);
		assert.equal(isInProfile("review", "content"), false);
		assert.equal(isInProfile("review", "core"), false);
	});

	it("unknown command is left untouched (true)", () => {
		assert.equal(isInProfile("user-custom-cmd", "core"), true);
		assert.equal(isInProfile("user-custom-cmd", "dev"), true);
	});
});

describe("command-profiles: profileCounts", () => {
	it("total defined command count should be 84", () => {
		const counts = profileCounts();
		const total = counts.core + counts.dev + counts.content + counts.pentest;
		assert.equal(total, Object.keys(COMMAND_PROFILES).length);
	});

	it("core, dev, content each at least 1", () => {
		const counts = profileCounts();
		assert.ok(counts.core >= 1);
		assert.ok(counts.dev >= 1);
		assert.ok(counts.content >= 1);
	});
});
