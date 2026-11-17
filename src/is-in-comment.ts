import { scanHashes } from './scan-hashes.js'

/** The text {@link lastComments} was scanned from. */
let lastInput: string | undefined

/** Comment ranges of {@link lastInput}. */
let lastComments: [number, number][] = []

/**
 * Returns true when the character at `idx` in `input` is inside a shell
 * comment, following bash's rules (see {@link scanHashes}). Callers test many
 * positions in one text, so the comment ranges of the last text are reused
 * instead of scanned again for each position.
 * @param input - The command string.
 * @param idx - Index of the character to test.
 * @returns True when the position is inside a comment.
 */
export function isInComment(input: string, idx: number): boolean {
  if (input !== lastInput) {
    lastComments = scanHashes(input).comments
    lastInput = input
  }
  return lastComments.some(([start, end]) => idx >= start && idx < end)
}
