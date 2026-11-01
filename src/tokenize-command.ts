import { parse } from 'shell-quote'
import { expandSimpleVariableRefs } from './expand-simple-variable-refs.js'
import { normalizeShellQuoting } from './normalize-shell-quoting.js'
import { stripHeredocBodies } from './strip-heredoc-bodies.js'
import { preprocessCommand } from './preprocess-command.js'

/**
 * Preprocesses a command string (see {@link preprocessCommand}) and tokenizes
 * the result with `shell-quote`, the full pipeline shared by every
 * `--no-verify` scan.
 * @param input - The raw command string.
 * @returns The parsed `shell-quote` token stream.
 */
export function tokenizeCommand(input: string): ReturnType<typeof parse> {
  return parse(preprocessCommand(input))
}
