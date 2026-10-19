import { tokenizeCommand } from './tokenize-command.js'

/** PowerShell hosts; `.exe` names come from WSL and Git Bash. */
const POWERSHELL = /^(?:pwsh|powershell)(?:\.exe)?$/i

/** Shell control operators that end a statement. */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&', '(', ')'])

/** The parameter PowerShell accepts under any prefix, plus its `-ec` alias. */
const ENCODED_COMMAND = 'encodedcommand'

/**
 * Tells whether a word names PowerShell's `-EncodedCommand` parameter:
 * `-e`, `-enc`, `-EncodedCommand`, `-ec`, also with a `/` lead.
 * @param word - An argv word.
 * @returns True for an `-EncodedCommand` spelling.
 */
function isEncodedOption(word: string): boolean {
  if (!/^[-/]e/i.test(word)) return false
  const name = word.slice(1).toLowerCase()
  return name === 'ec' || ENCODED_COMMAND.startsWith(name)
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
    } else if (POWERSHELL.test(token.slice(token.lastIndexOf('/') + 1))) {
      afterHost = true
    } else if (afterHost && isEncodedOption(token)) {
      valueIsNext = true
    }
  }
  return commands
}
