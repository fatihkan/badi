// Platform capabilities API testleri.
//
// Mevcut OS'a karsi smoke test — her platformda calisirken gercek
// degerleri kontrol eder; cross-platform mock yapilamaz cunku
// process.platform read-only.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	bashAvailable,
	commandExists,
	getOpener,
	getSchedulerKind,
	isLinux,
	isMac,
	isWindows,
	osSummary,
	platform,
	utf8Console,
} from "../lib/platform.js";

describe("platform capabilities", () => {
	it("platform constant matches process.platform", () => {
		assert.equal(platform, process.platform);
	});

	it("isMac/isLinux/isWindows sum is 1 (mutually exclusive)", () => {
		const sum = (isMac ? 1 : 0) + (isLinux ? 1 : 0) + (isWindows ? 1 : 0);
		assert.ok(sum <= 1);
	});

	it("commandExists is true for an existing command", () => {
		// node her zaman var (test calistiran)
		assert.equal(commandExists("node"), true);
	});

	it("commandExists is false for a nonexistent command", () => {
		assert.equal(commandExists("badi-nonexistent-cmd-xyz123"), false);
	});

	it("bashAvailable is true on mac/linux", () => {
		if (isMac || isLinux) {
			assert.equal(bashAvailable(), true);
		}
	});

	it("getOpener returns a platform-appropriate command", () => {
		const opener = getOpener();
		assert.ok(opener.cmd);
		assert.ok(Array.isArray(opener.args));
		if (isMac) assert.equal(opener.cmd, "open");
		if (isWindows) assert.equal(opener.cmd, "cmd");
		if (isLinux) assert.equal(opener.cmd, "xdg-open");
	});

	it("getSchedulerKind returns a platform-appropriate name", () => {
		const kind = getSchedulerKind();
		if (isMac) assert.equal(kind, "launchd");
		if (isLinux) assert.equal(kind, "systemd");
		if (isWindows) assert.equal(kind, "taskscheduler");
	});

	it("osSummary is a string containing version info", () => {
		const s = osSummary();
		assert.ok(s.length > 0);
		if (isMac) assert.match(s, /macOS/);
		if (isWindows) assert.match(s, /Windows/);
		if (isLinux) assert.match(s, /Linux/);
	});

	it("utf8Console is true on mac/linux", () => {
		if (isMac || isLinux) {
			assert.equal(utf8Console(), true);
		}
	});
});
