import type { GitCommand } from './git-command.js'
import type { Token } from './token.js'
import { tokenize } from './tokenize.js'

/**
 * Long options whose following token is a value (message/file content). A
 * `--no-verify` appearing there is text, not a flag.
 */
const LONG_VALUE_OPTS = new Set([
  '--message',
  '--file',
  '--reuse-message',
  '--reedit-message',
  '--fixup',
  '--squash',
  '--template',
  '--gpg-sign',
])

/** Short options that consume an argument. */
const SHORT_VALUE_OPTS = new Set(['m', 'F', 'C', 'c', 't'])

/**
 * Extracts the argv of the git sub-command: the word tokens following the
 * command, up to the next shell operator. Prefers a command preceded by a
 * `git`/`git.exe` token; falls back to the first command word (covers git
 * invoked by absolute path).
 * @param tokens - The tokenized command.
 * @param command - The detected git sub-command.
 * @returns The argument tokens that belong to the git command.
 */
function gitArgs(tokens: Token[], command: GitCommand): string[] {
  const collect = (requireGit: boolean): string[] => {
    const args: string[] = []
    let gitSeen = !requireGit
    let collecting = false
    for (const t of tokens) {
      if (collecting) {
        if (t.type === 'op') break
        args.push(t.value)
        continue
      }
      if (t.type !== 'word') continue
      if (
        requireGit &&
        (t.value === 'git' || t.value.toLowerCase() === 'git.exe')
      ) {
        gitSeen = true
        continue
      }
      if (gitSeen && t.value === command) collecting = true
    }
    return collecting ? args : []
  }
  const withGit = collect(true)
  if (withGit.length > 0) return withGit
  return collect(false)
}

/**
 * Classifies a short-flag bundle (single leading dash).
 * @param tok - The bundle token, e.g. `-nm`.
 * @param command - The detected git sub-command.
 * @returns `'bypass'` when it carries the commit `-n` shorthand, `'value'`
 *   when its trailing option consumes the next token, otherwise `''`.
 */
function classifyShort(tok: string, command: GitCommand): string {
  const chars = tok.slice(1)
  let idx = 0
  for (const ch of chars) {
    if (ch === 'n' && command === 'commit') return 'bypass'
    if (SHORT_VALUE_OPTS.has(ch)) return idx === chars.length - 1 ? 'value' : ''
    idx++
  }
  return ''
}

/**
 * Checks if the input passes a --no-verify (hook-bypassing) flag to a git
 * command. The command is tokenized with shell-quoting rules and only tokens
 * in flag position within the git argv are inspected; values that follow
 * message/file options are skipped. So `--no-verify` or `-n<word>` inside a
 * quoted commit message body no longer produces a false positive, while a
 * genuinely quoted flag such as `git commit "--no-verify"` is still detected.
 * @param input - The command string to scan.
 * @param command - The detected git sub-command.
 * @returns True when the command passes a hook-bypassing flag.
 */
export function hasNoVerifyFlag(input: string, command: GitCommand): boolean {
  const args = gitArgs(tokenize(input), command)
  let skipValue = false
  let optionsEnded = false
  for (const tok of args) {
    if (skipValue) {
      skipValue = false
      continue
    }
    if (optionsEnded) continue
    if (tok === '--') {
      optionsEnded = true
      continue
    }
    if (!tok.startsWith('-') || tok === '-') continue
    if (tok.startsWith('--')) {
      const eq = tok.indexOf('=')
      const name = eq === -1 ? tok : tok.slice(0, eq)
      if (name === '--no-verify') return true
      if (eq === -1 && LONG_VALUE_OPTS.has(name)) skipValue = true
      continue
    }
    const kind = classifyShort(tok, command)
    if (kind === 'bypass') return true
    if (kind === 'value') skipValue = true
  }
  return false
}
