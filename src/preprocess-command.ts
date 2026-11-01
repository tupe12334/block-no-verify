import { expandSimpleVariableRefs } from './expand-simple-variable-refs.js'
import { normalizeShellQuoting } from './normalize-shell-quoting.js'
import { stripHeredocBodies } from './strip-heredoc-bodies.js'
import { stripShellComments } from './strip-shell-comments.js'

/**
 * Strips heredoc bodies and `#` comments, expands simple variable references
 * and normalizes ANSI-C/locale quoting and line continuations. The text that
 * is left is what bash runs, and it is what every `--no-verify` scan reads.
 * @param input - The raw command string.
 * @returns The preprocessed command string.
 */
export function preprocessCommand(input: string): string {
  return expandSimpleVariableRefs(
    normalizeShellQuoting(stripShellComments(stripHeredocBodies(input)))
  )
}
