import { readSplitStringOption } from './read-split-string-option.js'
import { tokenizeCommand } from './tokenize-command.js'

/** Shells whose `-c` operand is a command string they run (#101). */
const SHELLS = new Set(
  // cspell:disable-next-line
  'sh bash zsh dash ksh ash mksh fish csh tcsh yash posh rc nu elvish xonsh pwsh powershell'.split(
    ' '
  )
)

/** `eval` joins its arguments and runs them as a command line. */
const EVAL = new Set(['eval'])

/** `env` runs the value of its split-string option as a command line. */
const ENV = new Set(['env'])

/** Shell control operators that end a statement. */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&', '(', ')'])

/** Matches a short-option bundle that includes `c`: `-c`, `-lc`, `-ec`. */
const C_OPTION = /^-[a-z]*c[a-z]*$/

/** Matches a long command option: fish/nu `--command(s)`, pwsh `-Command`. */
const COMMAND_OPTION = /^--?commands?$/i

/** Matches a long command option with an attached value (`--command=…`). */
const COMMAND_OPTION_VALUE = /^--?commands?=([\s\S]*)$/i

/** An env assignment word inside a split string (`A=1`). */
const ENV_ASSIGNMENT = /^[A-Za-z_]\w*=/

/**
 * Returns the program name of a word, without any path prefix.
 * @param word - An argv word.
 * @returns The base name, e.g. `env` for `/usr/bin/env`.
 */
function baseName(word: string): string {
  return word.slice(word.lastIndexOf('/') + 1)
}

/**
 * Turns an env split string into the command it runs: `\_` is a space to
 * env, and leading env options or assignments are not part of the command.
 * @param value - The split-string value.
 * @returns The command line.
 */
function envCommand(value: string): string {
  const words = value.replace(/\\_/g, ' ').trim().split(/\s+/)
  const start = words.findIndex(
    word => !word.startsWith('-') && !ENV_ASSIGNMENT.test(word)
  )
  return start === -1 ? '' : words.slice(start).join(' ')
}

/**
 * Returns the command strings that `sh -c`, `bash -c` (and `-lc`, `-ec`, …),
 * `eval` and `env -S` calls in the input would run, so the caller can check
 * them like typed commands (#101). A shell or env word anywhere in a
 * statement counts (`sudo bash -c`, `/usr/bin/env -S`), which can only widen
 * the scan. Option words between `-c` and the script are skipped, since the
 * shell takes the first non-option word as the script.
 * @param input - The raw command string.
 * @returns The command strings, in input order.
 */
export function findShellScripts(input: string): string[] {
  const scripts: string[] = []
  let after: 'shell' | 'env' | null = null
  let next: 'shell' | 'env' | null = null
  let evalWords: string[] | null = null
  const endStatement = (): void => {
    if (evalWords !== null && evalWords.length > 0) {
      scripts.push(evalWords.join(' '))
    }
    evalWords = null
    after = null
    next = null
  }
  for (const token of tokenizeCommand(input)) {
    if (typeof token !== 'string') {
      if ('op' in token && CONTROL_OPERATORS.has(token.op)) endStatement()
      continue
    }
    const splitString = after === 'env' ? readSplitStringOption(token) : null
    if (evalWords !== null) {
      evalWords.push(token)
    } else if (next === 'shell' && /^[-+]/.test(token)) {
      continue
    } else if (next !== null) {
      scripts.push(next === 'env' ? envCommand(token) : token)
      next = null
      after = null
    } else if (EVAL.has(token)) {
      evalWords = []
    } else if (SHELLS.has(baseName(token))) {
      after = 'shell'
    } else if (ENV.has(baseName(token))) {
      after = 'env'
    } else if (
      after === 'shell' &&
      (C_OPTION.test(token) || COMMAND_OPTION.test(token))
    ) {
      next = 'shell'
    } else if (after === 'shell' && COMMAND_OPTION_VALUE.test(token)) {
      scripts.push(token.slice(token.indexOf('=') + 1))
      after = null
    } else if (splitString === undefined) {
      next = 'env'
    } else if (splitString !== null) {
      scripts.push(envCommand(splitString))
      after = null
    }
  }
  endStatement()
  return scripts
}
