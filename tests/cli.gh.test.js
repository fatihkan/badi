// `badi gh sync` testleri (#11 MVP).
// Saf fonksiyonlar (formatIssueLine, sectionForIssue, parseTaskBoard,
// mergeIssuesIntoTaskBoard) birim test edilir; gh CLI external bagimli
// so subprocess tests cover only the help + missing-taskboard path.

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
	it("p1-high -> Today", () => {
		assert.equal(sectionForIssue(issue(1, "x", ["priority:p1-high"])), "Today");
	});
	it("p2-medium -> This Week", () => {
		assert.equal(
			sectionForIssue(issue(2, "x", ["priority:p2-medium"])),
			"This Week",
		);
	});
	it("p3-large -> Backlog", () => {
		assert.equal(
			sectionForIssue(issue(3, "x", ["priority:p3-large"])),
			"Backlog",
		);
	});
	it("p4-future -> Backlog", () => {
		assert.equal(
			sectionForIssue(issue(4, "x", ["priority:p4-future"])),
			"Backlog",
		);
	});
	it("no label -> Backlog", () => {
		assert.equal(sectionForIssue(issue(5, "x", [])), "Backlog");
	});
	it("multiple labels: the first priority wins", () => {
		assert.equal(
			sectionForIssue(issue(6, "x", ["bug", "priority:p2-medium", "ui"])),
			"This Week",
		);
	});
});

describe("parseTaskBoard", () => {
	it("recognizes 4 sections", () => {
		const content = `# Task Board

## Today
- [ ] (no tasks yet)

## This Week
- [ ] (no tasks yet)

## Backlog
- [ ] (no tasks yet)

## Done
- (none yet)
`;
		const { sections, order } = parseTaskBoard(content);
		assert.deepEqual(order, ["Today", "This Week", "Backlog", "Done"]);
		assert.equal(sections.Today.length, 2); // line + blank
	});

	it("accepts CRLF line endings", () => {
		const content = "## Today\r\n- [ ] item\r\n\r\n## This Week\r\n- [ ] x\r\n";
		const { sections } = parseTaskBoard(content);
		assert.ok(sections.Today.some((l) => l.includes("item")));
		assert.ok(sections["This Week"].some((l) => l.includes("x")));
	});
});

describe("mergeIssuesIntoTaskBoard", () => {
	const emptyBoard = `# Task Board

## Today
- [ ] (no tasks yet)

## This Week
- [ ] (no tasks yet)

## Backlog
- [ ] (no tasks yet)

## Done
- (none yet)
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
		// placeholder removed in Today; in the other two "(no tasks yet)"
		// remains. Done uses a different format ("(none yet)").
		assert.equal((newContent.match(/\(no tasks yet\)/g) || []).length, 2);
		assert.match(newContent, /\(none yet\)/);
	});

	it("an already-existing #N is skipped (idempotent)", () => {
		const board = `# Task Board

## Today
- [ ] #1 (P1) old line

## This Week
- [ ] (no tasks yet)

## Backlog
- [ ] (no tasks yet)

## Done
- (none yet)
`;
		const issues = [issue(1, "yeni baslik", ["priority:p1-high"])];
		const { added, skipped } = mergeIssuesIntoTaskBoard(board, issues);
		assert.equal(added.length, 0);
		assert.equal(skipped.length, 1);
		assert.equal(skipped[0].number, 1);
	});

	it("a manual task is preserved, not deleted when an issue is added", () => {
		const board = `# Task Board

## Today
- [ ] manuel: README guncelle

## This Week
- [ ] (no tasks yet)

## Backlog
- [ ] (no tasks yet)

## Done
- (none yet)
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
		// Today -> placeholder yok
		assert.ok(
			!sections.Today.some((l) => /\(no tasks yet\)/.test(l)),
			"placeholder left in the Today section",
		);
		// This Week -> placeholder still present
		assert.ok(
			sections["This Week"].some((l) => /\(no tasks yet\)/.test(l)),
			"This Week placeholder missing",
		);
	});
});

describe("detectRepo (regex)", () => {
	// Birim test: spawnSync git'i invoke etmek yerine private helper'i
	// we call it with a temp directory that has a git remote, for regex verification.
	// Burada sadece pure regex davranisini test edebilen bir wrapper yapilamadigi
	// to test the url regex separately from the main function's behavior
	// gerekirse regex export edilebilir. Su an detectRepo'nun acik branchlarini
	// instead of verifying via direct input-variation tests, we check
	// the function's accept-internal branches for the regex match.
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
