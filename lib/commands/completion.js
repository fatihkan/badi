import { chalk } from "../cli.js";

export function getCommandMap() {
	return {
		init: { flags: ["--target", "--force", "--dry-run", "--help"] },
		update: { flags: ["--target", "--dry-run", "--help"] },
		doctor: { flags: ["--target", "--help"] },
		list: {
			flags: [
				"--agents",
				"--commands",
				"--hooks",
				"--skills",
				"--target",
				"--help",
			],
		},
		plugin: { subs: ["install", "remove", "list"], flags: ["--help"] },
		content: {
			subs: [
				"post",
				"carousel",
				"video",
				"visual",
				"calendar",
				"brand",
				"list",
				"start",
				"status",
				"idea",
				"plan",
				"close",
				"open",
				"perf",
				"search",
				"template",
			],
			flags: ["--help", "--lang", "--template", "--force"],
		},
		stats: {
			flags: [
				"--week",
				"--month",
				"--all",
				"--command",
				"--habits",
				"--export",
				"--help",
			],
		},
		completion: { subs: ["bash", "zsh", "fish"], flags: ["--help"] },
		schedule: {
			subs: ["add", "list", "remove", "check"],
			flags: ["--at", "--days", "--help"],
		},
	};
}

export function generateBashCompletion() {
	const cmds = getCommandMap();
	const mainCmds = Object.keys(cmds).join(" ");
	let script = `# badi bash completion
# Usage: badi completion bash >> ~/.bashrc && source ~/.bashrc

_badi_completion() {
    local cur prev words cword
    _init_completion || return

    local commands="${mainCmds}"

    if [[ $cword -eq 1 ]]; then
        COMPREPLY=( $(compgen -W "$commands --help --version" -- "$cur") )
        return
    fi

    case "\${words[1]}" in
`;
	for (const [cmd, info] of Object.entries(cmds)) {
		const opts = [...(info.subs || []), ...(info.flags || [])].join(" ");
		script += `        ${cmd})\n            COMPREPLY=( $(compgen -W "${opts}" -- "$cur") )\n            ;;\n`;
	}
	script += `    esac
}

complete -F _badi_completion badi
`;
	return script;
}

export function generateZshCompletion() {
	const cmds = getCommandMap();
	let script = `#compdef badi
# badi zsh completion
# Usage: badi completion zsh > "\${fpath[1]}/_badi" && compinit

_badi() {
    local -a commands
    commands=(
`;
	for (const cmd of Object.keys(cmds)) {
		script += `        '${cmd}:${cmd} command'\n`;
	}
	script += `    )

    _arguments -C \\
        '1:command:->command' \\
        '*::arg:->args'

    case $state in
        command)
            _describe 'badi command' commands
            ;;
        args)
            case $words[1] in
`;
	for (const [cmd, info] of Object.entries(cmds)) {
		if (info.subs) {
			const subsStr = info.subs.map((s) => `'${s}:${s}'`).join(" ");
			script += `                ${cmd})\n                    local -a subcmds=(${subsStr})\n                    _describe '${cmd} subcommand' subcmds\n                    ;;\n`;
		} else if (info.flags) {
			const flagStr = info.flags.join(" ");
			script += `                ${cmd})\n                    _arguments '*:flag:(${flagStr})'\n                    ;;\n`;
		}
	}
	script += `            esac
            ;;
    esac
}

_badi "$@"
`;
	return script;
}

export function generateFishCompletion() {
	const cmds = getCommandMap();
	let script = `# badi fish completion
# Usage: badi completion fish > ~/.config/fish/completions/badi.fish

# Main commands
set -l commands ${Object.keys(cmds).join(" ")}

# Complete only on top-level commands
complete -c badi -f
complete -c badi -n "not __fish_seen_subcommand_from $commands" -a "$commands" -d "Badi command"
complete -c badi -n "not __fish_seen_subcommand_from $commands" -l help -d "Show help"
complete -c badi -n "not __fish_seen_subcommand_from $commands" -l version -d "Show version"

`;
	for (const [cmd, info] of Object.entries(cmds)) {
		if (info.subs) {
			for (const sub of info.subs) {
				script += `complete -c badi -n "__fish_seen_subcommand_from ${cmd}" -a "${sub}" -d "${sub}"\n`;
			}
		}
		if (info.flags) {
			for (const flag of info.flags) {
				const name = flag.replace(/^--/, "");
				script += `complete -c badi -n "__fish_seen_subcommand_from ${cmd}" -l "${name}" -d "${name}"\n`;
			}
		}
	}
	return script;
}

export function runCompletion(args) {
	const shell = args[0];

	if (!shell || shell === "--help" || shell === "-h") {
		console.log(chalk.bold("Shell Completion Scripts:"));
		console.log(
			`  badi completion ${chalk.cyan("bash")}    Bash completion script`,
		);
		console.log(
			`  badi completion ${chalk.cyan("zsh")}     Zsh completion script`,
		);
		console.log(
			`  badi completion ${chalk.cyan("fish")}    Fish completion script`,
		);
		console.log("");
		console.log(chalk.bold("Installation:"));
		console.log("  badi completion bash >> ~/.bashrc");
		// biome-ignore lint/suspicious/noTemplateCurlyInString: shell syntax, not JS template
		console.log('  badi completion zsh > "${fpath[1]}/_badi"');
		console.log(
			"  badi completion fish > ~/.config/fish/completions/badi.fish",
		);
		return;
	}

	switch (shell) {
		case "bash":
			process.stdout.write(generateBashCompletion());
			break;
		case "zsh":
			process.stdout.write(generateZshCompletion());
			break;
		case "fish":
			process.stdout.write(generateFishCompletion());
			break;
		default:
			console.error(chalk.red(`Unknown shell: ${shell}`));
			console.log("Supported shells: bash, zsh, fish");
			process.exit(1);
	}
}
