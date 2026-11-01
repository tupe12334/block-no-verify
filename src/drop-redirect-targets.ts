import type { ParseToken } from './parse-token.js'

/** Shell operators that redirect a stream. Their next word is a file or fd. */
const REDIRECT_OPERATOR = /[<>]/

/**
 * Removes each redirection operand from a parsed token stream. A redirect
 * target is a file name (`> --no-verify` writes to a file called
 * `--no-verify`), never a command argument, so it must not reach the argv
 * scan. The operator itself is kept so statement splitting is unchanged.
 * @param tokens - A parsed token stream from `tokenizeCommand`.
 * @returns A new token stream without the redirect operands.
 */
export function dropRedirectTargets(tokens: ParseToken[]): ParseToken[] {
  const kept: ParseToken[] = []
  let skipNext = false
  for (const token of tokens) {
    if (skipNext) {
      skipNext = false
      if (typeof token === 'string') {
        continue
      }
    }
    kept.push(token)
    if (
      typeof token !== 'string' &&
      'op' in token &&
      REDIRECT_OPERATOR.test(token.op)
    ) {
      skipNext = true
    }
  }
  return kept
}
