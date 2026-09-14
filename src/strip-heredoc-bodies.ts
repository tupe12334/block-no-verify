const HEREDOC_START = /<<-?\s*(['"])?(\w+)\1?/

/**
 * Removes heredoc body lines from a command string before it reaches
 * `shell-quote`. A heredoc body is free-form text terminated by a line that
 * matches the delimiter exactly (ignoring leading tabs for `<<-`); it is not
 * shell syntax, so leaving it in place lets an unrelated flag inside the body
 * (e.g. a `grep -n` example) be mistaken for part of the statement that
 * opened the heredoc. Quoted (`<<'EOF'`) and unquoted delimiters behave the
 * same for this purpose, since neither affects where the body ends.
 * @param input - The raw command string.
 * @returns The command string with every heredoc body's lines removed,
 *   leaving the opening `<<DELIM` and the closing delimiter line intact.
 */
export function stripHeredocBodies(input: string): string {
  const lines = input.split('\n')
  const result: string[] = []
  let delimiter: string | null = null
  let stripTabs = false

  for (const line of lines) {
    if (delimiter !== null) {
      const candidate = stripTabs ? line.replace(/^\t+/, '') : line
      if (candidate === delimiter) {
        delimiter = null
        result.push(line)
      }
      continue
    }

    const match = HEREDOC_START.exec(line)
    if (match !== null) {
      delimiter = match[2]
      stripTabs = line.startsWith('<<-', match.index)
    }
    result.push(line)
  }

  return result.join('\n')
}
