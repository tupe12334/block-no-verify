/**
 * GitHub MCP tools that bypass local git hooks.
 *
 * These MCP tools communicate directly with the GitHub API, meaning they do
 * not trigger local pre-commit, pre-push, commit-msg, or other client-side
 * hooks. Blocking them prevents AI agents from side-stepping the validations
 * enforced by those hooks.
 */
export const BLOCKED_GITHUB_MCP_TOOLS = [
  // Content writes that bypass pre-commit / commit-msg hooks
  'mcp__github__create_or_update_file',
  'mcp__github__delete_file',
  'mcp__github__push_files',
  // Branch / merge operations that bypass pre-push hooks
  'mcp__github__merge_pull_request',
  'mcp__github__update_pull_request_branch',
] as const
