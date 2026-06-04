// lib/frontmatter.js parseFrontmatter unit testleri (#137).
// badi-skills CI workflow'u bu dosyayi ana repo'dan curl ile cektigi icin
// regression koruma kritik. Aksi halde sessizce kirik schema validate olur.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseFrontmatter } from "../lib/frontmatter.js";

describe("parseFrontmatter: typical usage", () => {
	it("frontmatter + body separation", () => {
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

	it("returns all content as body when there is no frontmatter", () => {
		const input = "# Just a heading\n\nNo frontmatter here.";
		const { meta, body } = parseFrontmatter(input);
		assert.deepEqual(meta, {});
		assert.equal(body, input);
	});

	it("empty frontmatter", () => {
		const input = `---
---

Body only.`;
		const { meta, body } = parseFrontmatter(input);
		assert.deepEqual(meta, {});
		assert.equal(body, "Body only.");
	});

	it("unclosed frontmatter counts all content as body", () => {
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

describe("parseFrontmatter: format tolerance", () => {
	it("CRLF line endings (Windows core.autocrlf)", () => {
		const input = "---\r\nname: win\r\nversion: 2\r\n---\r\n\r\nBody.\r\n";
		const { meta, body } = parseFrontmatter(input);
		assert.equal(meta.name, "win");
		assert.equal(meta.version, "2");
		assert.match(body, /Body\./);
	});

	it("trims whitespace around key/value", () => {
		const input = `---
name:    spaced value
description:   another one
---
body`;
		const { meta } = parseFrontmatter(input);
		assert.equal(meta.name, "spaced value");
		assert.equal(meta.description, "another one");
	});

	it("skips lines without a colon", () => {
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

	it("uses the first ': ' separator for URL-like values", () => {
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

describe("parseFrontmatter: edge cases", () => {
	it("body trims double newline after frontmatter", () => {
		const input = `---
name: x
---


body with leading newlines`;
		const { body } = parseFrontmatter(input);
		assert.equal(body, "body with leading newlines");
	});

	it("empty string", () => {
		const { meta, body } = parseFrontmatter("");
		assert.deepEqual(meta, {});
		assert.equal(body, "");
	});

	it("frontmatter only, no body", () => {
		const input = `---
name: standalone
---`;
		const { meta, body } = parseFrontmatter(input);
		assert.equal(meta.name, "standalone");
		assert.equal(body, "");
	});

	it("no frontmatter when the first line is not ---", () => {
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
