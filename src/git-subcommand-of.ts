import type { ParseEntry } from 'shell-quote'
import { isGitExecutable } from './is-git-executable.js'

/**
 * Git's two global options that consume the following token as a value
 * (`git -C <path> …`, `git -c <key=value> …`). They appear before the
 * subcommand, so they must be skipped when locating it.
 */
const GIT_GLOBAL_VALUE_OPTIONS = new Set(['-C', '-c'])

/**
 * Returns the git subcommand a segment invokes, or null when the segment does
 * not start with the git executable. Skips git's global options (and the value
 * consumed by `-C` / `-c`) to find the subcommand word.
 */
export function gitSubcommandOf(segment: ParseEntry[]): string | null {
  const [head, ...rest] = segment
  if (typeof head !== 'string' || !isGitExecutable(head)) return null

  let skipValue = false
  for (const token of rest) {
    if (typeof token !== 'string') continue
    if (skipValue) {
      skipValue = false
      continue
    }
    if (GIT_GLOBAL_VALUE_OPTIONS.has(token)) {
      skipValue = true
      continue
    }
    if (token.startsWith('-')) continue // other global flag
    return token
  }
  return null
}
