import { tokenizeCommand } from './tokenize-command.js'

/** Placeholder that keeps a masked token's position in the rebuilt string. */
const MASK = '_'

/**
 * Returns true when a parsed argv token is free text rather than a word the
 * shell or git could act on: it contains whitespace, which only a quoted
 * string can carry, and it is not shaped like `key=value` (no whitespace
 * before its first `=`). Commit messages and PR bodies such as
 * `"fix LEFTHOOK=0 bypass"` are free text; `GIT_CONFIG_PARAMETERS='a'='b' …`
 * and `core.hooksPath=/dev/null ` stay visible, because git or the shell
 * reads them as assignments.
 * @param token - A string token from `shell-quote`.
 * @returns True when the token is free text that cannot set config or env.
 */
function isFreeText(token: string): boolean {
  return /\s/.test(token) && !/^\S+=/.test(token)
}

/**
 * Rebuilds the input from its `shell-quote` tokens with free-text tokens
 * replaced by a placeholder, so the regex-based hooks-path and manager env
 * checks no longer match override-looking text inside a quoted commit message
 * or PR body (#93). Quotes around real words are resolved by the tokenizer
 * (`-c "core.hooksPath=x"` becomes `-c core.hooksPath=x`), and a masked value
 * keeps its position, so `git config core.hooksPath "/a b"` is still caught.
 * @param input - The raw command string.
 * @returns The input with quoted free text masked.
 */
export function maskQuotedText(input: string): string {
  const words: string[] = []
  for (const token of tokenizeCommand(input)) {
    if (typeof token === 'string') {
      words.push(isFreeText(token) ? MASK : token)
    } else if ('op' in token) {
      words.push(token.op === 'glob' ? token.pattern : token.op)
    }
  }
  return words.join(' ')
}
