import { parse, type ParseEntry } from 'shell-quote'
import type { GitCommand } from './git-command.js'
import { splitIntoSegments } from './split-into-segments.js'
import { gitSubcommandOf } from './git-subcommand-of.js'
import { stripHeredocs } from './strip-heredocs.js'

/** Long-form flag tokens that always bypass git hooks. */
const NO_VERIFY_FLAGS = new Set(['--no-verify'])

/**
 * Options whose following argument is a value (a message, file path, or commit
 * reference) rather than a flag. The argument that follows them must not be
 * scanned for `--no-verify`, otherwise a `--no-verify` mentioned inside a
 * commit message (`git commit -m "disable --no-verify"`) is treated as if the
 * flag itself had been passed.
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
  '-t',
  '--template',
  '--fixup',
  '--squash',
])

/** Redirection operators whose following word is a filename, not a flag. */
const REDIRECTION_OPS = new Set(['<', '>', '>>', '<<<', '<&', '>&'])

/**
 * Whether a token is a short-flag bundle that contains `-n`. For `git commit`,
 * `-n` is the shorthand for `--no-verify`, including when bundled with other
 * short flags such as `-nm`. A long flag (starting with `--`) or any token that
 * is not purely `-` followed by letters is not a bundle.
 */
function isCommitShortFlagBundleWithN(token: string): boolean {
  return /^-[A-Za-z]+$/.test(token) && token.includes('n')
}

/**
 * Scans a single git-command segment for a bypass flag in actual flag position,
 * skipping the value that follows message/file options and redirections.
 */
function segmentHasBypassFlag(
  segment: ParseEntry[],
  command: GitCommand
): boolean {
  let skipNext = false
  for (const entry of segment) {
    if (typeof entry !== 'string') {
      const op = 'op' in entry ? entry.op : ''
      skipNext = REDIRECTION_OPS.has(op)
      continue
    }

    if (skipNext) {
      skipNext = false
      continue
    }

    if (NO_VERIFY_FLAGS.has(entry)) {
      return true
    }

    if (command === 'commit' && isCommitShortFlagBundleWithN(entry)) {
      return true
    }

    if (VALUE_OPTIONS.has(entry)) {
      skipNext = true
    }
  }

  return false
}

/**
 * Checks if the input passes a --no-verify flag (or the `-n` shorthand for
 * commit) to a git command. The command is tokenized as argv with `shell-quote`
 * (after here-document bodies are stripped), so the literal text `--no-verify`
 * or `-n…` appearing inside a quoted message value does not count — only a flag
 * in an actual flag position is blocked. The scan is scoped to the segment of
 * the git invocation that actually runs `command`, so a flag belonging to a
 * different command in a compound line (`git commit … && git log -n 3`) is not
 * attributed to it.
 */
export function hasNoVerifyFlag(input: string, command: GitCommand): boolean {
  let entries: ParseEntry[]
  try {
    entries = parse(stripHeredocs(input))
  } catch {
    // Fall back to a conservative substring check if the command cannot be
    // tokenized, so malformed input never silently bypasses the guard.
    return /--no-verify\b/.test(input)
  }

  for (const segment of splitIntoSegments(entries)) {
    if (gitSubcommandOf(segment) !== command) continue
    if (segmentHasBypassFlag(segment, command)) return true
  }

  return false
}
