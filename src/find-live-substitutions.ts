/**
 * Returns the index of the `)` that closes the `(` at `open`, skipping quoted
 * text and escaped characters, so a `)` inside `'…'` or `"…"` does not end the
 * substitution early.
 * @param text - The command string.
 * @param open - Index of the opening `(`.
 * @returns The index of the closing `)`, or -1 when unterminated.
 */
function findClosingParen(text: string, open: number): number {
  let depth = 0
  let quote: "'" | '"' | null = null
  for (let i = open; i < text.length; i++) {
    const char = text.charAt(i)
    if (quote === "'") {
      if (char === "'") quote = null
      continue
    }
    if (char === '\\') {
      i += 1
      continue
    }
    if (char === "'" && quote === null) {
      quote = "'"
    } else if (char === '"') {
      quote = quote === '"' ? null : '"'
    } else if (char === '(') {
      depth += 1
    } else if (char === ')') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

/**
 * Returns the index of the backtick that closes the span opened before
 * `start`, skipping escaped characters.
 * @param text - The command string.
 * @param start - Index just after the opening backtick.
 * @returns The index of the closing backtick, or -1 when unterminated.
 */
function findClosingBacktick(text: string, start: number): number {
  for (let i = start; i < text.length; i++) {
    const char = text.charAt(i)
    if (char === '\\') i += 1
    else if (char === '`') return i
  }
  return -1
}

/**
 * Reverses the escapes that bash applies to the text of a backtick span
 * before it runs it: `\`` becomes a backtick, and so do `\\` and `\$`.
 * @param text - The raw text between two backticks.
 * @returns The command text bash runs.
 */
function unescapeBacktick(text: string): string {
  return text.replace(/\\([`\\$])/g, '$1')
}

/**
 * Returns the inner text of every command substitution that bash runs in a
 * command string: `$( … )`, process substitutions `<( … )` and `>( … )`, and
 * backtick spans that are not inside single quotes or escaped. Substitutions nested in another one are returned too, at
 * every depth. The text is the same for `echo \`git …\`` as for `$(git …)`,
 * so a bypass in either form can be checked as its own command.
 *
 * `shell-quote` splits a backtick span into several words, so the statement
 * scan cannot see the command inside it; this scan works on the raw text.
 * @param text - The command string, after comments and heredoc bodies are
 *   removed.
 * @returns The substitution texts, outer ones before the spans they contain.
 */
export function findLiveSubstitutions(text: string): string[] {
  const found: string[] = []
  let quote: "'" | '"' | null = null
  let i = 0
  while (i < text.length) {
    const char = text.charAt(i)
    if (quote === "'") {
      if (char === "'") quote = null
      i += 1
      continue
    }
    if (char === '\\') {
      i += 2
      continue
    }
    if (char === "'" && quote === null) {
      quote = "'"
    } else if (char === '"') {
      quote = quote === '"' ? null : '"'
    } else if (
      (char === '$' || char === '<' || char === '>') &&
      text.charAt(i + 1) === '('
    ) {
      const close = findClosingParen(text, i + 1)
      if (close === -1) break
      const inner = text.slice(i + 2, close)
      found.push(inner, ...findLiveSubstitutions(inner))
      i = close
    } else if (char === '`') {
      const close = findClosingBacktick(text, i + 1)
      if (close === -1) break
      const inner = unescapeBacktick(text.slice(i + 1, close))
      found.push(inner, ...findLiveSubstitutions(inner))
      i = close
    }
    i += 1
  }
  return found
}
