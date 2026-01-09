import type { GitCommand } from './git-command.js'

/**
 * Result of checking a command for --no-verify flag
 */
export interface CheckResult {
  /** Whether the command is blocked */
  blocked: boolean
  /** The reason the command was blocked, if any */
  reason?: string
  /** The detected git command, if any */
  gitCommand?: GitCommand
}
