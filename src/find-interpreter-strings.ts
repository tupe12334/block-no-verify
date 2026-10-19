import { stringLiterals } from './string-literals.js'
import { tokenizeCommand } from './tokenize-command.js'

/** Shell control operators that end a statement. */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&', '(', ')'])

/** Matches an interpreter name: python3.12, perl, ruby, node, bun, deno, php, lua. */
const INTERPRETER = /^(?:python[\d.]*|perl|ruby|node|nodejs|bun|deno|php|lua)$/

/** Languages with `q{}` / `%q()` quote operators. */
const QUOTE_OPERATOR_LANGUAGES = new Set(['perl', 'ruby'])

/** Long options whose value is code (`node --eval`, `node --print`). */
const LONG_CODE_OPTIONS = new Set(['--eval', '--print'])

/** A short-option bundle ending in a code option: `-c`, `-Ic`, `-pe`. */
const SHORT_CODE_OPTION = /^-[A-Za-z]*[ceEp]$/

/** A code option with its code attached in the same word (`-c'…'`). */
const ATTACHED_CODE = /^-[A-Za-z]*?[ceE]([\s\S]+)$/

/** php's code option; node uses `-r` for a module name, so php only. */
const PHP_CODE_OPTION = new Set(['-r'])

/** `deno eval <code>` takes code as a sub-command argument. */
const DENO_EVAL = new Set(['eval'])

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
  const addCode = (code: string): void => {
    const found = stringLiterals(
      code,
      QUOTE_OPERATOR_LANGUAGES.has(interpreter)
    )
    literals.push(...found)
    // An argv list (`run(["git", "commit", …])`) splits a command across
    // literals, so the joined literals are checked as one command too.
    if (found.length > 1) literals.push(found.join(' '))
  }
  let afterInterpreter = false
  let codeIsNext = false
  let interpreter = ''
  for (const token of tokenizeCommand(input)) {
    if (typeof token !== 'string') {
      if ('op' in token && CONTROL_OPERATORS.has(token.op)) {
        afterInterpreter = false
        codeIsNext = false
      }
      continue
    }
    const eq = token.indexOf('=')
    // Attached code holds more than option letters (a space, quote, paren…).
    const attached =
      afterInterpreter && /[^A-Za-z]/.test(token.slice(1))
        ? ATTACHED_CODE.exec(token)
        : null
    if (codeIsNext) {
      addCode(token)
      codeIsNext = false
      afterInterpreter = false
    } else if (INTERPRETER.test(token.slice(token.lastIndexOf('/') + 1))) {
      afterInterpreter = true
      interpreter = token.slice(token.lastIndexOf('/') + 1)
    } else if (!afterInterpreter) {
      continue
    } else if (LONG_CODE_OPTIONS.has(token) || SHORT_CODE_OPTION.test(token)) {
      codeIsNext = true
    } else if (interpreter === 'php' && PHP_CODE_OPTION.has(token)) {
      codeIsNext = true
    } else if (DENO_EVAL.has(token)) {
      codeIsNext = true
    } else if (eq > 0 && LONG_CODE_OPTIONS.has(token.slice(0, eq))) {
      addCode(token.slice(eq + 1))
      afterInterpreter = false
    } else if (attached !== null) {
      addCode(attached[1])
      afterInterpreter = false
    }
  }
  return literals
}
