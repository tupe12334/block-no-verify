import { describe, expect, it } from 'vitest'
import { parseInput } from '../parse-input.js'
import { checkCommand } from '../check-command.js'
import { testCommands } from './test-commands.js'

const { BLOCKED_COMMANDS, ALLOWED_COMMANDS } = testCommands

/**
 * Claude Code Agent Format
 *
 * Input: JSON via stdin
 * { "tool_input": { "command": "..." } }
 *
 * Output: Exit code + stderr message
 * - Allowed: exit 0
 * - Blocked: exit 2, reason to stderr
 *
 * Hook config (.claude/settings.json):
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "matcher": "Bash",
 *       "hooks": [{
 *         "type": "command",
 *         "command": "pnpm dlx block-no-verify"
 *       }]
 *     }]
 *   }
 * }
 */

function createClaudeCodeInput(command: string): string {
  return JSON.stringify({
    tool_input: { command },
  })
}

describe('Claude Code', () => {
  describe('blocked commands', () => {
    it.each(BLOCKED_COMMANDS)('should block: $description', ({ command }) => {
      const input = createClaudeCodeInput(command)
      const { command: parsed } = parseInput(input, 'auto')
      const result = checkCommand(parsed)

      expect(result.blocked).toBe(true)
    })
  })

  describe('allowed commands', () => {
    it.each(ALLOWED_COMMANDS)('should allow: $description', ({ command }) => {
      const input = createClaudeCodeInput(command)
      const { command: parsed } = parseInput(input, 'auto')
      const result = checkCommand(parsed)

      expect(result.blocked).toBe(false)
    })
  })

  describe('format handling', () => {
    it('should handle format with extra metadata', () => {
      const input = JSON.stringify({
        tool_input: {
          command: 'git push --no-verify',
          timeout: 60000,
          description: 'Push changes',
        },
        tool_name: 'Bash',
      })

      const { command } = parseInput(input, 'auto')
      const result = checkCommand(command)

      expect(result.blocked).toBe(true)
    })
  })
})
