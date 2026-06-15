import type { Token } from './token.js'

/**
 * Splits a shell command into tokens, honoring single/double quotes and
 * backslash escapes. A quoted span collapses into a single `word` token, so a
 * quoted `-m`/`-F` message body never leaks `--no-verify`/`-n` sub-tokens.
 * Unquoted `&&`, `||`, `|`, `;`, `&`, `(` and `)` become `op` tokens that mark
 * command boundaries.
 * @param input - The raw command string.
 * @returns The ordered list of word and operator tokens.
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let cur = ''
  let hasCur = false
  let quote = ''
  let i = 0
  const flush = (): void => {
    if (!hasCur) return
    tokens.push({ type: 'word', value: cur })
    cur = ''
    hasCur = false
  }
  while (i < input.length) {
    const ch = input.charAt(i)
    if (quote !== '') {
      if (ch === '\\' && quote === '"') {
        cur += input.charAt(i + 1)
        i += 2
        hasCur = true
        continue
      }
      if (ch === quote) {
        quote = ''
        i++
        hasCur = true
        continue
      }
      cur += ch
      i++
      hasCur = true
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      hasCur = true
      i++
      continue
    }
    if (ch === '\\') {
      cur += input.charAt(i + 1)
      i += 2
      hasCur = true
      continue
    }
    if (/\s/.test(ch)) {
      flush()
      i++
      continue
    }
    const two = input.slice(i, i + 2)
    if (two === '&&' || two === '||') {
      flush()
      tokens.push({ type: 'op', value: two })
      i += 2
      continue
    }
    if (ch === ';' || ch === '|' || ch === '&' || ch === '(' || ch === ')') {
      flush()
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }
    cur += ch
    i++
    hasCur = true
  }
  flush()
  return tokens
}
