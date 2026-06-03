import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const TMP = resolve(__dirname, "..", ".test-tmp-icerik");

function run(args = [], cwd = TMP) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd,
	});
}

describe("badi icerik", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		mkdirSync(TMP, { recursive: true });
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
	});

	it("--help yardim gosterir", () => {
		const output = run(["content", "--help"]);
		assert.ok(output.includes("Content Production Commands"));
		assert.ok(output.includes("post"));
		assert.ok(output.includes("carousel"));
		assert.ok(output.includes("video"));
		assert.ok(output.includes("visual"));
		assert.ok(output.includes("calendar"));
		assert.ok(output.includes("brand"));
	});

	it("post sablonu olusturur", () => {
		const output = run(["content", "post", "test konu"]);
		assert.ok(output.includes("POST template created"));
		const icerikDir = join(TMP, ".claude", "workspace", "icerikler");
		assert.ok(existsSync(icerikDir));
	});

	it("karousel sablonu olusturur", () => {
		const output = run(["content", "carousel", "5 ipucu"]);
		assert.ok(output.includes("CAROUSEL template created"));
	});

	it("video sablonu olusturur", () => {
		const output = run(["content", "video", "30 saniye demo"]);
		assert.ok(output.includes("VIDEO template created"));
		const videoDir = join(TMP, ".claude", "workspace", "senaryolar");
		assert.ok(existsSync(videoDir));
	});

	it("gorsel brief sablonu olusturur", () => {
		const output = run(["content", "visual", "banner"]);
		assert.ok(output.includes("VISUAL template created"));
		const gorselDir = join(TMP, ".claude", "workspace", "gorseller");
		assert.ok(existsSync(gorselDir));
	});

	it("takvim sablonu olusturur", () => {
		const output = run(["content", "calendar", "2026-04"]);
		assert.ok(output.includes("CALENDAR template created"));
		const takvimDir = join(TMP, ".claude", "workspace", "takvim");
		assert.ok(existsSync(takvimDir));
	});

	// v1.11+ yeni icerik turleri
	it("newsletter sablonu olusturur", () => {
		const output = run(["content", "newsletter", "haftalik bulten"]);
		assert.ok(output.includes("NEWSLETTER template created"));
		const dir = join(TMP, ".claude", "workspace", "bultenler");
		assert.ok(existsSync(dir));
		const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
		assert.ok(files.length > 0);
		const content = readFileSync(join(dir, files[0]), "utf-8");
		assert.ok(content.includes("KONU SATIRI") || content.includes("HOOK"));
	});

	it("podcast sablonu olusturur", () => {
		const output = run(["content", "podcast", "ep-01 giris"]);
		assert.ok(output.includes("PODCAST template created"));
		const dir = join(TMP, ".claude", "workspace", "podcastler");
		assert.ok(existsSync(dir));
		const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
		assert.ok(files.length > 0);
		const content = readFileSync(join(dir, files[0]), "utf-8");
		assert.ok(content.includes("Show Notes") || content.includes("HOOK"));
	});

	it("thread sablonu olusturur (icerikler/)", () => {
		const output = run(["content", "thread", "10 ipucu"]);
		assert.ok(output.includes("THREAD template created"));
		const dir = join(TMP, ".claude", "workspace", "icerikler");
		// UTC / yerel saat farki olmasin diye sadece "thread" icerigine bakiyoruz.
		const files = readdirSync(dir).filter(
			(f) => f.includes("thread") && f.endsWith(".md"),
		);
		assert.ok(files.length > 0);
		const content = readFileSync(join(dir, files[0]), "utf-8");
		assert.ok(content.includes("1/10") && content.includes("10/10"));
	});

	it("case-study sablonu olusturur", () => {
		const output = run(["content", "case-study", "acme"]);
		assert.ok(output.includes("CASE-STUDY template created"));
		const dir = join(TMP, ".claude", "workspace", "case-study");
		assert.ok(existsSync(dir));
		const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
		assert.ok(files.length > 0);
		const content = readFileSync(join(dir, files[0]), "utf-8");
		assert.ok(content.includes("PROBLEM") || content.includes("ONE-LINER"));
	});

	it("newsletter English sablon olusturur (suffix yok)", () => {
		const output = run(["content", "newsletter", "weekly update"]);
		assert.ok(output.includes("NEWSLETTER template created"));
		const dir = join(TMP, ".claude", "workspace", "bultenler");
		const files = readdirSync(dir).filter(
			(f) => f.includes("weekly-update") && f.endsWith(".md"),
		);
		assert.ok(files.length > 0);
		assert.ok(
			!files[0].includes("-en") && !files[0].includes("-tr"),
			"lang suffix olmamali",
		);
		const content = readFileSync(join(dir, files[0]), "utf-8");
		assert.ok(content.includes("Newsletter") || content.includes("SUBJECT"));
	});

	it("help yeni turleri gosterir", () => {
		const output = run(["content", "--help"]);
		assert.ok(output.includes("newsletter"));
		assert.ok(output.includes("podcast"));
		assert.ok(output.includes("thread"));
		assert.ok(output.includes("case-study"));
	});

	it("marka sesi sablonu olusturur", () => {
		const output = run(["content", "brand"]);
		assert.ok(output.includes("Brand voice guide created"));
		const markaPath = join(TMP, ".claude", "workspace", "marka-sesi.md");
		assert.ok(existsSync(markaPath));
		const content = readFileSync(markaPath, "utf-8");
		assert.ok(content.includes("Brand Voice"));
	});

	it("list uretilen icerikleri listeler", () => {
		const output = run(["content", "list"]);
		assert.ok(output.includes("Generated Content"));
		assert.ok(output.includes("Total"));
	});

	it("marka sesi ikinci kez olusturulmaz", () => {
		try {
			run(["content", "brand"]);
			assert.fail("Hata bekleniyor");
		} catch (e) {
			assert.ok(e.stderr.includes("zaten mevcut") || e.status === 1);
		}
	});

	it("bilinmeyen tur hata verir", () => {
		try {
			run(["content", "nonexistent"]);
			assert.fail("Hata bekleniyor");
		} catch (e) {
			assert.ok(e.stderr.includes("Bilinmeyen icerik turu") || e.status === 1);
		}
	});

	it("olusturulan dosyalarda placeholder icerigi var", () => {
		const files = readdirSync(
			join(TMP, ".claude", "workspace", "icerikler"),
		).filter((f) => f.endsWith(".md"));
		assert.ok(files.length > 0);
		const content = readFileSync(
			join(TMP, ".claude", "workspace", "icerikler", files[0]),
			"utf-8",
		);
		assert.ok(content.includes("VARIATION") || content.includes("SLIDE"));
	});

	describe("oturum yonetimi", () => {
		it("basla seansi baslatir", () => {
			const output = run(["content", "start"]);
			assert.ok(output.includes("Content Session"));
			assert.ok(output.includes("Today's Theme"));
			assert.ok(output.includes("What You Can Focus On"));
		});

		it("durum envanter gosterir", () => {
			const output = run(["content", "status"]);
			assert.ok(output.includes("Inventory"));
			assert.ok(output.includes("Completeness"));
			assert.ok(output.includes("Total"));
		});

		it("fikir varsayilan tur icin calisir", () => {
			const output = run(["content", "idea"]);
			assert.ok(output.includes("Content Ideas"));
		});

		it("fikir post turu icin secim yapar", () => {
			const output = run(["content", "idea", "post"]);
			assert.ok(output.includes("post"));
			assert.ok(output.includes("1."));
		});

		it("fikir karousel turu icin calisir", () => {
			const output = run(["content", "idea", "carousel"]);
			assert.ok(output.includes("carousel"));
		});

		it("plan haftalik temalari gosterir", () => {
			const output = run(["content", "plan"]);
			assert.ok(output.includes("Weekly"));
			assert.ok(output.includes("Monday"));
			assert.ok(output.includes("Platform Distribution"));
		});

		it("kapat bugun uretilenleri listeler", () => {
			const output = run(["content", "close"]);
			assert.ok(
				output.includes("Session Close") || output.includes("Generated Today"),
			);
		});

		it("ac en son dosyayi gosterir", () => {
			const output = run(["content", "open"]);
			assert.ok(
				output.includes("Latest content file") ||
					output.includes("No matching files"),
			);
		});

		it("ac filtre ile calisir", () => {
			const output = run(["content", "open", "brand"]);
			assert.ok(
				output.includes("brand") || output.includes("No matching files"),
			);
		});
	});
});
