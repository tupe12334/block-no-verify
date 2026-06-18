/**
 * Characters that, when backslash-escaped inside a double-quoted string, are
 * reduced to the escaped character itself by the shell.
 */
const DOUBLE_QUOTE_ESCAPABLE = new Set(['"', '\\', '$', '`'])

/**
 * Reads a single-quoted segment starting just after the opening quote. Inside
 * single quotes every character is literal until the next single quote.
 * @param input - The full command string.
 * @param start - Index of the first character after the opening quote.
 * @returns The literal segment and the index just past the closing quote.
 */
function readSingleQuoted(
  input: string,
  start: number
): { value: string; next: number } {
  let value = ''
  let i = start
  while (i < input.length && input.charAt(i) !== "'") {
    value += input.charAt(i)
    i += 1
  }
  return { value, next: i + 1 }
}

/**
 * Reads a double-quoted segment starting just after the opening quote. Inside
 * double quotes a backslash escapes `"`, `\`, `$`, and `` ` ``; everything else
 * is literal until the next unescaped double quote.
 * @param input - The full command string.
 * @param start - Index of the first character after the opening quote.
 * @returns The literal segment and the index just past the closing quote.
 */
function readDoubleQuoted(
  input: string,
  start: number
): { value: string; next: number } {
  let value = ''
  let i = start
  while (i < input.length && input.charAt(i) !== '"') {
    const next = input.charAt(i + 1)
    if (input.charAt(i) === '\\' && DOUBLE_QUOTE_ESCAPABLE.has(next)) {
      value += next
      i += 2
      continue
    }
    value += input.charAt(i)
    i += 1
  }
  return { value, next: i + 1 }
}

/**
 * Splits a shell command string into argv-style tokens, honoring single quotes,
 * double quotes, and backslash escaping. Quote characters are removed so that
 * each token holds the literal value git would receive. This lets the caller
 * tell a flag in argv flag-position (e.g. `git commit "--no-verify"`) apart from
 * the same text appearing inside a quoted `-m`/`-F` value.
 * @param input - The raw command string.
 * @returns The list of argv tokens.
 */
export function tokenizeCommand(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let hasToken = false
  let i = 0

  while (i < input.length) {
    const ch = input.charAt(i)

    if (ch === '\\') {
      if (i + 1 < input.length) {
        current += input.charAt(i + 1)
        hasToken = true
        i += 2
      } else {
        i += 1
      }
    } else if (ch === "'") {
      const segment = readSingleQuoted(input, i + 1)
      current += segment.value
      hasToken = true
      i = segment.next
    } else if (ch === '"') {
      const segment = readDoubleQuoted(input, i + 1)
      current += segment.value
      hasToken = true
      i = segment.next
    } else if (/\s/.test(ch)) {
      if (hasToken) {
        tokens.push(current)
        current = ''
        hasToken = false
      }
      i += 1
    } else {
      current += ch
      hasToken = true
      i += 1
    }
  }

  if (hasToken) {
    tokens.push(current)
  }

  return tokens
}
