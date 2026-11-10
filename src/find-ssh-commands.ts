import { tokenizeCommand } from './tokenize-command.js'

/** ssh short options that take a value (`-p 22`, `-p22`, `-vp 22`). */
// cspell:disable-next-line
const VALUE_OPTIONS = new Set('BbcDEeFIiJLlmOoPpQRSWw'.split(''))

/** Shell control operators that end a statement. */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&', '(', ')'])

/**
 * Tells whether an ssh option word leaves its value in the next word.
 * @param word - An option word such as `-v`, `-p`, `-vp` or `-p22`.
 * @returns True when the last letter takes a value that is not attached.
 */
function needsValue(word: string): boolean {
  for (let index = 1; index < word.length; index++) {
    if (VALUE_OPTIONS.has(word.charAt(index))) return index === word.length - 1
  }
  return false
}

/**
 * Returns the command lines that `ssh host …` calls in the input would run
 * on the remote host, so the caller can check them like typed commands
 * (#101). ssh joins every word after the destination into one command line
 * for the remote shell. An `ssh` word anywhere in a statement counts
 * (`sudo ssh host …`), which can only widen the scan.
 * @param input - The raw command string.
 * @returns The remote command lines, in input order.
 */
export function findSshCommands(input: string): string[] {
  const commands: string[] = []
  let state: 'options' | 'value' | 'command' | null = null
  let words: string[] = []
  const endStatement = (): void => {
    if (words.length > 0) commands.push(words.join(' '))
    words = []
    state = null
  }
  for (const token of tokenizeCommand(input)) {
    if (typeof token !== 'string') {
      if ('op' in token && CONTROL_OPERATORS.has(token.op)) endStatement()
      continue
    }
    if (state === 'command') {
      words.push(token)
    } else if (state === 'value') {
      state = 'options'
    } else if (state === 'options' && token === '--') {
      continue
    } else if (state === 'options' && token.startsWith('-')) {
      if (needsValue(token)) state = 'value'
    } else if (state === 'options') {
      state = 'command'
    } else if (token.slice(token.lastIndexOf('/') + 1) === 'ssh') {
      state = 'options'
    }
  }
  endStatement()
  return commands
}
