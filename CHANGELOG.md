# Changelog

## 1.4.2

### Patch Changes

- d8773c4: Block git commit bypasses hidden in backtick and process substitutions, comments, heredocs piped to a shell or interpreter, osascript, trap, and read here-strings.

## 1.4.1

### Patch Changes

- 3d3a5ed: Harden `core.hooksPath` override detection. Every override that the previous release blocks is still blocked. The check now also blocks an override that reaches a git command the textual check missed: a function or alias that runs git, `xargs git`, a persistent setting (`export`, `set -o` options, `eval`) with a hook run possible, and an unexported `NAME=value` with a hook run possible. No override that the previous release blocks is allowed.
- c169eb7: Keep checking text that a shell can run. A heredoc body fed to a shell (`bash <<EOF`, `sh -s <<EOF`) is checked, and so is a quoted-delimiter body whose line is not a plain `cat` (`cat <<\EOF | bash`, `tee s.sh <<\EOF`, `source /dev/stdin <<\EOF`). A quoted `cat` body is dropped as data only when the whole input is that plain read, with no substitution, pipe, list operator, grouping or other redirect. Unquoted bodies keep their `$(` and backtick lines. Single-quoted or escaped `$(` and backticks are neutralized only in a line that is one `echo`, `printf` or `cat` statement, so text that reaches `bash -c`, `eval`, `source` or a pipe is still checked. Several heredoc bodies opened on one line are read in order, and `<<<` is not a heredoc.
- 0c3cd26: Keep checking `$(…)` and backtick substitutions in an `echo`/`printf`/`cat` statement that also uses ANSI-C quoting (`$'…'`). The quoting rewrite does not expand ANSI-C escapes, so `$'\''` (one literal quote character) looked like a quote mark, and a live substitution between two of them was treated as text. bash runs that substitution, so `echo $'\'' $(git commit … --no-verify) $'\''` committed past the hooks. Literal-substitution neutralization is now skipped whenever ANSI-C or locale quoting is present.
- 0f9e95a: Require `shell-quote` 1.12.0 or later. Earlier versions split the `&>` and `&>>` redirects into a background `&` and a `>`, so a skip flag written after the redirect file (`git commit -m x &> out -n`) was read as part of a new statement without git and the command was allowed. bash passes those words to git, so the commit skipped its hooks. Installs that resolved `shell-quote` 1.9 to 1.11 were affected.

## 1.4.0

### Minor Changes

- 8afafd7: Add a CommonJS entry point so `require('block-no-verify')` works on Node 18 and later, and fix the CLI crash on Node 18. The package now ships `dist/cjs` (built by a second `tsc` pass) and maps the `require` condition to it, while `import` and the `bin` stay ESM. The CLI loads `@polyhook/sdk` through `createRequire`, because the SDK's ESM entry cannot be parsed on Node 18. `engines.node` lowers to `>=18`, and CI now tests Node 18. This is a minor release because it adds a new consumer-facing entry point.

### Patch Changes

