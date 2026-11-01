import type { GitCommand } from './git-command.js'
import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'
import { tokenizeCommand } from './tokenize-command.js'

/** Words that name the git executable once the shell has unquoted them. */
const GIT_EXECUTABLE_NAMES = ['git', 'git.exe']

/**
 * Finds the git sub-command in one statement's unquoted words, when the word
 * that names git is one the shell would run as `git`.
 * @param words - The unquoted words of a single statement, in order.
 * @returns The detected git sub-command, or null when none is found.
 */
function findInStatement(words: string[]): GitCommand | null {
  const gitIdx = words.findIndex(word =>
    GIT_EXECUTABLE_NAMES.includes(word.toLowerCase())
  )
  if (gitIdx === -1) return null
  const rest = words.slice(gitIdx + 1)
  for (const cmd of GIT_COMMANDS_WITH_NO_VERIFY) {
    if (rest.includes(cmd)) return cmd
  }
  return null
}

/**
 * Finds a git sub-command by comparing shell-unquoted words, so a git name
 * split by quoting or escaping (`g''it`, `g\it`, `g\<newline>it`) is seen
 * the way bash runs it. Words come from `tokenizeCommand`, which already
 * removes quotes, escapes and line continuations, so no hand-written parser
 * is needed. Operators and comments end a statement.
 * @param input - The raw command string.
 * @returns The detected git sub-command, or null when none is found.
 */
export function findUnquotedGitCommand(input: string): GitCommand | null {
  let words: string[] = []
  for (const token of tokenizeCommand(input)) {
    if (typeof token === 'string') {
      words.push(token)
      continue
    }
    // A glob (e.g. `*.ts`) is one word the shell expands later; it does not
    // end the statement.
    if ('op' in token && token.op === 'glob') {
      words.push('')
      continue
    }
    const found = findInStatement(words)
    if (found !== null) return found
    words = []
  }
  return findInStatement(words)
}
