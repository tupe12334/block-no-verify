/** Matches a `NAME=` assignment prefix at a word start. */
const ASSIGNMENT_NAME = /(?:^|[\s;&|(])[A-Za-z_][A-Za-z0-9_]*=/g

/** Characters that end an unquoted shell word. */
const WORD_END = /[\s;&|()<>]/

/** Characters a backslash escapes inside double quotes. */
const DOUBLE_QUOTE_ESCAPES = '$`"\\\n'

/** A bare value that `expandSimpleVariableRefs` already reads in full. */
const PLAIN_VALUE = /^[A-Za-z0-9_./:-]*$/

/**
 * A part read from the text: the index after it, and what bash assigns, or
 * `null` when it cannot be read.
 */
interface ReadPart {
  end: number
  value: string | null
}

/**
 * Reads the double-quoted part whose opening quote is at `start`. Only
 * `\$`, `` \` ``, `\"`, `\\` and a backslash-newline are escapes; other
 * backslashes stay.
 * @param text - The command text.
 * @param start - Index of the opening double quote.
 * @returns The part. Its value is `null` when it is unterminated or holds
 *   an expansion (`$`, a backtick).
 */
function readDoubleQuoted(text: string, start: number): ReadPart {
  let value = ''
  let i = start + 1
  while (i < text.length) {
    const char = text.charAt(i)
    if (char === '"') return { end: i + 1, value }
    if (char === '$' || char === '`') return { end: i, value: null }
    if (char === '\\' && i + 1 < text.length) {
      const next = text.charAt(i + 1)
      if (!DOUBLE_QUOTE_ESCAPES.includes(next)) value += char
      if (next !== '\n') value += next
      i += 2
    } else {
      value += char
      i += 1
    }
  }
  return { end: i, value: null }
}

/**
 * Reads the shell word that starts at `start` as bash assigns it: unquoted
 * text, backslash escapes, and single- or double-quoted parts in any mix.
 * @param text - The command text.
 * @param start - Index right after the `=`.
 * @returns The word. Its value is `null` when a part of it cannot be read
 *   (an expansion, an unterminated quote, a backslash-newline).
 */
function readValueWord(text: string, start: number): ReadPart {
  let value = ''
  let i = start
  while (i < text.length && !WORD_END.test(text.charAt(i))) {
    const char = text.charAt(i)
    let part: ReadPart
    if (char === '$' || char === '`') {
      part = { end: i, value: null }
    } else if (char === '\\') {
      const next = text.charAt(i + 1)
      const escaped = next !== '' && next !== '\n'
      part = { end: i + 2, value: escaped ? next : null }
    } else if (char === "'") {
      const close = text.indexOf("'", i + 1)
      part =
        close === -1
          ? { end: text.length, value: null }
          : { end: close + 1, value: text.slice(i + 1, close) }
    } else if (char === '"') {
      part = readDoubleQuoted(text, i)
    } else {
      part = { end: i + 1, value: char }
    }
    if (part.value === null) return part
    value += part.value
    i = part.end
  }
  return { end: i, value }
}

/**
 * Rewrites each `NAME=value` assignment that `expandSimpleVariableRefs`
 * cannot read in full (a value with backslash escapes, mixed or empty quoted
 * parts, or characters such as `=`) to a single-quoted assignment of the
 * value bash assigns, so `NAME=a\-b` and `NAME=a''-b` become `NAME='a-b'`.
 * A value that cannot be read stays as written. The result is checked as an
 * extra variant, so it can only add blocks. Each value is read once, so the
 * pass is linear.
 * @param input - The raw command string.
 * @returns The command string with such assignments rewritten.
 */
export function resolveAssignmentEscapes(input: string): string {
  let result = ''
  let copied = 0
  ASSIGNMENT_NAME.lastIndex = 0
  let match = ASSIGNMENT_NAME.exec(input)
  while (match !== null) {
    const start = match.index + match[0].length
    const word = readValueWord(input, start)
    if (word.value !== null && !word.value.includes("'")) {
      const written = input.slice(start, word.end)
      const rewritten = `'${word.value}'`
      const readable =
        PLAIN_VALUE.test(written) ||
        written === rewritten ||
        written === `"${word.value}"`
      if (!readable) {
        result += input.slice(copied, start) + rewritten
        copied = word.end
      }
    }
    ASSIGNMENT_NAME.lastIndex = Math.max(ASSIGNMENT_NAME.lastIndex, word.end)
    match = ASSIGNMENT_NAME.exec(input)
  }
  return result + input.slice(copied)
}
