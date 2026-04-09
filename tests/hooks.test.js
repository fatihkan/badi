import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const HOOKS_DIR = resolve(__dirname, "..", ".claude", "hooks");

describe("hook scriptleri", () => {
	it("tum hook dosyalari mevcut", () => {
		const hooks = [
			"guard-bash.sh",
			"backup-before-write.sh",
			"completeness-gate.sh",
			"log-changes.sh",
			"log-failures.sh",
			"log-stop-verdict.sh",
			"post-compact-resume.sh",
			"pre-compact-handoff.sh",
			"session-reset.sh",
			"dependency-audit.sh",
			"branch-guard.sh",
		];

		for (const hook of hooks) {
			assert.ok(existsSync(resolve(HOOKS_DIR, hook)), `${hook} mevcut olmali`);
		}
	});

	it("guard-bash tehlikeli komutu engeller", () => {
		const input = JSON.stringify({
			tool_name: "Bash",
			tool_input: { command: "rm -rf /" },
		});

		const output = execFileSync("bash", [resolve(HOOKS_DIR, "guard-bash.sh")], {
			input,
			encoding: "utf-8",
			timeout: 5000,
		});

		assert.ok(output.includes("block"), "rm -rf / engellenmeli");
	});

	it("guard-bash guvenli komuta izin verir", () => {
		const input = JSON.stringify({
			tool_name: "Bash",
			tool_input: { command: "ls -la" },
		});

		const output = execFileSync("bash", [resolve(HOOKS_DIR, "guard-bash.sh")], {
			input,
			encoding: "utf-8",
			timeout: 5000,
		});

		// Guvenli komutlar icin block ciktisi olmamali
		assert.ok(!output.includes('"decision":"block"'));
	});

	it("completeness-gate gizli bilgiyi engeller", () => {
		const input = JSON.stringify({
			tool_name: "Write",
			tool_input: {
				file_path: "test.js",
				content: 'const key = "sk_live_abc123def456";',
			},
		});

		const output = execFileSync("bash", [resolve(HOOKS_DIR, "completeness-gate.sh")], {
			input,
			encoding: "utf-8",
			timeout: 5000,
		});

		assert.ok(output.includes("block"), "Gizli bilgi engellenmeli");
	});
});
