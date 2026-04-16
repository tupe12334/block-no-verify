import type { InputFormat } from './input-format.js'

/**
 * Result of parsing input
 */
export interface ParseResult {
  command: string
  format: InputFormat
  /**
   * Name of the tool being invoked, when the input format exposes it (e.g.
   * Claude Code's `tool_name` field). Used to detect direct GitHub MCP calls
   * that would bypass local git hooks.
   */
  toolName?: string
}
