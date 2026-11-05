import { NEUTRAL } from './neutral-marker.js'
import { splitStatements } from './split-statements.js'
import { tokenizeCommand } from './tokenize-command.js'

/** A plain shell variable name: `printf -v` stores into it and runs nothing. */
const IDENTIFIER = /^[A-Za-z_]\w*$/

/**
 * Matches a write to bash's command hash table or alias table:
 * `BASH_CMDS[grep]=/bin/sh`, `BASH_ALIASES+=…`, or the bare name or
 * subscript given to `printf -v`, `read` or `declare`.
 */
const HASH_TABLE_WRITE = /^(BASH_CMDS|BASH_ALIASES)(\[|\+?=|$)/

/**
 * Turns the literal openers that preprocessing neutralized back into `$(` and
 * backticks: quoting makes them literal to `printf`, but bash still runs them
 * when it reads the target as an array subscript.
 * @param word - A preprocessed word.
 * @returns The word with its substitution openers restored.
 */
function restoreOpeners(word: string): string {
  return word.replaceAll(`${NEUTRAL}(`, '$(').replaceAll(NEUTRAL, '`')
}

/**
 * Returns the `printf -v` target of a statement, from `-v NAME` or `-vNAME`.
 * @param words - The argv words of one statement.
 * @returns The target, or undefined when the statement sets none.
 */
function printfTarget(words: string[]): string | undefined {
  const index = words.indexOf('printf')
  if (index === -1) return undefined
  const option = words.at(index + 1)
  if (option === '-v') return words.at(index + 2)
  return option?.startsWith('-v') === true ? option.slice(2) : undefined
}

/**
 * Returns command strings that bash would run through variable names (#152):
 * - a `printf -v` target that is not a plain name, since bash expands the
 *   `$(…)` in an array subscript before it checks the name
 *   (`printf -v 'a[$(git commit …)]' x`);
 * - every word after a write to `BASH_CMDS` or `BASH_ALIASES`, since that
 *   write can turn any later program name into a shell that runs its
 *   arguments (`printf -v 'BASH_CMDS[grep]' /bin/sh; grep -c 'git …'`).
 * @param input - The raw command string.
 * @returns The command strings, in input order.
 */
export function findVariableNameCode(input: string): string[] {
  const commands: string[] = []
  let tableWritten = false
  for (const words of splitStatements(tokenizeCommand(input))) {
    if (tableWritten) commands.push(...words)
    const target = printfTarget(words)
    if (target !== undefined && !IDENTIFIER.test(target)) {
      commands.push(restoreOpeners(target))
    }
    if (words.some(word => HASH_TABLE_WRITE.test(word))) tableWritten = true
  }
  return commands
}
