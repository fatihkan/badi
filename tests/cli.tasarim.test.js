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
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";

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

describe("tasarim: --help", () => {
	it("yardim metni alt komutlari listeler", () => {
		const out = run(["tasarim", "--help"]);
		assert.match(out, /Gorsel Kimlik/);
		assert.match(out, /init/);
		assert.match(out, /lint/);
		assert.match(out, /export/);
		assert.match(out, /show/);
	});

	it("argumansiz cagri --help'i tetikler", () => {
		const out = run(["tasarim"]);
		assert.match(out, /Gorsel Kimlik/);
	});

	it("ornek isim listesi gorunur", () => {
		const out = run(["tasarim", "--help"]);
		assert.match(out, /paws-and-paths/);
		assert.match(out, /atmospheric-glass/);
		assert.match(out, /totality-festival/);
	});
});

describe("tasarim: init", () => {
	it("varsayilan yola DESIGN.md yazar", () => {
		run(["tasarim", "init"], { cwd: tmp });
		const target = join(tmp, ".claude", "workspace", "DESIGN.md");
		assert.ok(existsSync(target));
		const content = readFileSync(target, "utf-8");
		assert.match(content, /name: My Brand/);
		assert.match(content, /colors:/);
		assert.match(content, /typography:/);
	});

	it("--out ile ozel yola yazar", () => {
		run(["tasarim", "init", "--out", "custom/DESIGN.md"], { cwd: tmp });
		assert.ok(existsSync(join(tmp, "custom", "DESIGN.md")));
	});

	it("var olan dosyada --force olmadan reddeder", () => {
		const target = join(tmp, ".claude", "workspace", "DESIGN.md");
		mkdirSync(dirname(target), { recursive: true });
		writeFileSync(target, "# existing");
		assert.throws(() => run(["tasarim", "init"], { cwd: tmp }), /Dosya zaten var/);
	});

	it("--force ile var olan dosyayi overwrite eder", () => {
		const target = join(tmp, ".claude", "workspace", "DESIGN.md");
		mkdirSync(dirname(target), { recursive: true });
		writeFileSync(target, "# existing");
		run(["tasarim", "init", "--force"], { cwd: tmp });
		const content = readFileSync(target, "utf-8");
		assert.match(content, /My Brand/);
	});

	it("--ornek paws-and-paths stub yazar", () => {
		run(["tasarim", "init", "--ornek", "paws-and-paths"], { cwd: tmp });
		const target = join(tmp, ".claude", "workspace", "DESIGN.md");
		const content = readFileSync(target, "utf-8");
		assert.match(content, /paws-and-paths/);
	});

	it("gecersiz --ornek hata verir", () => {
		assert.throws(
			() => run(["tasarim", "init", "--ornek", "no-such-thing"], { cwd: tmp }),
			/Bilinmeyen ornek/,
		);
	});
});

describe("tasarim: show", () => {
	beforeEach(() => {
		run(["tasarim", "init"], { cwd: tmp });
	});

	it("--tokens sadece frontmatter'i basar", () => {
		const out = run(["tasarim", "show", "--tokens"], { cwd: tmp });
		assert.match(out, /name: My Brand/);
		assert.match(out, /colors:/);
		// body baslıkları gorunmemeli
		assert.doesNotMatch(out, /## Overview/);
	});

	it("--prose sadece markdown body'i basar", () => {
		const out = run(["tasarim", "show", "--prose"], { cwd: tmp });
		assert.match(out, /Visual Identity/);
		assert.match(out, /## Overview/);
		// frontmatter token'lari gorunmemeli
		assert.doesNotMatch(out, /baseSize:/);
	});

	it("flag yoksa hem token hem prose'u basar", () => {
		const out = run(["tasarim", "show"], { cwd: tmp });
		assert.match(out, /Tokens \(frontmatter\)/);
		assert.match(out, /Rationale \(prose\)/);
	});

	it("DESIGN.md yoksa hata verir", () => {
		const fresh = mkdtempSync(join(tmpdir(), "badi-tasarim-fresh-"));
		try {
			assert.throws(() => run(["tasarim", "show"], { cwd: fresh }), /DESIGN\.md yok/);
		} finally {
			rmSync(fresh, { recursive: true, force: true });
		}
	});
});

describe("tasarim: export validation", () => {
	beforeEach(() => {
		run(["tasarim", "init"], { cwd: tmp });
	});

	it("--format eksikse hata", () => {
		assert.throws(() => run(["tasarim", "export"], { cwd: tmp }), /--format belirtilmesi/);
	});

	it("gecersiz --format hata verir", () => {
		assert.throws(
			() => run(["tasarim", "export", "--format", "scss"], { cwd: tmp }),
			/Gecersiz format/,
		);
	});
});

describe("tasarim: bilinmeyen alt komut", () => {
	it("hata + yardim onerisi gosterir", () => {
		assert.throws(() => run(["tasarim", "blah"]), /Bilinmeyen alt komut/);
	});
});

describe("tasarim: --help yeni flag'lari icerir", () => {
	it("yardim --write flag'ini tanitir", () => {
		const out = run(["tasarim", "--help"]);
		assert.match(out, /--write/);
		assert.match(out, /stdout yerine/);
	});

	it("--out aciklamasi DESIGN.md yolu oldugunu netler", () => {
		const out = run(["tasarim", "--help"]);
		assert.match(out, /DESIGN\.md dosya yolu/);
	});
});
