import type { CheckCommandOptions } from './check-command-options.js'
import type { CheckResult } from './check-result.js'
import { checkCommandText } from './check-command-text.js'
import { expandParameterWords } from './expand-parameter-words.js'

/**
 * Checks a command input for --no-verify flag usage, hooks path override, a
 * tool-specific override handled by a manager (e.g. HUSKY=0), or a direct
 * GitHub MCP tool invocation that would bypass local git hooks.
 *
 * The text is checked as written first. When it holds a `${NAME:-word}`-style
 * expansion, the text with each such expansion replaced by its word is
 * checked too (see {@link expandParameterWords}), and either check can block.
 * The variant only adds a check, so a command the text check blocks is
 * always blocked, with that check's reason.
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
  const result = checkCommandText(input, options, checkCommand)
  if (result.blocked) return result
  const variant = expandParameterWords(input)
  return variant === input
    ? result
    : checkCommandText(variant, options, checkCommand)
}
