import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { chalk, showBanner } from "../cli.js";

function detectManager() {
	if (existsSync("pnpm-lock.yaml")) return "pnpm";
	if (existsSync("yarn.lock")) return "yarn";
	if (existsSync("package-lock.json")) return "npm";
	if (existsSync("package.json")) return "npm";
	return null;
}

// ─── badi dev deps ───

function devDeps(args) {
	showBanner();
	console.log(chalk.bold("Dependency Update Analysis"));
	console.log("");

	const mgr = detectManager();
	if (!mgr) {
		console.error(chalk.red("Package manager not found (npm/yarn/pnpm)"));
		process.exit(1);
	}

	console.log(chalk.dim(`Package manager: ${mgr}`));
	console.log("");

	// npm outdated
	try {
		const output = execFileSync(mgr, ["outdated", "--json"], {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		});
		const parsed = JSON.parse(output || "{}");
		const entries = Object.entries(parsed);
		if (entries.length === 0) {
			console.log(chalk.bold.green("All dependencies up to date!"));
			return;
		}

		const patch = [];
		const minor = [];
		const major = [];

		for (const [name, info] of entries) {
			const cur = info.current || "?";
			const wanted = info.wanted || cur;
			const latest = info.latest || wanted;
			const [cMaj, cMin] = cur.split(".").map(Number);
			const [lMaj, lMin] = latest.split(".").map(Number);

			if (lMaj > cMaj) major.push({ name, cur, latest });
			else if (lMin > cMin) minor.push({ name, cur, latest });
			else patch.push({ name, cur, latest });
		}

		console.log(chalk.bold(`Total updatable: ${entries.length}`));
		console.log("");

		if (patch.length > 0) {
			console.log(
				chalk.bold.green(`Patch (${patch.length}) — safe, can be automated:`),
			);
			for (const p of patch)
				console.log(
					`  ${chalk.cyan(p.name.padEnd(30))} ${chalk.dim(p.cur)} -> ${chalk.green(p.latest)}`,
				);
		}
		if (minor.length > 0) {
			console.log("");
			console.log(
				chalk.bold.yellow(`Minor (${minor.length}) — careful, testing needed:`),
			);
			for (const p of minor)
				console.log(
					`  ${chalk.cyan(p.name.padEnd(30))} ${chalk.dim(p.cur)} -> ${chalk.yellow(p.latest)}`,
				);
		}
		if (major.length > 0) {
			console.log("");
			console.log(
				chalk.bold.red(
					`Major (${major.length}) — breaking change likely, manual review:`,
				),
			);
			for (const p of major)
				console.log(
					`  ${chalk.cyan(p.name.padEnd(30))} ${chalk.dim(p.cur)} -> ${chalk.red(p.latest)}`,
				);
		}

		console.log("");
		console.log(chalk.bold("Recommended commands:"));
		console.log(
			chalk.dim(
				`  ${mgr} update                    # patch + minor (lock file limits)`,
			),
		);
		console.log(chalk.dim(`  ${mgr} install [package]@latest  # single major`));
		console.log(
			chalk.dim(
				"  npx npm-check-updates -u        # update all majors (careful)",
			),
		);

		// Apply flag
		if (args.includes("--apply-patch") && patch.length > 0) {
			console.log("");
			console.log(chalk.cyan("Applying patch updates..."));
			try {
				execFileSync(mgr, ["update", ...patch.map((p) => p.name)], {
					stdio: "inherit",
				});
				console.log(chalk.green("Patch updates applied."));
			} catch (e) {
				console.error(chalk.red(`Error: ${e.message}`));
			}
		}
	} catch (e) {
		// outdated can return with exit code 1 (normal case)
		if (e.stdout) {
			try {
				const parsed = JSON.parse(e.stdout.toString() || "{}");
				if (Object.keys(parsed).length === 0) {
					console.log(chalk.bold.green("All dependencies up to date!"));
					return;
				}
			} catch {
				/* */
			}
		}
		console.log(
			chalk.green("All dependencies up to date, or outdated info unavailable."),
		);
	}
}

// ─── badi dev bundle ───

