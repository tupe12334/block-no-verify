import type { GitCommand } from './git-command.js'

/**
 * Checks if the input contains a --no-verify flag for a specific git command
 */
export function hasNoVerifyFlag(input: string, command: GitCommand): boolean {
  // Check for --no-verify
  if (/--no-verify\b/.test(input)) {
    return true
  }

  // For commit, -n is a shorthand for --no-verify
  // For other commands, -n might mean something else, so we need to be careful
  if (command === 'commit') {
    // Match -n as a standalone flag or at the start of combined flags
    if (/\s-n(?:\s|$)/.test(input) || /\s-n[a-zA-Z]/.test(input)) {
      return true
    }
  }

  // For push, -n is --dry-run, not --no-verify
  // For merge, -n is --no-commit, not --no-verify
  // So we only block --no-verify (long form) for these

  return false
}
