// Skill frontmatter schema — agentskills.io standardi (issue #56) + Badi
// gereksinimleri.
//
// Mevcut .claude/skills/<name>/SKILL.md dosyalarini bu modul dogrular ve
// badi-skills repo'suna bundle edilirken eksik alanlar uyari uretir.
//
// Calisma kipleri:
// - default ("warn"): eksik alanlar warning, ana akis devam
// - "strict": her warning error'a yukselir, validate yesil donmez
//
// Hata mesajlari English — agentskills.io ekosisteminde uluslarararasi
// kullaniciya hitap eder. Badi CLI cikti dili Turkce ama schema mesajlari
// (validate ciktisi) standart sekilde okumak icin English.

import { parseFrontmatter } from "../icerik-helpers.js";

export const KNOWN_TOOLS = [
	"Read",
	"Write",
	"Edit",
	"Bash",
	"Grep",
	"Glob",
	"Agent",
	"WebFetch",
	"WebSearch",
];

export const REQUIRED_TOP_FIELDS = [
	"name",
	"description",
	"license",
	"compatibility",
	"allowed-tools",
];

export const REQUIRED_METADATA_FIELDS = [
	"author",
	"homepage",
	"badi-version",
	"category",
];

export const KNOWN_CATEGORIES = [
	"design",
	"security",
	"content",
	"devops",
	"testing",
	"data-analytics",
	"ai-automation",
	"behavioral",
	"finance",
	"sales",
	"marketing",
	"customer-success",
	"product",
	"productivity",
	"consulting",
	"startup",
	"ecommerce",
	"email",
	"frontend",
	"mobile",
	"seo",
	"social-media",
	"development",
];

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;
const URL_RE = /^https?:\/\/[^\s]+$/;
const BADI_VERSION_RE = /^[><=^~]*\s*\d+\.\d+\.\d+/;
const MIN_DESCRIPTION_LEN = 50;

function isObject(v) {
	return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Parse SKILL.md icerigini frontmatter + body olarak ayir. parseFrontmatter
 * (icerik-helpers'taki) frontmatter'i basit bir flat-object olarak donduyor.
 * Schema icin nested metadata bekledigimiz icin frontmatter'i ham YAML
 * stringi olarak da almak istiyoruz.
 */
export function parseSkillFile(content) {
	const fm = parseFrontmatter(content);
	if (!fm.meta || Object.keys(fm.meta).length === 0) {
		return { meta: null, body: content, raw: "" };
	}
	// parseFrontmatter raw'i da dondursun istiyorduk; helper sadece flat
	// dondurmuyor — meta + body alani var, raw'i ayrica cikaralim.
	const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
	const raw = m ? m[1] : "";
	return { meta: fm.meta, body: fm.body, raw };
}

/**
 * Daha zengin bir frontmatter parser — nested metadata icin. icerik-helpers'in
 * parseFrontmatter'i flat key-value cikariyor (security-check'in `metadata:`
 * blok yapisini parse edemiyor). Bu fonksiyon block-style YAML'in subset'ini
 * tanir: 1 seviye nested object + scalar/string/list values.
 */
export function parseRichFrontmatter(content) {
	const m = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!m) return { meta: null, body: content };
	const yaml = m[1];
	const body = m[2] || "";

	const result = {};
	const lines = yaml.split("\n");
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim() || line.trim().startsWith("#")) {
			i++;
			continue;
		}

		const topMatch = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
		if (!topMatch) {
			i++;
			continue;
		}
		const key = topMatch[1];
		const inline = topMatch[2];

		// Block-scalar marker (e.g. "description: >")
		if (inline === ">" || inline === "|") {
			let acc = "";
			i++;
			while (i < lines.length && /^\s+/.test(lines[i])) {
				acc += `${lines[i].trim()} `;
				i++;
			}
			result[key] = acc.trim();
			continue;
		}

		// Inline value
		if (inline) {
			result[key] = parseScalar(inline);
			i++;
			continue;
		}

		// Nested block — collect indented lines
		const child = {};
		i++;
		while (i < lines.length) {
			const childLine = lines[i];
			if (!childLine.startsWith("  ") && childLine.trim() !== "") break;
			if (!childLine.trim()) {
				i++;
				continue;
			}
			const cm = childLine.match(/^\s+([a-zA-Z][\w-]*):\s*(.*)$/);
			if (cm) {
				const k = cm[1];
				const v = cm[2];
				if (v.startsWith("- ") || v === "") {
					// Inline list start or list-only — collect items
					const items = [];
					if (v.startsWith("- ")) items.push(parseScalar(v.slice(2)));
					i++;
					while (i < lines.length) {
						const itm = lines[i].match(/^\s+-\s+(.*)$/);
						if (!itm) break;
						items.push(parseScalar(itm[1]));
						i++;
					}
					child[k] = items;
					continue;
				}
				child[k] = parseScalar(v);
				i++;
				continue;
			}
			i++;
		}
		result[key] = child;
	}

	return { meta: result, body };
}

