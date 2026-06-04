import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = join(__dirname, "..", "bin", "badi.js");

function run(args, opts = {}) {
	return execFileSync("node", [BIN, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		stdio: opts.stdio || "pipe",
		cwd: opts.cwd,
	});
}

let tmp;
beforeEach(() => {
	tmp = mkdtempSync(join(tmpdir(), "badi-tasarim-"));
});
afterEach(() => {
	rmSync(tmp, { recursive: true, force: true });
});

describe("design: --help", () => {
	it("help text lists the subcommands", () => {
		const out = run(["design", "--help"]);
		assert.match(out, /Visual Identity/);
		assert.match(out, /init/);
		assert.match(out, /lint/);
		assert.match(out, /export/);
		assert.match(out, /show/);
	});

	it("a call with no arguments triggers --help", () => {
		const out = run(["design"]);
		assert.match(out, /Visual Identity/);
	});

	it("the example name list appears", () => {
		const out = run(["design", "--help"]);
		assert.match(out, /paws-and-paths/);
		assert.match(out, /atmospheric-glass/);
		assert.match(out, /totality-festival/);
	});
});

describe("design: init", () => {
	it("writes DESIGN.md to the default path", () => {
		run(["design", "init"], { cwd: tmp });
		const target = join(tmp, ".claude", "workspace", "DESIGN.md");
		assert.ok(existsSync(target));
		const content = readFileSync(target, "utf-8");
		assert.match(content, /name: My Brand/);
		assert.match(content, /colors:/);
		assert.match(content, /typography:/);
	});

	it("writes to a custom path with --out", () => {
		run(["design", "init", "--out", "custom/DESIGN.md"], { cwd: tmp });
		assert.ok(existsSync(join(tmp, "custom", "DESIGN.md")));
	});

	it("rejects an existing file without --force", () => {
		const target = join(tmp, ".claude", "workspace", "DESIGN.md");
		mkdirSync(dirname(target), { recursive: true });
		writeFileSync(target, "# existing");
		assert.throws(
			() => run(["design", "init"], { cwd: tmp }),
			/File already exists/,
		);
	});

	it("overwrites an existing file with --force", () => {
		const target = join(tmp, ".claude", "workspace", "DESIGN.md");
		mkdirSync(dirname(target), { recursive: true });
		writeFileSync(target, "# existing");
		run(["design", "init", "--force"], { cwd: tmp });
		const content = readFileSync(target, "utf-8");
		assert.match(content, /My Brand/);
	});

	it("--example paws-and-paths writes a stub", () => {
		run(["design", "init", "--example", "paws-and-paths"], { cwd: tmp });
		const target = join(tmp, ".claude", "workspace", "DESIGN.md");
		const content = readFileSync(target, "utf-8");
		assert.match(content, /paws-and-paths/);
	});

	it("invalid --example errors", () => {
		assert.throws(
			() => run(["design", "init", "--example", "no-such-thing"], { cwd: tmp }),
			/Unknown example/,
		);
	});
});

describe("design: show", () => {
	beforeEach(() => {
		run(["design", "init"], { cwd: tmp });
	});

	it("--tokens prints only the frontmatter", () => {
		const out = run(["design", "show", "--tokens"], { cwd: tmp });
		assert.match(out, /name: My Brand/);
		assert.match(out, /colors:/);
		// body headings should not appear
		assert.doesNotMatch(out, /## Overview/);
	});

	it("--prose prints only the markdown body", () => {
		const out = run(["design", "show", "--prose"], { cwd: tmp });
		assert.match(out, /Visual Identity/);
		assert.match(out, /## Overview/);
		// frontmatter token'lari gorunmemeli
		assert.doesNotMatch(out, /baseSize:/);
	});

	it("prints both tokens and prose when no flag is given", () => {
		const out = run(["design", "show"], { cwd: tmp });
		assert.match(out, /Tokens \(frontmatter\)/);
		assert.match(out, /Rationale \(prose\)/);
	});

	it("errors when DESIGN.md is missing", () => {
		const fresh = mkdtempSync(join(tmpdir(), "badi-tasarim-fresh-"));
		try {
			assert.throws(
				() => run(["design", "show"], { cwd: fresh }),
				/No DESIGN\.md/,
			);
		} finally {
			rmSync(fresh, { recursive: true, force: true });
		}
	});
});

describe("design: export validation", () => {
	beforeEach(() => {
		run(["design", "init"], { cwd: tmp });
	});

	it("errors when --format is missing", () => {
		assert.throws(
			() => run(["design", "export"], { cwd: tmp }),
			/--format must be specified/,
		);
	});

	it("invalid --format errors", () => {
		assert.throws(
			() => run(["design", "export", "--format", "scss"], { cwd: tmp }),
			/Invalid format/,
		);
	});
});

describe("design: unknown subcommand", () => {
	it("shows an error + help suggestion", () => {
		assert.throws(() => run(["design", "blah"]), /Unknown subcommand/);
	});
});

describe("design: --help includes the new flags", () => {
	it("help introduces the --write flag", () => {
		const out = run(["design", "--help"]);
		assert.match(out, /--write/);
		assert.match(out, /instead of stdout/);
	});

	it("--out description clarifies it is the DESIGN.md path", () => {
		const out = run(["design", "--help"]);
		assert.match(out, /DESIGN\.md file path/);
	});
});
