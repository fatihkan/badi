// Help-doctor regression test.
//
// Bu test, lib/commands/*.js dosyalarinin tamaminda help-drift olmadigini
// dogrular: parser tarafindan kabul edilen her subcommand ve flag, kullaniciya
// gosterilen --help ciktilarinda gozukmeli.
//
// Drift cikarsa: ya help text'i guncelle ya da meşru false-positive ise
// .claude/help-doctor.allow.json'a 'why' aciklamasiyla ekle.

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
	it("tum lib/commands/*.js dosyalari drift-free", () => {
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
				`Help-drift tespit edildi (${drift.length} dosya):\n${summary}\n\n` +
					"Help text'i guncelle veya .claude/help-doctor.allow.json'a ekle.",
			);
		}
	});

	it("allowlist dosyasi gecerli JSON ve beklenen formatta", () => {
		const allow = loadAllowlist(ALLOWLIST);
		assert.equal(typeof allow, "object");
		// Her entry subs/flags array (string array) icermeli
		for (const [file, entry] of Object.entries(allow)) {
			if (file.startsWith("_")) continue; // _description / _rules
			if (entry.subs)
				assert.ok(Array.isArray(entry.subs), `${file}.subs array olmali`);
			if (entry.flags)
				assert.ok(Array.isArray(entry.flags), `${file}.flags array olmali`);
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

	it("dokumante edilmemis subcommand'i raporlar", () => {
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
			assert.ok(drift.missingSubs.includes("secret"), "secret raporlanmali");
			assert.ok(!drift.missingSubs.includes("init"));
		});
	});

	it("dokumante edilmemis flag'i raporlar", () => {
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

	it("allowSubs/allowFlags raporlamayi engeller", () => {
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

	it("static flag listesinde tanimli flag'leri parser flag'i sanmaz (completion.js pattern)", () => {
		const src = `
			export function getCommands() {
				return { init: { flags: ["--internal-only", "--undocumented"] } };
			}
		`;
		withTmp("comp.js", src, (path) => {
			const drift = detectDrift(path);
			// Bu flag'ler arg-parsing context'inde olmadigi icin drift olmamali
			assert.equal(drift.missingFlags.length, 0);
		});
	});

	it("CONTROL_KEYWORDS (--help, -h) drift'e dahil edilmez", () => {
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