function parseScalar(v) {
	const s = v.trim();
	if (s === "true") return true;
	if (s === "false") return false;
	if (s === "null" || s === "") return null;
	if (/^-?\d+$/.test(s)) return Number.parseInt(s, 10);
	if (/^-?\d+\.\d+$/.test(s)) return Number.parseFloat(s);
	if (
		(s.startsWith('"') && s.endsWith('"')) ||
		(s.startsWith("'") && s.endsWith("'"))
	) {
		return s.slice(1, -1);
	}
	return s;
}

/**
 * Bir SKILL.md frontmatter'ini schema'ya gore dogrula.
 *
 * @param {object} meta — parseRichFrontmatter sonucu
 * @param {object} opts — { strict: bool, expectedName?: string }
 * @returns {{ok: boolean, errors: string[], warnings: string[]}}
 */
export function validateSkill(meta, opts = {}) {
	const errors = [];
	const warnings = [];

	if (!isObject(meta)) {
		errors.push("Frontmatter parse edilemedi (--- ile sarmalanmis YAML bekliyor).");
		return finalize(errors, warnings, opts);
	}

	for (const f of REQUIRED_TOP_FIELDS) {
		if (meta[f] === undefined || meta[f] === null || meta[f] === "") {
			errors.push(`Required field missing: ${f}`);
		}
	}

	if (typeof meta.name === "string" && !SLUG_RE.test(meta.name)) {
		errors.push(
			`name must match ${SLUG_RE} (lowercase alphanumeric + dash, 2-64 chars). Got: ${meta.name}`,
		);
	}

	if (
		opts.expectedName &&
		typeof meta.name === "string" &&
		meta.name !== opts.expectedName
	) {
		warnings.push(
			`name "${meta.name}" does not match directory "${opts.expectedName}".`,
		);
	}

	if (typeof meta.description === "string") {
		if (meta.description.length < MIN_DESCRIPTION_LEN) {
			warnings.push(
				`description is ${meta.description.length} chars; >=${MIN_DESCRIPTION_LEN} recommended for trigger activation.`,
			);
		}
	}

	if (typeof meta["allowed-tools"] === "string") {
		const tools = meta["allowed-tools"].split(/\s+/).filter(Boolean);
		const unknown = tools.filter((t) => !KNOWN_TOOLS.includes(t));
		if (unknown.length > 0) {
			warnings.push(
				`allowed-tools contains unknown tool(s): ${unknown.join(", ")}. Known: ${KNOWN_TOOLS.join(", ")}`,
			);
		}
		if (tools.length === 0) {
			errors.push("allowed-tools is empty (must list at least one tool).");
		}
	}

	if (!isObject(meta.metadata)) {
		errors.push("metadata block required (object with author/homepage/badi-version/category).");
	} else {
		for (const f of REQUIRED_METADATA_FIELDS) {
			if (
				meta.metadata[f] === undefined ||
				meta.metadata[f] === null ||
				meta.metadata[f] === ""
			) {
				errors.push(`Required field missing: metadata.${f}`);
			}
		}
		if (
			typeof meta.metadata.homepage === "string" &&
			!URL_RE.test(meta.metadata.homepage)
		) {
			errors.push(
				`metadata.homepage must be an http(s) URL. Got: ${meta.metadata.homepage}`,
			);
		}
		if (
			typeof meta.metadata["badi-version"] === "string" &&
			!BADI_VERSION_RE.test(meta.metadata["badi-version"])
		) {
			warnings.push(
				`metadata.badi-version "${meta.metadata["badi-version"]}" does not look like a semver constraint (e.g. ">=1.14.0").`,
			);
		}
		if (
			typeof meta.metadata.category === "string" &&
			!KNOWN_CATEGORIES.includes(meta.metadata.category)
		) {
			warnings.push(
				`metadata.category "${meta.metadata.category}" is not in the known list. Known: ${KNOWN_CATEGORIES.join(", ")}`,
			);
		}
	}

	return finalize(errors, warnings, opts);
}

function finalize(errors, warnings, opts) {
	if (opts.strict) {
		// Strict mode: warnings -> errors
		const all = [...errors, ...warnings];
		return { ok: all.length === 0, errors: all, warnings: [] };
	}
	return { ok: errors.length === 0, errors, warnings };
}

/**
 * Dosya icerigini parse + validate sarici.
 */
export function validateSkillFile(content, opts = {}) {
	const { meta } = parseRichFrontmatter(content);
	return validateSkill(meta, opts);
}
