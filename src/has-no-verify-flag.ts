import { parse } from 'shell-quote'
import { expandSimpleVariableRefs } from './expand-simple-variable-refs.js'
import type { GitCommand } from './git-command.js'

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
 * Splits `shell-quote`'s parsed token stream into statements, cutting at every
 * operator token (`;`, `&&`, `|`, …, returned as `{ op: ... }` objects). Each
 * statement is the plain-string argv of one command in the shell line.
 * @param input - The command string to tokenize and split.
 * @returns One string array per statement, in source order.
 */
function splitIntoStatements(input: string): string[][] {
  const statements: string[][] = [[]]
  for (const token of parse(input)) {
    if (typeof token === 'string') {
      statements[statements.length - 1]?.push(token)
      continue
    }
    // An operator token (`;`, `&&`, `|`, `||`, `\n`, …) ends the current
    // statement — whatever follows is argv for a different command.
    statements.push([])
  }
  return statements
}

/**
 * Returns true when `statement` invokes `git <command>` somewhere in its
 * argv. `command` need not immediately follow `git` — global options between
 * them (e.g. `git -C /path commit`) are common — so this only requires
 * `command` to appear anywhere after a `git`/`git.exe` token.
 * @param statement - A single statement's argv tokens.
 * @param command - The git sub-command to look for after `git`.
 * @returns True when the statement is a `git <command>` invocation.
 */
function statementInvokesCommand(
  statement: string[],
  command: GitCommand
): boolean {
  const gitIndex = statement.findIndex(
    token => token === 'git' || token === 'git.exe'
  )
  if (gitIndex === -1) {
    return false
  }
  return statement.slice(gitIndex + 1).includes(command)
}

/**
 * Scans one statement's argv for a `--no-verify` flag, skipping the value of
 * message/file options (`-m`, `-F`, `-C`, …) so a `--no-verify` or `-n`
 * appearing inside a commit message body is not mistaken for the flag.
 * @param statement - A single statement's argv tokens.
 * @param command - The git sub-command this statement invokes.
 * @returns True when the statement's argv contains a bypass flag.
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
 * Checks if the input contains a --no-verify flag for a specific git command.
 *
 * `input` is first passed through a best-effort expansion of trivial
 * `NAME=value` assignments (see {@link expandSimpleVariableRefs}, also used by
 * `detectGitCommand`), so hiding `git` itself or its sub-command behind a
 * simple variable (e.g. `g=git; $g push --no-verify`) does not defeat the
 * statement check below. The expanded string is then split into statements at
 * shell operator boundaries (`;`, `&&`, `|`, …) and each statement is
 * tokenized into argv honoring shell quoting (via `shell-quote`). Only
 * statements that actually invoke `git <command>` are scanned for the bypass
 * flag, so a `-n` belonging to an unrelated chained command (e.g. `echo -n`,
 * `grep -n`) after a separator is not mistaken for `git`'s own
 * `-n`/`--no-verify`. A flag in argv flag-position (including a quoted
 * `git commit "--no-verify"`, which git still parses as the flag) is still
 * detected, in any statement that invokes the command.
 * @param input - The command string to scan.
 * @param command - The detected git sub-command.
 * @returns True when the command string contains a flag that bypasses hooks.
 */
export function hasNoVerifyFlag(input: string, command: GitCommand): boolean {
  const expanded = expandSimpleVariableRefs(input)
  for (const statement of splitIntoStatements(expanded)) {
    if (!statementInvokesCommand(statement, command)) {
      continue
    }
    if (statementHasNoVerifyFlag(statement, command)) {
      return true
    }
  }

  return false
}
