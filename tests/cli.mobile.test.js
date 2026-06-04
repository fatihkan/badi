import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, it } from "node:test";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) =>
	execFileSync("node", [BIN, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	}).trim();

describe("badi mobile", () => {
	it("shows help", () => {
		const out = run("mobile", "--help");
		assert.ok(out.includes("Mobile Development"));
		assert.ok(out.includes("badi mobile init"));
		assert.ok(out.includes("badi mobile build"));
	});

	it("shows help with no arguments", () => {
		const out = run("mobile");
		assert.ok(out.includes("Mobile Development"));
	});

	it("init errors without a project name", () => {
		assert.throws(() => run("mobile", "init"), { status: 1 });
	});

	it("init errors on an invalid framework", () => {
		assert.throws(() => run("mobile", "init", "myapp", "--framework", "xyz"), {
			status: 1,
		});
	});

	it("version bump errors on an invalid type", () => {
		assert.throws(() => run("mobile", "version", "bump", "xxxx"), {
			status: 1,
		});
	});

	it("build errors on an invalid platform", () => {
		assert.throws(() => run("mobile", "build", "windows"), { status: 1 });
	});

	it("release guide shows testflight", () => {
		const out = run("mobile", "release", "testflight");
		assert.ok(out.includes("TestFlight") || out.includes("Xcode"));
	});

	it("release guide shows play-internal", () => {
		const out = run("mobile", "release", "play-internal");
		assert.ok(out.includes("Play Console") || out.includes("AAB"));
	});

	it("release errors on an invalid target", () => {
		assert.throws(() => run("mobile", "release", "invalid"), { status: 1 });
	});

	it("assets icon guide shows", () => {
		const out = run("mobile", "assets", "icon");
		assert.ok(out.includes("iOS") || out.includes("Android"));
		assert.ok(out.includes("1024") || out.includes("512"));
	});

	it("assets splash guide shows", () => {
		const out = run("mobile", "assets", "splash");
		assert.ok(out.includes("Splash"));
	});

	it("assets screenshots guide shows", () => {
		const out = run("mobile", "assets", "screenshots");
		assert.ok(out.includes("Screenshot") || out.includes("iPhone"));
	});

	it("unknown command errors", () => {
		assert.throws(() => run("mobile", "invalid"), { status: 1 });
	});

	// v1.11+ yeni alt komutlar
	it("crash-setup rn + sentry guide shows", () => {
		const out = run("mobile", "crash-setup", "react-native", "sentry");
		assert.ok(out.includes("Sentry") || out.includes("sentry"));
		assert.ok(
			out.includes("@sentry/react-native") || out.includes("npm install"),
		);
	});

	it("crash-setup flutter + crashlytics guide shows", () => {
		const out = run("mobile", "crash-setup", "flutter", "crashlytics");
		assert.ok(out.includes("firebase") || out.includes("Firebase"));
	});

	it("crash-setup errors on an invalid framework", () => {
		assert.throws(() => run("mobile", "crash-setup", "xyz"), { status: 1 });
	});

	it("crash-setup errors on an invalid provider", () => {
		assert.throws(() => run("mobile", "crash-setup", "react-native", "xyz"), {
			status: 1,
		});
	});

	it("deeplink scheme guide shows", () => {
		const out = run("mobile", "deeplink", "myapp://");
		assert.ok(out.includes("Scheme") || out.includes("scheme"));
		assert.ok(out.includes("Info.plist") || out.includes("AndroidManifest"));
	});

	it("deeplink errors with no arguments", () => {
		assert.throws(() => run("mobile", "deeplink"), { status: 1 });
	});

	it("ota codepush guide shows", () => {
		const out = run("mobile", "ota", "codepush");
		assert.ok(out.includes("CodePush") || out.includes("codepush"));
		assert.ok(out.includes("appcenter") || out.includes("App Center"));
	});

	it("ota expo guide shows", () => {
		const out = run("mobile", "ota", "expo");
		assert.ok(out.includes("EAS") || out.includes("eas"));
		assert.ok(out.includes("expo-updates"));
	});

	it("ota errors on an invalid provider", () => {
		assert.throws(() => run("mobile", "ota", "unknown"), { status: 1 });
	});
});
