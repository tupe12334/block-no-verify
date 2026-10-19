import { tokenizeCommand } from './tokenize-command.js'

/** Shells whose `-c` operand is a command string they run. */
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh'])

/** `eval` joins its arguments and runs them as a command line. */
const EVAL = new Set(['eval'])

/** Shell control operators that end a statement. */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&', '(', ')'])

/** Matches a short-option bundle that includes `c`: `-c`, `-lc`, `-ec`. */
const C_OPTION = /^-[a-z]*c[a-z]*$/

/**
 * Returns true when the word names a shell, with an optional path prefix.
 * @param word - An argv word.
 * @returns True when the word is sh, bash, zsh, dash or ksh.
 */
function isShell(word: string): boolean {
  return SHELLS.has(word.slice(word.lastIndexOf('/') + 1))
}

/**
 * Returns the command strings that `sh -c`, `bash -c` (and `-lc`, `-ec`, …),
 * `eval` and `env -S` calls in the input would run, so the caller can check them like typed
 * commands (#101). A shell word anywhere in a statement counts (`sudo bash
 * -c`, `env sh -c`), which can only widen the scan. Option words between
 * `-c` and the script (`sh -c -- "…"`, `bash -c -x "…"`) are skipped, since
 * the shell takes the first non-option word as the script.
 * @param input - The raw command string.
 * @returns The `-c` operands, in input order.
 */
export function findShellScripts(input: string): string[] {
  const scripts: string[] = []
  let afterShell = false
  let scriptIsNext = false
  // `eval` joins all its arguments with spaces and runs the result.
  let evalWords: string[] | null = null
  const endStatement = (): void => {
    if (evalWords !== null && evalWords.length > 0) {
      scripts.push(evalWords.join(' '))
    }
    evalWords = null
    afterShell = false
    scriptIsNext = false
  }
  for (const token of tokenizeCommand(input)) {
    if (typeof token !== 'string') {
      if ('op' in token && CONTROL_OPERATORS.has(token.op)) endStatement()
      continue
    }
    if (evalWords !== null) {
      evalWords.push(token)
    } else if (
      scriptIsNext &&
      (token.startsWith('-') || token.startsWith('+'))
    ) {
      continue
    } else if (scriptIsNext) {
      scripts.push(token)
      scriptIsNext = false
      afterShell = false
    } else if (EVAL.has(token)) {
      evalWords = []
    } else if (token.startsWith('--split-string=')) {
      // `env --split-string=STRING` runs STRING as a command line.
      scripts.push(token.slice('--split-string='.length))
    } else if (isShell(token) || token === 'env') {
      afterShell = true
    } else if (afterShell && (C_OPTION.test(token) || isSplitString(token))) {
      scriptIsNext = true
    }
  }
  endStatement()
  return scripts
}

/**
 * Returns true for `env`'s split-string option (`-S`, `--split-string`),
 * whose value env splits into a command line and runs.
 * @param token - An argv word after `env`.
 * @returns True when the word is the split-string option.
 */
function isSplitString(token: string): boolean {
  return token === '-S' || token === '--split-string'
}
