import { tokenizeCommand } from './tokenize-command.js'
import type { ParseToken } from './parse-token.js'
import { splitStatements } from './split-statements.js'
import { extractCommandSubstitutions } from './extract-command-substitutions.js'

/**
 * Recursively recovers the statements hidden inside command substitutions
 * that `shell-quote` left glued into an opaque string token because they
 * were written inside a quoted word (see {@link extractCommandSubstitutions}).
 * Each substitution's inner text is tokenized and split into statements, and
 * scanned again for further nested substitutions — the recursion always
 * terminates because an extracted inner string is strictly shorter than the
 * token it came from.
 * @param tokens - A parsed token stream (from `tokenizeCommand`) to search
 *   for opaque substitution tokens.
 * @returns The statements found inside any substitution, at any depth.
 */
export function extractNestedStatements(tokens: ParseToken[]): string[][] {
  const nested: string[][] = []
  for (const token of tokens) {
    if (typeof token !== 'string') continue
    for (const substitution of extractCommandSubstitutions(token)) {
      const substitutionTokens = tokenizeCommand(substitution)
      nested.push(...splitStatements(substitutionTokens))
      nested.push(...extractNestedStatements(substitutionTokens))
    }
  }
  return nested
}
