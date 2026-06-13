import type { ParseEntry } from 'shell-quote'
import { isGitExecutable } from './is-git-executable.js'

/**
 * Shell control operators that terminate one simple command and begin another.
 * Tokens after one of these belong to a *different* command, so a `-n` (or any
 * flag) that follows must not be attributed to the git command before it.
 * Subshell parentheses are included because they likewise start a fresh command
 * context (`echo $(git commit -n)`).
 */
const COMMAND_SEPARATORS = new Set(['&&', '||', ';', '|', '&', '(', ')'])

/**
 * Splits a tokenized command line into per-command segments. A new segment
 * starts at every shell control operator and at every `git` executable token,
 * so each git invocation in a compound line (`git commit … && git log -n 3`)
 * lands in its own segment and its flags are never confused with another
 * command's.
 */
export function splitIntoSegments(entries: ParseEntry[]): ParseEntry[][] {
  const segments: ParseEntry[][] = []
  let current: ParseEntry[] = []

  const flush = (): void => {
    if (current.length > 0) {
      segments.push(current)
      current = []
    }
  }

  for (const entry of entries) {
    if (typeof entry !== 'string') {
      const op = 'op' in entry ? entry.op : ''
      if (COMMAND_SEPARATORS.has(op)) {
        flush()
        continue
      }
      // Redirection operators stay in the segment so the scan can skip the
      // filename word that follows them.
      current.push(entry)
      continue
    }

    if (isGitExecutable(entry)) {
      flush()
    }
    current.push(entry)
  }

  flush()
  return segments
}
