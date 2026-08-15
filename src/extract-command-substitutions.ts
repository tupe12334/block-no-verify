/**
 * Finds the index of the `)` that closes the `(` at `openIndex`, honoring
 * nesting depth so an inner `$(...)` does not close the outer span early.
 * @param text - The string to scan.
 * @param openIndex - Index of the opening `(`.
 * @returns The index of the matching `)`, or -1 when unterminated.
 */
function findMatchingParen(text: string, openIndex: number): number {
  let depth = 0
  for (let i = openIndex; i < text.length; i++) {
    const char = text.charAt(i)
    if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

/**
 * Extracts the inner command text of every `$( … )` and `` ` … ` `` command
 * substitution found anywhere in `token`.
 *
 * `shell-quote` has no notion of command substitution nested inside a
 * quoted word: it returns the whole quoted span (backticks or `$(...)`
 * included) as a single opaque string token instead of descending into it,
 * so neither the `git` token nor a bypass flag inside it is ever seen by the
 * normal statement scan. This walks the raw token text directly to recover
 * the substitution's inner command so it can be scanned as its own
 * statement (see `extract-nested-statements.ts`).
 * @param token - A single string token from `shell-quote`'s parse output.
 * @returns The inner text of each substitution found, in appearance order.
 */
export function extractCommandSubstitutions(token: string): string[] {
  const inner: string[] = []
  let i = 0
  while (i < token.length) {
    const char = token.charAt(i)
    if (char === '$' && token.charAt(i + 1) === '(') {
      const close = findMatchingParen(token, i + 1)
      if (close === -1) break
      inner.push(token.slice(i + 2, close))
      i = close + 1
      continue
    }
    if (char === '`') {
      const close = token.indexOf('`', i + 1)
      if (close === -1) break
      inner.push(token.slice(i + 1, close))
      i = close + 1
      continue
    }
    i += 1
  }
  return inner
}
