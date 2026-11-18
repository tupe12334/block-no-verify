import { canMaskMessageValues } from './can-mask-message-values.js'
import { ENV_ASSIGNMENT } from './env-assignment.js'
import { isMessageProgram } from './is-message-program.js'
import { MESSAGE_OPTIONS } from './message-options.js'
import { tokenizeCommand } from './tokenize-command.js'

/** Placeholder that keeps a masked value's position in the rebuilt string. */
const MASK = '_'

/**
 * Returns true when a value still runs code inside the outer command: a
 * command substitution (`$(…)` or backticks) is executed by the shell even
 * inside a double-quoted message, so it must stay visible to the scan.
 * @param value - A message option's value.
 * @returns True when the value contains a command substitution.
 */
function hasCommandSubstitution(value: string): boolean {
  return value.includes('$(') || value.includes('`')
}

/**
 * Masks one token when it is a message value: either the token after a
 * message option, or the value part of a `--message=…` style token.
 * @param token - The current string token.
 * @param previous - The string token before it, if any.
 * @returns The token, or its masked form.
 */
function maskToken(token: string, previous: string | undefined): string {
  if (hasCommandSubstitution(token)) return token
  if (previous !== undefined && MESSAGE_OPTIONS.has(previous)) return MASK
  const eq = token.indexOf('=')
  if (
    token.startsWith('--') &&
    eq > 0 &&
    MESSAGE_OPTIONS.has(token.slice(0, eq))
  ) {
    return `${token.slice(0, eq + 1)}${MASK}`
  }
  return token
}

/**
 * Escapes each `\`, `$` and backtick in a word that holds a `$`, and leaves
 * the rest of the word as it is. The tokenizer already read that `$` as text
 * (single-quoted or escaped text, or a `$(…)` in double quotes). Joined bare,
 * the next parse of the rebuilt string would read it again as an expansion,
 * and `${x:-$(…)}` would throw "Bad substitution" on text the shell never
 * expands. No quote is added, so a `NAME=` or `core.hooksPath=` prefix stays
 * at the start of the word, where the regex checks look for it.
 * @param word - A token string, or its masked form.
 * @returns The word, with `\`, `$` and backtick escaped when it holds a `$`.
 */
function keepLiteral(word: string): string {
  return word.includes('$') ? word.replace(/[\\$`]/g, '\\$&') : word
}

/**
 * Rebuilds the input from its `shell-quote` tokens with message values
 * masked, so the regex-based hooks-path and manager env checks no longer
 * match override-looking text inside a commit message or PR body (#93).
 *
 * Only values of known message options are masked, and only in statements
 * whose program is `git` or `gh`. Every other quoted string, such as a
 * `bash -c "…"` payload or text piped into `sh`, stays visible, because the
 * shell may run it. A message that contains a command substitution is not
 * masked either. A masked value keeps its position. A word with a literal `$`
 * is escaped (see `keepLiteral`). When the tokenizer's statements
 * might not match the shell's (see `canMaskMessageValues`), the input is
 * returned unchanged.
 * @param input - The raw command string.
 * @returns The input with message values masked.
 */
export function maskMessageValues(input: string): string {
  if (!canMaskMessageValues(input)) return input
  let tokens: ReturnType<typeof tokenizeCommand>
  try {
    tokens = tokenizeCommand(input)
  } catch {
    // `shell-quote` throws on input such as an unterminated `${`. Scan the raw
    // input instead: a crash here would exit non-blocking and let it run.
    return input
  }
  const words: string[] = []
  let previous: string | undefined
  let program: string | undefined
  for (const token of tokens) {
    if (typeof token === 'string') {
      const isProgramWord = program === undefined && !ENV_ASSIGNMENT.test(token)
      if (isProgramWord) program = token
      const masks =
        !isProgramWord && program !== undefined && isMessageProgram(program)
      words.push(keepLiteral(masks ? maskToken(token, previous) : token))
      previous = token
    } else if ('op' in token) {
      words.push(token.op === 'glob' ? token.pattern : token.op)
      previous = undefined
      program = undefined
    }
  }
  return words.join(' ')
}
