// Agent frontmatter audit tests (#90).
// For each .claude/agents/*.md: tools whitelist, permissionMode set,
// for read-only agents, disallowedTools forbids Write/Edit/NotebookEdit.

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
	// virtual eng team (advisory / verification)
	"product-strategist",
	"engineering-manager",
	"qa-lead",
	"ads-strategist",
	// atoms.dev-inspired advisory roles
	"market-researcher",
	"seo-strategist",
	"data-analyst",
]);

const PRODUCER_AGENTS = new Set([
	"auditor",
	"coach",
	"code-generator",
	"content-creator",
	"project-architect",
	"tasarim-kurator",
	"visual-director",
	// virtual eng team (ships release artifacts)
	"release-manager",
]);

const VALID_PERMISSION_MODES = new Set([
	"default",
	"acceptEdits",
	"plan",
	"bypassPermissions",
]);

function parseFrontmatter(content) {
	// CRLF normalize (Windows git checkout)
	const normalized = content.replace(/\r\n/g, "\n");
	const match = normalized.match(/^---\n([\s\S]*?)\n---/);
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

	it("30 agents present", () => {
		assert.equal(agents.length, 30);
	});

	it("every agent is in the READ_ONLY or PRODUCER category", () => {
		for (const a of agents) {
			assert.ok(
				READ_ONLY_AGENTS.has(a) || PRODUCER_AGENTS.has(a),
				`${a}: uncategorized`,
			);
		}
	});

	for (const agent of agents) {
		describe(agent, () => {
			const fm = parseFrontmatter(
				readFileSync(join(AGENTS_DIR, `${agent}.md`), "utf-8"),
			);

			it("frontmatter parse edilebilir", () => {
				assert.ok(fm, "frontmatter missing");
			});

			it("name field matches the filename", () => {
				assert.equal(fm.name, agent);
			});

			it("has a tools field", () => {
				assert.ok(fm.tools, "tools: undefined");
				assert.match(fm.tools, /^\[.*\]$/, "tools should be in array format");
			});

			it("permissionMode explicitly declared", () => {
				assert.ok(fm.permissionMode, "permissionMode: undefined");
				assert.ok(
					VALID_PERMISSION_MODES.has(fm.permissionMode),
					`invalid permissionMode: ${fm.permissionMode}`,
				);
			});

			if (READ_ONLY_AGENTS.has(agent)) {
				it("read-only: no Write/Edit in tools", () => {
					assert.doesNotMatch(fm.tools, /\bWrite\b/);
					assert.doesNotMatch(fm.tools, /\bEdit\b/);
				});

				it("read-only: disallowedTools Write/Edit/NotebookEdit icerir", () => {
					assert.ok(fm.disallowedTools, "disallowedTools undefined");
					assert.match(fm.disallowedTools, /Write/);
					assert.match(fm.disallowedTools, /Edit/);
					assert.match(fm.disallowedTools, /NotebookEdit/);
				});
			}

			if (PRODUCER_AGENTS.has(agent)) {
				it("producer: has Write or Edit in tools", () => {
					const hasWrite = /\bWrite\b/.test(fm.tools);
					const hasEdit = /\bEdit\b/.test(fm.tools);
					assert.ok(
						hasWrite || hasEdit,
						"producer must include at least Write or Edit",
					);
				});
			}
		});
	}
});
