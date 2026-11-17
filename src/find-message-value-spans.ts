import { canMaskMessageValues } from './can-mask-message-values.js'
import { ENV_ASSIGNMENT } from './env-assignment.js'
import { isMessageProgram } from './is-message-program.js'
import { MESSAGE_OPTIONS } from './message-options.js'
import { readShellWord } from './read-shell-word.js'

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
 * @param previous - The word before it in the statement, if any.
 * @returns The span inside the quotes, or null.
 */
function valueSpan(
  input: string,
  start: number,
  word: NonNullable<ReturnType<typeof readShellWord>>,
  previous: string | undefined
): MessageValueSpan | null {
  const isOneQuotedPart =
    word.quotes === 1 &&
    word.quoteStart === start &&
    word.quoteEnd === word.end - 1
  if (!isOneQuotedPart) return null
  if (previous === undefined || !MESSAGE_OPTIONS.has(previous)) return null
  const span = { start: start + 1, end: word.end - 1 }
  // A `$` or backtick may expand, so such a value is not masked.
  const text = input.slice(span.start, span.end)
  if (text.includes('$') || text.includes('`')) return null
  return span
}

/**
 * Finds the quoted message values that `maskMessageValues` treats as data:
 * a commit or tag message, or a PR, issue or release title or body, in a
 * statement whose program is `git` or `gh`. The shell never runs that text,
 * so a `git` word in it is prose, not a command.
 *
 * Only a value whose whole word is one quoted part is found (`--body "…"`,
 * `-m '…'`). No value is found when masking is not safe (see
 * `canMaskMessageValues`). A value that is not found is checked as command
 * text, as before.
 * @param input - The command text.
 * @returns The spans inside the quotes, in text order.
 */
export function findMessageValueSpans(input: string): MessageValueSpan[] {
  if (!canMaskMessageValues(input)) return []
  const spans: MessageValueSpan[] = []
  let program: string | undefined
  let previous: string | undefined
  let i = 0
  while (i < input.length) {
    if (/\s/.test(input.charAt(i))) {
      i++
      continue
    }
    const word = readShellWord(input, i)
    if (word === null) return spans
    if (word.operator) {
      program = undefined
      previous = undefined
    } else {
      if (program === undefined && !ENV_ASSIGNMENT.test(word.value)) {
        program = word.value
      } else if (program !== undefined && isMessageProgram(program)) {
        const span = valueSpan(input, i, word, previous)
        if (span !== null) spans.push(span)
      }
      previous = word.value
    }
    i = word.end
  }
  return spans
}
