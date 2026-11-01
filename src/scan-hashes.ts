/**
 * Scans a command string for `#` characters the way bash reads them. A `#`
 * starts a comment only at the start of a word and outside quotes; a comment
 * runs to the end of its line. A `#` in the middle of a word (`a#b`) is text,
 * and so is one in quotes or after `$`. `shell-quote` does not follow these
 * rules: it starts a comment at any `#` and swallows the rest of the input.
 * @param input - The command string.
 * @returns The comment ranges as `[start, end)` pairs, and the indexes of the
 *   `#` characters that are part of a word.
 */
export function scanHashes(input: string): {
  comments: [number, number][]
  wordHashes: number[]
} {
  const comments: [number, number][] = []
  const wordHashes: number[] = []
  let quote: "'" | '"' | null = null
  let wordStart = true
  for (let i = 0; i < input.length; i++) {
    const char = input.charAt(i)
    if (quote === "'") {
      if (char === "'") quote = null
      continue
    }
    if (char === '\\' && i + 1 < input.length) {
      i += 1
      wordStart = false
      continue
    }
    if (quote === '"') {
      if (char === '"') quote = null
      continue
    }
    if (char === "'" || char === '"') {
      quote = char
      wordStart = false
      continue
    }
    if (char === '#') {
      if (wordStart) {
        const newline = input.indexOf('\n', i)
        const end = newline === -1 ? input.length : newline
        comments.push([i, end])
        if (newline === -1) break
        i = newline
        wordStart = true
        continue
      }
      if (input.charAt(i - 1) !== '$') wordHashes.push(i)
    }
    wordStart = /[\s;&|()<>]/.test(char)
  }
  return { comments, wordHashes }
}
