import type { GitCommand } from './git-command.js'
import { tokenize } from './tokenize.js'

/**
 * Options whose following argument is a value (a message, file path, or commit
 * reference) rather than a flag. The argument that follows them must not be
 * scanned for `--no-verify`, otherwise a `--no-verify` mentioned inside a
 * commit message (`git commit -m "disable --no-verify"`) is treated as if the
 * flag itself had been passed.
 */
/** Long-form flag tokens that always bypass git hooks. */
const NO_VERIFY_FLAGS = new Set(['--no-verify'])

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
 * Checks if the input passes a --no-verify flag (or the `-n` shorthand for
 * commit) to a git command. The command is tokenized as argv first, so the
 * literal text `--no-verify` or `-n…` appearing inside a quoted message value
 * does not count — only a flag in an actual flag position is blocked.
 */
export function hasNoVerifyFlag(input: string, command: GitCommand): boolean {
  const tokens = tokenize(input)
  let skipNext = false

  for (const token of tokens) {
    if (skipNext) {
      skipNext = false
      continue
    }

    if (NO_VERIFY_FLAGS.has(token)) {
      return true
    }

    if (command === 'commit' && isCommitShortFlagBundleWithN(token)) {
      return true
    }

    if (VALUE_OPTIONS.has(token)) {
      skipNext = true
    }
  }

  return false
}
