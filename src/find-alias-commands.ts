import { quote } from 'shell-quote'
import { findGitInvocations } from './git-invocations.js'
import { tokenizeCommand } from './tokenize-command.js'

/** Matches a `alias.<name>=<value>` config token, as passed to `git -c`. */
const ALIAS_ASSIGNMENT = /^alias\.([^=\s]+)=([\s\S]*)$/i

/** Matches a bare `alias.<name>` key, as passed to `git config`. */
const ALIAS_KEY = /^alias\.([^=\s]+)$/i

/**
 * Collects the aliases defined in the input: a `-c alias.NAME=VALUE` word,
 * or `alias.NAME VALUE` after a `config` word. An `alias.…` word anywhere
 * else, such as inside a commit message, is ignored.
 * @param input - The raw command string.
 * @returns Alias name (lowercased, as git compares it) to its value.
 */
function findAliasDefinitions(input: string): Map<string, string> {
  const aliases = new Map<string, string>()
  let previous: string | undefined
  let afterConfig = false
  let pendingName: string | undefined
  for (const word of tokenizeCommand(input)) {
    if (typeof word !== 'string') continue
    const assignment = ALIAS_ASSIGNMENT.exec(word)
    const key = ALIAS_KEY.exec(word)
    if (pendingName !== undefined) {
      aliases.set(pendingName, word)
      pendingName = undefined
    } else if (word === 'config') {
      afterConfig = true
    } else if (previous === '-c' && assignment !== null) {
      aliases.set(assignment[1].toLowerCase(), assignment[2])
    } else if (afterConfig && key !== null) {
      pendingName = key[1].toLowerCase()
    }
    previous = word
  }
  return aliases
}

/**
 * Turns an alias value into the command git runs for it: `git VALUE`, or
 * the shell command for a `!` alias, followed by the call's own arguments.
 * @param value - The alias value.
 * @param args - The arguments the alias was called with.
 * @returns The command line git would run.
 */
function expandAlias(value: string, args: string[]): string {
  const base = value.startsWith('!') ? value.slice(1) : `git ${value}`
  return args.length === 0 ? base : `${base} ${quote(args)}`
}

/**
 * Returns the commands that git aliases defined in the input would run, so
 * the caller can check them like typed commands (#91):
 * - each definition on its own, since `git config alias.ci "commit
 *   --no-verify"` persists for later calls;
 * - each call of a defined alias, with its arguments appended, since
 *   `git -c alias.x=commit x --no-verify` only adds the flag at the call.
 * @param input - The raw command string.
 * @returns The commands the defined aliases would run.
 */
export function findAliasCommands(input: string): string[] {
  const aliases = findAliasDefinitions(input)
  if (aliases.size === 0) return []
  const commands = [...aliases.values()].map(value => expandAlias(value, []))
  for (const call of findGitInvocations(input)) {
    const value = aliases.get(call.subcommand.toLowerCase())
    if (value !== undefined) commands.push(expandAlias(value, call.args))
  }
  return commands
}
