/**
 * Characters that end the current shell statement and start a new one.
 * Mirrors the separator set used for sub-command scoping in
 * `find-git-subcommand.ts`.
 */
const STATEMENT_SEPARATORS = ['\n', ';', '&', '|']

/**
 * Splits a raw command string into top-level shell statements, so a token
 * belonging to one statement (e.g. `echo -n`) is never scanned as if it were
 * part of a different statement earlier on the same line (e.g. `git commit`).
 * Splitting is a plain character scan, not shell-quote-aware, so a separator
 * character inside a quoted value is still treated as a boundary — the same
 * trade-off already made by the sub-command scanner this mirrors.
 * @param input - The full command string.
 * @returns The statements, in order, with separators removed.
 */
export function splitStatements(input: string): string[] {
  const statements: string[] = []
  let start = 0
  for (;;) {
    let end = input.length
    for (const separator of STATEMENT_SEPARATORS) {
      const idx = input.indexOf(separator, start)
      if (idx !== -1 && idx < end) end = idx
    }
    statements.push(input.slice(start, end))
    if (end >= input.length) return statements
    start = end + 1
  }
}
