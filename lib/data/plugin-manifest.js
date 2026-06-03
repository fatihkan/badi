// Plugin manifest schema + apiVersion compat checker + dependency sort.
//
// Manifest format (badi-plugin.json):
//
//   {
//     "name": "my-plugin",
//     "version": "0.3.0",
//     "description": "...",
//     "badi": {                       // optional (v1.30+ field)
//       "apiVersion": "1.x",          // simple semver-range form: X.x | X.Y.x | X.Y.Z | *
//       "dependsOn": ["other@>=0.2"]  // dependency on other plugins (semver range)
//     },
//     "agents": [...],
//     "commands": [...],
//     "hooks": [...],
//     "skills": { ... }
//   }
//
// If apiVersion is missing: BADI_DEFAULT_API_VERSION applies (1.x). This
// provides backward compatibility for old plugins.

export const BADI_DEFAULT_API_VERSION = "1.x";

/**
 * Parse a simple range string. Returns { matcher, recognized }.
 *
 * `matcher(version)` -> bool. `recognized` true means the format was parsed;
 * false means an unknown format and we fell through to a permissive matcher
 * (returns true for all). Callers (doctor/install) should surface a warning
 * when `recognized === false` so operators are not silently misled (v1.30
 * review A2/B1).
 *
 * Supported forms:
 *   "*"          any              | recognized=true
 *   "1.x"        major 1          | recognized=true
 *   "1.30.x"    major 1, minor 30 | recognized=true
 *   "1.30.5"     exact            | recognized=true
 *   ">=1.0"      gte (M.m)        | recognized=true
 *   ">=1.30.0"   gte (M.m.p)      | recognized=true
 *   <anything else>                | recognized=false (permissive fallback)
 *
 * For backwards-compat: the function is still callable as a matcher directly.
 * The returned object has a `Symbol.for("badi.matcher")` getter, but consumers
 * MUST destructure `{ matcher, recognized }` when they need the recognized flag.
 */
export function parseRange(range) {
	if (!range || range === "*") {
		return makeRange(() => true, true);
	}
	const trimmed = String(range).trim();

	// >=X.Y[.Z]
	const gte = trimmed.match(/^>=\s*(\d+)\.(\d+)(?:\.(\d+))?$/);
	if (gte) {
		const M = Number(gte[1]);
		const m = Number(gte[2]);
		const p = gte[3] != null ? Number(gte[3]) : 0;
		return makeRange((version) => {
			const parts = parseVersion(version);
			if (!parts) return false;
			if (parts.major !== M) return parts.major > M;
			if (parts.minor !== m) return parts.minor > m;
			return parts.patch >= p;
		}, true);
	}

	// X.Y.x
	const minorWildcard = trimmed.match(/^(\d+)\.(\d+)\.x$/);
	if (minorWildcard) {
		const M = Number(minorWildcard[1]);
		const m = Number(minorWildcard[2]);
		return makeRange((version) => {
			const parts = parseVersion(version);
			return !!parts && parts.major === M && parts.minor === m;
		}, true);
	}

	// X.x
	const majorWildcard = trimmed.match(/^(\d+)\.x$/);
	if (majorWildcard) {
		const M = Number(majorWildcard[1]);
		return makeRange((version) => {
			const parts = parseVersion(version);
			return !!parts && parts.major === M;
		}, true);
	}

	// X.Y.Z (exact)
	const exact = trimmed.match(/^(\d+)\.(\d+)\.(\d+)$/);
	if (exact) {
		return makeRange((version) => version === trimmed, true);
	}

	// Unrecognized — permissive fallback + recognized:false flag.
	return makeRange(() => true, false);
}

// makeRange: callers can use either the `parseRange(r)("1.0.0")` form or the
// `const {matcher, recognized} = parseRange(r); matcher("1.0.0")` form.
function makeRange(matcher, recognized) {
	const fn = (v) => matcher(v);
	fn.matcher = matcher;
	fn.recognized = recognized;
	return fn;
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
		errors.push("Manifest is invalid or empty");
		return { valid: false, errors, warnings };
	}

	if (!manifest.name || typeof manifest.name !== "string") {
		errors.push("'name' field is required (string)");
	}
	if (manifest.version && !parseVersion(manifest.version)) {
		warnings.push(`'version' is not in semver format: ${manifest.version}`);
	}

	const badiField = manifest.badi || {};
	if (badiField.apiVersion !== undefined) {
		if (typeof badiField.apiVersion !== "string") {
			errors.push("'badi.apiVersion' must be a string");
		}
	}
	if (badiField.dependsOn !== undefined) {
		if (!Array.isArray(badiField.dependsOn)) {
			errors.push("'badi.dependsOn' must be an array");
		} else {
			for (const dep of badiField.dependsOn) {
				if (typeof dep !== "string") {
					errors.push(
						`'badi.dependsOn' every element must be a string: ${dep}`,
					);
				}
			}
		}
	}

	return { valid: errors.length === 0, errors, warnings };
}

/**
 * Compare apiVersion.
 *  - if manifest.badi.apiVersion is unspecified: BADI_DEFAULT_API_VERSION (1.x)
 *  - if badiVersion (current badi semver) satisfies the range: ok
 * Return: { ok, range, badiVersion, reason? }
 */
export function checkApiCompat(manifest, badiVersion) {
	const range =
		manifest?.badi?.apiVersion ||
		manifest?.engines?.badi ||
		BADI_DEFAULT_API_VERSION;
	const fn = parseRange(range);
	const ok = fn(badiVersion);
	const recognized = fn.recognized !== false;
	if (!ok) {
		return {
			ok: false,
			recognized,
			range,
			badiVersion,
			reason: `Plugin apiVersion '${range}' is not compatible with Badi v${badiVersion}`,
		};
	}
	if (!recognized) {
		return {
			ok: true,
			recognized: false,
			range,
			badiVersion,
			warning: `apiVersion format not recognized: '${range}' (permissive fallback applied; known formats: '*', 'X.x', 'X.Y.x', 'X.Y.Z', '>=X.Y[.Z]')`,
		};
	}
	return { ok: true, recognized: true, range, badiVersion };
}

/**
 * Parse "name@range" -> { name, range }. range is "*" if null.
 */
export function parseDependency(spec) {
	const at = spec.indexOf("@");
	if (at < 0) return { name: spec, range: "*" };
	return { name: spec.slice(0, at), range: spec.slice(at + 1) || "*" };
}

/**
 * Topologically sort plugins by dependency order. Plugins: array
 * of { name, version, badi: { dependsOn } }. Throws if there is a cycle.
 * One-way: a depends on b => b is loaded first.
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
