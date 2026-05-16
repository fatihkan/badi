// Badi secret-scan canonical pattern registry.
//
// Pattern fields:
//   id       — kebab-case unique identifier (used in --ignore list)
//   name     — human-readable label shown in reports
//   regex    — global pattern (must include /g)
//   severity — KRITIK | YUKSEK | ORTA | DUSUK
//   context  — optional secondary regex; finding only fires if a 200-char
//              window around the match also matches this regex
//
// Severity guide:
//   KRITIK — cloud root credentials, payment, AI provider keys, private keys
//   YUKSEK — service tokens (npm, sendgrid, twilio), DB URIs with creds
//   ORTA   — short-lived tokens (JWT) where rotation is cheap
//   DUSUK  — heuristic patterns with material false-positive rate

export const PATTERNS = [
	{
		id: "aws-access-key",
		name: "AWS Access Key",
		regex: /AKIA[0-9A-Z]{16}/g,
		severity: "KRITIK",
	},
	{
		id: "aws-secret",
		name: "AWS Secret Key",
		regex:
			/(?:aws[_-]?secret[_-]?(?:access[_-]?)?key|AWS_SECRET)[\s:="']*([A-Za-z0-9/+=]{40})/gi,
		severity: "KRITIK",
	},
	{
		id: "gcp-key",
		name: "GCP API Key",
		regex: /AIza[0-9A-Za-z\-_]{35}/g,
		severity: "KRITIK",
	},
	{
		id: "github-pat",
		name: "GitHub PAT (classic)",
		regex: /(?:ghp_|gho_|ghu_|ghs_|ghr_)[A-Za-z0-9]{36,40}/g,
		severity: "KRITIK",
	},
	{
		id: "github-pat-fine",
		name: "GitHub PAT (fine-grained)",
		regex: /github_pat_[A-Za-z0-9_]{82}/g,
		severity: "KRITIK",
	},
	{
		id: "slack-token",
		name: "Slack Token",
		regex: /xox[baprs]-[A-Za-z0-9-]{10,}/g,
		severity: "KRITIK",
	},
	{
		id: "stripe-key",
		name: "Stripe Key",
		regex: /(?:sk|rk|pk)_(?:test|live)_[A-Za-z0-9]{24,}/g,
		severity: "KRITIK",
	},
	{
		// NOTE: OpenAI and Anthropic keys both begin with "sk-" but Anthropic
		// inserts a literal "-" after "ant" which breaks [A-Za-z0-9]{20,}. So
		// this pattern does NOT overlap with the anthropic-key pattern below.
		// Independent reviewer flagged a false overlap; empirical probe in
		// /tmp/badi-probe confirmed no collision.
		id: "openai-key",
		name: "OpenAI Key",
		regex: /sk-[A-Za-z0-9]{20,}/g,
		severity: "KRITIK",
	},
	{
		id: "anthropic-key",
		name: "Anthropic Key",
		regex: /sk-ant-[A-Za-z0-9\-_]{40,}/g,
		severity: "KRITIK",
	},
	{
		id: "npm-token",
		name: "npm Token",
		regex: /npm_[A-Za-z0-9]{36}/g,
		severity: "YUKSEK",
	},
	{
		id: "sendgrid",
		name: "SendGrid API Key",
		regex: /SG\.[A-Za-z0-9_-]{16,32}\.[A-Za-z0-9_-]{32,64}/g,
		severity: "YUKSEK",
	},
	{
		id: "twilio",
		name: "Twilio API Key",
		regex: /SK[0-9a-fA-F]{32}/g,
		severity: "YUKSEK",
	},
	{
		id: "private-key",
		name: "RSA/EC Private Key",
		regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
		severity: "KRITIK",
	},
	{
		id: "jwt",
		name: "JWT Token",
		regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
		severity: "ORTA",
	},
	{
		id: "mongodb-uri",
		name: "MongoDB URI (credentials)",
		regex: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@/g,
		severity: "YUKSEK",
	},
	{
		id: "postgres-uri",
		name: "PostgreSQL URI (credentials)",
		regex: /postgres(?:ql)?:\/\/[^:]+:[^@]+@/g,
		severity: "YUKSEK",
	},
	{
		id: "generic-secret",
		name: "Generic Secret Variable",
		regex:
			/(?:api[_-]?key|secret|password|passwd|pwd|token)["'\s:=]{1,5}["']([A-Za-z0-9+/_-]{20,64})["']/gi,
		severity: "DUSUK",
	},
];

export const FALSE_POSITIVE_FILTER =
	/example|test|xxx|yyyyyy|dummy|placeholder|your[_-]?key|<.*>/i;

export const SCAN_EXTS = new Set([
	".js",
	".mjs",
	".cjs",
	".ts",
	".tsx",
	".jsx",
	".json",
	".env",
	".yml",
	".yaml",
	".sh",
	".bash",
	".py",
	".go",
	".rb",
	".php",
	".java",
	".kt",
	".swift",
	".rs",
	".md",
	".txt",
	".xml",
	".toml",
	".ini",
	".conf",
	".config",
]);

export const SKIP_DIRS = new Set([
	"node_modules",
	".git",
	"dist",
	"build",
	"coverage",
	".next",
	".nuxt",
	"vendor",
	"__pycache__",
	".venv",
	"venv",
	".pytest_cache",
	".claude",
	".test-tmp",
]);

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_FILES_DEFAULT = 5000;
export const MAX_COMMITS_DEFAULT = 100;
export const GIT_SHOW_MAX_BUFFER = 10 * 1024 * 1024;
