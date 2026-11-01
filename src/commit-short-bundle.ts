import { COMMIT_SHORT_VALUE_OPTIONS } from './commit-short-options.js'

/** What a single-dash `git commit` short-flag bundle does to the scan. */
interface CommitShortBundle {
  /** The bundle enables `--no-verify` (`-n` appears before any value letter). */
  readonly enablesNoVerify: boolean
  /** The bundle's last letter takes a value from the next argv token (`-am`). */
  readonly takesNextToken: boolean
}

/**
 * Reads a single-dash short-flag bundle such as `-n`, `-am` or `-tn` the way
 * git's option parser does. Letters are read left to right. A value letter
 * (`-m`, `-t`, ...) ends the bundle: the rest of the token is its value, or,
 * when the value letter is the last one, the next argv token is its value.
 * An optional-inline letter (`-u`, `-S`) takes only the rest of the token.
 * @param token - The argv token to inspect.
 * @returns The bundle's effect, or null when the token is not a short bundle.
 */
export function readCommitShortBundle(token: string): CommitShortBundle | null {
  if (!/^-[a-zA-Z]+$/.test(token)) {
    return null
  }
  const letters = Array.from(token.slice(1))
  for (const [index, letter] of letters.entries()) {
    if (letter === 'n') {
      return { enablesNoVerify: true, takesNextToken: false }
    }
    if (COMMIT_SHORT_VALUE_OPTIONS.required.has(letter)) {
      return {
        enablesNoVerify: false,
        takesNextToken: index === letters.length - 1,
      }
    }
    if (COMMIT_SHORT_VALUE_OPTIONS.optionalInline.has(letter)) {
      return { enablesNoVerify: false, takesNextToken: false }
    }
  }
  return { enablesNoVerify: false, takesNextToken: false }
}
