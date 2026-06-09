import type { Span } from './span.js'

/**
 * Reads a single-quoted span starting at the opening quote. Single quotes are
 * literal in POSIX shell, so nothing inside is interpreted. An unterminated
 * quote consumes the rest of the input.
 */
export function readSingleQuoted(input: string, open: number): Span {
  const end = input.indexOf("'", open + 1)
  if (end === -1) {
    return { value: input.slice(open + 1), next: input.length }
  }
  return { value: input.slice(open + 1, end), next: end + 1 }
}
