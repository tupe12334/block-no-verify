import type { GitCommand } from './git-command.js'
import { findSubCommand } from './find-git-subcommand.js'
import type { findMessageValueSpans } from './find-message-value-spans.js'
import { InputTooLongError } from './input-too-long-error.js'
import { isInComment } from './is-in-comment.js'
import { MAX_INPUT_LENGTH } from './max-input-length.js'

const VALID_BEFORE_GIT = ' \t\n\r;&|$`(<{!"\']/.~\\'

/**
 * Most text, in characters, the sub-command searches of one
 * {@link scanGitWords} call may parse.
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
 * Finds the git sub-command after each `git` token in turn (see
 * {@link findSubCommand}), skipping tokens in comments.
 *
 * Each `git` token can parse the rest of its statement, so many `git` words
 * in one statement parse it many times. Past {@link MAX_PARSE_WORK}
 * characters parsed, the search stops. For a `git` token inside one of
 * `valueSpans`, only the cheap raw-text scan runs, so it costs no parse work.
 * @param input - The expanded command text.
 * @param valueSpans - Spans whose `git` tokens are not parsed, in text order.
 * @returns The first sub-command found, or null.
 * @throws {InputTooLongError} When the searches would parse more than
 *   {@link MAX_PARSE_WORK} characters.
 */
export function scanGitWords(
  input: string,
  valueSpans: ReturnType<typeof findMessageValueSpans>
): GitCommand | null {
  let parsed = 0
  const chargeParse = (length: number): void => {
    parsed += length
    if (parsed > MAX_PARSE_WORK) throw new InputTooLongError()
  }
  let spanIndex = 0
  let start = 0
  while (start < input.length) {
    const git = findGit(input, start)
    if (!git) break
    if (isInComment(input, git.idx)) {
      start = git.idx + git.len
      continue
    }
    const searchStart = git.idx + git.len
    let span = valueSpans.at(spanIndex)
    while (span !== undefined && span.end <= git.idx) {
      spanIndex++
      span = valueSpans.at(spanIndex)
    }
    const inValue = span !== undefined && span.start <= git.idx
    const cmd = findSubCommand(input, searchStart, chargeParse, inValue)
    if (cmd) return cmd
    start = searchStart
  }
  return null
}
