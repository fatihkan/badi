import { chalk } from "../../cli.js";

export function runHelp() {
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
}
