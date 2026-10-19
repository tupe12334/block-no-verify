/** Closing delimiter for each bracketing quote-operator opener. */
const CLOSERS = new Map([
  ['(', ')'],
  ['[', ']'],
  ['{', '}'],
  ['<', '>'],
])

/**
 * A Perl (`q{}`, `qq()`, `qx[]`, `qw//`) or Ruby (`%q()`, `%Q{}`, `%x()`,
 * `%()`) quote operator at the start of the text; the delimiter is the last
 * group that matched. A bare `%` needs a bracket, since `%$h` and `7%-3` are
 * code. Delimiters that read as code after a variable (`$q = 1`) are not
 * taken.
 */
const QUOTE_OPERATOR =
  /^(?:(?:qq|qx|qw|q)\s*([^\w\s=,;)\]}>])|%[qQxwWi]([^\w\s=,;)\]}>])|%([([{<]))/

/**
 * Reads a quoted body that starts after its opening delimiter. Bracket
 * delimiters nest; backslash escapes are kept as the escaped character.
 * @param code - The code.
 * @param start - Index just past the opening delimiter.
 * @param open - The opening delimiter.
 * @returns The body, the index past the closing delimiter, and whether the
 * closing delimiter was found.
 */
function readQuoted(
  code: string,
  start: number,
  open: string
): { body: string; end: number; closed: boolean } {
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
    if (char === close && depth === 0) return { body, end: i + 1, closed: true }
    if (char === close) depth--
    else if (char === open && close !== open) depth++
    body += char
  }
  return { body, end: i, closed: false }
}

/**
 * Reads a closed quote operator at an index. A word or sigil before it
 * (`$q`, `$a%$b`) makes it code, and so does a missing closing delimiter.
 * @param code - The code.
 * @param i - The index to read at.
 * @returns The body and the index past it, or null when none is there.
 */
function readOperator(
  code: string,
  i: number
): { body: string; end: number } | null {
  const operator = QUOTE_OPERATOR.exec(code.slice(i))
  if (operator === null || (i > 0 && /[\w$@%&]/.test(code.charAt(i - 1)))) {
    return null
  }
  // Exactly one group matches; the others are undefined and join as ''.
  const open = operator.slice(1).join('')
  const quoted = readQuoted(code, i + operator[0].length, open)
  return quoted.closed ? quoted : null
}

/**
 * Returns the string literals in a piece of interpreter code. A git command
 * run from code sits in one (`os.system('git commit …')`, Perl
 * `system qq{…}`, Ruby `%x(…)`), so each literal is a candidate command.
 * @param code - The interpreter code.
 * @param quoteOperators - Whether Perl/Ruby quote operators are read; other
 * languages use `%` and `q` as code (`a%-1`, `q-1`).
 * @returns The literals' contents, in order.
 */
export function stringLiterals(
  code: string,
  quoteOperators: boolean
): string[] {
  const literals: string[] = []
  let i = 0
  while (i < code.length) {
    const char = code.charAt(i)
    const quoted = quoteOperators ? readOperator(code, i) : null
    if (quoted !== null) {
      // The body may itself hold plain literals (`qq{system "…"}`).
      literals.push(quoted.body, ...stringLiterals(quoted.body, false))
      i = quoted.end
    } else if (char === '"' || char === "'" || char === '`') {
      const plain = readQuoted(code, i + 1, char)
      literals.push(plain.body)
      i = plain.end
    } else {
      i++
    }
  }
  return literals
}
