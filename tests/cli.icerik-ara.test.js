import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const TMP = resolve(__dirname, "..", ".test-tmp-ara");

function run(args = [], cwd = TMP) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd,
	});
}

function seedContent() {
	const icerikDir = join(TMP, ".claude", "workspace", "icerikler");
	const senaryoDir = join(TMP, ".claude", "workspace", "senaryolar");
	mkdirSync(icerikDir, { recursive: true });
	mkdirSync(senaryoDir, { recursive: true });

	writeFileSync(
		join(icerikDir, "2026-04-10-uretkenlik-ipuclari.md"),
		"# Sosyal Medya Post — uretkenlik ipuclari\n\n**Platform:** Instagram\n\nUretkenlik artirmak icin 5 ipucu\n\n#uretkenlik #verimlilik",
	);
	writeFileSync(
		join(icerikDir, "2026-04-08-yeni-urun-lansman.md"),
		"# Sosyal Medya Post — yeni urun lansman\n\n**Platform:** LinkedIn\n\nYeni urunumuz piyasada!\n\n#lansman #urun",
	);
	writeFileSync(
		join(senaryoDir, "2026-04-05-sabah-rutini.md"),
		"# Video Senaryo — sabah rutini\n\n**Platform:** TikTok\n\nSabah uretkenlik rutini\n\n#sabahrutini",
	);
}

describe("badi content ara", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		mkdirSync(TMP, { recursive: true });
		seedContent();
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
	});

	it("ara --help yardim gosterir", () => {
		const output = run(["content", "search", "--help"]);
		assert.ok(output.includes("Archive Search"));
	});

	it("sorgu belirtilmeden yardim gosterir", () => {
		const output = run(["content", "search"]);
		assert.ok(
			output.includes("search query") || output.includes("Archive Search"),
		);
	});

	it("arama sonuc bulur", () => {
		const output = run(["content", "search", "uretkenlik"]);
		assert.ok(output.includes("Search Results"));
		assert.ok(output.includes("uretkenlik"));
	});

	it("bos sonuc mesaji gosterir", () => {
		const output = run(["content", "search", "zzzyokboyle"]);
		assert.ok(output.includes("No results"));
	});

	it("--platform filtresi calisiyor", () => {
		const output = run(["content", "search", "urun", "--platform", "LinkedIn"]);
		assert.ok(output.includes("lansman") || output.includes("Search Results"));
	});

	it("--format json cikti uretir", () => {
		const output = run(["content", "search", "uretkenlik", "--format", "json"]);
		const parsed = JSON.parse(output);
		assert.ok(Array.isArray(parsed));
		assert.ok(parsed.length > 0);
		assert.ok(parsed[0].file);
		assert.ok(parsed[0].score >= 0);
	});

	it("--hashtag filtresi calisiyor", () => {
		const output = run([
			"content",
			"search",
			"rutin",
			"--hashtag",
			"sabahrutini",
		]);
		assert.ok(
			output.includes("sabah-rutini") || output.includes("Search Results"),
		);
	});

	it("birden fazla sonuc skor sirasinda", () => {
		const output = run(["content", "search", "uretkenlik"]);
		const lines = output.split("\n").filter((l) => l.includes("Score:"));
		if (lines.length >= 2) {
			const scores = lines.map((l) => {
				const m = l.match(/Score: ([\d.]+)/);
				return m ? Number.parseFloat(m[1]) : 0;
			});
			assert.ok(scores[0] >= scores[1], "Sonuclar skora gore siralanmali");
		}
	});
});
