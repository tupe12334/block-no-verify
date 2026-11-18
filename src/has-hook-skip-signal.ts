/**
 * Text that may skip git hooks: a `--no-verify` flag or its abbreviation,
 * a `core.hooksPath` override, a git or gh alias, a hook-manager env var, or
 * a short option cluster with `n` (`-n` is `--no-verify` for git commit).
 */
const SIGNALS = [
  /no-?veri/i,
  /hooks?path/i,
  /alias/i,
  /husky|lefthook|overcommit/i,
  /skip\w*=/i,
  /(?:^|[\s;&|(=])-[a-z]*n/i,
]

/** Characters that end a word for the quote-split check. */
const WORD_BREAK = /[\s;&|()<>=]+/

/** A quote or backslash between word characters (`pu'sh'`, `g""it`). */
const QUOTE_SPLIT = /[\w.-]["'\\]+[\w.-]/

/** Names a quote-split word must not hide. */
const HIDDEN_NAME =
  /git|\bgh\b|commit|push|merge|cherry|rebase|\bam\b|verify|hook|alias/i

/**
 * Returns true when the text holds anything that may skip git hooks. It is
 * a broad text match, not a parse: it errs toward true. It is an extra
 * guard: a large command with a signal is not masked (see
 * `checkMaskedMessageValues`).
 * @param text - The command text.
 * @returns True when a hook-skip signal is found.
 */
export function hasHookSkipSignal(text: string): boolean {
  if (SIGNALS.some(signal => signal.test(text))) return true
  for (const word of text.split(WORD_BREAK)) {
    if (
      QUOTE_SPLIT.test(word) &&
      HIDDEN_NAME.test(word.replace(/["'\\]/g, ''))
    ) {
      return true
    }
  }
  return false
}
