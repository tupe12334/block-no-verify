/**
 * Matches a `${NAME<op>word}` parameter expansion that can expand to its
 * word: default (`:-`, `-`), assign (`:=`, `=`) and alternate (`:+`, `+`).
 * The word holds no braces, so nested forms resolve from the inside out.
 */
const PARAMETER_WORD = /\$\{[A-Za-z_][A-Za-z0-9_]*:?[-=+]([^{}]*)\}/g

/** Non-empty plain text: no space, quote, `$`, backtick or operator. */
const PLAIN_WORD = /^[\w./:@%+,=-]+$/

/**
 * Marks each index of `text` that bash reads as literal text: a character in
 * single quotes, or one escaped by a backslash. bash never expands a `${…}`
 * there, so such text must keep its form.
 * @param text - The string to scan.
 * @returns The indexes of the literal characters.
 */
function literalPositions(text: string): Set<number> {
  const literal = new Set<number>()
  let state: 'outside' | 'single' | 'double' = 'outside'
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i)
    if (state === 'single') {
      literal.add(i)
      if (char === "'") state = 'outside'
      continue
    }
    if (char === '\\' && i + 1 < text.length) {
      literal.add(i)
      literal.add(i + 1)
      i += 1
      continue
    }
    if (state === 'double') {
      if (char === '"') state = 'outside'
    } else if (char === "'") {
      state = 'single'
      literal.add(i)
    } else if (char === '"') {
      state = 'double'
    }
  }
  return literal
}

/**
 * Replaces each `${NAME:-word}`-style expansion with its word. bash uses that
 * word when the variable is unset (or, for `+`, set), so the word can be the
 * program name, the sub-command or a flag. The result is one more candidate
 * text to check: the variable may hold another value, so the original text
 * must be checked too.
 *
 * Two kinds of expansion keep their text. One in single quotes or escaped is
 * never expanded by bash. One whose word is not plain text (a space, quote,
 * `$`, backtick or shell operator) is left as it is, so `shell-quote` throws
 * `Bad substitution` on it and the hook fails closed ("could not parse").
 * @param text - The string to scan and replace within.
 * @returns `text` with every such expansion replaced by its word.
 */
export function expandParameterWords(text: string): string {
  let result = text
  let previous = ''
  while (result !== previous) {
    previous = result
    const literal = literalPositions(result)
    result = result.replace(
      PARAMETER_WORD,
      (match: string, word: string, offset: number) =>
        literal.has(offset) || !PLAIN_WORD.test(word) ? match : word
    )
  }
  return result
}
