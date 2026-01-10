import { describe, expect, it } from 'vitest'
import { parseInput } from '../parse-input.js'
import { checkCommand } from '../check-command.js'
import { testCommands } from './test-commands.js'

const { BLOCKED_COMMANDS, ALLOWED_COMMANDS } = testCommands

/**
 * Gemini CLI Agent Format
 *
 * Input: JSON via stdin
 * { "command": "..." }
 *
 * Output: Exit code + stderr message
 * - Allowed: exit 0
 * - Blocked: exit 2, reason to stderr
 *
 * Hook config (.gemini/settings.json):
 * {
 *   "preToolCall": {
 *     "shell": {
 *       "command": "pnpm dlx block-no-verify"
 *     }
 *   }
 * }
 */

function createGeminiInput(command: string): string {
  return JSON.stringify({ command })
}

describe('Gemini CLI', () => {
  describe('blocked commands', () => {
    it.each(BLOCKED_COMMANDS)('should block: $description', ({ command }) => {
      const input = createGeminiInput(command)
      const { command: parsed } = parseInput(input, 'auto')
      const result = checkCommand(parsed)

      expect(result.blocked).toBe(true)
    })
  })

  describe('allowed commands', () => {
    it.each(ALLOWED_COMMANDS)('should allow: $description', ({ command }) => {
      const input = createGeminiInput(command)
      const { command: parsed } = parseInput(input, 'auto')
      const result = checkCommand(parsed)

      expect(result.blocked).toBe(false)
    })
  })
})
