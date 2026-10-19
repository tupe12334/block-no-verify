import type { GitInvocation } from './git-invocation.js'
import { tokenizeCommand } from './tokenize-command.js'

/** Shell control operators that end a statement. */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&', '(', ')'])

/** Git global options that take their value as the next word. */
const GLOBAL_OPTIONS_WITH_VALUE = new Set([
  '-c',
  '-C',
  '--git-dir',
  '--work-tree',
  '--namespace',
  '--config-env',
])

/**
 * Returns true when the word is the `git` program, with an optional path
 * prefix or `.exe` suffix.
 * @param word - An argv word.
 * @returns True when the word invokes git.
 */
function isGit(word: string): boolean {
  const base = word
    .slice(Math.max(word.lastIndexOf('/'), word.lastIndexOf('\\')) + 1)
    .toLowerCase()
  return base === 'git' || base === 'git.exe'
}

/**
 * Reads the git call in one statement. A `git` word anywhere in the statement
 * counts (`sudo git`, `env git`, ...), which can only widen the scan. Skips git's global options
 * (`-c x=y`, `-C dir`, `--no-pager`, …) to reach the sub-command.
 * @param words - The statement's argv words.
 * @returns The invocation, or null when the statement does not call git.
 */
function readInvocation(words: string[]): GitInvocation | null {
  const start = words.findIndex(isGit)
  if (start === -1) return null
  let skipNext = false
  for (const [offset, word] of words.slice(start + 1).entries()) {
    if (skipNext) {
      skipNext = false
    } else if (GLOBAL_OPTIONS_WITH_VALUE.has(word)) {
      skipNext = true
    } else if (!word.startsWith('-')) {
      return { subcommand: word, args: words.slice(start + offset + 2) }
    }
  }
  return null
}

/**
 * Lists every git call in the input, one per statement, so callers can see
 * which sub-command (or alias name) each one runs and with which arguments.
 * @param input - The raw command string.
 * @returns The git invocations, in input order.
 */
export function findGitInvocations(input: string): GitInvocation[] {
  const statements: string[][] = [[]]
  for (const token of tokenizeCommand(input)) {
    if (typeof token === 'string') {
      statements[statements.length - 1].push(token)
    } else if ('op' in token && CONTROL_OPERATORS.has(token.op)) {
      statements.push([])
    }
  }
  return statements
    .map(readInvocation)
    .filter((call): call is GitInvocation => call !== null)
}
