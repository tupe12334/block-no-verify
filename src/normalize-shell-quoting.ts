/**
 * Rewrites two shell quoting forms that `shell-quote` tokenizes differently
 * from bash, before the string ever reaches `parse()`:
 *
 * - `$'...'` / `$"..."` (ANSI-C / locale-specific quoting) — bash recognizes
 *   these only when the `$` starts a word (i.e. we are not already inside a
 *   quoted span), so the `$` is dropped and the following quote char is left
 *   to `shell-quote`'s normal single/double-quote handling. This does not
 *   expand ANSI-C escape sequences (`\n`, `\t`, …), but flag matching never
 *   needs their expanded form.
 * - a backslash immediately followed by a newline (line continuation) —
 *   bash removes both characters outright, including inside a double-quoted
 *   string. `shell-quote` only does this outside quotes, so the pair is
 *   stripped here whenever we are outside a single-quoted span (where
 *   backslash-newline stays literal and must not be touched).
 * @param input - The raw command string.
 * @returns The command string with both constructs rewritten to the form
 *   `shell-quote` already tokenizes like bash.
 */
export function normalizeShellQuoting(input: string): string {
  let result = ''
  let state: 'outside' | 'single' | 'double' = 'outside'

  for (let i = 0; i < input.length; i++) {
    const char = input.charAt(i)
    const next = input.charAt(i + 1)

    if (state === 'single') {
      if (char === "'") state = 'outside'
      result += char
      continue
    }

    // Outside a single-quoted span: bash drops a backslash-newline pair
    // unconditionally, whether or not it is inside double quotes.
    if (char === '\\' && next === '\n') {
      i += 1
      continue
    }

    if (state === 'double') {
      // An escaped character inside double quotes must be copied as a pair
      // so the escaped quote/backslash is not mistaken for a delimiter.
      if (char === '\\' && i + 1 < input.length) {
        result += char + next
        i += 1
        continue
      }
      if (char === '"') state = 'outside'
      result += char
      continue
    }

    // Outside any quotes: ANSI-C/locale quoting only starts a word here.
    if (char === '$' && (next === "'" || next === '"')) {
      continue
    }

    if (char === "'") {
      state = 'single'
      result += char
      continue
    }
    if (char === '"') {
      state = 'double'
      result += char
      continue
    }

    result += char
  }

  return result
}
