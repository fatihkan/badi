// Lazy: the template module is ~500 lines, only needed when generating templates.
// English-only (phase 1): only en.js is loaded; tr.js was removed.
let _enCache;

export async function loadTemplates() {
	if (!_enCache)
		_enCache = (await import("../../templates/en.js")).contentTemplatesEN;
	return _enCache;
}
