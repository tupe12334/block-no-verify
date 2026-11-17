/** Characters the tokenizer reads as operators. Each ends the statement. */
const OPERATORS = ';&|()<>'

/** Characters that make the tokenizer read an unquoted word as a glob. */
const GLOB = '*?'

/** One shell word or operator, as {@link readShellWord} reads it. */
interface ShellWord {
  /** Index just past the word. */
  end: number
  /** The word with its quotes and escapes removed. */
  value: string
  /** Index of the opening quote of the word's last quoted part, or -1. */
  quoteStart: number
  /** Index of the closing quote of the word's last quoted part, or -1. */
  quoteEnd: number
  /** Number of quoted parts in the word. */
  quotes: number
  /**
   * True for an operator or a glob. The tokenizer reads both as operator
   * tokens, which end the statement.
   */
  operator: boolean
}

/**
 * Reads the shell word or operator that starts at `start`, as `shell-quote`
 * splits the text. `start` must not be at whitespace.
 * @param input - The command text.
 * @param start - Index of the word's first character.
 * @returns The word, or null when a quote is not closed.
 */
export function readShellWord(input: string, start: number): ShellWord | null {
  if (OPERATORS.includes(input.charAt(start))) {
    return {
      end: start + 1,
      value: '',
      quoteStart: -1,
      quoteEnd: -1,
      quotes: 0,
      operator: true,
    }
  }
  let value = ''
  let quoteStart = -1
  let quoteEnd = -1
  let quotes = 0
  let glob = false
  let i = start
  while (i < input.length) {
    const char = input.charAt(i)
    if (/\s/.test(char) || OPERATORS.includes(char)) break
    if (char === '"' || char === "'") {
      quotes++
      quoteStart = i
      i++
      while (i < input.length && input.charAt(i) !== char) {
        if (char === '"' && input.charAt(i) === '\\') i++
        value += input.charAt(i)
        i++
      }
      if (i >= input.length) return null
      quoteEnd = i
      i++
      continue
    }
    if (char === '\\') i++
    if (GLOB.includes(input.charAt(i))) glob = true
    value += input.charAt(i)
    i++
  }
  return { end: i, value, quoteStart, quoteEnd, quotes, operator: glob }
}
