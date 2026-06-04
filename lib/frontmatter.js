// Minimal markdown frontmatter parser.
//
// Kept standalone (no chalk/cli) — so external tooling (e.g. the
// badi-skills CI validate workflow) can validate a skill's schema by
// fetching only this file.

export function parseFrontmatter(content) {
	// Windows CRLF (git core.autocrlf=true) -> \r\n; if a split only does \n
	// you get "---\r" and the === "---" comparison fails. Strip \r first.
	const lines = content.replace(/\r\n/g, "\n").split("\n");
	if (lines[0] !== "---") return { meta: {}, body: content };
	const endIdx = lines.indexOf("---", 1);
	if (endIdx === -1) return { meta: {}, body: content };
	const meta = {};
	for (let i = 1; i < endIdx; i++) {
		const colonIdx = lines[i].indexOf(": ");
		if (colonIdx > 0) {
			meta[lines[i].substring(0, colonIdx).trim()] = lines[i]
				.substring(colonIdx + 2)
				.trim();
		}
	}
	return {
		meta,
		body: lines
			.slice(endIdx + 1)
			.join("\n")
			.trim(),
	};
}
