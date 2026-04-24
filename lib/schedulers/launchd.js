import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const LABEL_PREFIX = "com.badi.watcher.";

function plistPath(name) {
	return join(
		homedir(),
		"Library",
		"LaunchAgents",
		`${LABEL_PREFIX}${name}.plist`,
	);
}

function xmlEscape(s) {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function buildPlist({
	label,
	cmd,
	args,
	cwd,
	intervalSeconds,
	logOut,
	logErr,
}) {
	const argXml = [cmd, ...args]
		.map((a) => `    <string>${xmlEscape(a)}</string>`)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${xmlEscape(label)}</string>
  <key>ProgramArguments</key>
  <array>
${argXml}
  </array>
  <key>StartInterval</key>
  <integer>${intervalSeconds}</integer>
  <key>WorkingDirectory</key>
  <string>${xmlEscape(cwd)}</string>
  <key>StandardOutPath</key>
  <string>${xmlEscape(logOut)}</string>
  <key>StandardErrorPath</key>
  <string>${xmlEscape(logErr)}</string>
  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>
`;
}

export default {
	id: "launchd",
	platform: "darwin",

	isAvailable() {
		return process.platform === "darwin";
	},

	install({ name, cmd, args, cwd, intervalSeconds, logDir }, { dryRun } = {}) {
		const label = `${LABEL_PREFIX}${name}`;
		const plist = plistPath(name);
		const logOut = join(logDir, `${name}.out.log`);
		const logErr = join(logDir, `${name}.err.log`);
		if (!dryRun && !existsSync(logDir)) mkdirSync(logDir, { recursive: true });
		const content = buildPlist({
			label,
			cmd,
			args,
			cwd,
			intervalSeconds,
			logOut,
			logErr,
		});
		if (dryRun) return { plan: plist, content };
		mkdirSync(join(plist, ".."), { recursive: true });
		writeFileSync(plist, content);
		// launchctl bootout/bootstrap for gui/<uid> would be proper; load is
		// deprecated but still works on user domain. Fallback for wider macOS compat.
		const uid = process.getuid?.();
		if (uid !== undefined) {
			spawnSync("launchctl", ["bootout", `gui/${uid}`, plist], {
				stdio: "ignore",
			});
			spawnSync("launchctl", ["bootstrap", `gui/${uid}`, plist], {
				stdio: "ignore",
			});
		} else {
			spawnSync("launchctl", ["unload", plist], { stdio: "ignore" });
			spawnSync("launchctl", ["load", "-w", plist], { stdio: "ignore" });
		}
		return { plan: plist };
	},

	uninstall({ name }, { dryRun } = {}) {
		const plist = plistPath(name);
		if (dryRun) return { plan: plist, existed: existsSync(plist) };
		if (!existsSync(plist)) return { plan: plist, existed: false };
		const uid = process.getuid?.();
		if (uid !== undefined) {
			spawnSync("launchctl", ["bootout", `gui/${uid}`, plist], {
				stdio: "ignore",
			});
		} else {
			spawnSync("launchctl", ["unload", plist], { stdio: "ignore" });
		}
		unlinkSync(plist);
		return { plan: plist, existed: true };
	},

	isInstalled({ name }) {
		return existsSync(plistPath(name));
	},

	describe({ name }) {
		const p = plistPath(name);
		if (!existsSync(p)) return null;
		const raw = readFileSync(p, "utf-8");
		const interval = raw.match(/<key>StartInterval<\/key>\s*<integer>(\d+)/);
		return {
			scheduler: "launchd",
			plist: p,
			intervalSeconds: interval ? Number.parseInt(interval[1], 10) : null,
		};
	},
};
