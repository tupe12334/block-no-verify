import { scanHashes } from './scan-hashes.js'

/**
 * Returns true when the character at `idx` in `input` is inside a shell
 * comment, following bash's rules (see {@link scanHashes}).
 * @param input - The command string.
 * @param idx - Index of the character to test.
 * @returns True when the position is inside a comment.
 */
export function isInComment(input: string, idx: number): boolean {
  return scanHashes(input).comments.some(
    ([start, end]) => idx >= start && idx < end
  )
}
