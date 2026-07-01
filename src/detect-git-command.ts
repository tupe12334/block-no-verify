import type { GitCommand } from './git-command.js'
import { expandSimpleVariableRefs } from './expand-simple-variable-refs.js'
import { findSubCommand } from './find-git-subcommand.js'

const VALID_BEFORE_GIT = ' \t\n\r;&|$`(<{!"\']/.~\\'

/**
 * Returns true when the character at `idx` in `input` is inside a shell comment.
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
 * cases the raw-text scan already handles.
 * @param input - The command string to scan for a git sub-command.
 * @returns The detected git sub-command, or null when none is found.
 */
export function detectGitCommand(input: string): GitCommand | null {
  const expanded = expandSimpleVariableRefs(input)
  let start = 0
  while (start < expanded.length) {
    const git = findGit(expanded, start)
    if (!git) return null
    if (isInComment(expanded, git.idx)) {
      start = git.idx + git.len
      continue
    }
    const searchStart = git.idx + git.len
    const cmd = findSubCommand(expanded, searchStart)
    if (cmd) return cmd
    start = searchStart
  }
  return null
}
