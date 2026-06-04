// `badi gh sync` testleri (#11 MVP).
// Saf fonksiyonlar (formatIssueLine, sectionForIssue, parseTaskBoard,
// mergeIssuesIntoTaskBoard) birim test edilir; gh CLI external bagimli
// oldugu icin subprocess testleri sadece help + missing-taskboard yolu.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
	detectRepo,
	formatIssueLine,
	mergeIssuesIntoTaskBoard,
	parseTaskBoard,
	sectionForIssue,
} from "../lib/commands/gh.js";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const REPO_ROOT = resolve(__dirname, "..");
const BADI = join(REPO_ROOT, "bin", "badi.js");

const issue = (number, title, labels = []) => ({
	number,
	title,
	labels: labels.map((name) => ({ name })),
	state: "OPEN",
});

describe("formatIssueLine", () => {
	it("shows the P1 label as the 'P1' abbreviation", () => {
		const line = formatIssueLine(
			issue(137, "subLint test", ["priority:p1-high"]),
		);
		assert.equal(line, "- [ ] #137 (P1) subLint test");
	});

	it("writes the title directly when there is no label", () => {
		const line = formatIssueLine(issue(42, "no label", []));
		assert.equal(line, "- [ ] #42 no label");
	});

	it("shows the P3 label as the 'P3' abbreviation", () => {
		const line = formatIssueLine(
			issue(11, "feat: gh", ["enhancement", "priority:p3-large"]),
		);
		assert.equal(line, "- [ ] #11 (P3) feat: gh");
	});
});

describe("sectionForIssue", () => {
	it("p1-high -> Bugun", () => {
		assert.equal(sectionForIssue(issue(1, "x", ["priority:p1-high"])), "Bugun");
	});
	it("p2-medium -> Bu Hafta", () => {
		assert.equal(
			sectionForIssue(issue(2, "x", ["priority:p2-medium"])),
			"Bu Hafta",
		);
	});
	it("p3-large -> Bekleyen Isler", () => {
		assert.equal(
			sectionForIssue(issue(3, "x", ["priority:p3-large"])),
			"Bekleyen Isler",
		);
	});
	it("p4-future -> Bekleyen Isler", () => {
		assert.equal(
			sectionForIssue(issue(4, "x", ["priority:p4-future"])),
			"Bekleyen Isler",
		);
	});
	it("no label -> Bekleyen Isler", () => {
		assert.equal(sectionForIssue(issue(5, "x", [])), "Bekleyen Isler");
	});
	it("multiple labels: the first priority wins", () => {
		assert.equal(
			sectionForIssue(issue(6, "x", ["bug", "priority:p2-medium", "ui"])),
			"Bu Hafta",
		);
	});
});

describe("parseTaskBoard", () => {
	it("recognizes 4 sections", () => {
		const content = `# Gorev Panosu

## Bugun
- [ ] (henuz gorev yok)

## Bu Hafta
- [ ] (henuz gorev yok)

## Bekleyen Isler
- [ ] (henuz gorev yok)

## Tamamlanan
- (henuz yok)
`;
		const { sections, order } = parseTaskBoard(content);
		assert.deepEqual(order, [
			"Bugun",
			"Bu Hafta",
			"Bekleyen Isler",
			"Tamamlanan",
		]);
		assert.equal(sections.Bugun.length, 2); // satir + bos
	});

	it("accepts CRLF line endings", () => {
		const content = "## Bugun\r\n- [ ] item\r\n\r\n## Bu Hafta\r\n- [ ] x\r\n";
		const { sections } = parseTaskBoard(content);
		assert.ok(sections.Bugun.some((l) => l.includes("item")));
		assert.ok(sections["Bu Hafta"].some((l) => l.includes("x")));
	});
});

