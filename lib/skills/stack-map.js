// Stack → Badi skill kategori eslestirme manifesti.
//
// Her entry:
//   id              — uniq teknoloji id
//   name            — gosterim adi
//   detect          — { packages?, configFiles?, fileExtensions?, manifestKeys?, scripts? }
//   skills          — eslesince onerilen Badi skill kategorileri
//                    (.claude/skills-vault/ altindaki klasor adlari)
//
// Skills katalogu (vault, v1.24+):
//   ai-automation, consulting, content, customer-success, data-analytics,
//   design, design-tokens, development, devops, ecommerce, email, finance,
//   frontend-taste, marketing, mobile, product, productivity, sales,
//   security, security-check, seo, seo-crawl-budget, social-media,
//   startup, testing
//
//   pentest-* aile (v1.25+): pentest-orchestrator, pentest-engagement,
//   pentest-recon, pentest-web, pentest-api, pentest-bizlogic,
//   pentest-bugbounty, pentest-ad, pentest-cloud, pentest-mobile,
//   pentest-wireless, pentest-cicd, pentest-social, pentest-llm,
//   pentest-privesc, pentest-credentials, pentest-threat-model,
//   pentest-detection, pentest-forensics, pentest-malware, pentest-stig,
//   pentest-report, pentest-ctf, pentest-exploit-chain, pentest-opsec-evidence
//
// Eslestirme kurallari:
//  - Frontend frameworks (react/vue/svelte): design + frontend-taste
//  - Meta-frameworks (next/nuxt/astro): yukarisi + seo + seo-crawl-budget
//  - Mobile: mobile
//  - Backend/API: development
//  - Test araclari: testing
//  - DB/ORM: data-analytics
//  - Auth/Payments: security, finance
//  - DevOps/Infra: devops
//  - E-ticaret: ecommerce
//  - AI SDK'lar: ai-automation
//  - Email araci: email
//  - Marketing/social-media araclari: marketing, social-media
//  - Pentest engagement (scope.md, ROE, findings.db): pentest-orchestrator
//    + pentest-engagement + pentest-report + pentest-threat-model
//  - Pentest output (.nmap, .nessus): pentest-recon
//  - Burp / nuclei config: pentest-web + pentest-api + pentest-orchestrator

