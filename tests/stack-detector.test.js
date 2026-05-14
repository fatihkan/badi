// stack-detector birim testleri.
//
// detectStack() saf fn; geçici dizinde manifest dosyalari yarat, eslesme bekle.

import assert from "node:assert/strict";
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
	detectStack,
	evaluateDetect,
	globToRegex,
	matchAnyFile,
	readPackageJson,
} from "../lib/stack-detector.js";

function writePkg(dir, pkg) {
	writeFileSync(join(dir, "package.json"), JSON.stringify(pkg, null, 2));
}

describe("globToRegex", () => {
	it("yildiz desteklenir", () => {
		const re = globToRegex("next.config.*");
		assert.ok(re.test("next.config.js"));
		assert.ok(re.test("next.config.mjs"));
		assert.ok(!re.test("nuxt.config.js"));
	});
	it("ozel karakterler escape edilir", () => {
		const re = globToRegex("tsconfig.json");
		assert.ok(re.test("tsconfig.json"));
		assert.ok(!re.test("tsconfigxjson"));
	});
});

describe("readPackageJson", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "stack-pkg-"));
	});
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it("yok ise null", () => {
		assert.equal(readPackageJson(dir), null);
	});
	it("bozuk JSON null", () => {
		writeFileSync(join(dir, "package.json"), "{not json}");
		assert.equal(readPackageJson(dir), null);
	});
	it("deps ve devDeps merge edilir", () => {
		writePkg(dir, {
			name: "x",
			dependencies: { react: "^18", express: "^4" },
			devDependencies: { vitest: "^1" },
		});
		const r = readPackageJson(dir);
		assert.ok(r);
		assert.ok(r.allDeps.has("react"));
		assert.ok(r.allDeps.has("express"));
		assert.ok(r.allDeps.has("vitest"));
		assert.equal(r.name, "x");
	});
	it("scripts uniq Set", () => {
		writePkg(dir, { scripts: { dev: "vite", build: "vite build" } });
		const r = readPackageJson(dir);
		assert.ok(r.scripts.has("dev"));
		assert.ok(r.scripts.has("build"));
	});
});

describe("matchAnyFile", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "stack-match-"));
	});
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it("desen yoksa null", () => {
		assert.equal(matchAnyFile(dir, ["nope.*"]), null);
	});
	it("varolan dosyayi tespit eder", () => {
		writeFileSync(join(dir, "next.config.mjs"), "");
		assert.equal(matchAnyFile(dir, ["next.config.*"]), "next.config.mjs");
	});
	it("birden cok desen — ilk eslesen donulur", () => {
		writeFileSync(join(dir, "tailwind.config.ts"), "");
		assert.equal(
			matchAnyFile(dir, ["postcss.config.*", "tailwind.config.*"]),
			"tailwind.config.ts",
		);
	});
});

describe("evaluateDetect", () => {
	let dir;
	let ctx;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "stack-eval-"));
		writePkg(dir, {
			dependencies: { react: "^18" },
			devDependencies: { vitest: "^1" },
		});
		ctx = { target: dir, pkg: readPackageJson(dir) };
	});
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it("packages eslesirse matched=true", () => {
		const r = evaluateDetect({ packages: ["react"] }, ctx);
		assert.equal(r.matched, true);
		assert.match(r.source, /package\.json:dep:react/);
	});
	it("packages eslesmezse matched=false", () => {
		const r = evaluateDetect({ packages: ["unknown-pkg-xyz"] }, ctx);
		assert.equal(r.matched, false);
	});
	it("configFiles glob eslesir", () => {
		writeFileSync(join(dir, "vite.config.ts"), "");
		const r = evaluateDetect({ configFiles: ["vite.config.*"] }, ctx);
		assert.equal(r.matched, true);
		assert.match(r.source, /^configFile:vite\.config\.ts/);
	});
	it("manifestKeys (string substring) eslesir", () => {
		writeFileSync(join(dir, "pyproject.toml"), "[tool.poetry]\nname='x'");
		const r = evaluateDetect(
			{ manifestKeys: [{ file: "pyproject.toml", key: "[tool.poetry]" }] },
			ctx,
		);
		assert.equal(r.matched, true);
	});
	it("scripts eslesir", () => {
		writePkg(dir, { scripts: { dev: "vite" } });
		ctx.pkg = readPackageJson(dir);
		ctx.rootEntries = ["package.json"];
		const r = evaluateDetect({ scripts: ["dev"] }, ctx);
		assert.equal(r.matched, true);
		assert.match(r.source, /script:dev/);
	});
	it("hicbir kural eslesmezse matched=false", () => {
		const r = evaluateDetect({}, ctx);
		assert.equal(r.matched, false);
	});
	it("configDirs DIR eslesir, FILE eslesmez", () => {
		// 'prisma' adinda DIZIN olustur
		mkdirSync(join(dir, "prisma"));
		ctx.rootEntries = readdirSync(dir);
		const r = evaluateDetect({ configDirs: ["prisma"] }, ctx);
		assert.equal(r.matched, true);
		assert.match(r.source, /^configDir:prisma/);
	});
	it("configDirs sadece DIR — DOSYA reddedilir", () => {
		// 'prisma' adinda DOSYA olustur (yanlis pozitif testi)
		writeFileSync(join(dir, "prisma"), "");
		ctx.rootEntries = readdirSync(dir);
		const r = evaluateDetect({ configDirs: ["prisma"] }, ctx);
		assert.equal(r.matched, false);
	});
	it("configFiles sadece DOSYA — DIZIN reddedilir", () => {
		// 'next.config.js' adinda DIZIN olustur
		mkdirSync(join(dir, "next.config.js"));
		ctx.rootEntries = readdirSync(dir);
		const r = evaluateDetect({ configFiles: ["next.config.*"] }, ctx);
		assert.equal(r.matched, false);
	});
});

