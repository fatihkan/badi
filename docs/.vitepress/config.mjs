import { defineConfig } from "vitepress";

export default defineConfig({
	title: "Badi",
	description:
		"Workflow management CLI for Claude Code, Cursor, and Gemini CLI",
	base: "/badi/",
	lang: "en-US",
	lastUpdated: true,
	srcExclude: ["v1.14-plan.md"],

	head: [
		["link", { rel: "icon", href: "/badi/favicon.svg" }],
		[
			"meta",
			{
				property: "og:image",
				content:
					"https://github.com/fatihkan/badi/raw/main/assets/og-image.svg",
			},
		],
	],

	themeConfig: {
		nav: [
			{ text: "Getting Started", link: "/getting-started" },
			{ text: "Agents", link: "/agents/" },
			{ text: "Commands", link: "/commands/" },
			{ text: "Skills", link: "/skills/" },
			{ text: "GitHub", link: "https://github.com/fatihkan/badi" },
		],

		sidebar: {
			"/": [
				{
					text: "Introduction",
					items: [
						{ text: "Overview", link: "/" },
						{ text: "Getting Started", link: "/getting-started" },
					],
				},
				{
					text: "Reference",
					items: [
						{ text: "Agents (30)", link: "/agents/" },
						{ text: "Commands (84)", link: "/commands/" },
						{ text: "Skills (62 opt-in)", link: "/skills/" },
						{ text: "Hooks (14)", link: "/hooks/" },
					],
				},
			],
		},

		socialLinks: [
			{ icon: "github", link: "https://github.com/fatihkan/badi" },
			{ icon: "npm", link: "https://www.npmjs.com/package/@fatihkan/badi" },
		],

		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright (c) 2026 Fatih Kan",
		},

		search: { provider: "local" },
	},
});
