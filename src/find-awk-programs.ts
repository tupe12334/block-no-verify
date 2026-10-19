import { stringLiterals } from './string-literals.js'
import { tokenizeCommand } from './tokenize-command.js'

/** Shell control operators that end a statement. */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&', '(', ')'])

/** awk, gawk, mawk and nawk (busybox runs `awk` as a word too). */
const AWK = /^[gmn]?awk$/

/** Short options that take the next word as their value. */
const VALUE_OPTIONS = new Set(['-F', '-v', '-f', '-E', '-i', '-l', '-W'])

/** gawk long options that take a value; gawk accepts any unique prefix. */
const LONG_VALUE_OPTIONS = [
  '--field-separator',
  '--assign',
  '--file',
  '--exec',
  '--include',
  '--load',
]

/** Options whose next word is program text. */
const PROGRAM_OPTIONS = new Set(['-e', '--source'])

/**
 * Resolves a long-option word (`--sou`, `--ass=x`) to the value option or
 * `--source` it abbreviates.
 * @param word - An argv word starting with `--`.
 * @returns The full option name, or null when it is not one of them.
 */
function longOption(word: string): string | null {
  const eq = word.indexOf('=')
  const name = eq === -1 ? word : word.slice(0, eq)
  const matches = [...LONG_VALUE_OPTIONS, '--source'].filter(option =>
    option.startsWith(name)
  )
  return name.length > 2 && matches.length === 1 ? matches[0] : null
}

/**
 * Returns the string literals in awk program text (`awk 'BEGIN{system("…")}'`,
 * `gawk -e '…'`, `--source=…`, `--sou …`), so the caller can check each like a typed
 * command (#101). The program is the first operand after the options; every
 * other option word, attached values included (`-vx=1`, `-F:`), is skipped.
 * @param input - The raw command string.
 * @returns The literals, in input order.
 */
export function findAwkPrograms(input: string): string[] {
  const literals: string[] = []
  const addProgram = (program: string): void => {
    const found = stringLiterals(program, false)
    literals.push(...found)
    if (found.length > 1) literals.push(found.join(' '))
  }
  let afterAwk = false
  let next: 'value' | 'program' | null = null
  for (const token of tokenizeCommand(input)) {
    if (typeof token !== 'string') {
      if ('op' in token && CONTROL_OPERATORS.has(token.op)) {
        afterAwk = false
        next = null
      }
      continue
    }
    if (next === 'program') addProgram(token)
    if (next !== null) {
      next = null
    } else if (AWK.test(token.slice(token.lastIndexOf('/') + 1))) {
      afterAwk = true
    } else if (!afterAwk) {
      continue
    } else if (VALUE_OPTIONS.has(token)) {
      next = 'value'
    } else if (PROGRAM_OPTIONS.has(token)) {
      next = 'program'
    } else if (token.startsWith('-e')) {
      addProgram(token.slice(2))
    } else if (token.startsWith('--')) {
      const option = longOption(token)
      const eq = token.indexOf('=')
      const isSource = option !== null && PROGRAM_OPTIONS.has(option)
      if (isSource && eq !== -1) addProgram(token.slice(eq + 1))
      else if (isSource) next = 'program'
      else if (option !== null && eq === -1) next = 'value'
    } else if (!token.startsWith('-')) {
      addProgram(token)
      afterAwk = false
    }
  }
  return literals
}
