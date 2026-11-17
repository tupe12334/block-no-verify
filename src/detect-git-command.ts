import type { GitCommand } from './git-command.js'
import { expandSimpleVariableRefs } from './expand-simple-variable-refs.js'
import { findSubCommand } from './find-git-subcommand.js'
import { findMessageValueSpans } from './find-message-value-spans.js'
import { findUnquotedGitCommand } from './find-unquoted-git-command.js'
import { InputTooLongError } from './input-too-long-error.js'
import { isInComment } from './is-in-comment.js'
import { MAX_INPUT_LENGTH } from './max-input-length.js'

const VALID_BEFORE_GIT = ' \t\n\r;&|$`(<{!"\']/.~\\'

/**
 * Most text, in characters, the sub-command searches of one
 * {@link detectGitCommand} call may parse.
 */
const MAX_PARSE_WORK = MAX_INPUT_LENGTH * 20

/**
 * Finds the next `git` (or `git.exe`) token in `input` starting at `start`.
 * @param input - The full command string to search.
 * @param start - Character offset to begin searching from.
 * @returns The index and length of the matched token, or null if not found.
 */
function findGit(
  input: string,
  start: number
): { idx: number; len: number } | null {
  let pos = start
  while (pos < input.length) {
    const idx = input.indexOf('git', pos)
    if (idx === -1) return null
    const isExe = input.slice(idx + 3, idx + 7).toLowerCase() === '.exe'
    const len = isExe ? 7 : 3
    const after = input[idx + len] || ' '
    if (!/[\s"']/.test(after)) {
      pos = idx + 1
      continue
    }
    const before = idx > 0 ? input[idx - 1] : ' '
    if (VALID_BEFORE_GIT.includes(before)) return { idx, len }
    pos = idx + 1
  }
  return null
}

/**
 * Checks if the input contains a git command. `input` is first passed
 * through a best-effort expansion of trivial `NAME=value` assignments (see
 * {@link expandSimpleVariableRefs}), so hiding `git` itself or its
 * sub-command behind a simple variable (e.g. `g=git; $g push`) does not
 * defeat detection. The sub-command is then located via
 * {@link findSubCommand}, which also tolerates a sub-command split up by
 * shell quoting (e.g. `git pu"sh"`), on top of the plain whole-word/quoted
 * cases the raw-text scan already handles. When that scan finds nothing, the
 * shell-unquoted words are compared too (see {@link findUnquotedGitCommand}),
 * so a git name split by quoting or escaping (e.g. `g''it`) is detected.
 *
 * Each `git` token can parse the rest of its statement, so many `git` words
 * in one statement parse it many times. Past {@link MAX_PARSE_WORK}
 * characters parsed, the input is not checked. A `git` word inside a quoted
 * commit message or PR body (see {@link findMessageValueSpans}) is prose:
 * only the cheap raw-text scan runs for it, so it costs no parse work.
 * @param input - The command string to scan for a git sub-command.
 * @returns The detected git sub-command, or null when none is found.
 * @throws {InputTooLongError} When the input is too large to check in
 *   bounded time: a variable expansion grows past {@link MAX_INPUT_LENGTH}, or
 *   the searches would parse more than {@link MAX_PARSE_WORK} characters.
 *   `checkCommand` blocks such input.
 */
export function detectGitCommand(input: string): GitCommand | null {
  const expanded = expandSimpleVariableRefs(input)
  let parsed = 0
  const chargeParse = (length: number): void => {
    parsed += length
    if (parsed > MAX_PARSE_WORK) throw new InputTooLongError()
  }
  let valueSpans: ReturnType<typeof findMessageValueSpans> | undefined
  let spanIndex = 0
  let start = 0
  while (start < expanded.length) {
    const git = findGit(expanded, start)
    if (!git) break
    if (isInComment(expanded, git.idx)) {
      start = git.idx + git.len
      continue
    }
    const searchStart = git.idx + git.len
    valueSpans ??= findMessageValueSpans(expanded)
    let span = valueSpans.at(spanIndex)
    while (span !== undefined && span.end <= git.idx) {
      spanIndex++
      span = valueSpans.at(spanIndex)
    }
    const inValue = span !== undefined && span.start <= git.idx
    const cmd = findSubCommand(expanded, searchStart, chargeParse, inValue)
    if (cmd) return cmd
    start = searchStart
  }
  // The raw scan cannot see a git name that quoting or escaping splits
  // (e.g. `g''it`), so fall back to the shell-unquoted words.
  return findUnquotedGitCommand(input)
}
