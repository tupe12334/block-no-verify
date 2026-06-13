const DELIMITER_WORD = /[A-Za-z0-9_]/

/**
 * Skips an unquoted here-document (`<<EOF ... EOF` or `<<-EOF`) starting at the
 * first `<`. Returns the index just past the terminator line, or the original
 * start index when the text does not look like a here-document we understand.
 * The body is dropped by callers so a message piped through a heredoc is never
 * scanned as argv flags.
 */
export function skipHeredoc(input: string, start: number): number {
  const n = input.length
  let k = start + 2
  if (input.charAt(k) === '-') k++
  while (k < n && (input.charAt(k) === ' ' || input.charAt(k) === '\t')) k++

  let delimiter = ''
  const quote = input.charAt(k)
  if (quote === "'" || quote === '"') {
    k++
    while (k < n && input.charAt(k) !== quote) {
      delimiter += input.charAt(k)
      k++
    }
    if (k < n) k++
  } else {
    while (k < n && DELIMITER_WORD.test(input.charAt(k))) {
      delimiter += input.charAt(k)
      k++
    }
  }
  if (delimiter === '') return start

  const firstNewline = input.indexOf('\n', k)
  if (firstNewline === -1) return n

  let lineStart = firstNewline + 1
  while (lineStart <= n) {
    let lineEnd = input.indexOf('\n', lineStart)
    if (lineEnd === -1) lineEnd = n
    if (input.slice(lineStart, lineEnd).trim() === delimiter) {
      return lineEnd === n ? n : lineEnd + 1
    }
    if (lineEnd === n) return n
    lineStart = lineEnd + 1
  }
  return n
}
