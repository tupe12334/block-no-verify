// cspell:ignore Skeyn keyn
import { preprocessCommand } from './preprocess-command.js'
import { tokenizeCommand } from './tokenize-command.js'
import { findLiveSubstitutions } from './find-live-substitutions.js'
import { splitStatements } from './split-statements.js'
import { extractNestedStatements } from './extract-nested-statements.js'
import type { GitCommand } from './git-command.js'
import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'
import { readCommitShortBundle } from './commit-short-bundle.js'
import { dropRedirectTargets } from './drop-redirect-targets.js'
import { subcommandValueOptions } from './subcommand-value-options.js'

/**
 * Returns true when the token is the `git` program itself, tolerating a path
 * prefix (`/usr/bin/git`, `..\git.exe`) and the Windows `.exe` suffix.
 * @param token - The argv token to inspect.
 * @returns True when the token invokes git.
 */
function isGitToken(token: string): boolean {
  const base = token.slice(
    Math.max(token.lastIndexOf('/'), token.lastIndexOf('\\')) + 1
  )
  return base === 'git' || base.toLowerCase() === 'git.exe'
}

/**
 * Returns true when the token is an unambiguous git abbreviation of
 * `--no-verify`. Git accepts any prefix of a long option that is long enough
 * to be unambiguous; the shortest accepted prefix is `--no-veri` (8 chars after
 * the leading `--`). Anything shorter is ambiguous and rejected by git itself.
 * @param token - The argv token to inspect.
 * @returns True when the token is a valid abbreviation of `--no-verify`.
 */
function isNoVerifyAbbreviation(token: string): boolean {
  return '--no-verify'.startsWith(token) && token.startsWith('--no-veri')
}

/**
 * Scans one statement's argv tokens for a --no-verify bypass of `command`.
 * The value of each option in `valueOptions` (`-m`, `-F`, …) is skipped, so a
 * `--no-verify` or `-n` appearing inside a commit message body is not
 * mistaken for the flag. A flag in argv flag-position (including a quoted
 * `git commit "--no-verify"`, which git still parses as the flag) is still
 * detected.
 * @param statement - The statement's string argv tokens.
 * @param command - The detected git sub-command.
 * @param valueOptions - The options whose next token is skipped as a value.
 * @returns True when the statement contains a flag that bypasses hooks.
 */
function statementHasNoVerifyFlag(
  statement: string[],
  command: GitCommand,
  valueOptions: ReadonlySet<string>
): boolean {
  let skipNext = false

  for (const [index, token] of statement.entries()) {
    if (skipNext) {
      skipNext = false
      continue
    }

    if (valueOptions.has(token)) {
      skipNext = true
      continue
    }

    // --no-verify is a bypass for every git sub-command we guard.
    // Also match valid git long-option abbreviations (e.g. --no-veri, --no-verif).
    if (isNoVerifyAbbreviation(token)) {
      return true
    }

    // For commit, -n is shorthand for --no-verify. For push (-n = --dry-run),
    // merge (-n = --no-commit), etc. it means something else, so only commit.
    if (command !== 'commit') continue
    const bundle = readCommitShortBundle(token)
    if (bundle === null) continue
    if (bundle.enablesNoVerify) {
      return true
    }
    // A value letter ending the bundle (`-am`) takes the next token.
    skipNext = bundle.takesNextToken
  }

  return false
}

/**
 * Returns true when any reading of the statement finds a bypass. Each
 * sub-command in `commands` is read with its own value options, and again
 * with the value options of `git commit`, which hold all of them. Git
 * rejects an option that a sub-command does not have, but this check cannot
 * know which reading git uses, so it blocks when either one finds the flag.
 * @param statement - The statement's string argv tokens.
 * @param commands - The sub-commands the statement may invoke.
 * @returns True when a reading finds a flag that bypasses hooks.
 */
function anyReadingHasNoVerifyFlag(
  statement: string[],
  commands: readonly GitCommand[]
): boolean {
  return commands.some(
    command =>
      statementHasNoVerifyFlag(
        statement,
        command,
        subcommandValueOptions(command)
      ) ||
      statementHasNoVerifyFlag(
        statement,
        command,
        subcommandValueOptions('commit')
      )
  )
}

/**
 * Returns each guarded git sub-command word in a statement that invokes git,
 * or an empty list when the statement does not invoke git. A word is not
 * always the sub-command (`git rebase -m x commit`), so each one is read:
 * over-matching can only widen the scan.
 * @param statement - The statement's string argv tokens.
 * @returns The statement's guarded sub-command words.
 */
function statementCommands(statement: string[]): GitCommand[] {
  if (!statement.some(isGitToken)) return []
  return GIT_COMMANDS_WITH_NO_VERIFY.filter(cmd => statement.includes(cmd))
}

/**
 * Checks if the input contains a --no-verify flag for a specific git command.
 *
 * The input is normalized for ANSI-C/locale quoting and line continuations
 * (#78), then tokenized once with `shell-quote` after best-effort
 * `NAME=value` variable expansion (e.g. `c=push; git $c --no-verify`), and
 * split into statements at control-operator tokens (`;`, `&&`, `|`, …) via
 * {@link splitStatements}. `shell-quote` also leaves a command substitution
 * written inside a quoted word (e.g. `echo "$(git commit --no-verify)"`) as
 * one opaque string instead of its own statement (#81); those are recovered
 * separately by {@link extractNestedStatements} and scanned the same way,
 * which cannot distinguish an inert single-quoted `'$(...)'` literal from an
 * executed double-quoted one — an intentional over-scan, since it can only
 * report a false bypass, never miss a real one. Each statement that invokes
 * a guarded git sub-command is scanned against its own sub-command, so a
 * `-n` belonging to a chained `echo`, `grep`, or `head` is not mistaken for
 * git's `--no-verify` (#70), while a real bypass in any git-invoking
 * statement of the same line — even one for a different guarded sub-command
 * than `command` (e.g. `git commit -m "x" && git push --no-verify`) — is
 * still caught. Because the split works on parsed tokens, a separator
 * character inside a quoted commit message cannot break the statement apart
 * and smuggle the flag past the scan.
 *
 * When no statement resolves to a guarded sub-command (the detector saw
 * `command` through a construct this token-level check cannot), every
 * statement is scanned against `command` as before — erring toward blocking.
 * @param input - The command string to scan.
 * @param command - The detected git sub-command.
 * @returns True when the command string contains a flag that bypasses hooks.
 * @throws {InputTooLongError} When the input is too large to check in
 *   bounded time: a variable expansion grows past `MAX_INPUT_LENGTH`, or one
 *   statement has very many `git` words. `checkCommand` blocks such input.
 */
export function hasNoVerifyFlag(input: string, command: GitCommand): boolean {
  const tokens = tokenizeCommand(input)
  // Backtick and `$(…)` spans that bash runs are scanned on the raw text, since
  // shell-quote splits a backtick span into several words (see
  // findLiveSubstitutions).
  const substitutions = findLiveSubstitutions(preprocessCommand(input))
  const statements = [
    ...splitStatements(dropRedirectTargets(tokens)),
    ...extractNestedStatements(tokens),
    ...substitutions.flatMap(text => splitStatements(tokenizeCommand(text))),
  ]
  let anyGitStatement = false
  for (const statement of statements) {
    const commands = statementCommands(statement)
    if (commands.length === 0) continue
    anyGitStatement = true
    if (anyReadingHasNoVerifyFlag(statement, commands)) return true
  }
  if (anyGitStatement) return false
  return statements.some(statement =>
    anyReadingHasNoVerifyFlag(statement, [command])
  )
}
