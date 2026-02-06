import type { CheckResult } from './check-result.js'
import { detectGitCommand } from './detect-git-command.js'
import { hasNoVerifyFlag } from './has-no-verify-flag.js'
import { hasHooksPathOverride } from './has-hooks-path-override.js'

/**
 * Checks a command input for --no-verify flag usage or hooks path override
 *
 * @param input - The command input to check (typically from stdin in Claude Code hooks)
 * @returns CheckResult indicating whether the command should be blocked
 */
export function checkCommand(input: string): CheckResult {
  const gitCommand = detectGitCommand(input)

  if (!gitCommand) {
    return { blocked: false }
  }

  if (hasNoVerifyFlag(input, gitCommand)) {
    return {
      blocked: true,
      reason: `BLOCKED: --no-verify flag is not allowed with git ${gitCommand}. Git hooks must not be bypassed.`,
      gitCommand,
    }
  }

  if (hasHooksPathOverride(input)) {
    return {
      blocked: true,
      reason: `BLOCKED: Overriding core.hooksPath is not allowed with git ${gitCommand}. Git hooks must not be bypassed.`,
      gitCommand,
    }
  }

  return { blocked: false, gitCommand }
}
