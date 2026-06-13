import type { GitCommand } from '../git-command.js'
import { managers } from './managers.js'

/**
 * Runs every registered manager against the input. Returns the first matching
 * manager's core block reason (without the `BLOCKED:` label or false-positive
 * note), or null if no manager matches.
 */
export function detectManagerBypass(
  input: string,
  gitCommand: GitCommand
): string | null {
  for (const manager of managers) {
    if (manager.detect(input)) {
      return manager.reason(gitCommand)
    }
  }
  return null
}
