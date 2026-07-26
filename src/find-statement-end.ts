/** Statement-separator characters that end the current shell command. */
const STATEMENT_SEPARATORS = ['\n', ';', '&', '|']

/**
 * Finds the index of the next top-level statement separator (`;`, `&`, `|`,
 * or newline) at or after `start`, or `input.length` when the rest of the
 * input is a single statement. `&` and `|` alone are enough to also catch
 * `&&` and `||`, since only the first character's position is needed to
 * split there.
 * @param input - The full command string.
 * @param start - Offset to search from.
 * @returns The index of the next separator, or `input.length`.
 */
export function findStatementEnd(input: string, start: number): number {
  let end = input.length
  for (const separator of STATEMENT_SEPARATORS) {
    const idx = input.indexOf(separator, start)
    if (idx !== -1 && idx < end) end = idx
  }
  return end
}
