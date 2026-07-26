import { parse } from 'shell-quote'
import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'
import type { GitCommand } from './git-command.js'
import { findStatementEnd } from './find-statement-end.js'

/**
 * Returns true when the character at `idx` in `input` is inside a shell
 * comment. Duplicated (in miniature) from `detect-git-command.ts` because a
 * comment can only start a new statement boundary, never a sub-command match.
 * @param input - The full command string.
 * @param idx - Index of the character to test.
 * @returns True when the position is inside a `#` comment.
 */
function isInComment(input: string, idx: number): boolean {
  const lineStart = input.lastIndexOf('\n', idx - 1) + 1
  const before = input.slice(lineStart, idx)
  for (let i = 0; i < before.length; i++) {
    if (before.charAt(i) !== '#') continue
    const prev = i > 0 ? before.charAt(i - 1) : ''
    if (prev !== '$' && prev !== '\\') return true
  }
  return false
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
    const cmdIdx = input.indexOf(cmd, searchStart)
    if (cmdIdx === -1) continue
    const before = cmdIdx > 0 ? input[cmdIdx - 1] : ' '
    const after = input[cmdIdx + cmd.length] || ' '
    if (!/\s/.test(before)) continue
    if (!/[\s;&#|>)\]}"']/.test(after) && after !== '') continue
    if (/[;|]/.test(input.slice(searchStart, cmdIdx))) continue
    if (isInComment(input, cmdIdx)) continue
    return cmd
  }
  return null
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
 * @returns The detected git sub-command, or null when none is found.
 */
function findSubCommandTokenized(
  input: string,
  searchStart: number
): GitCommand | null {
  const statementEnd = findStatementEnd(input, searchStart)
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
 * @returns The detected git sub-command, or null when none is found.
 */
export function findSubCommand(
  input: string,
  searchStart: number
): GitCommand | null {
  const scanned = findSubCommandByScan(input, searchStart)
  if (scanned !== null) return scanned
  return findSubCommandTokenized(input, searchStart)
}
