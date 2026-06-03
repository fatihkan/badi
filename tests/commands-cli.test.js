// commands CLI birim testleri — paths, migrate, applyProfile, route.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
	applyProfile,
	listMarkdownFiles,
	migrateToVault,
	paths,
	readProfileState,
	writeProfileState,
} from "../lib/commands/commands.js";
import {
	buildCommandHint,
	buildCommandIndex,
	indexCommandFile,
	routePrompt,
} from "../lib/skills-router.js";

let tmp;

beforeEach(() => {
	tmp = mkdtempSync(join(tmpdir(), "badi-cmds-"));
	mkdirSync(join(tmp, ".claude", "commands"), { recursive: true });
});

afterEach(() => {
	rmSync(tmp, { recursive: true, force: true });
});

function seedCommands(dir, names) {
	for (const n of names) {
		writeFileSync(
			join(dir, `${n}.md`),
			`${n} komutu icin kisa aciklama.\n\n# ${n}\nicerik.\n`,
		);
	}
}

describe("commands.paths", () => {
	it("vault, active, state dogru turetir", () => {
		const p = paths("/foo");
		assert.equal(p.vault, "/foo/.claude/commands-vault");
		assert.equal(p.active, "/foo/.claude/commands");
		assert.equal(p.state, "/foo/.claude/commands.profile.json");
	});
});

describe("commands.migrateToVault", () => {
	it("commands/ icerigini vault'a kopyalar", () => {
		const active = join(tmp, ".claude", "commands");
		const vault = join(tmp, ".claude", "commands-vault");
		seedCommands(active, ["start", "review", "content-generate"]);

		const r = migrateToVault(active, vault);
		assert.equal(r.migrated, 3);
		assert.equal(r.skipped, 0);
		assert.deepEqual(listMarkdownFiles(vault).sort(), [
			"content-generate",
			"review",
			"start",
		]);
	});

	it("ikinci migrate skip eder (vault canonical)", () => {
		const active = join(tmp, ".claude", "commands");
		const vault = join(tmp, ".claude", "commands-vault");
		seedCommands(active, ["start"]);
		migrateToVault(active, vault);

		// Yeni komut ekle, tekrar migrate
		seedCommands(active, ["sync"]);
		const r = migrateToVault(active, vault);
		assert.equal(r.migrated, 1);
		assert.equal(r.skipped, 1);
	});
});

describe("commands.applyProfile", () => {
	it("'content' profili dev komutlarini kaldirir", () => {
		const active = join(tmp, ".claude", "commands");
		const vault = join(tmp, ".claude", "commands-vault");
		seedCommands(active, ["start", "review", "content-generate", "refactor"]);
		migrateToVault(active, vault);

		const r = applyProfile(vault, active, "content");
		// start core, content-generate content -> kalir
		// review dev, refactor dev -> kaldirilir
		assert.deepEqual(r.removed, ["refactor", "review"]);
		const remaining = listMarkdownFiles(active).sort();
		assert.deepEqual(remaining, ["content-generate", "start"]);
	});

	it("'all' profili tum vault'u getirir", () => {
		const active = join(tmp, ".claude", "commands");
		const vault = join(tmp, ".claude", "commands-vault");
		seedCommands(active, ["start", "review", "content-generate"]);
		migrateToVault(active, vault);

		// content profilini once uygula (silinsin)
		applyProfile(vault, active, "content");
		assert.ok(!listMarkdownFiles(active).includes("review"));

		// all geri getir
		const r = applyProfile(vault, active, "all");
		assert.ok(r.added.includes("review"));
		assert.equal(listMarkdownFiles(active).length, 3);
	});

	it("bilinmeyen kullanici komutuna dokunmaz", () => {
		const active = join(tmp, ".claude", "commands");
		const vault = join(tmp, ".claude", "commands-vault");
		seedCommands(active, ["start", "my-custom-cmd"]);
		migrateToVault(active, vault);

		applyProfile(vault, active, "dev");
		// my-custom-cmd profil haritasinda yok -> kalir
		assert.ok(listMarkdownFiles(active).includes("my-custom-cmd"));
	});
});

describe("commands.readProfileState / writeProfileState", () => {
	it("yoksa default 'all' dondurur", () => {
		const statePath = join(tmp, ".claude", "commands.profile.json");
		const s = readProfileState(statePath);
		assert.equal(s.profile, "all");
	});

	it("yazdiklarini geri okur", () => {
		const statePath = join(tmp, ".claude", "commands.profile.json");
		writeProfileState(statePath, "dev");
		const s = readProfileState(statePath);
		assert.equal(s.profile, "dev");
		assert.ok(s.updatedAt);
	});
});

describe("skills-router: indexCommandFile + buildCommandIndex", () => {
	it("ilk satiri description olarak indexler", () => {
		const file = join(tmp, "review.md");
		writeFileSync(
			file,
			"Derin kod incelemesi komutu. Guvenlik ve performans analizi.\n\n# review\n",
		);
		const idx = indexCommandFile(file);
		assert.equal(idx.name, "review");
		assert.ok(idx.description.includes("Derin"));
		assert.ok(
			idx.descriptionTokens.has("guvenlik") ||
				idx.descriptionTokens.has("performans"),
		);
	});

	it("buildCommandIndex tum .md dosyalari indexler", () => {
		const dir = join(tmp, "vault");
		mkdirSync(dir);
		writeFileSync(join(dir, "review.md"), "Kod review komutu.\n");
		writeFileSync(join(dir, "deploy.md"), "Dagitim komutu.\n");
		writeFileSync(join(dir, "not-md.txt"), "ignored");
		const idx = buildCommandIndex(dir);
		assert.equal(idx.length, 2);
		assert.deepEqual(idx.map((i) => i.name).sort(), ["deploy", "review"]);
	});

	it("routePrompt eslesen komutlari skorlar", () => {
		const dir = join(tmp, "vault");
		mkdirSync(dir);
		writeFileSync(
			join(dir, "review.md"),
			"Derin kod incelemesi guvenlik performans mimari analiz.\n",
		);
		writeFileSync(
			join(dir, "content-generate.md"),
			"Sosyal medya icerik uretme komutu instagram twitter.\n",
		);
		const index = buildCommandIndex(dir);
		const matched = routePrompt("Bu PR icin guvenlik analizi yap", index, {
			minScore: 1,
			top: 5,
		});
		assert.ok(matched.length >= 1);
		assert.equal(matched[0].name, "review");
	});

	it("buildCommandHint kisa hint blob uretir", () => {
		const dir = join(tmp, "vault");
		mkdirSync(dir);
		writeFileSync(join(dir, "review.md"), "Kod review komutu.\n");
		const index = buildCommandIndex(dir);
		const matched = [{ name: "review", score: 5 }];
		const blob = buildCommandHint(matched, index);
		assert.ok(blob.includes("/review"));
		assert.ok(blob.includes("Kod review"));
		// Hint kisa olmali: <500 byte tek komut icin
		assert.ok(blob.length < 500);
	});
});
