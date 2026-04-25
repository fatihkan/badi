// Lazy: template modulleri ~800 satir, sadece sablon uretiminde lazim
let _trCache;
let _enCache;

export async function loadTemplates(lang) {
	if (lang === "en") {
		if (!_enCache)
			_enCache = (await import("../../templates/en.js")).contentTemplatesEN;
		return _enCache;
	}
	if (!_trCache)
		_trCache = (await import("../../templates/tr.js")).contentTemplates;
	return _trCache;
}
