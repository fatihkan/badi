import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { chalk } from "../cli.js";

// Local file-based plan approval workflow.
// Plan files live under .claude/plans/; .approved/.denied marker files
// express the approval state. The hook (badi-plan-gate) can inspect these
// files when ExitPlanMode is called.

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

function isValidSlug(slug) {
	return typeof slug === "string" && SLUG_RE.test(slug);
}

function plansDir(cwd) {
	return join(cwd || process.cwd(), ".claude", "plans");
}

function ensureDir(dir) {
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function listPlans(cwd) {
	const dir = plansDir(cwd);
	if (!existsSync(dir)) return [];
	const files = readdirSync(dir);
	const slugs = new Set();
	for (const f of files) {
		if (f.endsWith(".md")) slugs.add(f.replace(/\.md$/, ""));
		else if (f.endsWith(".approved")) slugs.add(f.replace(/\.approved$/, ""));
		else if (f.endsWith(".denied")) slugs.add(f.replace(/\.denied$/, ""));
	}
	const out = [];
	for (const slug of slugs) {
		out.push(planStatus(slug, cwd));
	}
	return out.sort((a, b) => (b.mtimeMs || 0) - (a.mtimeMs || 0));
}

export function planStatus(slug, cwd) {
	if (!isValidSlug(slug)) throw new Error(`Invalid plan slug: ${slug}`);
	const dir = plansDir(cwd);
	const md = join(dir, `${slug}.md`);
	const ap = join(dir, `${slug}.approved`);
	const dn = join(dir, `${slug}.denied`);
	let state = "pending";
	let reason = null;
	let mtimeMs = 0;
	if (existsSync(ap)) {
		state = "approved";
		try {
			const st = statSync(ap);
			mtimeMs = st.mtimeMs;
		} catch {}
	} else if (existsSync(dn)) {
		state = "denied";
		try {
			const raw = readFileSync(dn, "utf-8");
			const lines = raw.split("\n");
			// 1. satir timestamp, sonrasi reason (bos ise null).
			const r = lines.slice(1).join("\n").trim();
			reason = r || null;
			const st = statSync(dn);
			mtimeMs = st.mtimeMs;
		} catch {}
	}
	if (existsSync(md)) {
		try {
			const st = statSync(md);
			if (st.mtimeMs > mtimeMs) mtimeMs = st.mtimeMs;
		} catch {}
	}
	return {
		slug,
		state,
		reason,
		mtimeMs,
		hasPlan: existsSync(md),
		planPath: md,
	};
}

function printHelp() {
	console.log(chalk.bold("Plan Approval Workflow:"));
	console.log("");
	console.log(
		`  badi plan list                ${chalk.dim("All plans + state")}`,
	);
	console.log(
		`  badi plan new <slug>          ${chalk.dim("Create a plan skeleton markdown")}`,
	);
	console.log(`  badi plan show <slug>         ${chalk.dim("Plan contents")}`);
	console.log(
		`  badi plan status <slug>       ${chalk.dim("Approval state (--format json for hook)")}`,
	);
	console.log(
		`  badi plan approve <slug>      ${chalk.dim("Approve (.approved marker)")}`,
	);
	console.log(
		`  badi plan deny <slug> [reason] ${chalk.dim("Deny (.denied marker)")}`,
	);
	console.log(
		`  badi plan reset <slug>        ${chalk.dim("Remove approve/deny markers")}`,
	);
	console.log("");
	console.log(
		chalk.dim("  Marker files: .claude/plans/<slug>.{approved,denied}"),
	);
}

function cmdList(cwd) {
	const plans = listPlans(cwd);
	if (plans.length === 0) {
		console.log(chalk.dim("No plans. Start with `badi plan new <slug>`."));
		return;
	}
	console.log(chalk.bold("Plans:"));
	const maxLabel = Math.max(...plans.map((p) => p.slug.length));
	for (const p of plans) {
		const stateColor =
			p.state === "approved"
				? chalk.green("approved")
				: p.state === "denied"
					? chalk.red("denied  ")
					: chalk.yellow("pending ");
		const date = p.mtimeMs
			? new Date(p.mtimeMs).toISOString().slice(0, 16).replace("T", " ")
			: "-";
		const planMark = p.hasPlan ? "" : chalk.dim(" (no .md)");
		console.log(
			`  ${p.slug.padEnd(maxLabel)}  ${stateColor}  ${chalk.dim(date)}${planMark}`,
		);
		if (p.reason) console.log(chalk.dim(`    Reason: ${p.reason}`));
	}
}

function cmdNew(slug, cwd) {
	if (!isValidSlug(slug)) {
		console.error(chalk.red(`Invalid slug: ${slug} (kebab-case, [a-z0-9-])`));
		process.exit(1);
	}
	const dir = plansDir(cwd);
	ensureDir(dir);
	const path = join(dir, `${slug}.md`);
	if (existsSync(path)) {
		console.error(chalk.yellow(`Already exists: ${path}`));
		process.exit(1);
	}
	const template = `# Plan: ${slug}

> Created: ${new Date().toISOString()}
> State: pending — approve with \`badi plan approve ${slug}\`, reject with \`badi plan deny ${slug}\`.

## Goal
<!-- What will be done? -->

## Steps
1. ...
2. ...

## Test plan
- [ ] ...

## Risks
- ...
`;
	writeFileSync(path, template);
	console.log(chalk.green(`Plan created: ${path}`));
}

function cmdShow(slug, cwd) {
	if (!isValidSlug(slug)) {
		console.error(chalk.red(`Invalid slug: ${slug}`));
		process.exit(1);
	}
	const p = planStatus(slug, cwd);
	if (!p.hasPlan) {
		console.error(chalk.red(`Plan file not found: ${p.planPath}`));
		process.exit(1);
	}
	console.log(readFileSync(p.planPath, "utf-8"));
}

function cmdStatus(slug, cwd, format) {
	if (!isValidSlug(slug)) {
		console.error(chalk.red(`Invalid slug: ${slug}`));
		process.exit(1);
	}
	const p = planStatus(slug, cwd);
	if (format === "json") {
		console.log(JSON.stringify(p));
		process.exit(p.state === "approved" ? 0 : 1);
	}
	const color =
		p.state === "approved"
			? chalk.green
			: p.state === "denied"
				? chalk.red
				: chalk.yellow;
	console.log(`${slug}: ${color(p.state)}`);
	if (p.reason) console.log(chalk.dim(`  Reason: ${p.reason}`));
	process.exit(p.state === "approved" ? 0 : 1);
}

function cmdApprove(slug, cwd) {
	if (!isValidSlug(slug)) {
		console.error(chalk.red(`Invalid slug: ${slug}`));
		process.exit(1);
	}
	const dir = plansDir(cwd);
	ensureDir(dir);
	const ap = join(dir, `${slug}.approved`);
	const dn = join(dir, `${slug}.denied`);
	if (existsSync(dn)) unlinkSync(dn);
	writeFileSync(ap, `${new Date().toISOString()}\n`);
	console.log(chalk.green(`Approved: ${slug}`));
}

function cmdDeny(slug, reason, cwd) {
	if (!isValidSlug(slug)) {
		console.error(chalk.red(`Invalid slug: ${slug}`));
		process.exit(1);
	}
	const dir = plansDir(cwd);
	ensureDir(dir);
	const ap = join(dir, `${slug}.approved`);
	const dn = join(dir, `${slug}.denied`);
	if (existsSync(ap)) unlinkSync(ap);
	writeFileSync(dn, `${new Date().toISOString()}\n${reason || ""}`);
	console.log(chalk.red(`Denied: ${slug}${reason ? ` — ${reason}` : ""}`));
}

function cmdReset(slug, cwd) {
	if (!isValidSlug(slug)) {
		console.error(chalk.red(`Invalid slug: ${slug}`));
		process.exit(1);
	}
	const dir = plansDir(cwd);
	const ap = join(dir, `${slug}.approved`);
	const dn = join(dir, `${slug}.denied`);
	let removed = 0;
	if (existsSync(ap)) {
		unlinkSync(ap);
		removed++;
	}
	if (existsSync(dn)) {
		unlinkSync(dn);
		removed++;
	}
	console.log(chalk.dim(`Reset: ${slug} (${removed} marker silindi)`));
}

export function runPlan(args) {
	const sub = args[0];
	const cwd = process.cwd();

	if (!sub || sub === "--help" || sub === "-h") {
		printHelp();
		return;
	}

	switch (sub) {
		case "list":
			return cmdList(cwd);
		case "new":
			return cmdNew(args[1], cwd);
		case "show":
			return cmdShow(args[1], cwd);
		case "status": {
			const format = args.includes("--format")
				? args[args.indexOf("--format") + 1]
				: null;
			return cmdStatus(args[1], cwd, format);
		}
		case "approve":
			return cmdApprove(args[1], cwd);
		case "deny": {
			// reason: 2. argumandan sonrasi (boslukla join)
			const reason = args
				.slice(2)
				.filter((a) => !a.startsWith("--"))
				.join(" ");
			return cmdDeny(args[1], reason, cwd);
		}
		case "reset":
			return cmdReset(args[1], cwd);
		default:
			console.error(chalk.red(`Bilinmeyen plan komutu: ${sub}`));
			printHelp();
			process.exit(1);
	}
}

// Export for test
// basename re-export icin (test sade kalsin)
export { basename, isValidSlug, plansDir };
