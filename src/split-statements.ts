import type { ParseToken } from './parse-token.js'

/**
 * Shell control operators that end the current statement. Redirection
 * operators (`>`, `<`, `>>`, …) are deliberately absent: they do not start a
 * new command, so their operands stay with the statement being scanned.
 */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&', '(', ')'])

/**
 * Splits a parsed token stream into statements at control operators. The
 * split happens on `shell-quote`'s operator tokens rather than on raw
 * characters, so a `;`, `|`, or `&` inside a quoted string (e.g. a commit
 * message) never breaks the statement that carries it. Non-string tokens
 * (operators, globs, comments) are dropped from the statements themselves.
 * Unquoted newlines are whitespace to `shell-quote`, so newline-separated
 * commands land in one statement — that can only over-scan (a safe
 * false-positive direction), never hide a flag.
 * @param tokens - The parsed token stream for the full input.
 * @returns The statements, each an array of string argv tokens.
 */
export function splitStatements(tokens: ParseToken[]): string[][] {
  const statements: string[][] = [[]]
  for (const token of tokens) {
    if (typeof token === 'string') {
      statements[statements.length - 1].push(token)
      continue
    }
    if ('op' in token && CONTROL_OPERATORS.has(token.op)) {
      statements.push([])
    }
  }
  return statements
}
