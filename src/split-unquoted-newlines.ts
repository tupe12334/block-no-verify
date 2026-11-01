/**
 * Replaces each newline that sits outside every quoted span with `;`. Bash
 * ends a statement at an unquoted newline, but `shell-quote` treats it as
 * whitespace, so `git commit -m x` and `bash -n s.sh` on two lines would
 * otherwise be read as one statement, and the `-n` of `bash` would look like
 * a flag of `git commit`. Newlines inside single or double quotes are data
 * and stay as they are. A backslash escapes the next character, so an escaped
 * quote does not open a span.
 * @param input - The raw command string, with line continuations already
 *   removed.
 * @returns The command string with unquoted newlines turned into `;`.
 */
export function splitUnquotedNewlines(input: string): string {
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

    if (char === '\\' && i + 1 < input.length) {
      result += char + next
      i += 1
      continue
    }

    if (state === 'double') {
      if (char === '"') state = 'outside'
      result += char
      continue
    }

    if (char === "'") {
      state = 'single'
    } else if (char === '"') {
      state = 'double'
    } else if (char === '\n') {
      result += ';'
      continue
    }
    result += char
  }

  return result
}
