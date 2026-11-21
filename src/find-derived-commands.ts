import { findAwkPrograms } from './find-awk-programs.js'
import { findEncodedCommands } from './find-encoded-commands.js'
import { findFedScripts } from './find-fed-scripts.js'
import { findHeredocInterpreterCode } from './find-heredoc-interpreter-code.js'
import { findPrintedSubstitutions } from './find-printed-substitutions.js'
import { findInterpreterStrings } from './find-interpreter-strings.js'
import { findLiveSubstitutions } from './find-live-substitutions.js'
import { preprocessCommand } from './preprocess-command.js'
import { findShellScripts } from './find-shell-scripts.js'
import { findSshCommands } from './find-ssh-commands.js'

/**
 * Returns every command string the input would run indirectly, so the
 * caller can check each like a typed command (#101): shell `-c` operands,
 * `eval` and `env -S` strings, remote `ssh` commands, scripts fed to a shell on stdin, string
 * literals in interpreter code and awk programs, and decoded
 * `pwsh -EncodedCommand` values, and the body of each command substitution
 * that bash runs, such as one inside a double-quoted commit message.
 * @param input - The raw command string.
 * @returns The derived command strings.
 */
export function findDerivedCommands(input: string): string[] {
  return [
    ...findShellScripts(input),
    ...findSshCommands(input),
    ...findFedScripts(input),
    ...findInterpreterStrings(input),
    ...findHeredocInterpreterCode(input),
    ...findPrintedSubstitutions(input),
    ...findLiveSubstitutions(preprocessCommand(input)),
    ...findAwkPrograms(input),
    ...findEncodedCommands(input),
  ]
}
