/** Matches `-S`, a bundle ending in it (`-iS`, `-vS`), or an attached value (`-S"…"`). */
const SHORT_SPLIT_STRING = /^-[a-zA-Z]*S([\s\S]*)$/

/** The long form of env's split-string option. */
const LONG_SPLIT_STRING = '--split-string'

/** The long option as a set, for an exact-word lookup. */
const LONG_SPLIT_STRING_WORD = new Set([LONG_SPLIT_STRING])

/**
 * Reads one word after `env` as its split-string option, which makes env
 * split a string into a command line and run it (#101).
 * @param token - An argv word after `env`.
 * @returns null when the word is not the option; undefined when the value is
 *   the next word (`-S`, `-iS`, `--split-string`); otherwise the attached
 *   value (`-S"…"`, `--split-string=…`).
 */
export function readSplitStringOption(
  token: string
): string | undefined | null {
  if (LONG_SPLIT_STRING_WORD.has(token)) return undefined
  if (token.startsWith(`${LONG_SPLIT_STRING}=`)) {
    return token.slice(LONG_SPLIT_STRING.length + 1)
  }
  const short = SHORT_SPLIT_STRING.exec(token)
  if (short === null) return null
  return short[1] === '' ? undefined : short[1]
}
