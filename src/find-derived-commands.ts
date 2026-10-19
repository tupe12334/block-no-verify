import { findAwkPrograms } from './find-awk-programs.js'
import { findEncodedCommands } from './find-encoded-commands.js'
import { findFedScripts } from './find-fed-scripts.js'
import { findInterpreterStrings } from './find-interpreter-strings.js'
import { findShellScripts } from './find-shell-scripts.js'

/**
 * Returns every command string the input would run indirectly, so the
 * caller can check each like a typed command (#101): shell `-c` operands,
 * `eval` and `env -S` strings, scripts fed to a shell on stdin, string
 * literals in interpreter code and awk programs, and decoded
 * `pwsh -EncodedCommand` values.
 * @param input - The raw command string.
 * @returns The derived command strings.
 */
export function findDerivedCommands(input: string): string[] {
  return [
    ...findShellScripts(input),
    ...findFedScripts(input),
    ...findInterpreterStrings(input),
    ...findAwkPrograms(input),
    ...findEncodedCommands(input),
  ]
}
