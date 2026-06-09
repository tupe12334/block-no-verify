import { skipHeredoc } from './skip-heredoc.js'

/**
 * Removes here-document bodies from a command string, keeping the `<<DELIM`
 * operator line but dropping everything from the body up to and including the
 * terminator line. Flags are never written inside a heredoc body, so removing
 * the body can only ever cause a command to be allowed — never a false block —
 * while preventing a `--no-verify` mentioned in a heredoc-built commit message
 * from being parsed as an argv flag.
 *
 * This runs before shell tokenization because `shell-quote` does not recognize
 * here-documents and would otherwise split the body into bare word tokens.
 */
export function stripHeredocs(input: string): string {
  const n = input.length
  let result = ''
  let i = 0

  while (i < n) {
    if (
      input.charAt(i) === '<' &&
      input.charAt(i + 1) === '<' &&
      input.charAt(i + 2) !== '<' &&
      input.charAt(i - 1) !== '<'
    ) {
      const end = skipHeredoc(input, i)
      if (end > i) {
        const newline = input.indexOf('\n', i)
        const operatorLineEnd = newline === -1 ? n : newline
        result += `${input.slice(i, operatorLineEnd)} `
        i = end
        continue
      }
    }
    result += input.charAt(i)
    i++
  }

  return result
}
