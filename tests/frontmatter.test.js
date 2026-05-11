// lib/frontmatter.js parseFrontmatter unit testleri (#137).
// badi-skills CI workflow'u bu dosyayi ana repo'dan curl ile cektigi icin
// regression koruma kritik. Aksi halde sessizce kirik schema validate olur.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseFrontmatter } from "../lib/frontmatter.js";

describe("parseFrontmatter: tipik kullanim", () => {
	it("frontmatter + body ayrimi", () => {
		const input = `---
name: example
version: 1.0
---

# Body

Some content.`;
		const { meta, body } = parseFrontmatter(input);
		assert.equal(meta.name, "example");
		assert.equal(meta.version, "1.0");
		assert.match(body, /^# Body/);
		assert.match(body, /Some content\./);
	});

	it("frontmatter olmadan tum icerigi body dondurur", () => {
		const input = "# Just a heading\n\nNo frontmatter here.";
		const { meta, body } = parseFrontmatter(input);
		assert.deepEqual(meta, {});
		assert.equal(body, input);
	});

	it("bos frontmatter", () => {
		const input = `---
---

Body only.`;
		const { meta, body } = parseFrontmatter(input);
		assert.deepEqual(meta, {});
		assert.equal(body, "Body only.");
	});

	it("kapatilmamis frontmatter tum icerigi body sayar", () => {
		// Acilmis ama --- ile kapatilmamis: orijinal icerik aynen donmeli
		const input = `---
name: broken

# This should be treated as raw content
`;
		const { meta, body } = parseFrontmatter(input);
		assert.deepEqual(meta, {});
		assert.equal(body, input);
	});
});

describe("parseFrontmatter: bicim toleransi", () => {
	it("CRLF satir sonu (Windows core.autocrlf)", () => {
		const input = "---\r\nname: win\r\nversion: 2\r\n---\r\n\r\nBody.\r\n";
		const { meta, body } = parseFrontmatter(input);
		assert.equal(meta.name, "win");
		assert.equal(meta.version, "2");
		assert.match(body, /Body\./);
	});

	it("anahtar/deger etrafindaki bosluklari trim eder", () => {
		const input = `---
name:    spaced value
description:   another one
---
body`;
		const { meta } = parseFrontmatter(input);
		assert.equal(meta.name, "spaced value");
		assert.equal(meta.description, "another one");
	});

	it("colon olmadan satirlari atlar", () => {
		const input = `---
name: ok
just-a-flag
description: also ok
---
body`;
		const { meta } = parseFrontmatter(input);
		assert.equal(meta.name, "ok");
		assert.equal(meta.description, "also ok");
		assert.equal(meta["just-a-flag"], undefined);
	});

	it("URL gibi degerlerde ilk ': ' ayraci kullanilir", () => {
		// "https://example.com" iki nokta iceriyor ama ': ' (colon+space) sadece
		// anahtarin sonunda var. Parser bunu dogru ayirmali.
		const input = `---
homepage: https://example.com/path
ratio: 16:9
---
body`;
		const { meta } = parseFrontmatter(input);
		assert.equal(meta.homepage, "https://example.com/path");
		// "ratio: 16:9" - ilk ': ' ratio'dan sonra
		assert.equal(meta.ratio, "16:9");
	});
});

describe("parseFrontmatter: edge case'ler", () => {
	it("frontmatter sonrasi cift newline'i body trim eder", () => {
		const input = `---
name: x
---


body with leading newlines`;
		const { body } = parseFrontmatter(input);
		assert.equal(body, "body with leading newlines");
	});

	it("bos string", () => {
		const { meta, body } = parseFrontmatter("");
		assert.deepEqual(meta, {});
		assert.equal(body, "");
	});

	it("sadece frontmatter, body yok", () => {
		const input = `---
name: standalone
---`;
		const { meta, body } = parseFrontmatter(input);
		assert.equal(meta.name, "standalone");
		assert.equal(body, "");
	});

	it("ilk satir --- degil ise frontmatter yok", () => {
		const input = `# Heading
---
name: nope
---
body`;
		const { meta, body } = parseFrontmatter(input);
		assert.deepEqual(meta, {});
		assert.equal(body, input);
	});
});
