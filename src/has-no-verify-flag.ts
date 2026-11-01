import { tokenizeCommand } from './tokenize-command.js'
import { splitStatements } from './split-statements.js'
import { extractNestedStatements } from './extract-nested-statements.js'
import type { GitCommand } from './git-command.js'
import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'

/**
 * Options that consume the following argv token as their value (a commit
 * message, a message file, or a commit to reuse/re-edit). The value of these
 * options is user text and must never be scanned for hook-bypass flags.
 */
const VALUE_OPTIONS = new Set([
  '-m',
  '--message',
  '-F',
  '--file',
  '-C',
  '--reuse-message',
  '-c',
  '--reedit-message',
  '--fixup',
  '--squash',
])

/**
 * Short option letters that consume the rest of a short-flag bundle as their
 * value. A `n` appearing after one of these in a bundle is part of a value, not
 * the `-n` (`--no-verify`) flag.
 */
const SHORT_VALUE_LETTERS = new Set(['m', 'F', 'C', 'c'])

/** The short-flag letter that enables `--no-verify` for `git commit`. */
const NO_VERIFY_LETTERS = new Set(['n'])

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
 * Returns true when a single-dash short-flag bundle (e.g. `-n`, `-nm`, `-vn`)
 * contains the `-n` (`--no-verify`) flag. A `n` that follows a value-consuming
 * letter such as `m` (e.g. `-mn`, where `n` is part of the message) does not
 * count.
 * @param token - The argv token to inspect.
 * @returns True when the bundle enables `--no-verify`.
 */
function isShortNoVerifyBundle(token: string): boolean {
  if (!/^-[a-zA-Z]+$/.test(token)) {
    return false
  }
  for (const letter of token.slice(1)) {
    if (NO_VERIFY_LETTERS.has(letter)) {
      return true
    }
    if (SHORT_VALUE_LETTERS.has(letter)) {
      return false
    }
  }
  return false
}

/**
 * Scans one statement's argv tokens for a --no-verify bypass of `command`.
 * The value of message/file options (`-m`, `-F`, `-C`, …) is skipped, so a
 * `--no-verify` or `-n` appearing inside a commit message body is not
 * mistaken for the flag. A flag in argv flag-position (including a quoted
 * `git commit "--no-verify"`, which git still parses as the flag) is still
 * detected.
 * @param statement - The statement's string argv tokens.
 * @param command - The detected git sub-command.
 * @returns True when the statement contains a flag that bypasses hooks.
 */
function statementHasNoVerifyFlag(
  statement: string[],
  command: GitCommand
): boolean {
  let skipNext = false

  for (const token of statement) {
    if (skipNext) {
      skipNext = false
      continue
    }

    if (VALUE_OPTIONS.has(token)) {
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
    if (command === 'commit' && isShortNoVerifyBundle(token)) {
      return true
    }
  }

  return false
}

/**
 * Returns the guarded git sub-command a statement invokes, or null when the
 * statement does not invoke git or none of its words is a guarded
 * sub-command. When several guarded words appear, `commit` wins so that the
 * stricter `-n` rule applies — over-matching can only widen the scan.
 * @param statement - The statement's string argv tokens.
 * @returns The statement's guarded sub-command, or null.
 */
function statementCommand(statement: string[]): GitCommand | null {
  if (!statement.some(isGitToken)) return null
  // `commit` is first in the list, so it wins when several words appear.
  for (const cmd of GIT_COMMANDS_WITH_NO_VERIFY) {
    if (statement.includes(cmd)) return cmd
  }
  return null
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
 */
export function hasNoVerifyFlag(input: string, command: GitCommand): boolean {
  const tokens = tokenizeCommand(input)
  const statements = [
    ...splitStatements(tokens),
    ...extractNestedStatements(tokens),
  ]
  let anyGitStatement = false
  for (const statement of statements) {
    const cmd = statementCommand(statement)
    if (cmd === null) continue
    anyGitStatement = true
    if (statementHasNoVerifyFlag(statement, cmd)) return true
  }
  if (anyGitStatement) return false
  return statements.some(statement =>
    statementHasNoVerifyFlag(statement, command)
  )
}
