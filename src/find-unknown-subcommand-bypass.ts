import { quote } from 'shell-quote'
import { findGitInvocations } from './git-invocations.js'
import { GIT_BUILTINS } from './git-builtins.js'
import { hasNoVerifyFlag } from './has-no-verify-flag.js'

/**
 * Finds a `git <word> --no-verify` call whose `<word>` may be an alias
 * defined elsewhere (`git config alias.ci commit` in an earlier command, then
 * `git ci --no-verify`). Built-in commands are skipped, because git never
 * lets an alias shadow one, so `git grep -e --no-verify` stays allowed. Words
 * after `--` are data, not options.
 * @param input - The raw command string.
 * @returns The sub-command word of the first such call, or null.
 */
export function findUnknownSubcommandBypass(input: string): string | null {
  for (const call of findGitInvocations(input)) {
    if (GIT_BUILTINS.has(call.subcommand)) continue
    const end = call.args.indexOf('--')
    const options = end === -1 ? call.args : call.args.slice(0, end)
    if (hasNoVerifyFlag(`git push ${quote(options)}`, 'push')) {
      return call.subcommand
    }
  }
  return null
}
