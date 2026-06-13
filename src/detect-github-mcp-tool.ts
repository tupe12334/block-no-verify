import type { BlockedGithubMcpTool } from './blocked-github-mcp-tool.js'
import { BLOCKED_GITHUB_MCP_TOOLS } from './github-mcp-tools.js'

/**
 * Checks whether a tool name refers to a GitHub MCP tool that bypasses local
 * git hooks.
 * @param toolName - The tool name reported by the AI agent (e.g. from a
 *   Claude Code `PreToolUse` payload).
 * @returns The matched blocked tool name, or null when the tool is not a
 *   blocked GitHub MCP tool.
 */
export function detectBlockedGithubMcpTool(
  toolName: string | undefined | null
): BlockedGithubMcpTool | null {
  if (toolName === undefined || toolName === null) {
    return null
  }

  const trimmed = toolName.trim()
  if (trimmed === '') {
    return null
  }

  for (const blocked of BLOCKED_GITHUB_MCP_TOOLS) {
    if (trimmed === blocked) {
      return blocked
    }
  }

  return null
}