function devBundle() {
	showBanner();
	console.log(chalk.bold("Bundle Size Analysis"));
	console.log("");

	// Framework detection
	const pkg = existsSync("package.json")
		? JSON.parse(readFileSync("package.json", "utf-8"))
		: null;
	if (!pkg) {
		console.error(chalk.red("package.json not found"));
		process.exit(1);
	}

	const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
	const hasVite = !!deps.vite;
	const hasWebpack = !!deps.webpack;
	const hasNext = !!deps.next;
	const hasExpo = !!deps.expo;

	console.log(chalk.bold("Detected Framework:"));
	if (hasNext) console.log(`  ${chalk.cyan("Next.js")}`);
	if (hasVite) console.log(`  ${chalk.cyan("Vite")}`);
	if (hasWebpack) console.log(`  ${chalk.cyan("Webpack")}`);
	if (hasExpo) console.log(`  ${chalk.cyan("Expo")}`);
	if (!hasNext && !hasVite && !hasWebpack && !hasExpo) {
		console.log(chalk.yellow("  Not detected — check package.json"));
	}

	// Build output detection
	const outDirs = ["dist", "build", ".next/static", "out", "web-build"];
	const found = outDirs.find((d) => existsSync(d));

	console.log("");
	if (found) {
		console.log(chalk.bold("Build Output:"));
		console.log(`  Directory: ${chalk.cyan(found)}`);

		// Total size
		function dirSize(dir) {
			let total = 0;
			for (const entry of readdirSync(dir, { withFileTypes: true })) {
				const full = join(dir, entry.name);
				if (entry.isDirectory()) total += dirSize(full);
				else
					try {
						total += statSync(full).size;
					} catch {
						/* */
					}
			}
			return total;
		}
		const bytes = dirSize(found);
		console.log(
			`  Total: ${chalk.cyan(`${(bytes / (1024 * 1024)).toFixed(2)} MB`)}`,
		);

		// Largest JS/CSS files
		const files = [];
		function collectFiles(dir) {
			for (const entry of readdirSync(dir, { withFileTypes: true })) {
				const full = join(dir, entry.name);
				if (entry.isDirectory()) collectFiles(full);
				else if ([".js", ".mjs", ".css"].includes(extname(entry.name))) {
					try {
						files.push({ path: full, size: statSync(full).size });
					} catch {
						/* */
					}
				}
			}
		}
		collectFiles(found);
		files.sort((a, b) => b.size - a.size);

		console.log("");
		console.log(chalk.bold("Largest 10 Assets:"));
		for (const f of files.slice(0, 10)) {
			const kb = (f.size / 1024).toFixed(1);
			const color =
				f.size > 500000
					? chalk.red
					: f.size > 200000
						? chalk.yellow
						: chalk.green;
			console.log(`  ${color(`${kb.padStart(8)} KB`)}  ${chalk.dim(f.path)}`);
		}

		console.log("");
		console.log(chalk.bold("Recommended Tools:"));
		if (hasWebpack)
			console.log(chalk.dim("  npx webpack-bundle-analyzer [stats.json]"));
		if (hasVite) console.log(chalk.dim("  npx vite-bundle-visualizer"));
		if (hasNext) console.log(chalk.dim("  npx @next/bundle-analyzer"));
	} else {
		console.log(chalk.yellow("Build output not found. Build first:"));
		console.log(chalk.dim("  npm run build"));
	}

	// Heavy dependencies
	const heavyDeps = [
		["moment", "date-fns (10x smaller)"],
		["lodash", "lodash-es + tree-shaking"],
		["rxjs", "native Promise (most cases)"],
		["axios", "native fetch"],
		["jquery", "native DOM / modern framework"],
	];
	console.log("");
	console.log(chalk.bold("Heavy Dependencies With Alternatives:"));
	let foundHeavy = false;
	for (const [heavy, alt] of heavyDeps) {
		if (deps[heavy]) {
			console.log(`  ${chalk.yellow("!!")} ${heavy} -> ${chalk.dim(alt)}`);
			foundHeavy = true;
		}
	}
	if (!foundHeavy) console.log(chalk.green("  No known heavy dependencies."));
}

// ─── badi dev docker-lint ───

