import { stringLiterals } from './string-literals.js'

/** Languages with `q{}` / `%q()` quote operators. */
const QUOTE_OPERATOR_LANGUAGES = new Set(['perl', 'ruby'])

/**
 * Returns the candidate commands in interpreter code: each string literal,
 * plus all literals joined, since an argv list (`run(["git", "commit", …])`)
 * splits a command across literals.
 * @param code - The interpreter code.
 * @param interpreter - The interpreter's base name (`perl`, `python3`, …).
 * @returns The candidate command strings.
 */
export function codeLiterals(code: string, interpreter: string): string[] {
  const found = stringLiterals(code, QUOTE_OPERATOR_LANGUAGES.has(interpreter))
  return found.length > 1 ? [...found, found.join(' ')] : found
}
