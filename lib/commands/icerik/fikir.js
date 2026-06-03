import { chalk, showBanner } from "../../cli.js";

export function runFikir(args) {
	const tur = args[1] || "general";
	showBanner();
	console.log(chalk.bold(`Content Ideas — ${tur}`));
	console.log("");

	const fikirKategori = {
		post: [
			"How to do X — step-by-step guide",
			"5 common mistakes and their fixes",
			"Core concepts for beginners",
			"The one thing I learned this week",
			"Common misconceptions — what's the truth?",
			"Quick win tip",
			"Questions / answers",
		],
		carousel: [
			"5 tips / 5 rules / 5 methods list",
			"Before vs after comparison",
			"7-step guide for X",
			"Frequently asked questions (FAQ)",
			"Resource / tool list",
			"Mistakes and the right way",
			"From beginner to expert journey",
		],
		video: [
			"30-second quick tutorial",
			"Behind the scenes — daily routine",
			"Customer testimonial / success story",
			"Educational content with a trending sound",
			"Before/after transformation video",
			"Duet / reaction video",
			"Live Q&A",
		],
		visual: [
			"Typographic quote",
			"Infographic (data visualization)",
			"Minimalist product showcase",
			"Before/after comparison",
			"Step-by-step visual guide",
			"Moodboard / inspiration board",
			"Before/after visual",
		],
		general: [
			"Something I learned today",
			"A popular misconception in our industry",
			"Pain point + solution",
			"Customer question + detailed answer",
			"A lesson from failure",
			"Tool review / comparison",
			"Trending topic + our brand take",
			"Community question — let everyone answer",
			"Timeline / growth story",
			"Quick poll / idea gathering",
		],
	};

	const fikirler = fikirKategori[tur] || fikirKategori.general;
	fikirler.forEach((fikir, i) => {
		console.log(`  ${chalk.cyan(`${i + 1}.`)} ${fikir}`);
	});

	console.log("");
	console.log(chalk.bold("To apply a chosen idea:"));
	console.log(`  badi content ${tur === "general" ? "post" : tur} "[idea]"`);
	console.log("");
	console.log(
		chalk.dim(
			"For brand-voice idea generation, use /content-idea in Claude Code.",
		),
	);
}
