import { isDataProgram } from './is-data-program.js'

/** A leading `NAME=value` word, which sets a variable and runs nothing. */
const ASSIGNMENT = /^[A-Za-z_]\w*=/

/** A short-option cluster such as `-v`, `-pV`. */
const SHORT_OPTIONS = /^-[a-zA-Z]+$/

/**
 * Returns true when `command`'s leading options include `-v` or `-V`. Bash
 * then only looks up the name that follows and never runs it.
 * @param args - The words after `command`.
 * @returns True for a lookup such as `command -v git push`.
 */
function isCommandLookup(args: string[]): boolean {
  for (const arg of args) {
    if (!SHORT_OPTIONS.test(arg)) return false
    if (/[vV]/.test(arg)) return true
  }
  return false
}

/**
 * Returns true when a statement's words are data or a lookup, so bash never
 * runs them as a command. Such statements are: only `NAME=value` assignments
 * (the value is text), a data program call such as `echo` or `grep` (the
 * words are printed or searched), and `command -v`/`-V` (the name is only
 * looked up). Any other statement may run its words.
 * @param words - The statement's argv words, with quoting removed.
 * @returns True when the statement runs none of its words.
 */
export function isNonExecutingStatement(words: string[]): boolean {
  const start = words.findIndex(word => !ASSIGNMENT.test(word))
  if (start === -1) return true
  const [head = ''] = words.slice(start)
  const program = head.slice(head.lastIndexOf('/') + 1)
  if (isDataProgram(program)) return true
  return program === 'command' && isCommandLookup(words.slice(start + 1))
}
