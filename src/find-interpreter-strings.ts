import { tokenizeCommand } from './tokenize-command.js'

/** Shell control operators that end a statement. */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&', '(', ')'])

/** Matches an interpreter name: python, python3, python3.12, perl, ruby, node. */
const INTERPRETER = /^(?:python[\d.]*|perl|ruby|node)$/

/** Interpreter options whose value is code: python `-c`, perl/ruby/node `-e`. */
const CODE_OPTIONS = new Set(['-c', '-e', '-E', '--eval'])

/**
 * Returns the string literals in a piece of interpreter code. A git command
 * run from code sits in one (`os.system('git commit …')`), so each literal
 * is a candidate command. Backslash escapes inside a literal are kept.
 * @param code - The interpreter code.
 * @returns The literals' contents, in order.
 */
function stringLiterals(code: string): string[] {
  const literals: string[] = []
  let quote: string | null = null
  let current = ''
  let escaped = false
  for (const char of code) {
    if (quote === null) {
      if (char === '"' || char === "'" || char === '`') {
        quote = char
        current = ''
      }
    } else if (escaped) {
      current += char
      escaped = false
    } else if (char === '\\') {
      escaped = true
    } else if (char === quote) {
      literals.push(current)
      quote = null
    } else {
      current += char
    }
  }
  return literals
}

/**
 * Returns the string literals inside code passed to an interpreter on the
 * command line (`python3 -c "…"`, `perl -e '…'`, `node -e "…"`), so the
 * caller can check each like a typed command (#101). A literal that is not a
 * command is checked too, which can only widen the scan.
 * @param input - The raw command string.
 * @returns The literals, in input order.
 */
export function findInterpreterStrings(input: string): string[] {
  const literals: string[] = []
  let afterInterpreter = false
  let codeIsNext = false
  for (const token of tokenizeCommand(input)) {
    if (typeof token !== 'string') {
      if ('op' in token && CONTROL_OPERATORS.has(token.op)) {
        afterInterpreter = false
        codeIsNext = false
      }
      continue
    }
    if (codeIsNext) {
      literals.push(...stringLiterals(token))
      codeIsNext = false
      afterInterpreter = false
    } else if (INTERPRETER.test(token.slice(token.lastIndexOf('/') + 1))) {
      afterInterpreter = true
    } else if (afterInterpreter && CODE_OPTIONS.has(token)) {
      codeIsNext = true
    }
  }
  return literals
}
