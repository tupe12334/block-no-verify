import { tokenizeCommand } from './tokenize-command.js'

/** Matches a `alias.<name>=<value>` config token, as passed to `git -c`. */
const ALIAS_ASSIGNMENT = /^alias\.[^=\s]+=([\s\S]*)$/i

/** Matches a bare `alias.<name>` key, as passed to `git config`. */
const ALIAS_KEY = /^alias\.[^=\s]+$/i

/**
 * Returns the command each git alias defined in the input would run, so the
 * caller can check it like a typed command (#91). Git runs an alias value as
 * `git <value>`, or as a shell command when it starts with `!`. Both forms
 * are covered: `git -c alias.ci="commit --no-verify" ci` and
 * `git config alias.ci "commit --no-verify"`. An `alias.…` word counts only
 * right after `-c`, or after a `config` word, so a commit message that only
 * looks like an alias is ignored.
 * @param input - The raw command string.
 * @returns The commands the defined aliases would run.
 */
export function findAliasCommands(input: string): string[] {
  const values: string[] = []
  let previous: string | undefined
  let afterConfig = false
  let valueIsNext = false
  for (const word of tokenizeCommand(input)) {
    if (typeof word !== 'string') continue
    if (valueIsNext) {
      values.push(word)
      valueIsNext = false
    } else if (word === 'config') {
      afterConfig = true
    } else if (previous === '-c') {
      const assignment = ALIAS_ASSIGNMENT.exec(word)
      if (assignment !== null) values.push(assignment[1])
    } else if (afterConfig && ALIAS_KEY.test(word)) {
      valueIsNext = true
    }
    previous = word
  }
  return values.map(value =>
    value.startsWith('!') ? value.slice(1) : `git ${value}`
  )
}
