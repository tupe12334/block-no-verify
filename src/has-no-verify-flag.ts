import { parse } from 'shell-quote'
import type { GitCommand } from './git-command.js'
import { detectGitCommand } from './detect-git-command.js'
import { expandSimpleVariableRefs } from './expand-simple-variable-refs.js'
import { splitStatements } from './split-statements.js'

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
 * Checks a single shell statement (no top-level `;`, `&`, `|`, or newline) for
 * a --no-verify flag belonging to `command`. Assumes the caller has already
 * confirmed the statement is itself a `git <command>` invocation.
 * @param statement - One shell statement to scan.
 * @param command - The detected git sub-command.
 * @returns True when the statement contains a flag that bypasses hooks.
 */
function statementHasNoVerifyFlag(
  statement: string,
  command: GitCommand
): boolean {
  const tokens = parse(statement).filter(
    (token): token is string => typeof token === 'string'
  )
  let skipNext = false

  for (const token of tokens) {
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
 * `input` is first expanded via {@link expandSimpleVariableRefs} (so a
 * sub-command hidden behind a variable, e.g. `c=push; git $c --no-verify`,
 * still resolves) and then split into top-level shell statements (see
 * {@link splitStatements}); only statements that are themselves a
 * `git <command>` invocation (per {@link detectGitCommand}) are scanned for
 * the flag. This keeps a flag belonging to an unrelated command chained on
 * the same line — `echo -n`, `grep -n`, `head -n`, … — from being mistaken
 * for git's own `-n`/`--no-verify`, while a real bypass in a later statement
 * (`git commit -m "x"; git commit --no-verify`) is still caught.
 *
 * Within a matching statement, the value of message/file options (`-m`,
 * `-F`, `-C`, …) is skipped, so a `--no-verify` or `-n` appearing inside a
 * commit message body is not mistaken for the flag. A flag in argv
 * flag-position (including a quoted `git commit "--no-verify"`, which git
 * still parses as the flag) is still detected.
 * @param input - The command string to scan.
 * @param command - The detected git sub-command.
 * @returns True when the command string contains a flag that bypasses hooks.
 */
export function hasNoVerifyFlag(input: string, command: GitCommand): boolean {
  const expanded = expandSimpleVariableRefs(input)
  for (const statement of splitStatements(expanded)) {
    if (detectGitCommand(statement) !== command) continue
    if (statementHasNoVerifyFlag(statement, command)) return true
  }

  return false
}
