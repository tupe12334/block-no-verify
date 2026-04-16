/**
 * Optional context for {@link checkCommand}.
 */
export interface CheckCommandOptions {
  /**
   * Name of the tool being invoked, when available. Used to detect GitHub
   * MCP tool calls that would bypass local git hooks.
   */
  toolName?: string
}
