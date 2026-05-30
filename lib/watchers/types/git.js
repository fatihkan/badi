import { spawnSync } from "node:child_process";

/**
 * Git watcher: polls `git log` within a scope and matches a regex pattern.
 *
 * Accepted check shape:
 *   { type: "git", pattern: "merge conflict|fatal", scope: "last-10-commits" }
 *
 * Scopes:
 *   "last-N-commits"  (N integer; default N=10)
 *   "since:<gitref>"  (e.g. "since:HEAD~5" or a tag/branch)
 */
export default function runGitCheck(check, { cwd }) {
	if (!check.pattern) {
		return { pass: false, message: "git watch pattern empty" };
	}
	const scope = check.scope || "last-10-commits";
	const args = ["log", "--pretty=%H %s"];
	const m = scope.match(/^last-(\d+)-commits?$/);
	if (m) {
		args.push(`-${m[1]}`);
	} else if (scope.startsWith("since:")) {
		args.push(`${scope.slice("since:".length)}..HEAD`);
	} else if (scope === "all") {
		// no extra arg
	} else {
		return { pass: false, message: `Unknown git scope: ${scope}` };
	}

	const res = spawnSync("git", args, { cwd, encoding: "utf-8" });
	if (res.status !== 0) {
		return {
			pass: false,
			message: "git log failed",
			details: [(res.stderr || "").trim()],
		};
	}
	const re = new RegExp(check.pattern, "i");
	const matches = (res.stdout || "").split("\n").filter((l) => l && re.test(l));
	if (matches.length === 0) {
		return { pass: true, message: `OK (${scope})` };
	}
	return {
		pass: false,
		message: `${matches.length} commit matches (/${check.pattern}/)`,
		details: matches.slice(0, 10),
	};
}
