import { codeLiterals } from './code-literals.js'
import { commandWords } from './command-words.js'
import { isInterpreter } from './is-interpreter.js'

/** Matches a heredoc operator and its delimiter (see strip-heredoc-bodies). */
const HEREDOC_START = /(?<!<)<<(-?)\s*([^\s<>|&;()]+)/g

/** A leading `NAME=value` word on a command line. */
const ASSIGNMENT = /^[A-Za-z_]\w*=/

/**
 * Returns the interpreter that a line's pipeline or list runs, when one of its
 * segments runs a code interpreter (`python3 <<EOF`, `cat <<EOF | python3`).
 * @param line - The line that opens a heredoc.
 * @returns The interpreter base name, or null.
 */
function lineInterpreter(line: string): string | null {
  for (const segment of line.split(/[|;&]/)) {
    const words = commandWords(segment).filter(word => !ASSIGNMENT.test(word))
    if (words.length === 0) continue
    const program = words[0]
    const base = program.slice(program.lastIndexOf('/') + 1)
    if (isInterpreter(base)) return base
  }
  return null
}

/**
 * Returns the command strings that heredoc bodies fed to a code interpreter
 * would run: the string literals of the body, as `python3 <<EOF` runs
 * `os.system("git …")`. The body is data for the shell, so
 * strip-heredoc-bodies removes it; this recovers the code for the caller to
 * check like a typed command.
 * @param input - The raw command string.
 * @returns The candidate command strings.
 */
export function findHeredocInterpreterCode(input: string): string[] {
  const found: string[] = []
  const lines = input.split('\n')
  let open: {
    delimiter: string
    stripTabs: boolean
    interpreter: string
    body: string[]
  } | null = null
  for (const line of lines) {
    if (open !== null) {
      const candidate = open.stripTabs ? line.replace(/^\t+/, '') : line
      if (candidate === open.delimiter) {
        found.push(...codeLiterals(open.body.join('\n'), open.interpreter))
        open = null
      } else {
        open.body.push(line)
      }
      continue
    }
    const matches = [...line.matchAll(HEREDOC_START)]
    if (matches.length === 0) continue
    const match = matches[0]
    const interpreter = lineInterpreter(line)
    if (interpreter === null) continue
    open = {
      delimiter: match[2].replace(/\\(.)|['"]/g, '$1'),
      stripTabs: match[1] === '-',
      interpreter,
      body: [],
    }
  }
  if (open !== null) {
    found.push(...codeLiterals(open.body.join('\n'), open.interpreter))
  }
  return found
}
