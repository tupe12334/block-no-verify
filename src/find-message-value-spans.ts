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
 * value, or null. The value is the whole word after a message option
 * (`--body "…"`), or the part after `=` in `--body="…"`. Either way it must
 * be one quoted part, and it must hold no command substitution, nor any
 * other expansion in double quotes.
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
  if (word.quotes !== 1 || !/["']/.test(input.charAt(word.end - 1))) {
    return null
  }
  const prefix = input.slice(start, word.quoteStart)
  const isValueWord =
    prefix === '' && previous !== undefined && MESSAGE_OPTIONS.has(previous)
  const isEqualsForm =
    prefix.startsWith('--') &&
    prefix.endsWith('=') &&
    MESSAGE_OPTIONS.has(prefix.slice(0, -1))
  if (!isValueWord && !isEqualsForm) return null
  const span = { start: word.quoteStart + 1, end: word.end - 1 }
  // A command substitution runs even inside a double-quoted message.
  const text = input.slice(span.start, span.end)
  if (text.includes('$(') || text.includes('`')) return null
  // Any other expansion in double quotes is live too.
  if (input.charAt(word.quoteStart) === '"' && text.includes('$')) return null
  return span
}

/**
 * Finds the quoted message values that `maskMessageValues` treats as data:
 * a commit or tag message, or a PR, issue or release title or body, in a
 * statement whose program is `git` or `gh`. The shell never runs that text,
 * so a `git` word in it is prose, not a command.
 *
 * Only a value that is one quoted part is found (`--body "…"`, `-m '…'`,
 * `--body="…"`). No value is found when masking is not safe (see
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