function devDockerLint() {
	showBanner();
	console.log(chalk.bold("Dockerfile Lint"));
	console.log("");

	const dockerfile = existsSync("Dockerfile")
		? "Dockerfile"
		: existsSync("dockerfile")
			? "dockerfile"
			: null;
	if (!dockerfile) {
		console.error(chalk.red("Dockerfile not found"));
		process.exit(1);
	}

	const content = readFileSync(dockerfile, "utf-8");
	const lines = content.split("\n");
	let issues = 0;

	function warn(n, msg) {
		console.log(`  ${chalk.yellow("!!")} Line ${n}: ${msg}`);
		issues++;
	}
	function err(n, msg) {
		console.log(`  ${chalk.red("XX")} Line ${n}: ${msg}`);
		issues++;
	}

	let hasUser = false;
	let hasHealthcheck = false;
	let fromLine = null;

	lines.forEach((line, i) => {
		const n = i + 1;
		const trimmed = line.trim();
		if (trimmed.startsWith("#") || !trimmed) return;

		const upper = trimmed.toUpperCase();

		// FROM
		if (upper.startsWith("FROM ")) {
			fromLine = n;
			if (/:latest/.test(trimmed) || !/:/.test(trimmed.split(" ")[1] || "")) {
				warn(
					n,
					"FROM ... :latest or untagged — pin the version (security + reproducibility)",
				);
			}
		}
		// USER
		if (upper.startsWith("USER ")) hasUser = true;

		// HEALTHCHECK
		if (upper.startsWith("HEALTHCHECK ")) hasHealthcheck = true;

		// RUN apt-get install without --no-install-recommends
		if (
			/^RUN .*apt-get install/i.test(trimmed) &&
			!/--no-install-recommends/.test(trimmed)
		) {
			warn(n, "use --no-install-recommends with apt-get install (size)");
		}
		// RUN update + install in separate layers
		if (/^RUN apt-get update/i.test(trimmed) && !/&&/.test(trimmed)) {
			warn(
				n,
				"combine apt-get update and install in the same RUN (cache busting)",
			);
		}
		// COPY instead of ADD
		if (/^ADD /i.test(trimmed) && !/\.tar/.test(trimmed)) {
			warn(n, "use COPY instead of ADD (more explicit)");
		}
		// sudo for root
		if (/sudo/.test(trimmed)) {
			warn(n, "sudo is meaningless inside a container, remove it");
		}
		// chmod 777
		if (/chmod\s+777/.test(trimmed)) {
			err(n, "chmod 777 is overly permissive — 755 or stricter");
		}
		// Expose < 1024 (root priv)
		if (/^EXPOSE\s+\d+/i.test(trimmed)) {
			const port = Number.parseInt(trimmed.split(/\s+/)[1], 10);
			if (port < 1024)
				warn(
					n,
					`EXPOSE ${port} — below 1024 requires root, use a higher port if possible`,
				);
		}
	});

	// Global checks
	if (!hasUser) warn(0, "No USER directive — running as root (security risk)");
	if (!hasHealthcheck)
		warn(
			0,
			"No HEALTHCHECK defined — consider adding one for orchestration health checks",
		);
	if (!fromLine) err(0, "FROM directive not found");

	// .dockerignore check
	if (!existsSync(".dockerignore")) {
		warn(0, "No .dockerignore file — build context may be bloated");
	}

	console.log("");
	if (issues === 0) {
		console.log(chalk.bold.green("Dockerfile clean!"));
	} else {
		console.log(chalk.bold.yellow(`${issues} issues detected.`));
		console.log(
			chalk.dim("Detailed analysis: hadolint (brew install hadolint)"),
		);
	}
}

// ─── badi dev env-check ───

