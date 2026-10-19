import type { CheckCommandOptions } from './check-command-options.js'
import type { CheckResult } from './check-result.js'
import { detectGitCommand } from './detect-git-command.js'
import { detectBlockedGithubMcpTool } from './detect-github-mcp-tool.js'
import { hasNoVerifyFlag } from './has-no-verify-flag.js'
import { hasHooksPathOverride } from './has-hooks-path-override.js'
import { detectManagerBypass } from './managers/index.js'
import { maskMessageValues } from './mask-message-values.js'
import { findAliasCommands } from './find-alias-commands.js'
import { findDerivedCommands } from './find-derived-commands.js'
import { findUnknownSubcommandBypass } from './find-unknown-subcommand-bypass.js'
import { issuesUrl } from './package-info.js'

/**
 * Note appended to every block reason instructing the agent to report a
 * suspected false positive by opening an issue on the project's repository.
 */
const FALSE_POSITIVE_NOTE = `If you believe this is a false positive, open an issue at ${issuesUrl()} describing the command that was blocked.`

/**
 * Checks a command input for --no-verify flag usage, hooks path override, a
 * tool-specific override handled by a manager (e.g. HUSKY=0), or a direct
 * GitHub MCP tool invocation that would bypass local git hooks.
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
  const toolName = options === undefined ? undefined : options.toolName
  const blockedMcpTool = detectBlockedGithubMcpTool(toolName)
  if (blockedMcpTool !== null) {
    return {
      blocked: true,
      reason: `BLOCKED: ${blockedMcpTool} bypasses local git hooks by writing through the GitHub API. Use local git commands so hooks can run. ${FALSE_POSITIVE_NOTE}`,
    }
  }

  const detectedGitCommand = detectGitCommand(input)
  const gitCommand =
    detectedGitCommand === null ? undefined : detectedGitCommand

  // Checked before the `!gitCommand` early return: a bare `git config
  // core.hooksPath <value>` persistently redirects hooks without going
  // through a sub-command (e.g. commit/push) that supports --no-verify.
  // Env and config checks are regex-based, so they scan the input with commit
  // and PR message values masked: override-looking text in a message is not a
  // bypass (#93).
  const scanText = maskMessageValues(input)

  if (hasHooksPathOverride(scanText)) {
    return {
      blocked: true,
      reason: `BLOCKED: Overriding core.hooksPath is not allowed${gitCommand === undefined ? '' : ` with git ${gitCommand}`}. Git hooks must not be bypassed. ${FALSE_POSITIVE_NOTE}`,
      gitCommand,
    }
  }

  // A git alias runs its value when invoked, so check what each alias
  // defined here would run (#91).
  for (const aliasCommand of findAliasCommands(input)) {
    const aliasResult = checkCommand(aliasCommand, options)
    if (aliasResult.blocked) {
      return {
        blocked: true,
        reason: `BLOCKED: A git alias defined in this command runs a hook bypass. ${aliasResult.reason === undefined ? '' : aliasResult.reason}`,
        gitCommand: aliasResult.gitCommand,
      }
    }
  }

  // `sh -c "…"` runs its operand as a command, so check it as one (#101).
  for (const script of findDerivedCommands(input)) {
    const scriptResult = checkCommand(script, options)
    if (scriptResult.blocked) {
      return {
        blocked: true,
        reason: `BLOCKED: A shell -c command string in this command runs a hook bypass. ${scriptResult.reason === undefined ? '' : scriptResult.reason}`,
        gitCommand: scriptResult.gitCommand,
      }
    }
  }

  // A sub-command that is not a git built-in may be an alias defined
  // elsewhere, so `--no-verify` after it is blocked too.
  const unknownSubcommand = findUnknownSubcommandBypass(input)
  if (unknownSubcommand !== null) {
    return {
      blocked: true,
      reason: `BLOCKED: --no-verify is not allowed with git ${unknownSubcommand}, which may be an alias for a guarded command. Git hooks must not be bypassed. ${FALSE_POSITIVE_NOTE}`,
    }
  }

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

  const managerReason = detectManagerBypass(scanText, gitCommand)
  if (managerReason !== null) {
    return {
      blocked: true,
      reason: `BLOCKED: ${managerReason} ${FALSE_POSITIVE_NOTE}`,
      gitCommand,
    }
  }

  return { blocked: false, gitCommand }
}
