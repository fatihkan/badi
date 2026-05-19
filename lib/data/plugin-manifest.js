// Plugin manifest schema + apiVersion compat checker + dependency sort.
//
// Manifest format (badi-plugin.json):
//
//   {
//     "name": "my-plugin",
//     "version": "0.3.0",
//     "description": "...",
//     "badi": {                       // optional (v1.30+ field)
//       "apiVersion": "1.x",          // semver-range basit form: X.x | X.Y.x | X.Y.Z | *
//       "dependsOn": ["other@>=0.2"]  // diger plugin'lere bagimlilik (semver range)
//     },
//     "agents": [...],
//     "commands": [...],
//     "hooks": [...],
//     "skills": { ... }
//   }
//
// apiVersion eksikse: BADI_DEFAULT_API_VERSION uygulanir (1.x). Bu, eski
// plugin'ler icin geri-uyumluluk saglar.

export const BADI_DEFAULT_API_VERSION = "1.x";

/**
 * Parse a simple range string into a matcher fn(version) -> bool.
 * Supported forms:
 *   "*"          any
 *   "1.x"        major 1 (any minor/patch)
 *   "1.30.x"    major 1, minor 30 (any patch)
 *   "1.30.5"     exact (major.minor.patch)
 *   ">=1.0"      gte (major.minor)
 *   ">=1.30.0"   gte (major.minor.patch)
 */
export function parseRange(range) {
	if (!range || range === "*") return () => true;
	const trimmed = String(range).trim();

	// >=X.Y[.Z]
	const gte = trimmed.match(/^>=\s*(\d+)\.(\d+)(?:\.(\d+))?$/);
	if (gte) {
		const M = Number(gte[1]);
		const m = Number(gte[2]);
		const p = gte[3] != null ? Number(gte[3]) : 0;
		return (version) => {
			const parts = parseVersion(version);
			if (!parts) return false;
			if (parts.major !== M) return parts.major > M;
			if (parts.minor !== m) return parts.minor > m;
			return parts.patch >= p;
		};
	}

	// X.Y.x
	const minorWildcard = trimmed.match(/^(\d+)\.(\d+)\.x$/);
	if (minorWildcard) {
		const M = Number(minorWildcard[1]);
		const m = Number(minorWildcard[2]);
		return (version) => {
			const parts = parseVersion(version);
			return !!parts && parts.major === M && parts.minor === m;
		};
	}

	// X.x
	const majorWildcard = trimmed.match(/^(\d+)\.x$/);
	if (majorWildcard) {
		const M = Number(majorWildcard[1]);
		return (version) => {
			const parts = parseVersion(version);
			return !!parts && parts.major === M;
		};
	}

	// X.Y.Z (exact)
	const exact = trimmed.match(/^(\d+)\.(\d+)\.(\d+)$/);
	if (exact) {
		return (version) => version === trimmed;
	}

	// Unrecognized — be permissive (warn at call site)
	return () => true;
}

export function parseVersion(version) {
	if (!version || typeof version !== "string") return null;
	const m = version.match(/^(\d+)\.(\d+)\.(\d+)/);
	if (!m) return null;
	return {
		major: Number(m[1]),
		minor: Number(m[2]),
		patch: Number(m[3]),
	};
}

/**
 * Manifest validate. Returns {valid, errors[], warnings[]}.
 * Hard errors prevent install/load. Warnings are surfaced but allowed.
 */
export function validateManifest(manifest) {
	const errors = [];
	const warnings = [];

	if (!manifest || typeof manifest !== "object") {
		errors.push("Manifest gecersiz veya bos");
		return { valid: false, errors, warnings };
	}

	if (!manifest.name || typeof manifest.name !== "string") {
		errors.push("'name' alani zorunlu (string)");
	}
	if (manifest.version && !parseVersion(manifest.version)) {
		warnings.push(`'version' semver formatinda degil: ${manifest.version}`);
	}

	const badiField = manifest.badi || {};
	if (badiField.apiVersion !== undefined) {
		if (typeof badiField.apiVersion !== "string") {
			errors.push("'badi.apiVersion' string olmali");
		}
	}
	if (badiField.dependsOn !== undefined) {
		if (!Array.isArray(badiField.dependsOn)) {
			errors.push("'badi.dependsOn' array olmali");
		} else {
			for (const dep of badiField.dependsOn) {
				if (typeof dep !== "string") {
					errors.push(`'badi.dependsOn' her eleman string olmali: ${dep}`);
				}
			}
		}
	}

	return { valid: errors.length === 0, errors, warnings };
}

