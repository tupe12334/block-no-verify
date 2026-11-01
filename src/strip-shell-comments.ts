import { scanHashes } from './scan-hashes.js'

/**
 * Removes the `#` comments from a command string, keeping their newlines, so
 * that a comment's apostrophe or the `;` in it cannot change how the code after
 * it is read. A word-internal `#` (`foo#bar`) is kept but escaped as `\#`:
 * `shell-quote` would read it as a comment, and bash reads `\#` as `#`.
 * @param input - The command string.
 * @returns The command string without comments, with word hashes escaped.
 */
export function stripShellComments(input: string): string {
  const { comments, wordHashes } = scanHashes(input)
  const cuts = [
    ...comments.map(([start, end]) => ({ start, end, text: '' })),
    ...wordHashes.map(idx => ({ start: idx, end: idx + 1, text: '\\#' })),
  ].sort((a, b) => a.start - b.start)
  let result = ''
  let last = 0
  for (const cut of cuts) {
    result += input.slice(last, cut.start) + cut.text
    last = cut.end
  }
  return result + input.slice(last)
}
