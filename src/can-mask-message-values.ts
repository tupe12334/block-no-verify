/**
 * Returns true when the input has a newline outside quotes. `shell-quote`
 * reads such a newline as plain whitespace, so the next line would inherit
 * the previous line's program word. A backslash-newline is a line
 * continuation, not a separator.
 * @param input - The raw command string.
 * @returns True when an unquoted newline is present.
 */
function hasUnquotedNewline(input: string): boolean {
  let quote: '"' | "'" | null = null
  for (let i = 0; i < input.length; i++) {
    const char = input.charAt(i)
    if (quote === "'") {
      if (char === "'") quote = null
    } else if (char === '\\') {
      i++
    } else if (quote === '"') {
      if (char === '"') quote = null
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '\n') {
      return true
    }
  }
  return false
}

/**
 * Returns true when message values in the input can be masked safely, that
 * is, when the tokenizer's statement boundaries match the shell's. Masking is
 * skipped, and the input is scanned whole as before, when it contains:
 * - an unquoted newline, which `shell-quote` does not treat as a separator;
 * - a heredoc (`<<`), whose body the tokenizer reads as shell words;
 * - a `#`, since a comment hides the rest of the input from the tokenizer;
 * - `alias`, since a git or gh alias can run a message value in a shell
 *   (`git -c alias.x='!sh -c' x -m "…"`);
 * - ANSI-C or locale quoting (`$'…'`, `$"…"`), where a backslash can escape
 *   the quote and mislead the newline tracker below.
 * @param input - The raw command string.
 * @returns True when masking cannot hide a statement from the scan.
 */
export function canMaskMessageValues(input: string): boolean {
  return (
    !input.includes('<<') &&
    !input.includes('#') &&
    !input.includes("$'") &&
    !input.includes('$"') &&
    !/alias/i.test(input) &&
    !hasUnquotedNewline(input)
  )
}