/**
 * apiVersion karsilastir.
 *  - manifest.badi.apiVersion belirtilmemisse: BADI_DEFAULT_API_VERSION (1.x)
 *  - badiVersion (mevcut badi semver) range'i karsilamaliyse: ok
 * Return: { ok, range, badiVersion, reason? }
 */
export function checkApiCompat(manifest, badiVersion) {
	const range =
		manifest?.badi?.apiVersion ||
		manifest?.engines?.badi ||
		BADI_DEFAULT_API_VERSION;
	const matcher = parseRange(range);
	const ok = matcher(badiVersion);
	if (!ok) {
		return {
			ok: false,
			range,
			badiVersion,
			reason: `Plugin apiVersion '${range}' ile Badi v${badiVersion} uyumlu degil`,
		};
	}
	return { ok: true, range, badiVersion };
}

/**
 * Parse "name@range" -> { name, range }. range null ise "*".
 */
export function parseDependency(spec) {
	const at = spec.indexOf("@");
	if (at < 0) return { name: spec, range: "*" };
	return { name: spec.slice(0, at), range: spec.slice(at + 1) || "*" };
}

/**
 * Topological sort plugin'leri bagimlilik sirasiyla. Plugins: array
 * of { name, version, badi: { dependsOn } }. Cycle varsa hata firlatir.
 * Tek-yon: a depends on b => b once load edilir.
 */
export function topoSort(plugins) {
	const byName = new Map();
	for (const p of plugins) {
		byName.set(p.name, p);
	}

	const indeg = new Map();
	const adj = new Map();
	for (const p of plugins) {
		indeg.set(p.name, 0);
		adj.set(p.name, []);
	}
	for (const p of plugins) {
		const deps = p.badi?.dependsOn || [];
		for (const dep of deps) {
			const { name } = parseDependency(dep);
			if (!byName.has(name)) continue; // unresolved dep: warn caller
			adj.get(name).push(p.name);
			indeg.set(p.name, (indeg.get(p.name) || 0) + 1);
		}
	}

	const queue = [];
	for (const [name, deg] of indeg) {
		if (deg === 0) queue.push(name);
	}
	const sorted = [];
	while (queue.length) {
		const name = queue.shift();
		sorted.push(name);
		for (const next of adj.get(name)) {
			const d = indeg.get(next) - 1;
			indeg.set(next, d);
			if (d === 0) queue.push(next);
		}
	}
	if (sorted.length !== plugins.length) {
		throw new Error(
			`Plugin dependency cycle algilandi (${plugins.length - sorted.length} plugin sort edilemedi)`,
		);
	}
	return sorted.map((n) => byName.get(n));
}

/**
 * Find missing/unsatisfied dependencies. Returns array of issues:
 *   { plugin, dep, reason: "missing" | "version-mismatch", requested, installed }
 */
export function findUnsatisfied(plugins) {
	const byName = new Map();
	for (const p of plugins) byName.set(p.name, p);

	const issues = [];
	for (const p of plugins) {
		const deps = p.badi?.dependsOn || [];
		for (const dep of deps) {
			const { name, range } = parseDependency(dep);
			const installed = byName.get(name);
			if (!installed) {
				issues.push({
					plugin: p.name,
					dep: name,
					reason: "missing",
					requested: range,
					installed: null,
				});
				continue;
			}
			const matcher = parseRange(range);
			if (!matcher(installed.version || "0.0.0")) {
				issues.push({
					plugin: p.name,
					dep: name,
					reason: "version-mismatch",
					requested: range,
					installed: installed.version,
				});
			}
		}
	}
	return issues;
}
