import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { chalk, VERSION } from "../cli.js";
import {
	BADI_DEFAULT_API_VERSION,
	checkApiCompat,
	findUnsatisfied,
	topoSort,
	validateManifest,
} from "../data/plugin-manifest.js";
import { listDirs } from "../helpers.js";

function loadAllPluginManifests(pluginsDir) {
	if (!existsSync(pluginsDir)) return [];
	const out = [];
	for (const dir of listDirs(pluginsDir)) {
		const manifestPath = join(pluginsDir, dir, "badi-plugin.json");
		if (!existsSync(manifestPath)) continue;
		try {
			const m = JSON.parse(readFileSync(manifestPath, "utf-8"));
			out.push({ ...m, _path: join(pluginsDir, dir) });
		} catch {
			// skip unreadable
		}
	}
	return out;
}

export function runPlugin(args) {
	const subcommand = args[0];

	if (!subcommand || subcommand === "--help" || subcommand === "-h") {
		console.log(chalk.bold("Plugin Yonetimi:"));
		console.log(`  badi plugin install <kaynak>   Plugin yukle`);
		console.log(`  badi plugin remove <isim>      Plugin kaldir`);
		console.log(`  badi plugin list               Yuklu plugin'leri listele`);
		console.log(`  badi plugin show <isim>        Plugin detayi (v1.29+)`);
		console.log(
			`  badi plugin doctor             Tum plugin'lerin saglik denetimi (v1.30+)`,
		);
		console.log(
			`  badi plugin graph              Plugin bagimlilik agacini yazdir (v1.30+)`,
		);
		return;
	}

	const target = process.cwd();
	const pluginsDir = join(target, ".claude", "plugins");

	switch (subcommand) {
		case "install": {
			const source = args[1];
			if (!source) {
				console.error(chalk.red("Hata: Plugin kaynagi belirtilmedi."));
				console.log("Kullanim: badi plugin install <git-url|npm-paket>");
				process.exit(1);
			}

			// Argument injection koruma: '-' ile baslayan kaynak (--upload-pack=...,
			// -u curl..., vb.) git veya npm tarafindan flag olarak yorumlanabilir.
			if (source.startsWith("-")) {
				console.error(
					chalk.red(`Gecersiz kaynak: '-' ile baslayan deger kabul edilmiyor.`),
				);
				console.log(
					chalk.dim(
						"Yerel yol veriyorsaniz './<dizin>' veya tam yol kullanin.",
					),
				);
				process.exit(1);
			}

			if (!existsSync(pluginsDir)) {
				mkdirSync(pluginsDir, { recursive: true });
			}

			let isGitHubUrl = false;
			try {
				const u = new URL(source);
				isGitHubUrl =
					u.hostname === "github.com" || u.hostname.endsWith(".github.com");
			} catch {
				// non-URL kaynak (orn. local path veya npm paket adi) — github degil
			}
			if (isGitHubUrl || source.endsWith(".git")) {
				const pluginName = basename(source, ".git").replace(
					/^badi-plugin-/,
					"",
				);
				const destDir = join(pluginsDir, pluginName);

				if (existsSync(destDir)) {
					console.error(
						chalk.yellow(`Plugin '${pluginName}' zaten yuklu. Once kaldirin.`),
					);
					process.exit(1);
				}

				console.log(chalk.cyan(`Plugin indiriliyor: ${source}`));
				try {
					// `--` separator git'i `source`'u pozisyonel arguman olarak almaya
					// zorlar, flag yorumlamayi keser (defense-in-depth — '-' ile
					// baslayan kaynaklar zaten yukarida engellendi).
					execFileSync(
						"git",
						["clone", "--depth", "1", "--", source, destDir],
						{ stdio: "pipe" },
					);
					const gitDir = join(destDir, ".git");
					if (existsSync(gitDir)) {
						rmSync(gitDir, { recursive: true });
					}
					console.log(
						chalk.green(`Plugin '${pluginName}' basariyla yuklendi!`),
					);
				} catch (e) {
					console.error(chalk.red(`Plugin yuklenemedi: ${e.message}`));
					process.exit(1);
				}
			} else {
				const pluginName = source
					.replace(/^@.*\//, "")
					.replace(/^badi-plugin-/, "");
				const destDir = join(pluginsDir, pluginName);

				if (existsSync(destDir)) {
					console.error(chalk.yellow(`Plugin '${pluginName}' zaten yuklu.`));
					process.exit(1);
				}

				console.log(chalk.cyan(`Plugin npm'den indiriliyor: ${source}`));
				try {
					mkdirSync(destDir, { recursive: true });
					execFileSync("npm", ["pack", source, "--pack-destination", destDir], {
						stdio: "pipe",
					});
					console.log(
						chalk.green(`Plugin '${pluginName}' basariyla yuklendi!`),
					);
				} catch (e) {
					console.error(chalk.red(`Plugin yuklenemedi: ${e.message}`));
					if (existsSync(destDir)) rmSync(destDir, { recursive: true });
					process.exit(1);
				}
			}

			const installedName = basename(args[1], ".git").replace(
				/^badi-plugin-/,
				"",
			);
			const manifestPath = join(pluginsDir, installedName, "badi-plugin.json");
			if (existsSync(manifestPath)) {
				try {
					const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
					// apiVersion + manifest validation (v1.30+)
					const validation = validateManifest(manifest);
					if (!validation.valid) {
						console.log("");
						console.log(chalk.yellow("Manifest validation uyarilari:"));
						for (const err of validation.errors) {
							console.log(chalk.yellow(`  - ${err}`));
						}
					}
					const compat = checkApiCompat(manifest, VERSION);
					if (!compat.ok) {
						console.log("");
						console.log(
							chalk.yellow(
								`Uyari: Plugin apiVersion='${compat.range}' Badi v${VERSION} ile uyumsuz olabilir. Test edip raporlayin.`,
							),
						);
					}

					console.log("");
					console.log(chalk.bold("Plugin icerigi:"));
					if (manifest.agents?.length)
						console.log(`  Ajanlar: ${manifest.agents.join(", ")}`);
					if (manifest.commands?.length)
						console.log(`  Komutlar: ${manifest.commands.join(", ")}`);
					if (manifest.hooks?.length)
						console.log(`  Hook'lar: ${manifest.hooks.join(", ")}`);
					if (manifest.skills)
						console.log(
							`  Skill'ler: ${Object.keys(manifest.skills).join(", ")}`,
						);
					if (manifest.badi?.apiVersion) {
						console.log(
							chalk.dim(`  apiVersion: ${manifest.badi.apiVersion}`),
						);
					}
					if (manifest.badi?.dependsOn?.length) {
						console.log(
							chalk.dim(`  dependsOn:  ${manifest.badi.dependsOn.join(", ")}`),
						);
					}
				} catch {
					// manifest okunamadiysa ses cikarma
				}
			} else {
				console.log(
					chalk.yellow(
						"Uyari: badi-plugin.json bulunamadi. Plugin yapilandirmasi eksik olabilir.",
					),
				);
			}
			break;
		}

		case "remove": {
			const name = args[1];
			if (!name) {
				console.error(chalk.red("Hata: Plugin adi belirtilmedi."));
				process.exit(1);
			}
			const pluginDir = join(pluginsDir, name);
			if (!existsSync(pluginDir)) {
				console.error(chalk.red(`Plugin '${name}' bulunamadi.`));
				process.exit(1);
			}
			rmSync(pluginDir, { recursive: true });
			console.log(chalk.green(`Plugin '${name}' basariyla kaldirildi.`));
			break;
		}

		case "show": {
			const name = args[1];
			if (!name) {
				console.error(chalk.red("Hata: Plugin adi belirtilmedi."));
				console.log("Kullanim: badi plugin show <isim>");
				process.exit(1);
			}
			const pluginDir = join(pluginsDir, name);
			if (!existsSync(pluginDir)) {
				console.error(chalk.red(`Plugin '${name}' bulunamadi.`));
				process.exit(1);
			}
			const manifestPath = join(pluginDir, "badi-plugin.json");
			let manifest = null;
			if (existsSync(manifestPath)) {
				try {
					manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
				} catch (e) {
					console.error(chalk.red(`Manifest parse hatasi: ${e.message}`));
				}
			}
			console.log(chalk.bold(`Plugin: ${manifest?.name || name}`));
			if (manifest?.version)
				console.log(chalk.dim(`  Version:     ${manifest.version}`));
			if (manifest?.description)
				console.log(chalk.dim(`  Description: ${manifest.description}`));
			console.log(chalk.dim(`  Path:        ${pluginDir}`));
			if (manifest?.badi?.apiVersion) {
				const compat = checkApiCompat(manifest, VERSION);
				const tag = compat.ok ? chalk.green("uyumlu") : chalk.red("UYUMSUZ");
				console.log(
					chalk.dim(`  apiVersion:  ${manifest.badi.apiVersion}`) + ` (${tag})`,
				);
			} else if (manifest) {
				console.log(
					chalk.dim(
						`  apiVersion:  (belirtilmemis, ${BADI_DEFAULT_API_VERSION} varsayilir)`,
					),
				);
			}
			if (manifest?.badi?.dependsOn?.length) {
				console.log(
					chalk.dim(`  dependsOn:   ${manifest.badi.dependsOn.join(", ")}`),
				);
			}
			console.log("");
			const agentCount = manifest?.agents?.length || 0;
			const commandCount = manifest?.commands?.length || 0;
			const hookCount = manifest?.hooks?.length || 0;
			const skillCount = manifest?.skills
				? Object.keys(manifest.skills).length
				: 0;
			console.log(chalk.bold("Icerik:"));
			console.log(`  ${chalk.cyan("Ajanlar")}:  ${agentCount}`);
			if (manifest?.agents?.length) {
				for (const a of manifest.agents) console.log(`    - ${a}`);
			}
			console.log(`  ${chalk.cyan("Komutlar")}: ${commandCount}`);
			if (manifest?.commands?.length) {
				for (const c of manifest.commands) console.log(`    - ${c}`);
			}
			console.log(`  ${chalk.cyan("Hook'lar")}: ${hookCount}`);
			if (manifest?.hooks?.length) {
				for (const h of manifest.hooks) console.log(`    - ${h}`);
			}
			console.log(`  ${chalk.cyan("Skill'ler")}: ${skillCount}`);
			if (manifest?.skills) {
				for (const [cat, items] of Object.entries(manifest.skills)) {
					const count = Array.isArray(items) ? items.length : 0;
					console.log(`    - ${cat} (${count})`);
				}
			}
			if (!manifest) {
				console.log(chalk.yellow("  badi-plugin.json bulunamadi"));
			}
			break;
		}

		case "list": {
			if (!existsSync(pluginsDir)) {
				console.log(chalk.dim("Yuklu plugin yok."));
				return;
			}
			const plugins = listDirs(pluginsDir);
			if (plugins.length === 0) {
				console.log(chalk.dim("Yuklu plugin yok."));
				return;
			}
			console.log(chalk.bold(`Yuklu Plugin'ler (${plugins.length}):`));
			for (const p of plugins) {
				const manifestPath = join(pluginsDir, p, "badi-plugin.json");
				if (existsSync(manifestPath)) {
					try {
						const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
						console.log(
							`  ${chalk.magenta("+")} ${manifest.name || p} v${manifest.version || "?"} - ${manifest.description || ""}`,
						);
					} catch {
						console.log(`  ${chalk.magenta("+")} ${p}`);
					}
				} else {
					console.log(`  ${chalk.magenta("+")} ${p}`);
				}
			}
			break;
		}

		case "doctor": {
			const plugins = loadAllPluginManifests(pluginsDir);
			if (plugins.length === 0) {
				console.log(chalk.dim("Yuklu plugin yok."));
				return;
			}
			console.log(chalk.bold(`Plugin Doctor (${plugins.length} plugin):`));
			console.log("");
			let issues = 0;
			for (const p of plugins) {
				const v = validateManifest(p);
				const c = checkApiCompat(p, VERSION);
				const okMark = v.valid && c.ok ? chalk.green("OK") : chalk.red("XX");
				console.log(
					`  ${okMark}  ${p.name || "(noname)"}  ${chalk.dim(`v${p.version || "?"}`)}`,
				);
				if (!v.valid) {
					for (const e of v.errors) {
						console.log(chalk.red(`       - ${e}`));
						issues++;
					}
				}
				for (const w of v.warnings) {
					console.log(chalk.yellow(`       - ${w}`));
				}
				if (!c.ok) {
					console.log(chalk.red(`       - ${c.reason}`));
					issues++;
				}
				if (p.badi?.apiVersion) {
					console.log(
						chalk.dim(
							`       apiVersion: ${p.badi.apiVersion} (Badi v${VERSION})`,
						),
					);
				}
			}
			const unsat = findUnsatisfied(plugins);
			if (unsat.length) {
				console.log("");
				console.log(chalk.bold("Bagimlilik sorunlari:"));
				for (const u of unsat) {
					console.log(
						chalk.red(
							`  - ${u.plugin}: ${u.dep}@${u.requested} ${u.reason === "missing" ? "(yuklu degil)" : `(yuklu ${u.installed})`}`,
						),
					);
					issues++;
				}
			}
			console.log("");
			if (issues > 0) {
				console.log(chalk.red(`${issues} sorun tespit edildi.`));
				process.exit(1);
			}
			console.log(chalk.green("Tum plugin'ler saglikli."));
			break;
		}

		case "graph": {
			const plugins = loadAllPluginManifests(pluginsDir);
			if (plugins.length === 0) {
				console.log(chalk.dim("Yuklu plugin yok."));
				return;
			}
			let sorted;
			try {
				sorted = topoSort(plugins);
			} catch (e) {
				console.error(chalk.red(e.message));
				process.exit(1);
			}
			console.log(chalk.bold("Plugin Bagimlilik Agaci (load sirasi):"));
			console.log("");
			for (let i = 0; i < sorted.length; i++) {
				const p = sorted[i];
				const deps = p.badi?.dependsOn || [];
				const arrow = deps.length
					? chalk.dim(` ← ${deps.join(", ")}`)
					: "";
				const isLast = i === sorted.length - 1;
				const branch = isLast ? "└─" : "├─";
				console.log(
					`  ${branch} ${p.name} ${chalk.dim(`v${p.version || "?"}`)}${arrow}`,
				);
			}
			break;
		}

		default:
			console.error(chalk.red(`Bilinmeyen plugin komutu: ${subcommand}`));
			console.log("Kullanim: badi plugin [install|remove|list|show|doctor|graph]");
			process.exit(1);
	}
}
