import type { GitCommand } from './git-command.js'
import { expandSimpleVariableRefs } from './expand-simple-variable-refs.js'
import { findMessageValueSpans } from './find-message-value-spans.js'
import { findUnquotedGitCommand } from './find-unquoted-git-command.js'
import { hasHookSkipSignal } from './has-hook-skip-signal.js'
import { InputTooLongError } from './input-too-long-error.js'
import { scanGitWords } from './scan-git-words.js'

/**
 * Finds the git sub-command after each `git` token. When that search would
 * parse too much text, and the command holds no hook-skip signal (see
 * {@link hasHookSkipSignal}), it runs again with the `git` words of quoted
 * commit messages and PR bodies (see {@link findMessageValueSpans}) left
 * unparsed. Such a word is prose. The second search only runs for input the
 * first one rejects, so it never changes the result for other input.
 * @param input - The raw command string.
 * @param expanded - The command string with simple variables expanded.
 * @returns The first sub-command found, or null.
 * @throws {InputTooLongError} When both searches would parse too much text.
 */
function scanWithMessageExemption(
  input: string,
  expanded: string
): GitCommand | null {
  try {
    return scanGitWords(expanded, [])
  } catch (error) {
    const exempt =
      error instanceof InputTooLongError &&
      !hasHookSkipSignal(input) &&
      !hasHookSkipSignal(expanded)
    const spans = exempt ? findMessageValueSpans(expanded) : []
    if (spans.length === 0) {
      // eslint-disable-next-line error/no-throw-literal -- rethrows the caught error unchanged
      throw error
    }
    return scanGitWords(expanded, spans)
  }
}

/**
 * Checks if the input contains a git command. `input` is first passed
 * through a best-effort expansion of trivial `NAME=value` assignments (see
 * {@link expandSimpleVariableRefs}), so hiding `git` itself or its
 * sub-command behind a simple variable (e.g. `g=git; $g push`) does not
 * defeat detection. The sub-command is then located after each `git` token
 * (see {@link scanGitWords}), which also tolerates a sub-command split up by
 * shell quoting (e.g. `git pu"sh"`). When that finds nothing, the
 * shell-unquoted words are compared too (see {@link findUnquotedGitCommand}),
 * so a git name split by quoting or escaping (e.g. `g''it`) is detected.
 *
 * Many `git` words in one statement make the search parse it many times.
 * Past a limit the input is not checked, unless the extra `git` words are
 * prose in a message value of a command with no hook-skip signal (see
 * {@link scanWithMessageExemption}).
 * @param input - The command string to scan for a git sub-command.
 * @returns The detected git sub-command, or null when none is found.
 * @throws {InputTooLongError} When the input is too large to check in
 *   bounded time: a variable expansion grows past `MAX_INPUT_LENGTH`, or the
 *   searches would parse too much text. `checkCommand` blocks such input.
 */
export function detectGitCommand(input: string): GitCommand | null {
  const expanded = expandSimpleVariableRefs(input)
  const cmd = scanWithMessageExemption(input, expanded)
  // The raw scan cannot see a git name that quoting or escaping splits
  // (e.g. `g''it`), so fall back to the shell-unquoted words.
  return cmd === null ? findUnquotedGitCommand(input) : cmd
}