export const STACK_MAP = [
	// ── Frontend frameworks ──────────────────────────────────────────────
	{
		id: "react",
		name: "React",
		detect: { packages: ["react", "react-dom"] },
		skills: ["design", "frontend-taste"],
	},
	{
		id: "vue",
		name: "Vue",
		detect: { packages: ["vue"] },
		skills: ["design", "frontend-taste"],
	},
	{
		id: "svelte",
		name: "Svelte",
		detect: { packages: ["svelte"] },
		skills: ["design", "frontend-taste"],
	},
	{
		id: "angular",
		name: "Angular",
		detect: { packages: ["@angular/core"] },
		skills: ["design", "frontend-taste"],
	},

	// ── Meta-frameworks ──────────────────────────────────────────────────
	{
		id: "nextjs",
		name: "Next.js",
		detect: {
			packages: ["next"],
			configFiles: ["next.config.js", "next.config.mjs", "next.config.ts"],
		},
		skills: ["development", "seo", "seo-crawl-budget", "frontend-taste"],
	},
	{
		id: "nuxt",
		name: "Nuxt",
		detect: {
			packages: ["nuxt"],
			configFiles: ["nuxt.config.js", "nuxt.config.ts"],
		},
		skills: ["development", "seo", "seo-crawl-budget", "frontend-taste"],
	},
	{
		id: "astro",
		name: "Astro",
		detect: {
			packages: ["astro"],
			configFiles: ["astro.config.mjs", "astro.config.js", "astro.config.ts"],
		},
		skills: ["development", "seo", "seo-crawl-budget"],
	},
	{
		id: "remix",
		name: "Remix",
		detect: {
			packages: ["@remix-run/react", "@remix-run/node"],
			configFiles: ["remix.config.js"],
		},
		skills: ["development", "seo", "frontend-taste"],
	},

	// ── Styling / UI kit ──────────────────────────────────────────────────
	{
		id: "tailwind",
		name: "Tailwind CSS",
		detect: {
			packages: ["tailwindcss"],
			configFiles: [
				"tailwind.config.js",
				"tailwind.config.ts",
				"tailwind.config.mjs",
			],
		},
		skills: ["design", "design-tokens", "frontend-taste"],
	},
	{
		id: "shadcn",
		name: "shadcn/ui",
		detect: { configFiles: ["components.json"] },
		skills: ["design", "design-tokens", "frontend-taste"],
	},

	// ── Mobile ──────────────────────────────────────────────────────────
	{
		id: "react-native",
		name: "React Native",
		detect: { packages: ["react-native"] },
		skills: ["mobile"],
	},
	{
		id: "expo",
		name: "Expo",
		detect: { packages: ["expo"] },
		skills: ["mobile"],
	},
	{
		id: "flutter",
		name: "Flutter",
		detect: { configFiles: ["pubspec.yaml"] },
		skills: ["mobile"],
	},
	{
		id: "swift",
		name: "Swift",
		detect: {
			fileExtensions: [".swift"],
			configFiles: ["Podfile", "Package.swift"],
			configDirs: ["ios"],
		},
		skills: ["mobile"],
	},
	{
		id: "kotlin",
		name: "Kotlin",
		detect: {
			fileExtensions: [".kt"],
			configFiles: ["build.gradle", "build.gradle.kts", "AndroidManifest.xml"],
			configDirs: ["android"],
		},
		skills: ["mobile"],
	},

	// ── Backend ──────────────────────────────────────────────────────────
	{
		id: "express",
		name: "Express",
		detect: { packages: ["express"] },
		skills: ["development"],
	},
	{
		id: "hono",
		name: "Hono",
		detect: { packages: ["hono"] },
		skills: ["development"],
	},
	{
		id: "nestjs",
		name: "NestJS",
		detect: { packages: ["@nestjs/core"] },
		skills: ["development", "testing"],
	},
	{
		id: "fastify",
		name: "Fastify",
		detect: { packages: ["fastify"] },
		skills: ["development"],
	},

	// ── Languages / runtimes ─────────────────────────────────────────────
	{
		id: "typescript",
		name: "TypeScript",
		detect: {
			packages: ["typescript"],
			configFiles: ["tsconfig.json"],
		},
		skills: ["development"],
	},
	{
		id: "go",
		name: "Go",
		detect: { configFiles: ["go.mod"] },
		skills: ["development"],
	},
	{
		id: "rust",
		name: "Rust",
		detect: { configFiles: ["Cargo.toml"] },
		skills: ["development"],
	},
	{
		id: "python",
		name: "Python",
		detect: {
			configFiles: ["pyproject.toml", "requirements.txt", "setup.py"],
		},
		skills: ["development", "data-analytics"],
	},
	{
		id: "ruby",
		name: "Ruby",
		detect: { configFiles: ["Gemfile"] },
		skills: ["development"],
	},

	// ── Data / ORM ───────────────────────────────────────────────────────
	{
		id: "prisma",
		name: "Prisma",
		detect: {
			packages: ["prisma", "@prisma/client"],
			configDirs: ["prisma"],
		},
		skills: ["data-analytics"],
	},
	{
		id: "drizzle",
		name: "Drizzle ORM",
		detect: {
			packages: ["drizzle-orm"],
			configFiles: ["drizzle.config.ts", "drizzle.config.js"],
		},
		skills: ["data-analytics"],
	},
	{
		id: "supabase",
		name: "Supabase",
		detect: { packages: ["@supabase/supabase-js"] },
		skills: ["data-analytics", "security"],
	},

	// ── Auth / Payments ──────────────────────────────────────────────────
	{
		id: "stripe",
		name: "Stripe",
		detect: { packages: ["stripe", "@stripe/stripe-js"] },
		skills: ["finance"],
	},
	{
		id: "clerk",
		name: "Clerk",
		detect: {
			packages: [
				"@clerk/nextjs",
				"@clerk/clerk-react",
				"@clerk/clerk-sdk-node",
			],
		},
		skills: ["security"],
	},
	{
		id: "better-auth",
		name: "Better Auth",
		detect: { packages: ["better-auth"] },
		skills: ["security"],
	},

	// ── Testing ──────────────────────────────────────────────────────────
	{
		id: "vitest",
		name: "Vitest",
		detect: {
			packages: ["vitest"],
			configFiles: [
				"vitest.config.ts",
				"vitest.config.js",
				"vitest.config.mjs",
			],
		},
		skills: ["testing"],
	},
	{
		id: "jest",
		name: "Jest",
		detect: {
			packages: ["jest"],
			configFiles: ["jest.config.js", "jest.config.ts"],
		},
		skills: ["testing"],
	},
	{
		id: "playwright",
		name: "Playwright",
		detect: {
			packages: ["@playwright/test"],
			configFiles: ["playwright.config.ts", "playwright.config.js"],
		},
		skills: ["testing"],
	},
	{
		id: "cypress",
		name: "Cypress",
		detect: {
			packages: ["cypress"],
			configFiles: ["cypress.config.js", "cypress.config.ts"],
		},
		skills: ["testing"],
	},

	// ── DevOps / Infra ───────────────────────────────────────────────────
	{
		id: "docker",
		name: "Docker",
		detect: { configFiles: ["Dockerfile", "docker-compose.yml"] },
		skills: ["devops"],
	},
	{
		id: "terraform",
		name: "Terraform",
		detect: { fileExtensions: [".tf"] },
		skills: ["devops"],
	},
	{
		id: "github-actions",
		name: "GitHub Actions",
		detect: { configDirs: [".github"] },
		skills: ["devops", "testing"],
	},

	// ── AI ───────────────────────────────────────────────────────────────
	{
		id: "vercel-ai",
		name: "Vercel AI SDK",
		detect: { packages: ["ai"] },
		skills: ["ai-automation"],
	},
	{
		id: "openai",
		name: "OpenAI",
		detect: { packages: ["openai"] },
		skills: ["ai-automation"],
	},
	{
		id: "anthropic",
		name: "Anthropic",
		detect: { packages: ["@anthropic-ai/sdk"] },
		skills: ["ai-automation"],
	},
	{
		id: "langchain",
		name: "LangChain",
		detect: {
			packages: ["langchain", "@langchain/core", "@langchain/openai"],
		},
		skills: ["ai-automation"],
	},

	// ── E-ticaret ────────────────────────────────────────────────────────
	{
		id: "shopify",
		name: "Shopify",
		detect: { packages: ["@shopify/hydrogen", "shopify-api-node"] },
		skills: ["ecommerce", "marketing"],
	},
	{
		id: "woocommerce",
		name: "WooCommerce",
		detect: { packages: ["@woocommerce/woocommerce-rest-api"] },
		skills: ["ecommerce", "marketing"],
	},

	// ── Email ────────────────────────────────────────────────────────────
	{
		id: "resend",
		name: "Resend",
		detect: { packages: ["resend"] },
		skills: ["email", "marketing"],
	},
	{
		id: "nodemailer",
		name: "Nodemailer",
		detect: { packages: ["nodemailer"] },
		skills: ["email"],
	},

	// ── Media / Content ──────────────────────────────────────────────────
	{
		id: "remotion",
		name: "Remotion",
		detect: { packages: ["remotion", "@remotion/cli"] },
		skills: ["content", "social-media"],
	},

	// ── Pentest engagement projeleri ─────────────────────────────────────
	// Yetkili penetration testing/red team engagement project'leri.
	// Scope/ROE/findings/evidence dosyalari -> pentest- ailesini onerir.
	{
		id: "pentest-engagement",
		name: "Pentest Engagement",
		detect: {
			configFiles: [
				"scope.md",
				"scope.txt",
				"roe.md",
				"engagement.md",
				"findings.db",
				"targets.txt",
				"in-scope.txt",
			],
			configDirs: ["engagements", "evidence", "findings"],
		},
		skills: [
			"pentest-orchestrator",
			"pentest-engagement",
			"pentest-report",
			"pentest-threat-model",
			"pentest-opsec-evidence",
		],
	},
	{
		id: "pentest-recon-output",
		name: "Pentest Recon Output",
		detect: {
			fileExtensions: [".nmap", ".gnmap", ".nessus"],
		},
		skills: ["pentest-orchestrator", "pentest-recon"],
	},
	{
		id: "pentest-web-tooling",
		name: "Pentest Web Tooling",
		detect: {
			configFiles: [
				"nuclei-config.yaml",
				"nuclei.yaml",
				"burp-project.json",
				".nuclei-ignore",
			],
			configDirs: ["nuclei-templates"],
		},
		skills: [
			"pentest-orchestrator",
			"pentest-web",
			"pentest-api",
			"pentest-recon",
		],
	},
];