describe("mergeIssuesIntoTaskBoard", () => {
	const emptyBoard = `# Gorev Panosu

## Bugun
- [ ] (henuz gorev yok)

## Bu Hafta
- [ ] (henuz gorev yok)

## Bekleyen Isler
- [ ] (henuz gorev yok)

## Tamamlanan
- (henuz yok)
`;

	it("adds a new issue to an empty board", () => {
		const issues = [issue(1, "important", ["priority:p1-high"])];
		const { newContent, added, skipped } = mergeIssuesIntoTaskBoard(
			emptyBoard,
			issues,
		);
		assert.equal(added.length, 1);
		assert.equal(skipped.length, 0);
		assert.match(newContent, /#1 \(P1\) important/);
		// Bugun'de placeholder kaldirildi; diger ikisinde "(henuz gorev yok)"
		// hala duruyor. Tamamlanan ayri format kullanir ("(henuz yok)").
		assert.equal((newContent.match(/\(henuz gorev yok\)/g) || []).length, 2);
		assert.match(newContent, /\(henuz yok\)/);
	});

	it("an already-existing #N is skipped (idempotent)", () => {
		const board = `# Gorev Panosu

## Bugun
- [ ] #1 (P1) old line

## Bu Hafta
- [ ] (henuz gorev yok)

## Bekleyen Isler
- [ ] (henuz gorev yok)

## Tamamlanan
- (henuz yok)
`;
		const issues = [issue(1, "yeni baslik", ["priority:p1-high"])];
		const { added, skipped } = mergeIssuesIntoTaskBoard(board, issues);
		assert.equal(added.length, 0);
		assert.equal(skipped.length, 1);
		assert.equal(skipped[0].number, 1);
	});

	it("a manual task is preserved, not deleted when an issue is added", () => {
		const board = `# Gorev Panosu

## Bugun
- [ ] manuel: README guncelle

## Bu Hafta
- [ ] (henuz gorev yok)

## Bekleyen Isler
- [ ] (henuz gorev yok)

## Tamamlanan
- (henuz yok)
`;
		const issues = [issue(42, "yeni p1", ["priority:p1-high"])];
		const { newContent, added } = mergeIssuesIntoTaskBoard(board, issues);
		assert.equal(added.length, 1);
		assert.match(newContent, /manuel: README guncelle/);
		assert.match(newContent, /#42 \(P1\) yeni p1/);
	});

	it("the same issues are found when the generated content is parsed again", () => {
		const issues = [
			issue(1, "p1 task", ["priority:p1-high"]),
			issue(2, "p2 task", ["priority:p2-medium"]),
			issue(3, "p3 task", ["priority:p3-large"]),
		];
		const { newContent } = mergeIssuesIntoTaskBoard(emptyBoard, issues);
		// Tekrar uygulanirsa hicbir sey eklememeli
		const second = mergeIssuesIntoTaskBoard(newContent, issues);
		assert.equal(second.added.length, 0);
		assert.equal(second.skipped.length, 3);
	});

	it("removes the placeholder line only if an issue was added to that section", () => {
		const issues = [issue(7, "only-bugun", ["priority:p1-high"])];
		const { newContent } = mergeIssuesIntoTaskBoard(emptyBoard, issues);
		const { sections } = parseTaskBoard(newContent);
		// Bugun -> placeholder yok
		assert.ok(
			!sections.Bugun.some((l) => /\(henuz gorev yok\)/.test(l)),
			"Bugun bolumunde placeholder kalmis",
		);
		// Bu Hafta -> placeholder hala var
		assert.ok(
			sections["Bu Hafta"].some((l) => /\(henuz gorev yok\)/.test(l)),
			"Bu Hafta placeholder eksik",
		);
	});
});

describe("detectRepo (regex)", () => {
	// Birim test: spawnSync git'i invoke etmek yerine private helper'i
	// regex dogrulamasi icin geçici git remote'lu bir dizin ile cagiriyoruz.
	// Burada sadece pure regex davranisini test edebilen bir wrapper yapilamadigi
	// icin url regex'ini ana fonksiyonun davranisindan ayri olarak test etmek
	// gerekirse regex export edilebilir. Su an detectRepo'nun acik branchlarini
	// dogrudan input variation testleri ile dogrulamak yerine, fonksiyonun
	// regex match'i icin kabul dahili branch'lari kontrol ediyoruz.
	function tryMatch(url) {
		const m = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
		return m ? `${m[1]}/${m[2]}` : null;
	}

	it("SSH with .git suffix", () => {
		assert.equal(tryMatch("git@github.com:fatihkan/badi.git"), "fatihkan/badi");
	});
	it("HTTPS with .git suffix", () => {
		assert.equal(
			tryMatch("https://github.com/fatihkan/badi.git"),
			"fatihkan/badi",
		);
	});
	it("HTTPS without .git", () => {
		assert.equal(tryMatch("https://github.com/fatihkan/badi"), "fatihkan/badi");
	});
	it("a name containing a hyphen and a digit", () => {
		assert.equal(
			tryMatch("https://github.com/foo-bar/my-repo-123.git"),
			"foo-bar/my-repo-123",
		);
	});
	it("trailing slash", () => {
		assert.equal(tryMatch("https://github.com/owner/repo/"), "owner/repo");
	});
	it("a non-github.com URL is null", () => {
		assert.equal(tryMatch("https://gitlab.com/x/y"), null);
	});
	it("detectRepo returns a string or null on a real call (smoke)", () => {
		const r = detectRepo(process.cwd());
		assert.ok(r === null || typeof r === "string");
	});
});

describe("badi gh: subprocess flow", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "badi-gh-test-"));
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("--help shows the help message", () => {
		const r = spawnSync("node", [BADI, "gh", "--help"], { encoding: "utf-8" });
		assert.equal(r.status, 0);
		assert.match(r.stdout, /badi gh sync/);
		assert.match(r.stdout, /TaskBoard/);
	});

	it("exit 1 when there is no TaskBoard", () => {
		const r = spawnSync("node", [BADI, "gh", "sync", "--dry-run"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 1);
		assert.match(r.stderr, /No TaskBoard/);
	});

	it("unknown subcommand exit 1 + help", () => {
		const r = spawnSync("node", [BADI, "gh", "bogus"], { encoding: "utf-8" });
		assert.equal(r.status, 1);
		assert.match(r.stderr, /Unknown subcommand/);
	});
});