describe("detectStack: tek tek senaryolar", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "stack-full-"));
	});
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it("React projesi -> design + frontend-taste", () => {
		writePkg(dir, { dependencies: { react: "^18", "react-dom": "^18" } });
		const r = detectStack(dir);
		assert.ok(r.technologies.some((t) => t.id === "react"));
		assert.ok(r.skills.has("design"));
		assert.ok(r.skills.has("frontend-taste"));
	});

	it("Next.js (config dosyasi) -> seo + seo-crawl-budget", () => {
		writePkg(dir, { dependencies: { next: "^14" } });
		writeFileSync(join(dir, "next.config.mjs"), "");
		const r = detectStack(dir);
		const tech = r.technologies.find((t) => t.id === "nextjs");
		assert.ok(tech);
		assert.ok(r.skills.has("seo"));
		assert.ok(r.skills.has("seo-crawl-budget"));
	});

	it("React Native -> mobile", () => {
		writePkg(dir, { dependencies: { "react-native": "0.75" } });
		const r = detectStack(dir);
		assert.ok(r.technologies.some((t) => t.id === "react-native"));
		assert.ok(r.skills.has("mobile"));
	});

	it("Python (requirements.txt) -> development + data-analytics", () => {
		writeFileSync(join(dir, "requirements.txt"), "requests==2.31\n");
		const r = detectStack(dir);
		assert.ok(r.technologies.some((t) => t.id === "python"));
		assert.ok(r.skills.has("development"));
		assert.ok(r.skills.has("data-analytics"));
	});

	it("Rust (Cargo.toml) -> development", () => {
		writeFileSync(join(dir, "Cargo.toml"), '[package]\nname="x"\n');
		const r = detectStack(dir);
		assert.ok(r.technologies.some((t) => t.id === "rust"));
	});

	it("Stripe deps -> finance", () => {
		writePkg(dir, { dependencies: { stripe: "^14" } });
		const r = detectStack(dir);
		assert.ok(r.skills.has("finance"));
	});

	it("Vitest dev -> testing", () => {
		writePkg(dir, { devDependencies: { vitest: "^1" } });
		const r = detectStack(dir);
		assert.ok(r.skills.has("testing"));
	});

	it("Docker (Dockerfile) -> devops", () => {
		writeFileSync(join(dir, "Dockerfile"), "FROM node:20\n");
		const r = detectStack(dir);
		assert.ok(r.skills.has("devops"));
	});

	it("bos dizin -> 0 teknoloji, 0 skill", () => {
		const r = detectStack(dir);
		assert.equal(r.technologies.length, 0);
		assert.equal(r.skills.size, 0);
	});

	it("kombinasyon: Next.js + Tailwind + Stripe + Prisma", () => {
		writePkg(dir, {
			dependencies: {
				next: "^14",
				tailwindcss: "^3",
				stripe: "^14",
				"@prisma/client": "^5",
			},
		});
		writeFileSync(join(dir, "next.config.mjs"), "");
		const r = detectStack(dir);
		const ids = r.technologies.map((t) => t.id);
		assert.ok(ids.includes("nextjs"));
		assert.ok(ids.includes("tailwind"));
		assert.ok(ids.includes("stripe"));
		assert.ok(ids.includes("prisma"));
		assert.ok(r.skills.has("seo"));
		assert.ok(r.skills.has("design"));
		assert.ok(r.skills.has("finance"));
		assert.ok(r.skills.has("data-analytics"));
	});
});

describe("detectStack: idempotency + skills set", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "stack-idem-"));
	});
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it("ayni dizin iki kez cagrilirsa ayni sonuc", () => {
		writePkg(dir, { dependencies: { react: "^18" } });
		const a = detectStack(dir);
		const b = detectStack(dir);
		assert.deepEqual(
			a.technologies.map((t) => t.id),
			b.technologies.map((t) => t.id),
		);
		assert.deepEqual([...a.skills].sort(), [...b.skills].sort());
	});

	it("skills Set tipi", () => {
		writePkg(dir, { dependencies: { react: "^18" } });
		const r = detectStack(dir);
		assert.ok(r.skills instanceof Set);
	});
});
