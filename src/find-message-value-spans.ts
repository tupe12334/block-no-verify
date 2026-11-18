import { canMaskMessageValues } from './can-mask-message-values.js'
import { ENV_ASSIGNMENT } from './env-assignment.js'
import { readShellWord } from './read-shell-word.js'
import { takesMessageValue } from './takes-message-value.js'

/** Text that runs a command inside another: a substitution or `eval`. */
const NESTED_COMMAND = /`|\$\(|<\(|>\(|\beval\b/

/** The text inside one quoted message value, from `start` to before `end`. */
interface MessageValueSpan {
  start: number
  end: number
}

/**
 * Returns the span inside the quotes of a word that is a whole message
 * value, or null. The value is the word after a message option
 * (`--body "…"`, `-m '…'`). The whole word must be exactly one quoted part,
 * with nothing attached before or after it, and with no `$` or backtick
 * inside. Anything else (`--body="…"`, `'…'"…"`, `'…'$x`, `'…'\ x`) is not
 * a value here, so it stays command text.
 * @param input - The command text.
 * @param start - Index of the word's first character.
 * @param word - The word.
 * @param words - The raw words of the simple command before it.
 * @returns The span inside the quotes, or null.
 */
function valueSpan(
  input: string,
  start: number,
  word: NonNullable<ReturnType<typeof readShellWord>>,
  words: readonly string[]
): MessageValueSpan | null {
  const isOneQuotedPart =
    word.quotes === 1 &&
    word.quoteStart === start &&
    word.quoteEnd === word.end - 1
  if (!isOneQuotedPart) return null
  const option = words.at(-1)
  if (option === undefined || !takesMessageValue(words, option)) return null
  const span = { start: start + 1, end: word.end - 1 }
  // A `$` or backtick may expand, so such a value is not masked.
  const text = input.slice(span.start, span.end)
  if (text.includes('$') || text.includes('`')) return null
  return span
}

/**
 * Finds the quoted message values that are data: the value of an option
 * that takes a message in that `git` or `gh` sub-command (see
 * `takesMessageValue`), such as `git commit -m` or `gh pr create --body`.
 * The program word must be literally `git` or `gh`, with its sub-command
 * words right after it. The shell never runs that text, so a `git` word in
 * it is prose, not a command.
 *
 * The program word is the first word after a `;`, `&`, `|`, `(`, `)` or
 * `{`, after any `NAME=value` words. A redirect before it hides the
 * program, so then nothing in that command is found. Only a value whose
 * whole word is one quoted part is found (`--body "…"`, `-m '…'`). Nothing
 * is found when the text has a backtick, `$(`, `<(`, `>(` or `eval`, or
 * when masking is not safe (see `canMaskMessageValues`). A value that is not
 * found is checked as command text, as before.
 * @param input - The command text.
 * @returns The spans inside the quotes, in text order.
 */
export function findMessageValueSpans(input: string): MessageValueSpan[] {
  if (NESTED_COMMAND.test(input) || !canMaskMessageValues(input)) return []
  const spans: MessageValueSpan[] = []
  // The raw words of the current simple command, program first.
  let words: string[] = []
  let i = 0
  while (i < input.length) {
    if (/\s/.test(input.charAt(i))) {
      i++
      continue
    }
    const word = readShellWord(input, i)
    if (word === null) return spans
    const raw = input.slice(i, word.end)
    if (word.operator && /[<>]/.test(raw)) {
      // A redirect before the program word hides which program runs.
      words.push(raw)
    } else if (word.operator || raw === '{') {
      words = []
    } else if (words.length > 0 || !ENV_ASSIGNMENT.test(raw)) {
      const span = valueSpan(input, i, word, words)
      if (span !== null) spans.push(span)
      words.push(raw)
    }
    i = word.end
  }
  return spans
}
