import { tokenizeCommand } from './tokenize-command.js'

/** PowerShell hosts; `.exe` names come from WSL and Git Bash. */
const POWERSHELL = /^(?:pwsh(?:-preview)?|powershell)(?:\.exe)?$/i

/**
 * A switch lead: one or two of the same dash, or a `/`. pwsh's dashes are
 * `-` plus en dash, em dash and horizontal bar.
 */
const SWITCH_LEAD = /^(?:([-\u2013\u2014\u2015])\1?|\/)/

/** Shell control operators that end a statement. */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&', '(', ')'])

/** The parameter PowerShell accepts under any prefix, plus its `-ec` alias. */
const ENCODED_COMMAND = 'encodedcommand'

/**
 * Tells whether a word names PowerShell's `-EncodedCommand` parameter:
 * `-e`, `-enc`, `-EncodedCommand`, `-ec`, also with a `--`, `/` or
 * Unicode dash lead. pwsh trims the word before it matches.
 * @param word - An argv word.
 * @returns True for an `-EncodedCommand` spelling.
 */
function isEncodedOption(word: string): boolean {
  // .NET Trim() also strips U+0085 (NEL), which JS trim() keeps.
  const trimmed = word.replace(/^[\s\u0085]+|[\s\u0085]+$/g, '')
  const lead = SWITCH_LEAD.exec(trimmed)
  if (lead === null) return false
  const name = trimmed.slice(lead[0].length).toLowerCase()
  return name === 'ec' || (name !== '' && ENCODED_COMMAND.startsWith(name))
}

/**
 * Returns a word's program name without a `/` or `\\` path prefix.
 * @param word - An argv word.
 * @returns The base name.
 */
function baseName(word: string): string {
  return word.slice(Math.max(word.lastIndexOf('/'), word.lastIndexOf('\\')) + 1)
}

/**
 * Returns the commands that `pwsh -EncodedCommand <base64>` would run. The
 * value is base64 of UTF-16LE text, so a plain scan never sees the git
 * command inside it (#101).
 * @param input - The raw command string.
 * @returns The decoded command strings, in input order.
 */
export function findEncodedCommands(input: string): string[] {
  const commands: string[] = []
  let afterHost = false
  let valueIsNext = false
  for (const token of tokenizeCommand(input)) {
    if (typeof token !== 'string') {
      if ('op' in token && CONTROL_OPERATORS.has(token.op)) {
        afterHost = false
        valueIsNext = false
      }
      continue
    }
    if (valueIsNext) {
      commands.push(Buffer.from(token, 'base64').toString('utf16le'))
      valueIsNext = false
    } else if (POWERSHELL.test(baseName(token))) {
      afterHost = true
    } else if (afterHost && isEncodedOption(token)) {
      valueIsNext = true
    }
  }
  return commands
}
