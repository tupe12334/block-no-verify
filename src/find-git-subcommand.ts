import { parse } from 'shell-quote'
import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'
import type { GitCommand } from './git-command.js'
import { isInComment } from './is-in-comment.js'

/** Statement-separator characters that end the current shell command. */
const STATEMENT_SEPARATOR = /[\n;&|]/g

/** Separators that end the raw-text scan for a sub-command. */
const SCAN_SEPARATOR = /[;|]/g

/** One search: its first match at or after `from` is at `at` (-1 for none). */
interface Found {
  from: number
  at: number
}

/** The text {@link searches} were made in. */
let searchedInput: string | undefined

/** The last search for each key in {@link searchedInput}. */
const searches = new Map<string, Found>()

/**
 * Returns the index of the first match at or after `from`, reusing the last
 * search for the same key in the same text when it still holds: it started at
 * or before `from` and its match is not before `from`. A caller that searches
 * one text from a rising offset, as {@link findSubCommand} is called for each
 * `git` token in turn, so reads each part of the text once per key.
 * @param input - The text to search.
 * @param key - Names what is searched for.
 * @param from - Offset to search from.
 * @param search - Runs the search from an offset.
 * @returns The index of the first match, or -1 when there is none.
 */
function firstIndex(
  input: string,
  key: string,
  from: number,
  search: (start: number) => number
): number {
  if (input !== searchedInput) {
    searches.clear()
    searchedInput = input
  }
  const found = searches.get(key)
  if (
    found !== undefined &&
    found.from <= from &&
    (found.at === -1 || found.at >= from)
  ) {
    return found.at
  }
  const at = search(from)
  searches.set(key, { from, at })
  return at
}

/**
 * Returns the index of the first match of `separator` at or after `start`, or
 * `input.length` when there is none.
 * @param input - The full command string.
 * @param start - Offset to search from.
 * @param separator - A global regex of separator characters.
 * @returns The index of the next separator, or `input.length`.
 */
function nextSeparator(
  input: string,
  start: number,
  separator: RegExp
): number {
  return firstIndex(input, separator.source, start, from => {
    separator.lastIndex = from
    const match = separator.exec(input)
    return match === null ? input.length : match.index
  })
}

/**
 * Finds the git sub-command by scanning raw text for a literal, whole-word
 * occurrence of one of `GIT_COMMANDS_WITH_NO_VERIFY` after the `git` token.
 * This is fast and handles the common case, but it can miss a sub-command
 * that shell quoting splits into pieces (e.g. `pu"sh"`), which is why
 * {@link findSubCommandTokenized} exists as a fallback.
 * @param input - The full command string.
 * @param searchStart - Offset (just past the `git` token) to search from.
 * @returns The detected git sub-command, or null when none is found.
 */
function findSubCommandByScan(
  input: string,
  searchStart: number
): GitCommand | null {
  for (const cmd of GIT_COMMANDS_WITH_NO_VERIFY) {
    const cmdIdx = firstIndex(input, cmd, searchStart, from =>
      input.indexOf(cmd, from)
    )
    if (cmdIdx === -1) continue
    const before = cmdIdx > 0 ? input[cmdIdx - 1] : ' '
    const after = input[cmdIdx + cmd.length] || ' '
    if (!/\s/.test(before)) continue
    if (!/[\s;&#|>)\]}"']/.test(after) && after !== '') continue
    // A `;` or `|` before the match ends the git statement first.
    if (cmdIdx > nextSeparator(input, searchStart, SCAN_SEPARATOR)) continue
    if (isInComment(input, cmdIdx)) continue
    return cmd
  }
  return null
}

/**
 * Finds the index of the next top-level statement separator (`;`, `&`, `|`,
 * or newline) at or after `start`, or `input.length` when the rest of the
 * input is a single statement.
 * @param input - The full command string.
 * @param start - Offset to search from.
 * @returns The index of the next separator, or `input.length`.
 */
function findStatementEnd(input: string, start: number): number {
  return nextSeparator(input, start, STATEMENT_SEPARATOR)
}

/**
 * Finds the git sub-command by tokenizing the current statement with
 * `shell-quote`'s parser (the same one `has-no-verify-flag.ts` uses for flag
 * detection), so a sub-command broken up by shell quoting (e.g. `git
 * pu"sh"`, `git "push"`) still resolves to the plain word the shell would
 * actually pass to `git`. Only used as a fallback once the cheaper raw-text
 * scan finds nothing.
 * @param input - The full command string.
 * @param searchStart - Offset (just past the `git` token) to search from.
 * @param chargeParse - Called with the length of the text before it is
 *   parsed.
 * @returns The detected git sub-command, or null when none is found.
 */
function findSubCommandTokenized(
  input: string,
  searchStart: number,
  chargeParse: ((length: number) => void) | undefined
): GitCommand | null {
  const statementEnd = findStatementEnd(input, searchStart)
  if (chargeParse !== undefined) chargeParse(statementEnd - searchStart)
  const tokens = parse(input.slice(searchStart, statementEnd)).filter(
    (token): token is string => typeof token === 'string'
  )
  for (const cmd of GIT_COMMANDS_WITH_NO_VERIFY) {
    if (tokens.includes(cmd)) return cmd
  }
  return null
}

/**
 * Finds the git sub-command right after a detected `git` token, trying the
 * cheap raw-text scan first and falling back to a quote-aware tokenizer when
 * that finds nothing (see {@link findSubCommandTokenized}).
 * @param input - The full command string.
 * @param searchStart - Offset (just past the `git` token) to search from.
 * @param chargeParse - Called with the length of the text the tokenizer is
 *   about to parse. It can throw to stop a search that would cost too much.
 * @param scanOnly - When true, only the raw-text scan runs.
 * @returns The detected git sub-command, or null when none is found.
 */
export function findSubCommand(
  input: string,
  searchStart: number,
  chargeParse?: (length: number) => void,
  scanOnly?: boolean
): GitCommand | null {
  const scanned = findSubCommandByScan(input, searchStart)
  if (scanned !== null || scanOnly === true) return scanned
  return findSubCommandTokenized(input, searchStart, chargeParse)
}
