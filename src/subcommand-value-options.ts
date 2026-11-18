import type { GitCommand } from './git-command.js'

/**
 * Options of `git commit` that consume the following argv token as their
 * value (a commit message, a message file, a template file, or a commit to
 * reuse/re-edit). The value of these options is user text and must never be
 * scanned for hook-bypass flags.
 */
const COMMIT_VALUE_OPTIONS: ReadonlySet<string> = new Set([
  '-m',
  '--message',
  '-F',
  '--file',
  '-C',
  '--reuse-message',
  '-c',
  '--reedit-message',
  '-t',
  '--template',
  '--fixup',
  '--squash',
])

/**
 * For each guarded sub-command, the options of {@link COMMIT_VALUE_OPTIONS}
 * that take the next argv token as their value, taken from `git <command> -h`
 * (git 2.50.1). The same letter can mean something else: `-m` is `--merge`
 * for rebase and `--message-id` for am, `-c` is `--scissors` for am, and
 * `--squash` takes no value for merge. The token after such a flag is still
 * scanned. An option that is not listed here for a sub-command (push lists
 * none) is never treated as taking a value.
 */
const VALUE_OPTIONS = new Map<GitCommand, ReadonlySet<string>>([
  ['commit', COMMIT_VALUE_OPTIONS],
  ['merge', new Set(['-m', '--message', '-F', '--file'])],
  ['cherry-pick', new Set(['-m'])],
  ['rebase', new Set(['-C'])],
  ['am', new Set(['-C'])],
])

/** The value options of a sub-command that has none. */
const NO_VALUE_OPTIONS: ReadonlySet<string> = new Set()

/**
 * Returns the options whose next argv token is their value for `command`.
 * @param command - A guarded git sub-command.
 * @returns The sub-command's value options, empty when it has none.
 */
export function subcommandValueOptions(
  command: GitCommand
): ReadonlySet<string> {
  const options = VALUE_OPTIONS.get(command)
  return options === undefined ? NO_VALUE_OPTIONS : options
}
