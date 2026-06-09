import type { Span } from './span.js'

/**
 * Reads a double-quoted span starting at the opening quote, honoring the
 * backslash escapes that are meaningful inside double quotes (`" \ $ \``). An
 * unterminated quote consumes the rest of the input.
 */
export function readDoubleQuoted(input: string, open: number): Span {
  const n = input.length
  let value = ''
  let i = open + 1
  while (i < n && input.charAt(i) !== '"') {
    const next = input.charAt(i + 1)
    if (
      input.charAt(i) === '\\' &&
      (next === '"' || next === '\\' || next === '$' || next === '`')
    ) {
      value += next
      i += 2
      continue
    }
    value += input.charAt(i)
    i++
  }
  return { value, next: i + 1 }
}
