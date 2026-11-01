import { findLiveSubstitutions } from './find-live-substitutions.js'
import { preprocessCommand } from './preprocess-command.js'
import { tokenizeCommand } from './tokenize-command.js'
import { splitStatements } from './split-statements.js'

/** Programs whose arguments become the text they print to stdout. */
const PRINTERS = new Set(['echo', 'printf', 'cat'])

/**
 * Returns the text that the substitutions and process substitutions of a
 * command string print, when they only print a literal:
 * `eval "$(echo 'git commit …')"`, `sh <(printf '%s' 'git commit …')`. Whatever
 * the shell then runs is that text, so the caller checks it like a typed
 * command. A substitution that runs anything else is not included here.
 * @param input - The raw command string.
 * @returns The printed texts, in input order.
 */
export function findPrintedSubstitutions(input: string): string[] {
  const printed: string[] = []
  for (const text of findLiveSubstitutions(preprocessCommand(input))) {
    for (const statement of splitStatements(tokenizeCommand(text))) {
      const [program, ...args] = statement
      if (PRINTERS.has(program)) printed.push(args.join(' '))
    }
  }
  return printed
}
