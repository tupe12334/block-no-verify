import { tokenizeCommand } from './tokenize-command.js'

/** A short option cluster with `n` (`-n`, `-an`): `--no-verify` for commit. */
const SHORT_N_CLUSTER = /^-[A-Za-z]*n[A-Za-z]*$/

/** `--no-verify`, any prefix git accepts for it, or a longer form of it. */
const NO_VERIFY_FORM = /^--no-?ver/

/**
 * Returns true when any shell word of the command, with its quotes and
 * escapes removed, is a hook-skip flag: a short option cluster with `n`, or
 * a `--no-verify` form. Every word counts, whatever option comes before it,
 * so a flag that a value option would hide from the per-command check
 * (`git rebase -m "-n"`) is still found. Text the tokenizer cannot read
 * counts as a flag.
 * @param text - The command text.
 * @returns True when a hook-skip flag word is found.
 */
export function hasSkipFlagWord(text: string): boolean {
  let tokens: ReturnType<typeof tokenizeCommand>
  try {
    tokens = tokenizeCommand(text)
  } catch {
    return true
  }
  return tokens.some(
    token =>
      typeof token === 'string' &&
      (SHORT_N_CLUSTER.test(token) || NO_VERIFY_FORM.test(token))
  )
}