- 086a415: Fix false positives on `git commit` short-option bundles. A bundled token such as `-tn`, `-uno` or `-S` followed by a key id no longer reads its trailing `n` as the `-n` (`--no-verify`) flag, because `-t` (template), `-u` (untracked-files) and `-S` (gpg-sign) take their value from the rest of the token. `-t` and `--template` also skip their separate value token. Real bypasses such as `-n`, `-qn`, `-nq`, `-an` and `-n -m x` stay blocked.
- 102805e: Detect a git name that shell quoting or escaping splits, such as `g''it commit --no-verify`, `g\it commit --no-verify`, and a `g\` line continuation before `it`. The raw-text scan could not see these, so `--no-verify` ran past a failing pre-commit hook. Detection now also compares the shell-unquoted words, reusing the existing `tokenizeCommand` helper, when the raw scan finds nothing.
- 7946e0e: Strip heredoc bodies from the input before scanning for `--no-verify`, so a `-n`/`--no-verify`-looking flag written inside a heredoc's free-form text (e.g. an example `grep -n` in a doc block) is no longer mistaken for a real flag on a statement it has nothing to do with (#89).
- 223e318: Fix a bypass where text piped into `xargs` ran a hook-skipping command undetected, so the commit went through a failing pre-commit hook (`echo 'git commit -q -m x --no-verify' | xargs -I{} bash -c '{}'`). xargs runs its command with the piped lines as arguments, but the scan only checked the shell's own operand, which was the replace string `{}`. The piped text is now combined with xargs' command the way xargs does it (in place of `-I{}`/`-i`/`--replace`, or appended), and that command is checked like a typed one. Options such as `-n`, `-0` and `-r` are read, and `echo a | xargs grep -n foo` stays allowed.

## 1.3.18

### Patch Changes

- 27c6856: Fix a bypass where a hook-skipping flag inside a command substitution nested in double quotes went undetected, so the guarded git command ran with hooks skipped (#81). `shell-quote` returns a `$(...)` or backtick substitution written inside a quoted word as one opaque string token instead of descending into it, so neither the git token nor the flag matched (`echo "$(git commit --no-verify)"`, `echo "`git commit --no-verify`"`). The inner command of any such substitution is now extracted from the opaque token and scanned as its own statement, recursively for nested substitutions.

## 1.3.17

### Patch Changes

- fde6ad6: README: list the indirect forms the hook catches (piped scripts, interpreter code, code fed on stdin, `pwsh -EncodedCommand`).

## 1.3.16

### Patch Changes

- 3f1021a: Check string literals in code fed to `python`/`perl`/`ruby`/`node` on stdin through a pipe or here-string (#101).

## 1.3.15

### Patch Changes

- 0a1d694: Decode `pwsh`/`powershell -EncodedCommand` (also `-e`, `-enc`, `-ec`) values and check the command they run (#101).
- 8e59217: Check git commands inside Perl `q{}`/`qq{}`/`qx{}` and Ruby `%q()`/`%Q{}`/`%x()` quote operators, and inside `awk`/`gawk`/`mawk`/`nawk` programs (#101).

## 1.3.14

### Patch Changes

- 97b86e4: Check string literals in interpreter code passed on the command line (#101): `python3 -c "import os; os.system('git commit --no-verify')"`, `perl -e`, `ruby -e` and `node -e` now block.

  Code whose literals only name git and the flag separately (for example `print("git"); print("--no-verify")`) can be blocked too, because argv-list literals are also checked joined. Perl/Ruby `q{}`-style quoting and code fed on stdin are not covered yet.

## 1.3.13

### Patch Changes

- 73e5b2f: Follow piped scripts through `time`, `nohup` and `doas`, and past wrapper option values such as `sudo -u root` and `timeout -s KILL 5` (#101).

## 1.3.12

### Patch Changes

- f90c589: Follow scripts piped into a shell through wrappers and pass-through stages (#101): `| sudo sh`, `| env bash`, `| timeout 5 sh`, `|& sh`, `| tee x | sh`, `| cat | sh`, and `cat <<< '…' | sh`.

## 1.3.11

### Patch Changes

- bc0b4b8: Block bypasses run through `su -c`, piped into a shell (`echo '…' | sh`, `printf '…' | bash`), or passed as a here-string (`sh <<< '…'`) (#101).

## 1.3.10

### Patch Changes

- a202ffd: Check the command string of more shells and their long options (#101): `yash`, `posh`, `rc`, `nu`, `elvish`, `xonsh`, `pwsh` and `powershell`, plus `--command`, `--command=…`, `--commands` and `-Command`.

## 1.3.9

### Patch Changes

- a6fb647: Check the `-c` operand of `ash`, `mksh`, `fish`, `csh` and `tcsh` too (#101), not only `sh`, `bash`, `zsh`, `dash` and `ksh`.

## 1.3.8

### Patch Changes

- 417ff37: Update the npm description and keywords to match the bypasses the guard blocks.

## 1.3.7

### Patch Changes

- 70a4321: Block hook bypasses run through `eval` or `env -S` (#101). `eval "git commit --no-verify -m x"` and `env -S "git commit --no-verify"` were allowed. The command line that `eval` builds from its arguments, and the value of `env -S` / `--split-string`, are now checked like typed commands.
- 3a0eadb: README: list the alias and shell-string bypasses, letter-case-insensitive `core.hooksPath`, and that commands it cannot parse are blocked.

## 1.3.6

### Patch Changes

- ee6dcc5: Block hook bypasses wrapped in a shell `-c` string (#101). `bash -c "git commit --no-verify -m x"` was allowed because the quoted operand was never checked as a command. The `-c` operand of `sh`, `bash`, `zsh`, `dash` and `ksh` (also in bundles such as `-lc` and `-ec`) is now checked like a typed command, including when nested or used inside a `!` git alias.

## 1.3.5

### Patch Changes

- 342c96d: Block git aliases that carry a hook bypass (#91). `git -c alias.ci="commit --no-verify" ci` and `git config alias.ci "commit --no-verify"` were allowed because the alias name is not a guarded sub-command. Each alias defined in a command (via `-c alias.NAME=VALUE` or `git config alias.NAME VALUE`) is now checked as the command it runs: `git VALUE`, or the shell command for a `!` alias.

  A persisted alias called with the short `-n` flag (`git ci -n`) is not blocked, because `-n` means something else for most git commands and the alias definition is not visible. `--no-verify` after a sub-command that is not a git built-in is blocked, since that sub-command may be an alias.

  The built-in list comes from git 2.50, so on an older git an alias persisted under a newer built-in's name (for example `replay`) is not covered by that rule.

## 1.3.4

### Patch Changes

- 6da9280: Block, instead of crashing, when a command cannot be parsed (#97). An unterminated `${` made the shell tokenizer throw, and the CLI exited 1, which agents treat as non-blocking, so `git commit --no-verify -m x $(echo ${)` ran past the hooks. The hook now blocks any command it cannot check.
- 32012a4: Stop blocking commands whose commit or PR message only mentions an override (#93). The hooks-path and hook-manager env checks (`HUSKY`, `LEFTHOOK`, `SKIP`, `OVERCOMMIT_DISABLE`, `core.hooksPath`, …) now ignore the values of `-m`, `--message`, `--title`, `--body` and `--notes`. Shell payloads such as `bash -c "…"` and messages that contain a command substitution are still scanned. Also block `git "-c" "core.hooksPath=…"`, which the quoted `-c` let through before.

## 1.3.3

### Patch Changes

- 77b1fb8: Block `core.hooksPath` overrides written in any letter case (#91). Git config keys are case-insensitive, so `git -c core.hookspath=/dev/null commit` skipped hooks while only the camel-case spelling was detected. All four hooks-path checks (`-c`, `GIT_CONFIG_KEY_<n>`, `GIT_CONFIG_PARAMETERS`, `git config`) now match case-insensitively.

## 1.3.2

### Patch Changes

- d78226c: Fix two tokenizer disagreements with bash that let `--no-verify` bypass detection: an ANSI-C/locale quoted flag (`$'--no-verify'`) and a line continuation splitting the flag inside a double-quoted word (`"--no-ver\` + newline + `ify"`) (#78). The input is now normalized to the form `shell-quote` already tokenizes like bash before parsing, while leaving line continuations inside single-quoted text untouched.
- a2f0177: Fix documentation issues found during validation. (#67)
- e5c7186: Scope `--no-verify`/`-n` detection to the shell statement that invokes the guarded git command, so a `-n` belonging to a chained `echo`, `grep`, or `head` no longer blocks `git commit` (#70). Statement splitting works on `shell-quote` operator tokens, so separators inside quoted commit messages cannot hide a real bypass.

## 1.3.1

### Patch Changes

- b26a229: Block persistent `git config core.hooksPath` override used to bypass hooks (#64)
- b26a229: Close 4 git hook bypass detection gaps (#57)
- b26a229: Replace custom shell tokenizer with the `shell-quote` package (#59)
- b26a229: Restore shell-quote tokenizer import in find-git-subcommand (#61)

## [1.3.0](https://github.com/tupe12334/block-no-verify/compare/v1.2.0...v1.3.0) (2026-06-18)

### Features

- block HUSKY=0 environment override ([#3](https://github.com/tupe12334/block-no-verify/issues/3)) ([#10](https://github.com/tupe12334/block-no-verify/issues/10)) ([3074db3](https://github.com/tupe12334/block-no-verify/commit/3074db3bafd6589933571b22c32ad3db05a310eb))
- tell agent to report false positives in block message ([#8](https://github.com/tupe12334/block-no-verify/issues/8)) ([33f760b](https://github.com/tupe12334/block-no-verify/commit/33f760b66e0a1bb4fab009fe522d85ae9d8dc70f)), closes [#7](https://github.com/tupe12334/block-no-verify/issues/7)

### Bug Fixes

- actually block bypass attempts in Claude Code hooks ([#29](https://github.com/tupe12334/block-no-verify/issues/29)) ([#30](https://github.com/tupe12334/block-no-verify/issues/30)) ([3d5cb04](https://github.com/tupe12334/block-no-verify/commit/3d5cb0403db15c3ffe56a6692b413eeefd0c9c10))
- stop scanning commit message bodies for bypass flags ([#26](https://github.com/tupe12334/block-no-verify/issues/26)) ([1384aa1](https://github.com/tupe12334/block-no-verify/commit/1384aa13421019d6db05a939edab1925621a1b5e)), closes [#1](https://github.com/tupe12334/block-no-verify/issues/1) [#5](https://github.com/tupe12334/block-no-verify/issues/5) [#9](https://github.com/tupe12334/block-no-verify/issues/9)

## [1.2.0](https://github.com/tupe12334/block-no-verify/compare/v1.1.5...v1.2.0) (2026-06-02)

### Features

- replace custom stdin parsing with @polyhook/sdk ([#4](https://github.com/tupe12334/block-no-verify/issues/4)) ([b4b2610](https://github.com/tupe12334/block-no-verify/commit/b4b261065aa962af8f03e40e623f856cb333fe49)), closes [#5](https://github.com/tupe12334/block-no-verify/issues/5)

## [1.1.5](https://github.com/tupe12334/block-no-verify/compare/v1.1.4...v1.1.5) (2026-04-16)

### Features

- block GitHub MCP tools that bypass local git hooks ([#2](https://github.com/tupe12334/block-no-verify/issues/2)) ([7323a7c](https://github.com/tupe12334/block-no-verify/commit/7323a7c75d3c0529ff3ea866bf0fe705eda5152c))

## 1.1.4 (2026-03-24)

### Features

- add .local to .gitignore for temporary file exclusion ([0f9d15a](https://github.com/tupe12334/block-no-verify/commit/0f9d15a1a7ceecfccc6f65b1a50f7ff39a9dbdd1))
- add additional Bash commands for improved functionality in settings ([f8ccb8e](https://github.com/tupe12334/block-no-verify/commit/f8ccb8e69ca12b9781b4c8129af75be2ae6b31c5))
- add agent-specific test suite with shared test commands ([daad1ff](https://github.com/tupe12334/block-no-verify/commit/daad1ffad9244aba2fc68f1e36390a9a26f88013))
- Add commands for intelligent session revert, chat summary, deep analysis, use case testing, and comprehensive feature validation ([e385db6](https://github.com/tupe12334/block-no-verify/commit/e385db649ae11199d4651d2aee18bfbc9742cb6a))
- add comprehensive edge case detection for git commands ([e1ee029](https://github.com/tupe12334/block-no-verify/commit/e1ee0298e0d1d83b337595a54b70f237bbdbf832))
- Add CONTRIBUTING.md and README.md for project guidelines and usage instructions ([895f658](https://github.com/tupe12334/block-no-verify/commit/895f65838e8981fe74d7851589a173db5ccfb995))
- Add eslint-import-resolver-typescript to enhance ESLint configuration ([53a4a77](https://github.com/tupe12334/block-no-verify/commit/53a4a77c63b1302b4e35ed21ccc6ad34664a8227))
- add GitHub CLI commands to permissions in settings ([149dfbe](https://github.com/tupe12334/block-no-verify/commit/149dfbe2f59ae386ab8e43ea915d3dfdf3427b45))
- Add LICENSE, ESLint, and Knip configuration files ([e5889d3](https://github.com/tupe12334/block-no-verify/commit/e5889d346434e880b392fb3d30f9175b87d73ce3))
- add pattern to ignore additional local temporary files ([73aedcd](https://github.com/tupe12334/block-no-verify/commit/73aedcdcbe16329514a8d0c39ae34dbc31bd0fe3))
- add permission for pnpm test command in settings ([1d347f0](https://github.com/tupe12334/block-no-verify/commit/1d347f0e9998a89d9f7b88446b6c5be23629357f))
- add platform-agnostic support for Claude Code, Gemini CLI, and Cursor ([b8e8fc4](https://github.com/tupe12334/block-no-verify/commit/b8e8fc432bffea618ff1ed0e709f87b769e5ff52))
- Add Prettier and Commitlint configuration files ([a7ba725](https://github.com/tupe12334/block-no-verify/commit/a7ba7255fe214fd1ef09a17955f1574b34466346))
- add settings for block-no-verify hook to prevent --no-verify flags in git commands ([8546e60](https://github.com/tupe12334/block-no-verify/commit/8546e60f028571bfbe78c780fe9813173156dc9a))
- Add settings for permissions and hooks to block --no-verify on git push ([e809415](https://github.com/tupe12334/block-no-verify/commit/e809415dc318ea4d15fa4cf3999c59ca7cf5f193))
- add shell syntax edge case detection and tests ([4d52d79](https://github.com/tupe12334/block-no-verify/commit/4d52d79179dfca8ff7919dc60cb15a6e059160e7))
- add wc command to permissions in settings ([2691f77](https://github.com/tupe12334/block-no-verify/commit/2691f776515d299ec8445f8600cdb88f9a6bd6a6))
- block core.hooksPath override to prevent hook bypass ([f7a2df0](https://github.com/tupe12334/block-no-verify/commit/f7a2df03c92975a045ef683a3a00603d469f0275))
- bump version to 1.1.2 ([785fbf1](https://github.com/tupe12334/block-no-verify/commit/785fbf1a5b18e177773921be8526810771f8734c))
- implement block-no-verify CLI tool with comprehensive test suite ([5c05c1e](https://github.com/tupe12334/block-no-verify/commit/5c05c1ea10001e2ad82838f46f48022073cac6a7))
- Update .gitignore to include additional temporary files and IDE configurations ([7774def](https://github.com/tupe12334/block-no-verify/commit/7774def2efb7d35091c09449497d2418e5b6d878))
- update usage instructions for non-global installation with pnpm and npx ([18100d8](https://github.com/tupe12334/block-no-verify/commit/18100d81f7b2b54e23d2504d2430a337ea932f91))

### Bug Fixes

- **ci:** run build before tests to ensure dist/cli.js exists ([5539896](https://github.com/tupe12334/block-no-verify/commit/55398968ffb954ca0e3c4406b0252334a2469695))
- update command in hooks to use pnpm dlx for block-no-verify ([00e68d7](https://github.com/tupe12334/block-no-verify/commit/00e68d78494fc0abe152731fa692d2d542318cdb))
- update installation instructions to remove npm and npx references ([93312e3](https://github.com/tupe12334/block-no-verify/commit/93312e3aa7d70b8698ebe9e8c7500597b1d3d371))

All notable changes to this project will be documented in this file.

## [1.1.2] - 2025-05-13

### Features

- Block `core.hooksPath` override to prevent hook bypass
- Add platform-agnostic support for Claude Code, Gemini CLI, and Cursor
- Add comprehensive edge case detection for git commands
- Add shell syntax edge case detection and tests
- Add agent-specific test suite with shared test commands

### Bug Fixes

- Update command in hooks to use `pnpm dlx` for block-no-verify

## [1.0.0] - 2025-05-01

### Features

- Implement block-no-verify CLI tool with comprehensive test suite
- Add settings for block-no-verify hook to prevent `--no-verify` flags in git commands

### Bug Fixes

- Run build before tests to ensure `dist/cli.js` exists (CI)