function devEnvCheck() {
	showBanner();
	console.log(chalk.bold(".env Validation"));
	console.log("");

	const examples = [".env.example", ".env.template", ".env.sample"];
	const exampleFile = examples.find((f) => existsSync(f));
	const envFile = existsSync(".env") ? ".env" : null;

	if (!exampleFile) {
		console.error(chalk.red("No .env.example/.env.template/.env.sample found"));
		process.exit(1);
	}

	console.log(chalk.dim(`Reference: ${exampleFile}`));
	if (envFile) console.log(chalk.dim(`Active:    ${envFile}`));
	console.log("");

	function parseEnv(path) {
		const vars = new Map();
		if (!existsSync(path)) return vars;
		const content = readFileSync(path, "utf-8");
		for (const line of content.split("\n")) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const eq = trimmed.indexOf("=");
			if (eq < 0) continue;
			const key = trimmed.substring(0, eq).trim();
			const value = trimmed.substring(eq + 1).trim();
			vars.set(key, value);
		}
		return vars;
	}

	const expected = parseEnv(exampleFile);
	const actual = envFile ? parseEnv(envFile) : new Map();

	let issues = 0;

	// Missing keys
	const missing = [];
	for (const key of expected.keys()) {
		if (!actual.has(key)) missing.push(key);
	}
	if (missing.length > 0) {
		console.log(chalk.bold.red(`Missing (${missing.length}):`));
		for (const k of missing) console.log(`  ${chalk.red("XX")} ${k}`);
		issues += missing.length;
	}

	// Extra keys (in env but not in example)
	const extra = [];
	for (const key of actual.keys()) {
		if (!expected.has(key)) extra.push(key);
	}
	if (extra.length > 0) {
		console.log("");
		console.log(
			chalk.bold.yellow(`Extra (${extra.length}) — add to .env.example:`),
		);
		for (const k of extra) console.log(`  ${chalk.yellow("!!")} ${k}`);
	}

	// Empty value
	const empty = [];
	for (const [k, v] of actual) {
		if (!v || v === '""' || v === "''") empty.push(k);
	}
	if (empty.length > 0) {
		console.log("");
		console.log(chalk.bold.yellow(`Empty value (${empty.length}):`));
		for (const k of empty) console.log(`  ${chalk.yellow("??")} ${k}`);
	}

	// Placeholder value (your_key, xxx, changeme)
	const placeholders = [];
	for (const [k, v] of actual) {
		if (
			/^(your[_-]?\w+|xxx|changeme|todo|tbd|placeholder|<.*>)$/i.test(
				v.replace(/['"]/g, ""),
			)
		) {
			placeholders.push({ k, v });
		}
	}
	if (placeholders.length > 0) {
		console.log("");
		console.log(
			chalk.bold.red(
				`Placeholder value (${placeholders.length}) — not updated:`,
			),
		);
		for (const { k, v } of placeholders)
			console.log(`  ${chalk.red("XX")} ${k}=${chalk.dim(v)}`);
		issues += placeholders.length;
	}

	// .gitignore check
	const gi = existsSync(".gitignore")
		? readFileSync(".gitignore", "utf-8")
		: "";
	if (envFile && !gi.includes(".env")) {
		console.log("");
		console.log(chalk.red("XX .env file is NOT in .gitignore — URGENT!"));
		issues++;
	}

	console.log("");
	if (issues === 0) {
		console.log(chalk.bold.green(".env validation clean!"));
	} else {
		console.log(chalk.bold.yellow(`${issues} issues detected.`));
	}
}

// ─── badi dev api-test ───

async function devApiTest(args) {
	const url = args[0];
	if (!url) {
		showBanner();
		console.log(chalk.bold("API Endpoint Tester:"));
		console.log("");
		console.log(
			`  ${chalk.cyan("badi dev api-test")} [url]                    GET request`,
		);
		console.log(
			`  ${chalk.cyan("badi dev api-test")} [url] --method POST      HTTP method`,
		);
		console.log(
			`  ${chalk.cyan("badi dev api-test")} [url] --body '{}'        JSON body`,
		);
		console.log(
			`  ${chalk.cyan("badi dev api-test")} [url] --header 'K: V'    Add header`,
		);
		console.log(
			`  ${chalk.cyan("badi dev api-test")} [url] --expect 200       Expected status`,
		);
		console.log("");
		console.log(chalk.bold("Examples:"));
		console.log(`  badi dev api-test https://api.example.com/users`);
		console.log(
			`  badi dev api-test https://api.example.com/users --method POST --body '{"name":"X"}'`,
		);
		return;
	}

	let method = "GET";
	let body = null;
	const headers = {};
	let expectStatus = null;

	for (let i = 1; i < args.length; i++) {
		if (args[i] === "--method") method = args[++i];
		else if (args[i] === "--body") body = args[++i];
		else if (args[i] === "--header") {
			const h = args[++i];
			const idx = h.indexOf(":");
			if (idx > 0)
				headers[h.substring(0, idx).trim()] = h.substring(idx + 1).trim();
		} else if (args[i] === "--expect")
			expectStatus = Number.parseInt(args[++i], 10);
	}

	showBanner();
	console.log(chalk.bold(`API Test: ${method} ${url}`));
	console.log("");

	if (Object.keys(headers).length > 0) {
		console.log(chalk.dim("Headers:"));
		for (const [k, v] of Object.entries(headers))
			console.log(`  ${chalk.dim(`${k}: ${v}`)}`);
		console.log("");
	}

	const fetchOpts = { method, headers };
	if (body) {
		fetchOpts.body = body;
		fetchOpts.headers["Content-Type"] =
			fetchOpts.headers["Content-Type"] || "application/json";
	}

	const start = Date.now();
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 30000);
	fetchOpts.signal = controller.signal;

	try {
		const res = await fetch(url, fetchOpts);
		clearTimeout(timeout);
		const duration = Date.now() - start;
		const text = await res.text();
		let jsonBody = null;
		try {
			jsonBody = JSON.parse(text);
		} catch {
			/* */
		}

		// Status
		const statusColor =
			res.status < 300
				? chalk.green
				: res.status < 400
					? chalk.yellow
					: chalk.red;
		console.log(chalk.bold("Response:"));
		console.log(
			`  Status:   ${statusColor(`${res.status} ${res.statusText}`)}`,
		);
		console.log(`  Time:     ${chalk.cyan(`${duration}ms`)}`);
		console.log(
			`  Size:     ${chalk.cyan(`${(text.length / 1024).toFixed(2)} KB`)}`,
		);
		console.log(
			`  Content:  ${chalk.dim(res.headers.get("content-type") || "?")}`,
		);

		console.log("");
		console.log(chalk.bold("Headers:"));
		for (const [k, v] of res.headers.entries()) {
			console.log(`  ${chalk.dim(`${k.padEnd(25)} ${v.substring(0, 60)}`)}`);
		}

		console.log("");
		console.log(chalk.bold("Body:"));
		if (jsonBody) {
			console.log(JSON.stringify(jsonBody, null, 2).substring(0, 2000));
		} else {
			console.log(text.substring(0, 1000));
		}

		// Assertions
		if (expectStatus !== null) {
			console.log("");
			if (res.status === expectStatus) {
				console.log(
					chalk.bold.green(`OK Expected status ${expectStatus} matched`),
				);
			} else {
				console.log(
					chalk.bold.red(`FAIL Expected ${expectStatus}, got ${res.status}`),
				);
				process.exit(1);
			}
		}
	} catch (e) {
		clearTimeout(timeout);
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}

// ─── Main command ───

export async function runDev(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("DevOps + Code Quality:"));
		console.log("");
		console.log(
			`  ${chalk.cyan("badi dev deps")}                  Dependency update analysis`,
		);
		console.log(
			`  ${chalk.cyan("badi dev deps --apply-patch")}    Apply patch updates`,
		);
		console.log(
			`  ${chalk.cyan("badi dev bundle")}                Bundle size + framework detection`,
		);
		console.log(
			`  ${chalk.cyan("badi dev docker-lint")}           Dockerfile best practice`,
		);
		console.log(
			`  ${chalk.cyan("badi dev env-check")}             .env validation`,
		);
		console.log(
			`  ${chalk.cyan("badi dev api-test")} [url]        HTTP endpoint tester`,
		);
		console.log("");
		console.log(chalk.bold("Examples:"));
		console.log("  badi dev deps");
		console.log("  badi dev bundle");
		console.log(
			"  badi dev api-test https://api.example.com/health --expect 200",
		);
		return;
	}

	try {
		switch (sub) {
			case "deps":
				devDeps(args.slice(1));
				break;
			case "bundle":
				devBundle();
				break;
			case "docker-lint":
				devDockerLint();
				break;
			case "env-check":
				devEnvCheck();
				break;
			case "api-test":
				await devApiTest(args.slice(1));
				break;
			default:
				console.error(chalk.red(`Unknown dev command: ${sub}`));
				console.log(
					"Usage: badi dev [deps|bundle|docker-lint|env-check|api-test]",
				);
				process.exit(1);
		}
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}
