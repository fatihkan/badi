import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, it } from "node:test";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) =>
	execFileSync("node", [BIN, ...args], {
		encoding: "utf-8",
		timeout: 5000,
	}).trim();

describe("badi ssl/dns/whois", () => {
	it("ssl shows help", () => {
		const out = run("ssl");
		assert.ok(out.includes("badi ssl"));
	});

	it("dns shows help", () => {
		const out = run("dns");
		assert.ok(out.includes("badi dns"));
	});

	it("whois shows help", () => {
		const out = run("whois");
		assert.ok(out.includes("badi whois"));
	});

	it("ssl rejects an invalid domain", () => {
		assert.throws(() => run("ssl", "not_a_domain"), { status: 1 });
	});

	it("dns rejects an invalid domain", () => {
		assert.throws(() => run("dns", "123"), { status: 1 });
	});
});
