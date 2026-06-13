import type { CheckCommandOptions } from './check-command-options.js'
import type { CheckResult } from './check-result.js'
import { detectGitCommand } from './detect-git-command.js'
import { detectBlockedGithubMcpTool } from './detect-github-mcp-tool.js'
import { hasNoVerifyFlag } from './has-no-verify-flag.js'
import { hasHooksPathOverride } from './has-hooks-path-override.js'
import { hasHuskySkip } from './managers/husky/has-husky-skip.js'
import { issuesUrl } from './package-info.js'

/**
 * Note appended to every block reason instructing the agent to report a
 * suspected false positive by opening an issue on the project's repository.
 */
const FALSE_POSITIVE_NOTE = `If you believe this is a false positive, open an issue at ${issuesUrl()} describing the command that was blocked.`

/**
 * Checks a command input for --no-verify flag usage, hooks path override, a
 * HUSKY=0 environment override, or a direct GitHub MCP tool invocation that
 * would bypass local git hooks.
 *
 * @param input - The command input to check (typically from stdin in AI agent
 *   hooks). May be an empty string when the invocation is a non-shell tool
 *   call (e.g. an MCP tool).
 * @param options - Optional context such as the invoked tool name.
 * @returns CheckResult indicating whether the command should be blocked.
 */
export function checkCommand(
  input: string,
  options?: CheckCommandOptions
): CheckResult {
  const toolName =
    options === undefined || options === null ? undefined : options.toolName
  const blockedMcpTool = detectBlockedGithubMcpTool(toolName)
  if (blockedMcpTool !== null) {
    return {
      blocked: true,
      reason: `BLOCKED: ${blockedMcpTool} bypasses local git hooks by writing through the GitHub API. Use local git commands so hooks can run. ${FALSE_POSITIVE_NOTE}`,
    }
  }

  const gitCommand = detectGitCommand(input)

  if (!gitCommand) {
    return { blocked: false }
  }

  if (hasNoVerifyFlag(input, gitCommand)) {
    return {
      blocked: true,
      reason: `BLOCKED: --no-verify flag is not allowed with git ${gitCommand}. Git hooks must not be bypassed. ${FALSE_POSITIVE_NOTE}`,
      gitCommand,
    }
  }

  if (hasHooksPathOverride(input)) {
    return {
      blocked: true,
      reason: `BLOCKED: Overriding core.hooksPath is not allowed with git ${gitCommand}. Git hooks must not be bypassed. ${FALSE_POSITIVE_NOTE}`,
      gitCommand,
    }
  }

  if (hasHuskySkip(input)) {
    return {
      blocked: true,
      reason: `BLOCKED: Setting HUSKY=0 disables husky git hooks for git ${gitCommand}. Git hooks must not be bypassed. ${FALSE_POSITIVE_NOTE}`,
      gitCommand,
    }
  }

  return { blocked: false, gitCommand }
}
