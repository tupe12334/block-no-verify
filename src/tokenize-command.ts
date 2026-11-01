import { parse } from 'shell-quote'
import { expandSimpleVariableRefs } from './expand-simple-variable-refs.js'
import { normalizeShellQuoting } from './normalize-shell-quoting.js'
import { splitUnquotedNewlines } from './split-unquoted-newlines.js'
import { stripHeredocBodies } from './strip-heredoc-bodies.js'

/**
 * Strips heredoc bodies, normalizes ANSI-C/locale quoting and line
 * continuations, turns unquoted newlines into statement separators, expands
 * simple variable references, and tokenizes the result with `shell-quote` —
 * the full preprocessing pipeline shared by every `--no-verify` scan.
 * @param input - The raw command string.
 * @returns The parsed `shell-quote` token stream.
 */
export function tokenizeCommand(input: string): ReturnType<typeof parse> {
  return parse(
    expandSimpleVariableRefs(
      splitUnquotedNewlines(normalizeShellQuoting(stripHeredocBodies(input)))
    )
  )
}
