/**
 * Integration tests: spawn dist/cli.js with real Claude Code hook format.
 *
 * Claude Code sends {"hook_event_name":"PreToolUse",...} — not {"type":"PreToolUse",...}.
 * These tests verify end-to-end behavior using that exact wire format.
 *
 * Requires a prior `pnpm build`. Skips automatically when dist/cli.js is absent.
 */
import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, it, expect, beforeAll } from 'vitest'

const currentDir = dirname(fileURLToPath(import.meta.url))
const cliPath = resolve(currentDir, '../dist/cli.js')
const BUILD_REQUIRED = "dist/cli.js not found — run 'pnpm build' first"

function runCli(
  input: Record<string, unknown>
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise(resolve => {
    const child = spawn('node', [cliPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })
    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })
    child.on('close', code => {
      resolve({ code: code === null ? 0 : code, stdout, stderr })
    })

    child.stdin.write(JSON.stringify(input))
    child.stdin.end()
  })
}

function claudeCodeEvent(
  toolName: string,
  toolInput: Record<string, unknown>
): Record<string, unknown> {
  return {
    session_id: 'test-session',
    hook_event_name: 'PreToolUse',
    tool_name: toolName,
    tool_input: toolInput,
    tool_use_id: 'test-tool-use-id',
    cwd: '/tmp',
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseStdout(stdout: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(stdout.trim())
    return isRecord(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function isBlocked(stdout: string): boolean {
  try {
    return parseStdout(stdout).decision === 'block'
  } catch {
    return false
  }
}

describe('CLI integration (Claude Code wire format)', () => {
  beforeAll(() => {
    if (!existsSync(cliPath)) {
      throw new Error(BUILD_REQUIRED)
    }
  })

  describe('blocked bash commands', () => {
    it('blocks git commit with --no-verify flag', async () => {
      const result = await runCli(
        claudeCodeEvent('Bash', { command: 'git commit --no-verify -m test' })
      )
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
      expect(isBlocked(result.stdout)).toBe(true)
    })

    it('blocks git push with --no-verify flag', async () => {
      const result = await runCli(
        claudeCodeEvent('Bash', {
          command: 'git push --no-verify origin main',
        })
      )
      expect(isBlocked(result.stdout)).toBe(true)
    })

    it('blocks git commit -n shorthand', async () => {
      const result = await runCli(
        claudeCodeEvent('Bash', { command: 'git commit -n -m test' })
      )
      expect(isBlocked(result.stdout)).toBe(true)
    })

    it('blocks core.hooksPath override', async () => {
      const result = await runCli(
        claudeCodeEvent('Bash', {
          command: 'git -c core.hooksPath=/dev/null commit -m x',
        })
      )
      expect(isBlocked(result.stdout)).toBe(true)
    })

    it('block reason contains BLOCKED text', async () => {
      const result = await runCli(
        claudeCodeEvent('Bash', { command: 'git commit --no-verify -m test' })
      )
      expect(String(parseStdout(result.stdout).reason)).toContain('BLOCKED')
    })
  })

  describe('blocked github mcp tools', () => {
    it('blocks mcp__github__push_files', async () => {
      const result = await runCli(
        claudeCodeEvent('mcp__github__push_files', {
          owner: 'o',
          repo: 'r',
          files: [],
        })
      )
      expect(isBlocked(result.stdout)).toBe(true)
    })

    it('blocks mcp__github__create_or_update_file', async () => {
      const result = await runCli(
        claudeCodeEvent('mcp__github__create_or_update_file', {
          owner: 'o',
          repo: 'r',
          path: 'a',
          content: 'x',
        })
      )
      expect(isBlocked(result.stdout)).toBe(true)
    })

    it('blocks mcp__github__merge_pull_request', async () => {
      const result = await runCli(
        claudeCodeEvent('mcp__github__merge_pull_request', {
          owner: 'o',
          repo: 'r',
          pullNumber: 1,
        })
      )
      expect(isBlocked(result.stdout)).toBe(true)
    })

    it('blocks mcp__github__delete_file', async () => {
      const result = await runCli(
        claudeCodeEvent('mcp__github__delete_file', {
          owner: 'o',
          repo: 'r',
          path: 'f',
        })
      )
      expect(isBlocked(result.stdout)).toBe(true)
    })

    it('block reason mentions the tool name', async () => {
      const result = await runCli(
        claudeCodeEvent('mcp__github__push_files', {})
      )
      expect(String(parseStdout(result.stdout).reason)).toContain(
        'mcp__github__push_files'
      )
    })
  })

  describe('allowed commands', () => {
    it('allows safe git commit', async () => {
      const result = await runCli(
        claudeCodeEvent('Bash', { command: 'git commit -m safe' })
      )
      expect(result.code).toBe(0)
      expect(isBlocked(result.stdout)).toBe(false)
    })

    it('allows git push without flag', async () => {
      const result = await runCli(
        claudeCodeEvent('Bash', { command: 'git push origin main' })
      )
      expect(isBlocked(result.stdout)).toBe(false)
    })

    it('allows non-git commands', async () => {
      const result = await runCli(
        claudeCodeEvent('Bash', { command: 'npm install' })
      )
      expect(isBlocked(result.stdout)).toBe(false)
    })

    it('allows git push -n (dry-run, not --no-verify)', async () => {
      const result = await runCli(
        claudeCodeEvent('Bash', { command: 'git push -n origin main' })
      )
      expect(isBlocked(result.stdout)).toBe(false)
    })

    it('allows read-only github mcp tool', async () => {
      const result = await runCli(
        claudeCodeEvent('mcp__github__get_file_contents', {
          owner: 'o',
          repo: 'r',
          path: 'README.md',
        })
      )
      expect(isBlocked(result.stdout)).toBe(false)
    })

    it('allows unrelated mcp tools', async () => {
      const result = await runCli(
        claudeCodeEvent('mcp__other_server__do_thing', {})
      )
      expect(result.code).toBe(0)
      expect(isBlocked(result.stdout)).toBe(false)
    })
  })

  // An event missing `hook_event_name` is what the CLI receives when the raw
  // tool payload reaches stdin without the Claude Code envelope. polyhook then
  // labels it `notification` instead of `tool:before`; the CLI must still
  // block. See https://github.com/tupe12334/block-no-verify/issues/29.
  describe('event without hook_event_name', () => {
    it('blocks git push --no-verify', async () => {
      const result = await runCli({
        tool_name: 'Bash',
        tool_input: { command: 'git push --no-verify origin main' },
      })
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
      expect(isBlocked(result.stdout)).toBe(true)
    })

    it('blocks mcp__github__push_files', async () => {
      const result = await runCli({
        tool_name: 'mcp__github__push_files',
        tool_input: {},
      })
      expect(result.code).toBe(2)
      expect(isBlocked(result.stdout)).toBe(true)
    })

    it('allows a safe command', async () => {
      const result = await runCli({
        tool_name: 'Bash',
        tool_input: { command: 'git commit -m safe' },
      })
      expect(result.code).toBe(0)
      expect(isBlocked(result.stdout)).toBe(false)
    })
  })
})
