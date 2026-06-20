import { chalk, showBanner } from "../../cli.js";
import { fetchJsonWithTimeout } from "../../helpers.js";

// ─── mobile deeplink ───
// Note: the validateUrl call inside fetchJsonWithTimeout blocks private IPs +
// localhost — since mobile deeplink accepts a user-provided domain, this guard
// is essential against SSRF.

export async function mobileDeeplink(args) {
	const urlOrScheme = args[0];
	if (!urlOrScheme) {
		console.error(
			chalk.red("Usage: badi mobile deeplink [test|validate] <domain|scheme>"),
		);
		console.error("Example:  badi mobile deeplink test example.com");
		console.error("          badi mobile deeplink validate myapp://");
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold("Deep Link Validation"));
	console.log("");

	// If a scheme (myapp://)
	if (urlOrScheme.includes("://") && !urlOrScheme.startsWith("http")) {
		const schemeMatch = urlOrScheme.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
		if (!schemeMatch) {
			console.error(chalk.red("Invalid URL scheme (RFC 3986 violation)"));
			console.log(
				chalk.dim("Scheme: [a-z][a-z0-9+.-]*  example: myapp, com-company-app"),
			);
			process.exit(1);
		}
		const scheme = schemeMatch[1];
		console.log(`Scheme: ${chalk.cyan(scheme)}`);
		console.log(`  ${chalk.green("OK")} RFC 3986 compliant`);
		console.log("");
		console.log(chalk.bold("iOS Info.plist:"));
		console.log(
			chalk.dim(`<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array><string>${scheme}</string></array>
  </dict>
</array>`),
		);
		console.log("");
		console.log(chalk.bold("Android AndroidManifest.xml:"));
		console.log(
			chalk.dim(`<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="${scheme}" />
</intent-filter>`),
		);
		console.log("");
		console.log(chalk.bold("Test commands:"));
		console.log(
			chalk.dim(`  iOS:     xcrun simctl openurl booted "${scheme}://test"`),
		);
		console.log(
			chalk.dim(
				`  Android: adb shell am start -a android.intent.action.VIEW -d "${scheme}://test"`,
			),
		);
		return;
	}

	// Universal Link / App Link validation
	const host = urlOrScheme.replace(/^https?:\/\//, "").replace(/\/.*/, "");
	console.log(`Domain: ${chalk.cyan(host)}`);
	console.log("");

	// iOS AASA
	console.log(chalk.bold("iOS — apple-app-site-association (AASA):"));
	const aasaUrls = [
		`https://${host}/.well-known/apple-app-site-association`,
		`https://${host}/apple-app-site-association`,
	];
	let aasaFound = false;
	for (const url of aasaUrls) {
		try {
			const data = await fetchJsonWithTimeout(url, {
				timeoutMs: 8000,
				userAgent: "Badi-Mobile/1.11 (+https://github.com/fatihkan/badi)",
			});
			console.log(`  ${chalk.green("OK")} ${url}`);
			if (data.applinks?.details) {
				for (const d of data.applinks.details) {
					const appID = d.appID || d.appIDs?.[0] || "?";
					console.log(`       appID: ${chalk.cyan(appID)}`);
					const paths = d.paths || d.components || [];
					console.log(
						`       paths: ${chalk.dim(JSON.stringify(paths).substring(0, 60))}`,
					);
				}
			} else {
				console.log(`  ${chalk.yellow("!!")} applinks.details missing`);
			}
			aasaFound = true;
			break;
		} catch (_e) {
			/* try the other one */
		}
	}
	if (!aasaFound) {
		console.log(`  ${chalk.red("XX")} AASA file not found (${aasaUrls[0]})`);
		console.log(
			chalk.dim(
				`       Content-Type: application/json, HTTPS required, no redirect`,
			),
		);
	}

	// Android assetlinks
	console.log("");
	console.log(chalk.bold("Android — assetlinks.json:"));
	const alUrl = `https://${host}/.well-known/assetlinks.json`;
	try {
		const data = await fetchJsonWithTimeout(alUrl, {
			timeoutMs: 8000,
			userAgent: "Badi-Mobile/1.11 (+https://github.com/fatihkan/badi)",
		});
		if (Array.isArray(data) && data.length > 0) {
			console.log(`  ${chalk.green("OK")} ${alUrl}`);
			for (const entry of data) {
				const pkg = entry.target?.package_name || "?";
				const fp = entry.target?.sha256_cert_fingerprints?.[0] || "?";
				console.log(`       package: ${chalk.cyan(pkg)}`);
				console.log(
					`       SHA256 prefix: ${chalk.dim(`${(fp || "").substring(0, 20)}...`)}`,
				);
			}
		} else {
			console.log(`  ${chalk.yellow("!!")} Empty or invalid assetlinks`);
		}
	} catch (_e) {
		console.log(`  ${chalk.red("XX")} ${alUrl} not found`);
		console.log(
			chalk.dim(`       Content-Type: application/json, HTTPS required`),
		);
	}

	// Validation tool suggestions
	console.log("");
	console.log(chalk.bold("External Validators:"));
	console.log(
		chalk.dim(`  iOS:     search.apple.com/open-link?url=https://${host}/test`),
	);
	console.log(
		chalk.dim(
			`  Android: developers.google.com/digital-asset-links/tools/generator`,
		),
	);
	console.log(chalk.dim(`  Branch:  branch.io/resources/aasa-validator`));
}
