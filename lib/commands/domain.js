import { promises as dns } from "node:dns";
import { Socket } from "node:net";
import { connect } from "node:tls";
import { chalk, showBanner } from "../cli.js";

// ─── URL/domain helpers ───

function extractDomain(input) {
	let domain = input.trim().toLowerCase();
	domain = domain
		.replace(/^https?:\/\//, "")
		.replace(/\/.*$/, "")
		.replace(/:\d+$/, "");
	if (!/^[a-z0-9][\w.-]*\.[a-z]{2,}$/i.test(domain)) {
		throw new Error(`Invalid domain: ${input}`);
	}
	return domain;
}

// ─── SSL ───

function fetchSslCert(domain, port = 443, { insecure = false } = {}) {
	return new Promise((resolve, reject) => {
		const socket = connect({
			host: domain,
			port,
			servername: domain,
			rejectUnauthorized: !insecure,
			timeout: 10000,
		});
		socket.on("secureConnect", () => {
			const cert = socket.getPeerCertificate(true);
			const protocol = socket.getProtocol();
			const cipher = socket.getCipher();
			const authorized = socket.authorized;
			const authError = socket.authorizationError;
			socket.end();
			resolve({ cert, protocol, cipher, authorized, authError });
		});
		socket.on("timeout", () => {
			socket.destroy();
			reject(new Error("SSL connection timeout"));
		});
		socket.on("error", (e) => reject(new Error(`SSL error: ${e.message}`)));
	});
}

// Try strict TLS verification first; if the cert can't be verified (expired,
// hostname mismatch, self-signed) retry in insecure mode for reporting
// purposes only. Insecure mode is solely for analysis — the returned data
// is flagged with `validForDomain: false`.
async function fetchSslCertWithFallback(domain, port = 443) {
	try {
		const r = await fetchSslCert(domain, port);
		return { ...r, validForDomain: r.authorized === true };
	} catch (e) {
		const certVerifyErrors = [
			"CERT_HAS_EXPIRED",
			"DEPTH_ZERO_SELF_SIGNED_CERT",
			"SELF_SIGNED_CERT_IN_CHAIN",
			"UNABLE_TO_VERIFY_LEAF_SIGNATURE",
			"ERR_TLS_CERT_ALTNAME_INVALID",
			"HOSTNAME_MISMATCH",
		];
		const isCertVerifyError = certVerifyErrors.some((code) =>
			e.message.includes(code),
		);
		if (!isCertVerifyError) throw e;
		const r = await fetchSslCert(domain, port, { insecure: true });
		return { ...r, validForDomain: false, verifyError: e.message };
	}
}

async function runSsl(domain) {
	showBanner();
	console.log(chalk.bold(`SSL Certificate Analysis: ${domain}`));
	console.log("");

	const { cert, protocol, cipher, validForDomain, verifyError } =
		await fetchSslCertWithFallback(domain);
	if (!cert?.subject) {
		console.log(chalk.red("Could not retrieve certificate info."));
		return;
	}

	const validFrom = new Date(cert.valid_from);
	const validTo = new Date(cert.valid_to);
	const now = new Date();
	const daysLeft = Math.floor((validTo - now) / 86400000);
	const totalDays = Math.floor((validTo - validFrom) / 86400000);

	console.log(chalk.bold("Certificate:"));
	console.log(`  Subject CN:    ${chalk.cyan(cert.subject.CN || "?")}`);
	console.log(
		`  Issuer:        ${chalk.cyan(cert.issuer.CN || cert.issuer.O || "?")}`,
	);
	console.log(
		`  Alternative:   ${chalk.dim((cert.subjectaltname || "").replace(/DNS:/g, "").substring(0, 80))}`,
	);
	console.log(`  Serial:        ${chalk.dim(cert.serialNumber)}`);

	console.log("");
	console.log(chalk.bold("Validity:"));
	console.log(
		`  Start:         ${chalk.cyan(validFrom.toISOString().substring(0, 10))}`,
	);
	console.log(
		`  End:           ${chalk.cyan(validTo.toISOString().substring(0, 10))}`,
	);
	const expColor =
		daysLeft < 14
			? chalk.bold.red
			: daysLeft < 30
				? chalk.bold.yellow
				: chalk.bold.green;
	console.log(
		`  Remaining:     ${expColor(`${daysLeft} days`)} (${totalDays} days total)`,
	);

	console.log("");
	console.log(chalk.bold("Protocol:"));
	console.log(`  Version:       ${chalk.cyan(protocol || "?")}`);
	console.log(`  Cipher:        ${chalk.cyan(cipher?.name || "?")}`);
	console.log(`  Bit strength:  ${chalk.cyan(cipher?.standardName || "?")}`);

	console.log("");
	console.log(chalk.bold("Status:"));
	let issues = 0;
	const check = (label, ok) => {
		console.log(`  ${ok ? chalk.green("OK") : chalk.red("XX")} ${label}`);
		if (!ok) issues++;
	};
	check("Certificate chain/hostname verification", validForDomain);
	if (validForDomain === false && verifyError) {
		console.log(chalk.dim(`     ${verifyError}`));
	}
	check("Certificate valid", daysLeft > 0);
	check("Expiry more than 30 days away", daysLeft >= 30);
	check("TLS 1.2+ in use", ["TLSv1.2", "TLSv1.3"].includes(protocol));
	check("TLS 1.3 in use", protocol === "TLSv1.3");
	check("Modern cipher", !/RC4|3DES|MD5/.test(cipher?.name || ""));

	console.log("");
	console.log(
		issues === 0
			? chalk.bold.green("SSL healthy!")
			: chalk.bold.yellow(`${issues} issues detected.`),
	);
}

// ─── DNS ───

async function resolveAll(domain, type) {
	try {
		switch (type) {
			case "A":
				return await dns.resolve4(domain);
			case "AAAA":
				return await dns.resolve6(domain);
			case "MX":
				return await dns.resolveMx(domain);
			case "TXT":
				return (await dns.resolveTxt(domain)).map((r) => r.join(""));
			case "NS":
				return await dns.resolveNs(domain);
			case "CNAME":
				return await dns.resolveCname(domain);
			case "CAA":
				return await dns.resolveCaa(domain);
			case "SOA":
				return [await dns.resolveSoa(domain)];
			default:
				return [];
		}
	} catch (e) {
		if (e.code === "ENODATA" || e.code === "ENOTFOUND") return [];
		throw e;
	}
}

async function runDns(domain) {
	showBanner();
	console.log(chalk.bold(`DNS Records: ${domain}`));
	console.log("");

	const [a, aaaa, mx, txt, ns, caa, soa] = await Promise.all([
		resolveAll(domain, "A"),
		resolveAll(domain, "AAAA"),
		resolveAll(domain, "MX"),
		resolveAll(domain, "TXT"),
		resolveAll(domain, "NS"),
		resolveAll(domain, "CAA"),
		resolveAll(domain, "SOA"),
	]);

	console.log(chalk.bold("A (IPv4):"));
	if (a.length === 0) console.log(chalk.dim("  (no records)"));
	else for (const ip of a) console.log(`  ${chalk.cyan(ip)}`);

	console.log("");
	console.log(chalk.bold("AAAA (IPv6):"));
	if (aaaa.length === 0) console.log(chalk.dim("  (no records)"));
	else for (const ip of aaaa) console.log(`  ${chalk.cyan(ip)}`);

	console.log("");
	console.log(chalk.bold(`MX (Mail, ${mx.length}):`));
	if (mx.length === 0) console.log(chalk.dim("  (no records)"));
	else {
		mx.sort((a, b) => a.priority - b.priority);
		for (const r of mx)
			console.log(
				`  ${chalk.cyan(String(r.priority).padEnd(3))} ${r.exchange}`,
			);
	}

	console.log("");
	console.log(chalk.bold(`NS (Name Server, ${ns.length}):`));
	for (const s of ns) console.log(`  ${chalk.cyan(s)}`);

	console.log("");
	console.log(chalk.bold("TXT:"));
	const spf = txt.filter((t) => t.startsWith("v=spf1"));
	const dmarc = txt.filter((t) => t.startsWith("v=DMARC1"));
	const dkim = txt.filter((t) => t.includes("DKIM") || t.startsWith("v=DKIM"));
	const verification = txt.filter((t) =>
		/google-site|ms-|facebook|apple-/.test(t),
	);
	const other = txt.filter(
		(t) =>
			!spf.includes(t) &&
			!dmarc.includes(t) &&
			!dkim.includes(t) &&
			!verification.includes(t),
	);

	if (spf.length > 0)
		console.log(
			`  ${chalk.green("SPF")}    ${chalk.dim(spf[0].substring(0, 90))}`,
		);
	else console.log(`  ${chalk.yellow("SPF")}    ${chalk.dim("not defined")}`);

	for (const d of dmarc)
		console.log(`  ${chalk.green("DMARC")}  ${chalk.dim(d.substring(0, 90))}`);
	if (dmarc.length === 0)
		console.log(`  ${chalk.yellow("DMARC")}  ${chalk.dim("not defined")}`);

	for (const v of verification)
		console.log(`  ${chalk.dim("Verify")} ${chalk.dim(v.substring(0, 90))}`);
	for (const t of other)
		console.log(`  ${chalk.dim("Other")}  ${chalk.dim(t.substring(0, 90))}`);

	console.log("");
	console.log(chalk.bold(`CAA (Certificate Authority, ${caa.length}):`));
	if (caa.length === 0)
		console.log(chalk.dim("  (no records — any CA can issue a certificate)"));
	else
		for (const c of caa)
			console.log(`  ${chalk.cyan(c.issue || c.issuewild || c.iodef)}`);

	console.log("");
	console.log(chalk.bold("SOA:"));
	if (soa.length > 0) {
		const s = soa[0];
		console.log(
			`  Primary: ${chalk.cyan(s.nsname)}  Admin: ${chalk.dim(s.hostmaster)}`,
		);
		console.log(
			`  Serial: ${chalk.cyan(s.serial)}  TTL: ${chalk.dim(`${s.minttl}s`)}`,
		);
	}

	// Email security score
	console.log("");
	console.log(chalk.bold("Email Security:"));
	const issues = [];
	if (spf.length === 0) issues.push("SPF not defined (spoofing risk)");
	if (dmarc.length === 0) issues.push("DMARC not defined (phishing risk)");
	if (mx.length > 0 && caa.length === 0)
		issues.push("No CAA record (any CA can issue a cert)");
	if (issues.length === 0)
		console.log(chalk.bold.green("  Basic security records present"));
	else for (const i of issues) console.log(`  ${chalk.yellow("!!")} ${i}`);
}

// ─── WHOIS ───

function queryWhois(server, query, port = 43) {
	return new Promise((resolve, reject) => {
		const socket = new Socket();
		let data = "";
		socket.setTimeout(10000);
		socket.connect(port, server, () => socket.write(`${query}\r\n`));
		socket.on("data", (chunk) => {
			data += chunk.toString();
		});
		socket.on("end", () => resolve(data));
		socket.on("timeout", () => {
			socket.destroy();
			reject(new Error("WHOIS timeout"));
		});
		socket.on("error", (e) => reject(new Error(`WHOIS error: ${e.message}`)));
	});
}

function extractField(text, patterns) {
	for (const p of patterns) {
		const m = text.match(new RegExp(`^\\s*${p}\\s*:\\s*(.+)$`, "im"));
		if (m) return m[1].trim();
	}
	return null;
}

async function runWhois(domain) {
	showBanner();
	console.log(chalk.bold(`WHOIS: ${domain}`));
	console.log("");

	// TLD-based server (simple set)
	const tld = domain.split(".").pop().toLowerCase();
	const servers = {
		com: "whois.verisign-grs.com",
		net: "whois.verisign-grs.com",
		org: "whois.publicinterestregistry.org",
		io: "whois.nic.io",
		ai: "whois.nic.ai",
		dev: "whois.nic.google",
		app: "whois.nic.google",
		co: "whois.nic.co",
		tr: "whois.nic.tr",
	};
	const server = servers[tld] || "whois.iana.org";

	let raw;
	try {
		raw = await queryWhois(server, domain);
		// Some servers redirect
		const referral = extractField(raw, ["Registrar WHOIS Server", "whois"]);
		if (referral && referral !== server && referral.startsWith("whois.")) {
			raw = await queryWhois(referral, domain);
		}
	} catch (e) {
		console.log(chalk.red(`Could not reach WHOIS server: ${e.message}`));
		return;
	}

	const registrar = extractField(raw, ["Registrar", "Sponsoring Registrar"]);
	const created = extractField(raw, [
		"Creation Date",
		"Created On",
		"created",
		"registered",
	]);
	const updated = extractField(raw, [
		"Updated Date",
		"Last Updated",
		"changed",
	]);
	const expires = extractField(raw, [
		"Registry Expiry Date",
		"Registrar Registration Expiration Date",
		"Expiration Date",
		"Expiry Date",
		"paid-till",
	]);
	const status =
		raw
			.match(/^\s*Domain Status\s*:\s*(.+)$/gim)
			?.map((l) => l.split(":").slice(1).join(":").trim()) || [];
	const nameServers =
		raw
			.match(/^\s*Name Server\s*:\s*(.+)$/gim)
			?.map((l) => l.split(":").slice(1).join(":").trim().toLowerCase()) || [];

	console.log(chalk.bold("Registration Info:"));
	console.log(`  Registrar:     ${chalk.cyan(registrar || "?")}`);
	console.log(
		`  Created:       ${chalk.cyan(created ? created.substring(0, 10) : "?")}`,
	);
	console.log(
		`  Last updated:  ${chalk.cyan(updated ? updated.substring(0, 10) : "?")}`,
	);

	if (expires) {
		const expDate = new Date(expires);
		const daysLeft = Math.floor((expDate - Date.now()) / 86400000);
		const expColor =
			daysLeft < 30
				? chalk.bold.red
				: daysLeft < 90
					? chalk.bold.yellow
					: chalk.bold.green;
		console.log(
			`  Expiry:        ${chalk.cyan(expires.substring(0, 10))} (${expColor(`${daysLeft} days`)})`,
		);
	}

	console.log("");
	console.log(chalk.bold(`Name Servers (${nameServers.length}):`));
	for (const ns of nameServers.slice(0, 10)) console.log(`  ${chalk.cyan(ns)}`);

	if (status.length > 0) {
		console.log("");
		console.log(chalk.bold(`Domain Status (${status.length}):`));
		for (const s of status.slice(0, 10))
			console.log(`  ${chalk.dim(s.replace(/https?:\/\/\S+/, "").trim())}`);
	}

	// Security recommendations
	console.log("");
	console.log(chalk.bold("Security Recommendations:"));
	const hasTransferLock = status.some((s) =>
		/clientTransferProhibited/i.test(s),
	);
	const hasUpdateLock = status.some((s) => /clientUpdateProhibited/i.test(s));
	console.log(
		`  ${hasTransferLock ? chalk.green("OK") : chalk.yellow("!!")} Transfer Lock (domain hijacking protection)`,
	);
	console.log(
		`  ${hasUpdateLock ? chalk.green("OK") : chalk.yellow("!!")} Update Lock`,
	);
}

// ─── Main command ───

export async function runDomain(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("Domain Health Tools:"));
		console.log("");
		console.log(
			`  ${chalk.cyan("badi ssl")} [domain]     SSL certificate analysis (expiry, TLS, cipher)`,
		);
		console.log(
			`  ${chalk.cyan("badi dns")} [domain]     DNS records (A/AAAA/MX/TXT/SPF/DMARC/CAA)`,
		);
		console.log(
			`  ${chalk.cyan("badi whois")} [domain]   Domain registration + expiry + transfer lock`,
		);
		console.log("");
		console.log(chalk.bold("Examples:"));
		console.log("  badi ssl example.com");
		console.log("  badi dns github.com");
		console.log("  badi whois badi.dev");
		return;
	}

	try {
		const domain = extractDomain(args[1] || sub);
		const cmd = args[1] ? sub : "__alias__"; // badi ssl [domain] or domain directly
		if (["ssl", "dns", "whois"].includes(cmd)) {
			if (cmd === "ssl") await runSsl(domain);
			else if (cmd === "dns") await runDns(domain);
			else if (cmd === "whois") await runWhois(domain);
		} else {
			console.error(chalk.red(`Unknown domain command: ${sub}`));
			process.exit(1);
		}
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}

// Separate wrapper export for each command
export async function runSslCmd(args) {
	const domain = args[0];
	if (!domain || ["--help", "-h"].includes(domain)) {
		console.log(chalk.bold("Usage: badi ssl [domain]"));
		console.log(chalk.dim("  badi ssl example.com"));
		return;
	}
	try {
		await runSsl(extractDomain(domain));
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}

export async function runDnsCmd(args) {
	const domain = args[0];
	if (!domain || ["--help", "-h"].includes(domain)) {
		console.log(chalk.bold("Usage: badi dns [domain]"));
		return;
	}
	try {
		await runDns(extractDomain(domain));
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}

export async function runWhoisCmd(args) {
	const domain = args[0];
	if (!domain || ["--help", "-h"].includes(domain)) {
		console.log(chalk.bold("Usage: badi whois [domain]"));
		return;
	}
	try {
		await runWhois(extractDomain(domain));
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}
