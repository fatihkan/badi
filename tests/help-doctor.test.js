// Help-doctor regression test.
//
// This test verifies that there is no help-drift across all lib/commands/*.js
// files: every subcommand and flag accepted by the parser must appear in the
// --help output shown to the user.
//
// If drift appears: either update the help text, or if it's a legitimate false positive
// add it to .claude/help-doctor.allow.json with a 'why' explanation.

import assert from "node:assert/strict";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { auditFiles, detectDrift, loadAllowlist } from "../lib/help-doctor.js";

const REPO = join(import.meta.dirname, "..");
const COMMANDS_DIR = join(REPO, "lib", "commands");
const ALLOWLIST = join(REPO, ".claude", "help-doctor.allow.json");

function listCommandFiles() {
	return readdirSync(COMMANDS_DIR)
		.filter((f) => f.endsWith(".js"))
		.map((f) => join(COMMANDS_DIR, f));
}

describe("help-doctor: full repo audit", () => {
	it("all lib/commands/*.js files are drift-free", () => {
		const files = listCommandFiles();
		const drift = auditFiles(files, { allowlistPath: ALLOWLIST });
		if (drift.length > 0) {
			const summary = drift
				.map((d) => {
					const parts = [];
					if (d.missingSubs.length)
						parts.push(`subs: ${d.missingSubs.join(", ")}`);
					if (d.missingFlags.length)
						parts.push(`flags: ${d.missingFlags.join(", ")}`);
					return `  ${d.file}\n    ${parts.join("\n    ")}`;
				})
				.join("\n");
			assert.fail(
				`Help-drift detected (${drift.length} files):\n${summary}\n\n` +
					"Update the help text or add it to .claude/help-doctor.allow.json.",
			);
		}
	});

	it("allowlist file is valid JSON and in the expected format", () => {
		const allow = loadAllowlist(ALLOWLIST);
		assert.equal(typeof allow, "object");
		// Each entry must contain a subs/flags array (a string array)
		for (const [file, entry] of Object.entries(allow)) {
			if (file.startsWith("_")) continue; // _description / _rules
			if (entry.subs)
				assert.ok(Array.isArray(entry.subs), `${file}.subs should be an array`);
			if (entry.flags)
				assert.ok(
					Array.isArray(entry.flags),
					`${file}.flags should be an array`,
				);
		}
	});
});

describe("help-doctor: detectDrift unit", () => {
	const TMP = join(import.meta.dirname, ".test-tmp-help");

	function withTmp(name, content, fn) {
		if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });
		const path = join(TMP, name);
		writeFileSync(path, content);
		try {
			return fn(path);
		} finally {
			rmSync(path);
		}
	}

	it("reports an undocumented subcommand", () => {
		const src = `
			export function runFoo(args) {
				if (args[0] === "--help") {
					console.log("badi foo init  Init");
					return;
				}
				switch (args[0]) {
					case "init": return doInit();
					case "secret": return doSecret();  // <- help'te yok
				}
			}
		`;
		withTmp("foo.js", src, (path) => {
			const drift = detectDrift(path);
			assert.ok(
				drift.missingSubs.includes("secret"),
				"secret should be reported",
			);
			assert.ok(!drift.missingSubs.includes("init"));
		});
	});

	it("reports an undocumented flag", () => {
		const src = `
			export function runBar(args) {
				if (args[0] === "--help") {
					console.log("badi bar --foo  Foo");
					return;
				}
				const foo = args.includes("--foo");
				const baz = args.includes("--baz");  // <- help'te yok
			}
		`;
		withTmp("bar.js", src, (path) => {
			const drift = detectDrift(path);
			assert.ok(drift.missingFlags.includes("--baz"));
			assert.ok(!drift.missingFlags.includes("--foo"));
		});
	});

	it("allowSubs/allowFlags prevent reporting", () => {
		const src = `
			export function runQux(args) {
				switch (args[0]) {
					case "alias": return doAlias();
				}
				const x = args.includes("--internal");
			}
		`;
		withTmp("qux.js", src, (path) => {
			const drift = detectDrift(path, {
				allowSubs: new Set(["alias"]),
				allowFlags: new Set(["--internal"]),
			});
			assert.equal(drift.missingSubs.length, 0);
			assert.equal(drift.missingFlags.length, 0);
		});
	});

	it("does not mistake flags defined in a static flag list for parser flags (completion.js pattern)", () => {
		const src = `
			export function getCommands() {
				return { init: { flags: ["--internal-only", "--undocumented"] } };
			}
		`;
		withTmp("comp.js", src, (path) => {
			const drift = detectDrift(path);
			// These flags are not in an arg-parsing context, so there should be no drift
			assert.equal(drift.missingFlags.length, 0);
		});
	});

	it("CONTROL_KEYWORDS (--help, -h) are not included in drift", () => {
		const src = `
			export function runHi(args) {
				if (args[0] === "--help") {
					console.log("badi hi <isim>");
					return;
				}
			}
		`;
		withTmp("hi.js", src, (path) => {
			const drift = detectDrift(path);
			assert.equal(drift.missingFlags.length, 0);
		});
	});

	// Cleanup TMP dir
	it("cleanup", () => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	});
});
