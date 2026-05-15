// Komut profil tanimlari.
//
// 77 .claude/commands/ dosyasi 4 profile bolunur:
//   core    — her zaman aktif (oturum yonetimi, olcum)
//   dev     — kod/altyapi/devops odakli
//   content — sosyal medya/marketing odakli
//   pentest — yetkili pentest engagement (gelecek)
//
// "all" profili tum komutlari acar (default).
// "core" profili sadece zorunlu komutlari birakir.

export const PROFILES = ["core", "dev", "content", "pentest", "all"];

/**
 * Her komutun ana profil etiketi.
 * Bir komut yalnizca bir profile aittir (basit dahil/cikar).
 * "core" komutlari her zaman aktiftir, profili degistiren komutlarda
 * bile kalir.
 */
export const COMMAND_PROFILES = {
	// core (20) — her zaman aktif
	start: "core",
	sync: "core",
	"wrap-up": "core",
	clear: "core",
	doctor: "core",
	"system-audit": "core",
	"drift-detect": "core",
	health: "core",
	dashboard: "core",
	stats: "core",
	"ai-token": "core",
	schedule: "core",
	plugin: "core",
	"memory-diff": "core",
	"prompt-test": "core",
	audit: "core",
	unstick: "core",
	handoff: "core",
	coach: "core",
	standup: "core",
	onboard: "core",

	// dev (40) — gelistirme/devops/audit
	adr: "dev",
	"ai-review": "dev",
	"ai-translate": "dev",
	"api-doc": "dev",
	"api-test": "dev",
	architect: "dev",
	brief: "dev",
	"bundle-analyze": "dev",
	changelog: "dev",
	"changelog-gen": "dev",
	"conv-commit": "dev",
	"debt-map": "dev",
	deploy: "dev",
	"deps-update": "dev",
	"docker-lint": "dev",
	"docs-audit": "dev",
	"env-check": "dev",
	hotfix: "dev",
	lighthouse: "dev",
	"perf-check": "dev",
	playbook: "dev",
	"post-mortem": "dev",
	refactor: "dev",
	release: "dev",
	report: "dev",
	retro: "dev",
	review: "dev",
	scaffold: "dev",
	"secret-scan": "dev",
	"security-scan": "dev",
	"spec-check": "dev",
	"a11y-audit": "dev",
	"dns-audit": "dev",
	"ssl-check": "dev",
	whois: "dev",
	seo: "dev",
	aso: "dev",
	wp: "dev",
	mobile: "dev",

	// content (17) — icerik uretim/marketing
	"gorsel-brief": "content",
	"icerik-ara": "content",
	"icerik-basla": "content",
	"icerik-durum": "content",
	"icerik-fikir": "content",
	"icerik-kapat": "content",
	"icerik-perf": "content",
	"icerik-plan": "content",
	"icerik-sablon": "content",
	"icerik-takvimi": "content",
	"icerik-uret": "content",
	karousel: "content",
	"marka-sesi": "content",
	"video-senaryo": "content",
	"competitive-intel": "content",
	launch: "content",
	proposal: "content",
};

/**
 * Verilen profil icin aktif kalmasi gereken komutlar.
 * core her zaman dahildir; "all" hepsini dondurur.
 */
export function commandsForProfile(profile) {
	const target = profile === "all" ? null : profile;
	const result = [];
	for (const [name, p] of Object.entries(COMMAND_PROFILES)) {
		if (target === null) result.push(name);
		else if (p === "core" || p === target) result.push(name);
	}
	return result.sort();
}

/**
 * Bir profilin uyesi olup olmadigini soyle.
 */
export function isInProfile(commandName, profile) {
	if (profile === "all") return true;
	const p = COMMAND_PROFILES[commandName];
	if (!p) return true; // bilinmiyor -> dokunma (kullanici komutu olabilir)
	return p === "core" || p === profile;
}

/**
 * Profil sayilari.
 */
export function profileCounts() {
	const counts = { core: 0, dev: 0, content: 0, pentest: 0 };
	for (const p of Object.values(COMMAND_PROFILES)) {
		if (counts[p] !== undefined) counts[p]++;
	}
	return counts;
}
