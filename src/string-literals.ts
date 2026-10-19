/** Closing delimiter for each bracketing quote-operator opener. */
const CLOSERS = new Map([
  ['(', ')'],
  ['[', ']'],
  ['{', '}'],
  ['<', '>'],
])

/**
 * A Perl (`q{}`, `qq()`, `qx[]`, `qw//`) or Ruby (`%q()`, `%Q{}`, `%x()`,
 * `%()`) quote operator at the start of the text; group 1 is the delimiter.
 * Delimiters that read as code after a variable (`$q = 1`, `%h)`) are not
 * taken.
 */
const QUOTE_OPERATOR = /^(?:\b(?:qq|qx|qw|q)\s*|%[qQxwWi]?)([^\w\s=,;)\]}>])/

/**
 * Reads a quoted body that starts after its opening delimiter. Bracket
 * delimiters nest; backslash escapes are kept as the escaped character.
 * @param code - The code.
 * @param start - Index just past the opening delimiter.
 * @param open - The opening delimiter.
 * @returns The body and the index past the closing delimiter.
 */
function readQuoted(
  code: string,
  start: number,
  open: string
): { body: string; end: number } {
  const closer = CLOSERS.get(open)
  const close = closer === undefined ? open : closer
  let depth = 0
  let body = ''
  let i = start
  for (; i < code.length; i++) {
    const char = code.charAt(i)
    if (char === '\\') {
      i++
      body += code.charAt(i)
      continue
    }
    if (char === close && depth === 0) return { body, end: i + 1 }
    if (char === close) depth--
    else if (char === open && close !== open) depth++
    body += char
  }
  return { body, end: i }
}

/**
 * Returns the string literals in a piece of interpreter code. A git command
 * run from code sits in one (`os.system('git commit …')`, Perl
 * `system qq{…}`, Ruby `%x(…)`), so each literal is a candidate command.
 * @param code - The interpreter code.
 * @returns The literals' contents, in order.
 */
export function stringLiterals(code: string): string[] {
  const literals: string[] = []
  let i = 0
  while (i < code.length) {
    const char = code.charAt(i)
    const operator = QUOTE_OPERATOR.exec(code.slice(i))
    // `\b` cannot see the character before the slice, so check it here; a
    // sigil before it (`$q`, `@q`) makes it a variable.
    const wordBefore = i > 0 && /[\w$@%&]/.test(code.charAt(i - 1))
    if (operator !== null && !(wordBefore && char === 'q')) {
      const quoted = readQuoted(code, i + operator[0].length, operator[1])
      literals.push(quoted.body)
      i = quoted.end
    } else if (char === '"' || char === "'" || char === '`') {
      const quoted = readQuoted(code, i + 1, char)
      literals.push(quoted.body)
      i = quoted.end
    } else {
      i++
    }
  }
  return literals
}
