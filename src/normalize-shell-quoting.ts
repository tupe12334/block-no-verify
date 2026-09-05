/**
 * Rewrites three shell quoting forms that `shell-quote` tokenizes differently
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
 * - `` `…` `` (backtick command substitution) — `shell-quote` does not know
 *   the form and leaves the backticks glued to the adjacent words, hiding both
 *   the `git` token and the flag. It is rewritten to the equivalent `$(…)`,
 *   which `shell-quote` already turns into `(`/`)` operator tokens. Rewritten
 *   outside single quotes only, matching where bash expands it. A
 *   backslash-escaped backtick is literal and is left alone.
 * @param input - The raw command string.
 * @returns The command string with both constructs rewritten to the form
 *   `shell-quote` already tokenizes like bash.
 */
export function normalizeShellQuoting(input: string): string {
  let result = ''
  let state: 'outside' | 'single' | 'double' = 'outside'
  let inBacktick = false

  for (let index = 0; index < input.length; index++) {
    const char = input.charAt(index)
    const next = input.charAt(index + 1)

    if (state === 'single') {
      if (char === "'") state = 'outside'
      result += char
      continue
    }

    // Outside a single-quoted span: bash drops a backslash-newline pair
    // unconditionally, whether or not it is inside double quotes.
    if (char === '\\' && next === '\n') {
      index += 1
      continue
    }

    // A backslash-escaped backtick is a literal backtick, not a substitution
    // delimiter, so it must not flip the backtick state.
    if (char === '\\' && next === '`') {
      result += char + next
      index += 1
      continue
    }

    // Backtick command substitution: `shell-quote` has no notion of it and
    // leaves the backticks glued to the adjacent words, so `` `git `` never
    // matches the git token and ``--no-verify` `` never matches the flag —
    // `echo \`git commit --no-verify\`` ran unguarded. Rewriting to the
    // equivalent `$(…)` yields the `(`/`)` operator tokens the statement
    // splitter already understands, which is why `$(…)` was caught and
    // backticks were not. Applies outside single quotes only: bash expands
    // backticks inside double quotes, but treats them literally in `'…'`.
    if (char === '`') {
      result += inBacktick ? ')' : '$('
      inBacktick = !inBacktick
      continue
    }

    if (state === 'double') {
      // An escaped character inside double quotes must be copied as a pair
      // so the escaped quote/backslash is not mistaken for a delimiter.
      if (char === '\\' && index + 1 < input.length) {
        result += char + next
        index += 1
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
