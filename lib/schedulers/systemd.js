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

const SERVICE_PREFIX = "badi-watcher-";

function unitDir() {
	return join(homedir(), ".config", "systemd", "user");
}
function servicePath(name) {
	return join(unitDir(), `${SERVICE_PREFIX}${name}.service`);
}
function timerPath(name) {
	return join(unitDir(), `${SERVICE_PREFIX}${name}.timer`);
}

function intervalToOnUnitActive(intervalSeconds) {
	if (intervalSeconds >= 86400) {
		const days = Math.round(intervalSeconds / 86400);
		return `${days}d`;
	}
	if (intervalSeconds >= 3600) {
		const h = Math.round(intervalSeconds / 3600);
		return `${h}h`;
	}
	const m = Math.max(1, Math.round(intervalSeconds / 60));
	return `${m}min`;
}

function buildService({ cmd, args, cwd, description }) {
	const execStart = [cmd, ...args]
		.map((a) => (a.includes(" ") ? `"${a}"` : a))
		.join(" ");
	return `[Unit]
Description=${description}

[Service]
Type=oneshot
WorkingDirectory=${cwd}
ExecStart=${execStart}
`;
}

function buildTimer({ description, intervalSeconds }) {
	const every = intervalToOnUnitActive(intervalSeconds);
	return `[Unit]
Description=Timer for ${description}

[Timer]
OnBootSec=2min
OnUnitActiveSec=${every}
Persistent=true

[Install]
WantedBy=timers.target
`;
}

function systemctlAvailable() {
	const r = spawnSync("systemctl", ["--user", "--version"], {
		stdio: "ignore",
	});
	return r.status === 0;
}

export default {
	id: "systemd",
	platform: "linux",

	isAvailable() {
		return process.platform === "linux" && systemctlAvailable();
	},

	install({ name, cmd, args, cwd, intervalSeconds }, { dryRun } = {}) {
		const svc = servicePath(name);
		const tmr = timerPath(name);
		const description = `Badi watcher: ${name}`;
		const serviceContent = buildService({ cmd, args, cwd, description });
		const timerContent = buildTimer({ description, intervalSeconds });

		if (dryRun) {
			return {
				plan: { service: svc, timer: tmr },
				content: { service: serviceContent, timer: timerContent },
			};
		}
		if (!existsSync(unitDir())) mkdirSync(unitDir(), { recursive: true });
		writeFileSync(svc, serviceContent);
		writeFileSync(tmr, timerContent);
		spawnSync("systemctl", ["--user", "daemon-reload"], { stdio: "ignore" });
		spawnSync(
			"systemctl",
			["--user", "enable", "--now", `${SERVICE_PREFIX}${name}.timer`],
			{ stdio: "ignore" },
		);
		return { plan: { service: svc, timer: tmr } };
	},

	uninstall({ name }, { dryRun } = {}) {
		const svc = servicePath(name);
		const tmr = timerPath(name);
		const existed = existsSync(svc) || existsSync(tmr);
		if (dryRun) return { plan: { service: svc, timer: tmr }, existed };
		if (!existed) return { plan: { service: svc, timer: tmr }, existed: false };
		spawnSync(
			"systemctl",
			["--user", "disable", "--now", `${SERVICE_PREFIX}${name}.timer`],
			{ stdio: "ignore" },
		);
		for (const p of [svc, tmr]) if (existsSync(p)) unlinkSync(p);
		spawnSync("systemctl", ["--user", "daemon-reload"], { stdio: "ignore" });
		return { plan: { service: svc, timer: tmr }, existed: true };
	},

	isInstalled({ name }) {
		return existsSync(timerPath(name));
	},

	describe({ name }) {
		const tmr = timerPath(name);
		if (!existsSync(tmr)) return null;
		const raw = readFileSync(tmr, "utf-8");
		const m = raw.match(/OnUnitActiveSec=(\S+)/);
		return {
			scheduler: "systemd",
			service: servicePath(name),
			timer: tmr,
			every: m ? m[1] : null,
		};
	},
};
