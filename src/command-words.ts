/**
 * Matches a bare redirection operator that takes the next word as its target:
 * `<`, `>`, `>>`, `>|`, `<<`, `<<-`, `<<<`, with an optional fd number.
 */
const BARE_REDIRECTION = /^\d*(<<<|<<-?|<|>>?|>\|)$/

/**
 * Matches a redirection word with its target attached: `<<EOF`, `2>/dev/null`.
 */
const ATTACHED_REDIRECTION = /^\d*[<>]/

/**
 * Returns the words of one command segment that name the program and its
 * arguments, with redirections removed (`<<EOF bash` gives `bash`,
 * `2>/dev/null sh` gives `sh`).
 * @param segment - Text of one pipeline or list segment.
 * @returns The command words, in order.
 */
export function commandWords(segment: string): string[] {
  const result: string[] = []
  let skipNext = false
  for (const word of segment.trim().split(/\s+/)) {
    if (word === '') continue
    if (skipNext) {
      skipNext = false
    } else if (BARE_REDIRECTION.test(word)) {
      skipNext = true
    } else if (!ATTACHED_REDIRECTION.test(word)) {
      result.push(word)
    }
  }
  return result
}
