// Lazy: the template module is ~500 lines, only needed when generating templates.
// English-only (faz 1): yalniz en.js yuklenir; tr.js kaldirildi.
let _enCache;

export async function loadTemplates() {
	if (!_enCache)
		_enCache = (await import("../../templates/en.js")).contentTemplatesEN;
	return _enCache;
}
