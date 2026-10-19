import { findFedScripts } from './find-fed-scripts.js'
import { findInterpreterStrings } from './find-interpreter-strings.js'
import { findShellScripts } from './find-shell-scripts.js'

/**
 * Returns every command string the input would run indirectly, so the
 * caller can check each like a typed command (#101): shell `-c` operands,
 * `eval` and `env -S` strings, scripts fed to a shell on stdin, and string
 * literals in interpreter code.
 * @param input - The raw command string.
 * @returns The derived command strings.
 */
export function findDerivedCommands(input: string): string[] {
  return [
    ...findShellScripts(input),
    ...findFedScripts(input),
    ...findInterpreterStrings(input),
  ]
}
