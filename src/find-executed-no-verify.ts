import { quote } from 'shell-quote'
import { extractNestedStatements } from './extract-nested-statements.js'
import type { GitCommand } from './git-command.js'
import { hasNoVerifyFlag } from './has-no-verify-flag.js'
import { isNonExecutingStatement } from './is-non-executing-statement.js'
import { splitStatements } from './split-statements.js'
import { tokenizeCommand } from './tokenize-command.js'
import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'

/**
 * Programs that run their arguments as a command line (or a command plus
 * extra arguments), so a `git` call hidden in a quoted argument really runs.
 */
const EXECUTOR_PROGRAMS = new Set([
  'eval',
  'exec',
  'source',
  '.',
  'builtin',
  'command',
  'env',
  'sudo',
  'doas',
  'nohup',
  'time',
  'timeout',
  'nice',
  'xargs',
  'ssh',
  'watch',
  'parallel',
])

/**
 * Returns true when a word names the git program, with an optional path
 * prefix or `.exe` suffix.
 * @param word - An argv word.
 * @returns True when the word is git.
 */
function isGitWord(word: string): boolean {
  const base = word
    .slice(Math.max(word.lastIndexOf('/'), word.lastIndexOf('\\')) + 1)
    .toLowerCase()
  return base === 'git' || base === 'git.exe'
}

/**
 * Returns true when a statement's program is an executor, or is a variable or
 * substitution, so the words after it may be run as a command.
 * @param words - The statement's argv words, with quoting removed.
 * @returns True when the statement can run a quoted argument as a command.
 */
function runsItsArguments(words: string[]): boolean {
  const program = words.find(word => !/^[A-Za-z_]\w*=/.test(word))
  if (program === undefined) return false
  const base = program.slice(program.lastIndexOf('/') + 1)
  return EXECUTOR_PROGRAMS.has(base) || /[$`]/.test(program)
}

/**
 * Checks one statement that may run its words for a --no-verify flag.
 * - A statement with a `git` word is checked as git.
 * - A statement that runs its arguments (`eval`, `env`, `xargs`, …) is checked
 *   token by token, with the git sub-command found in the whole input, as
 *   the old whole-input scan did. `eval "git commit" --no-verify` is caught.
 * - Any other statement is not checked here, so `sed -n` or `bash -n` is not
 *   blamed on a git call that appears elsewhere.
 * @param words - The statement's argv words, with quoting removed.
 * @param detected - The git sub-command found in the whole input.
 * @returns The git sub-command that runs with the flag, or null.
 */
function checkStatement(
  words: string[],
  detected: GitCommand
): GitCommand | null {
  if (isNonExecutingStatement(words)) return null
  if (words.some(isGitWord)) {
    const command = GIT_COMMANDS_WITH_NO_VERIFY.find(cmd => words.includes(cmd))
    if (command === undefined) return null
    return hasNoVerifyFlag(quote(words), command) ? command : null
  }
  if (!runsItsArguments(words)) return null
  return hasNoVerifyFlag(quote(words), detected) ? detected : null
}

/**
 * Finds a --no-verify flag that is attributed to a git command that really
 * runs. Statements that only carry text are skipped: echo/printf/cat/grep
 * arguments, assignment values, and `command -v` lookups. A statement with a
 * git word is checked as git, so a flag in the next statement is not blamed
 * on an earlier git call. Statements that run their arguments are checked too.
 * Command substitutions are checked as their own statements.
 * @param input - The raw command string.
 * @param detected - The git sub-command found in the whole input, which is
 *   used for statements that run their arguments.
 * @returns The git sub-command that runs with a bypass flag, or null.
 */
export function findExecutedNoVerifyCommand(
  input: string,
  detected: GitCommand
): GitCommand | null {
  const tokens = tokenizeCommand(input)
  const statements = [
    ...splitStatements(tokens),
    ...extractNestedStatements(tokens),
  ]
  for (const words of statements) {
    const command = checkStatement(words, detected)
    if (command !== null) return command
  }
  return null
}
