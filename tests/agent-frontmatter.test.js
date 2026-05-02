// Agent frontmatter audit testleri (#90).
// Her .claude/agents/*.md icin: tools whitelist, permissionMode acik,
// read-only ajanlarda disallowedTools ile Write/Edit/NotebookEdit yasak.

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const AGENTS_DIR = resolve(__dirname, "..", ".claude", "agents");

const READ_ONLY_AGENTS = new Set([
	"archaeologist",
	"api-designer",
	"architecture-advisor",
	"debt-collector",
	"error-whisperer",
	"migration-pilot",
	"onboarding-sherpa",
	"performance-profiler",
	"pr-ghostwriter",
	"refactoring-advisor",
	"rubber-duck",
	"security-scanner",
	"test-strategist",
	"unsticker",
	"yak-shave-detector",
]);

const PRODUCER_AGENTS = new Set([
	"auditor",
	"coach",
	"code-generator",
	"content-creator",
	"project-architect",
	"visual-director",
]);

const VALID_PERMISSION_MODES = new Set([
	"default",
	"acceptEdits",
	"plan",
	"bypassPermissions",
]);

function parseFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;
	const obj = {};
	for (const line of match[1].split("\n")) {
		const m = line.match(/^([a-zA-Z][a-zA-Z0-9_]*):\s*(.*)$/);
		if (m) obj[m[1]] = m[2].trim();
	}
	return obj;
}

function listAgents() {
	return readdirSync(AGENTS_DIR)
		.filter((f) => f.endsWith(".md"))
		.map((f) => f.replace(/\.md$/, ""));
}

describe("agent frontmatter audit (#90)", () => {
	const agents = listAgents();

	it("21 ajan mevcut", () => {
		assert.equal(agents.length, 21);
	});

	it("her ajan READ_ONLY veya PRODUCER kategorisinde", () => {
		for (const a of agents) {
			assert.ok(
				READ_ONLY_AGENTS.has(a) || PRODUCER_AGENTS.has(a),
				`${a}: kategorisize`,
			);
		}
	});

	for (const agent of agents) {
		describe(agent, () => {
			const fm = parseFrontmatter(
				readFileSync(join(AGENTS_DIR, `${agent}.md`), "utf-8"),
			);

			it("frontmatter parse edilebilir", () => {
				assert.ok(fm, "frontmatter yok");
			});

			it("name alani dosya adiyla eslesiyor", () => {
				assert.equal(fm.name, agent);
			});

			it("tools alani var", () => {
				assert.ok(fm.tools, "tools: tanimsiz");
				assert.match(fm.tools, /^\[.*\]$/, "tools array formatinda olmali");
			});

			it("permissionMode acikca tanimli", () => {
				assert.ok(fm.permissionMode, "permissionMode: tanimsiz");
				assert.ok(
					VALID_PERMISSION_MODES.has(fm.permissionMode),
					`gecersiz permissionMode: ${fm.permissionMode}`,
				);
			});

			if (READ_ONLY_AGENTS.has(agent)) {
				it("read-only: tools'ta Write/Edit yok", () => {
					assert.doesNotMatch(fm.tools, /\bWrite\b/);
					assert.doesNotMatch(fm.tools, /\bEdit\b/);
				});

				it("read-only: disallowedTools Write/Edit/NotebookEdit icerir", () => {
					assert.ok(fm.disallowedTools, "disallowedTools tanimsiz");
					assert.match(fm.disallowedTools, /Write/);
					assert.match(fm.disallowedTools, /Edit/);
					assert.match(fm.disallowedTools, /NotebookEdit/);
				});
			}

			if (PRODUCER_AGENTS.has(agent)) {
				it("producer: tools'ta Write veya Edit var", () => {
					const hasWrite = /\bWrite\b/.test(fm.tools);
					const hasEdit = /\bEdit\b/.test(fm.tools);
					assert.ok(
						hasWrite || hasEdit,
						"producer en az Write veya Edit icermeli",
					);
				});
			}
		});
	}
});
