import { describe, expect, it } from 'vitest'
import { parseInput } from './parse-input.js'

describe('parseInput', () => {
  describe('plain format', () => {
    it('should return input as-is', () => {
      const result = parseInput('git commit --no-verify', 'plain')
      expect(result.command).toBe('git commit --no-verify')
      expect(result.format).toBe('plain')
    })

    it('should not parse JSON when format is plain', () => {
      const result = parseInput('{"command":"git commit"}', 'plain')
      expect(result.command).toBe('{"command":"git commit"}')
      expect(result.format).toBe('plain')
    })
  })

  describe('claude-code format', () => {
    it('should extract command from Claude Code format', () => {
      const input = JSON.stringify({
        tool_input: { command: 'git commit --no-verify -m "test"' },
      })
      const result = parseInput(input, 'claude-code')
      expect(result.command).toBe('git commit --no-verify -m "test"')
      expect(result.format).toBe('claude-code')
    })

    it('should handle Claude Code format with extra fields', () => {
      const input = JSON.stringify({
        tool_input: {
          command: 'git push --no-verify',
          timeout: 5000,
        },
        tool_name: 'Bash',
      })
      const result = parseInput(input, 'claude-code')
      expect(result.command).toBe('git push --no-verify')
    })

    it('should fallback to raw input if not valid JSON', () => {
      const result = parseInput('git commit -m "test"', 'claude-code')
      expect(result.command).toBe('git commit -m "test"')
    })

    it('should fallback to raw input if missing tool_input', () => {
      const input = JSON.stringify({ other: 'data' })
      const result = parseInput(input, 'claude-code')
      expect(result.command).toBe(input)
    })
  })

  describe('json format', () => {
    it('should extract from "command" field', () => {
      const input = JSON.stringify({ command: 'git commit --no-verify' })
      const result = parseInput(input, 'json')
      expect(result.command).toBe('git commit --no-verify')
      expect(result.format).toBe('json')
    })

    it('should extract from "cmd" field', () => {
      const input = JSON.stringify({ cmd: 'git push --no-verify' })
      const result = parseInput(input, 'json')
      expect(result.command).toBe('git push --no-verify')
    })

    it('should extract from "input" field', () => {
      const input = JSON.stringify({ input: 'git merge --no-verify' })
      const result = parseInput(input, 'json')
      expect(result.command).toBe('git merge --no-verify')
    })

    it('should extract from "shell" field', () => {
      const input = JSON.stringify({ shell: 'git rebase --no-verify' })
      const result = parseInput(input, 'json')
      expect(result.command).toBe('git rebase --no-verify')
    })

    it('should extract from "script" field', () => {
      const input = JSON.stringify({ script: 'git cherry-pick --no-verify' })
      const result = parseInput(input, 'json')
      expect(result.command).toBe('git cherry-pick --no-verify')
    })

    it('should extract from Claude Code format in json mode', () => {
      const input = JSON.stringify({
        tool_input: { command: 'git am --no-verify' },
      })
      const result = parseInput(input, 'json')
      expect(result.command).toBe('git am --no-verify')
    })

    it('should fallback to raw input if not valid JSON', () => {
      const result = parseInput('not json', 'json')
      expect(result.command).toBe('not json')
    })

    it('should fallback to raw input if no recognized fields', () => {
      const input = JSON.stringify({ other: 'data' })
      const result = parseInput(input, 'json')
      expect(result.command).toBe(input)
    })
  })

  describe('auto format', () => {
    it('should auto-detect JSON with command field', () => {
      const input = JSON.stringify({ command: 'git commit --no-verify' })
      const result = parseInput(input, 'auto')
      expect(result.command).toBe('git commit --no-verify')
      expect(result.format).toBe('json')
    })

    it('should auto-detect Claude Code format', () => {
      const input = JSON.stringify({
        tool_input: { command: 'git push --no-verify' },
      })
      const result = parseInput(input, 'auto')
      expect(result.command).toBe('git push --no-verify')
      expect(result.format).toBe('json')
    })

    it('should treat non-JSON as plain text', () => {
      const result = parseInput('git commit --no-verify', 'auto')
      expect(result.command).toBe('git commit --no-verify')
      expect(result.format).toBe('plain')
    })

    it('should treat invalid JSON as plain text', () => {
      const result = parseInput('{not valid json}', 'auto')
      expect(result.command).toBe('{not valid json}')
      expect(result.format).toBe('plain')
    })

    it('should handle JSON without recognized fields as plain text', () => {
      const input = JSON.stringify({ unknown: 'field' })
      const result = parseInput(input, 'auto')
      expect(result.command).toBe(input)
      expect(result.format).toBe('plain')
    })

    it('should default to auto format when not specified', () => {
      const result = parseInput('git commit -m "test"')
      expect(result.command).toBe('git commit -m "test"')
      expect(result.format).toBe('plain')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = parseInput('')
      expect(result.command).toBe('')
      expect(result.format).toBe('plain')
    })

    it('should handle whitespace-only input', () => {
      const result = parseInput('   ')
      expect(result.command).toBe('   ')
      expect(result.format).toBe('plain')
    })

    it('should handle JSON with null values', () => {
      const input = JSON.stringify({ command: null })
      const result = parseInput(input, 'json')
      expect(result.command).toBe(input)
    })

    it('should handle JSON with number values', () => {
      const input = JSON.stringify({ command: 123 })
      const result = parseInput(input, 'json')
      expect(result.command).toBe(input)
    })

    it('should handle nested JSON commands', () => {
      const input = JSON.stringify({
        tool_input: {
          command: 'echo \'{"nested": "json"}\'',
        },
      })
      const result = parseInput(input, 'claude-code')
      expect(result.command).toBe('echo \'{"nested": "json"}\'')
    })

    it('should handle commands with special characters', () => {
      const input = JSON.stringify({
        command: 'git commit -m "feat: add new feature! #123"',
      })
      const result = parseInput(input, 'json')
      expect(result.command).toBe('git commit -m "feat: add new feature! #123"')
    })

    it('should prefer first recognized field in json mode', () => {
      // tool_input.command takes priority
      const input = JSON.stringify({
        tool_input: { command: 'from-tool-input' },
        command: 'from-command',
      })
      const result = parseInput(input, 'json')
      expect(result.command).toBe('from-tool-input')
    })
  })
})
