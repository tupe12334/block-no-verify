import { readDoubleQuoted } from './read-double-quoted.js'
import { readSingleQuoted } from './read-single-quoted.js'
import { skipHeredoc } from './skip-heredoc.js'

const META_CHARS = ';&|()<>'
const WHITESPACE = ' \t\n\r'

/**
 * Splits a shell command string into argv-style tokens, honoring single and
 * double quoting, backslash escapes, and adjacency (e.g. `-m"x"` becomes the
 * single token `-mx`). Quote characters are removed from the returned values,
 * shell metacharacters (`; & | ( ) < >`) act as token separators, and the body
 * of an unquoted here-document is dropped so a commit message piped through a
 * heredoc is never mistaken for argv flags.
 *
 * This is intentionally a lightweight lexer, not a full shell parser: it does
 * not expand variables or command substitutions, it keeps their literal text
 * inside the surrounding token. That is enough for flag detection, where the
 * goal is to tell an unquoted `--no-verify` flag apart from the same text
 * appearing inside a quoted `-m` message value.
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = []
  const n = input.length
  let current = ''
  let hasCurrent = false
  let i = 0

  const flush = (): void => {
    if (hasCurrent) {
      tokens.push(current)
      current = ''
      hasCurrent = false
    }
  }

  while (i < n) {
    const ch = input.charAt(i)

    if (ch === "'" || ch === '"') {
      const span =
        ch === "'" ? readSingleQuoted(input, i) : readDoubleQuoted(input, i)
      current += span.value
      hasCurrent = true
      i = span.next
      continue
    }

    if (ch === '\\') {
      if (i + 1 < n) {
        current += input.charAt(i + 1)
        hasCurrent = true
        i += 2
      } else {
        i++
      }
      continue
    }

    if (
      ch === '<' &&
      input.charAt(i + 1) === '<' &&
      input.charAt(i + 2) !== '<'
    ) {
      const consumed = skipHeredoc(input, i)
      if (consumed > i) {
        flush()
        i = consumed
        continue
      }
    }

    if (WHITESPACE.includes(ch) || META_CHARS.includes(ch)) {
      flush()
      i++
      continue
    }

    current += ch
    hasCurrent = true
    i++
  }

  flush()
  return tokens
}
