import { canMaskMessageValues } from './can-mask-message-values.js'
import { tokenizeCommand } from './tokenize-command.js'

/** Placeholder that keeps a masked value's position in the rebuilt string. */
const MASK = '_'

/**
 * Options whose value is prose for a human reader: a commit or tag message,
 * or a PR/issue/release title or body (`gh … --title/--body/--notes`). Their
 * value is never executed, so override-looking text in it is not a bypass.
 * Other short forms (`-b`, `-t`, `-n`) are left out on purpose: other
 * programs (`sudo -n`, `ssh -t`) give them different meanings.
 */
const MESSAGE_OPTIONS = new Set([
  '-m',
  '--message',
  '--title',
  '--body',
  '--notes',
])

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
 * Returns true when the token names a program whose message options take
 * prose: `git` or `gh`, with an optional path prefix or `.exe` suffix. Other
 * programs can give `-m` another meaning, and GNU `parallel -m "…"` even runs
 * the next word through a shell, so their arguments are never masked.
 * @param token - The statement's program word.
 * @returns True when the program is git or gh.
 */
function isMessageProgram(token: string): boolean {
  const base = token
    .slice(Math.max(token.lastIndexOf('/'), token.lastIndexOf('\\')) + 1)
    .toLowerCase()
    .replace(/\.exe$/, '')
  return base === 'git' || base === 'gh'
}

/** Matches a leading `NAME=value` env assignment before a statement's program. */
const ENV_ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/

/**
 * Rebuilds the input from its `shell-quote` tokens with message values
 * masked, so the regex-based hooks-path and manager env checks no longer
 * match override-looking text inside a commit message or PR body (#93).
 *
 * Only values of known message options are masked, and only in statements
 * whose program is `git` or `gh`. Every other quoted string, such as a
 * `bash -c "…"` payload or text piped into `sh`, stays visible, because the
 * shell may run it. A message that contains a command substitution is not
 * masked either. A masked value keeps its position. When the tokenizer's
 * statements might not match the shell's (see `canMaskMessageValues`), the
 * input is returned unchanged.
 * @param input - The raw command string.
 * @returns The input with message values masked.
 */
export function maskMessageValues(input: string): string {
  if (!canMaskMessageValues(input)) return input
  const words: string[] = []
  let previous: string | undefined
  let program: string | undefined
  for (const token of tokenizeCommand(input)) {
    if (typeof token === 'string') {
      const isProgramWord = program === undefined && !ENV_ASSIGNMENT.test(token)
      if (isProgramWord) program = token
      const masks =
        !isProgramWord && program !== undefined && isMessageProgram(program)
      words.push(masks ? maskToken(token, previous) : token)
      previous = token
    } else if ('op' in token) {
      words.push(token.op === 'glob' ? token.pattern : token.op)
      previous = undefined
      program = undefined
    }
  }
  return words.join(' ')
}
